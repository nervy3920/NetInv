import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export interface User {
  id: number;
  username: string;
  password: string;
}

export interface MainGroup {
  id: number;
  name: string;
  icon: string | null;
}

export interface SubGroup {
  id: number;
  parentId: number;
  name: string;
  icon: string | null;
  config: string;
}

export interface Asset {
  id: number;
  name: string;
  mainGroupId: number;
  subGroupId: number;
  values: string;
  expiryDate: string | null;
  expiryNotify: boolean;
  createdAt: number;
  notes?: string;
}

export interface NotificationSettings {
  enabled: boolean;
  daysBeforeExpiry: number;
  notificationTime: string; // HH:mm format
  channels: {
    bark: {
      enabled: boolean;
      serverUrl: string;
      deviceKey: string;
    };
    telegram: {
      enabled: boolean;
      botToken: string;
      chatId: string;
    };
  };
  lastNotificationCheck: number;
  notifiedAssets: {
    [key: string]: {
      lastNotifiedDate: string; // YYYY-MM-DD format
      daysRemaining: number;
    };
  };
}

export interface DatabaseSchema {
  users: User[];
  mainGroups: MainGroup[];
  subGroups: SubGroup[];
  assets: Asset[];
  notificationSettings?: NotificationSettings;
  nextIds: {
    users: number;
    mainGroups: number;
    subGroups: number;
    assets: number;
  };
}

const defaultDb: DatabaseSchema = {
  users: [],
  mainGroups: [],
  subGroups: [],
  assets: [],
  notificationSettings: {
    enabled: false,
    daysBeforeExpiry: 7,
    notificationTime: "09:00",
    channels: {
      bark: {
        enabled: false,
        serverUrl: "",
        deviceKey: "",
      },
      telegram: {
        enabled: false,
        botToken: "",
        chatId: "",
      },
    },
    lastNotificationCheck: 0,
    notifiedAssets: {},
  },
  nextIds: {
    users: 1,
    mainGroups: 1,
    subGroups: 1,
    assets: 1,
  }
};

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

export async function readDb(): Promise<DatabaseSchema> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    await writeDb(defaultDb);
    return defaultDb;
  }
}

export async function writeDb(data: DatabaseSchema) {
  await ensureDataDir();
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function initDb() {
  const db = await readDb();
  if (db.users.length === 0) {
    db.users.push({
      id: db.nextIds.users++,
      username: 'admin',
      password: 'admin'
    });
    await writeDb(db);
    console.log("Admin user initialized: admin/admin");
  }
}