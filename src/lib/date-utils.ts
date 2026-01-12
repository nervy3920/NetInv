/**
 * 从资产的 values 字段中提取所有日期
 * 支持格式: xxx@YYYY-MM-DD
 */
export function extractDatesFromValues(values: string): string[] {
  const dates: string[] = [];

  try {
    // 尝试解析 JSON
    const parsed = JSON.parse(values);

    // 遍历所有值
    Object.values(parsed).forEach((value) => {
      if (typeof value === 'string') {
        // 匹配 @YYYY-MM-DD 格式的日期
        const dateMatches = value.match(/@(\d{4}-\d{2}-\d{2})/g);
        if (dateMatches) {
          dateMatches.forEach(match => {
            const date = match.substring(1); // 去掉 @ 符号
            dates.push(date);
          });
        }
      }
    });
  } catch (error) {
    // 如果不是 JSON，直接在字符串中查找日期
    const dateMatches = values.match(/@(\d{4}-\d{2}-\d{2})/g);
    if (dateMatches) {
      dateMatches.forEach(match => {
        const date = match.substring(1);
        dates.push(date);
      });
    }
  }

  return dates;
}

/**
 * 资产项接口
 */
export interface AssetItem {
  name: string;
  expiryDate: string;
}

/**
 * 从资产的 values 字段中提取所有项目及其到期日期
 * 支持格式: xxx@YYYY-MM-DD
 * 返回: [{ name: "域名名称", expiryDate: "2026-02-11" }, ...]
 */
export function extractAssetItems(values: string): AssetItem[] {
  const items: AssetItem[] = [];

  try {
    // 尝试解析 JSON
    const parsed = JSON.parse(values);

    // 遍历所有值
    Object.values(parsed).forEach((value) => {
      if (typeof value === 'string') {
        // 匹配 xxx@YYYY-MM-DD 格式
        const matches = value.match(/([^|]+)@(\d{4}-\d{2}-\d{2})/g);
        if (matches) {
          matches.forEach(match => {
            const parts = match.split('@');
            if (parts.length === 2) {
              items.push({
                name: parts[0].trim(),
                expiryDate: parts[1].trim()
              });
            }
          });
        }
      }
    });
  } catch (error) {
    // 如果不是 JSON，直接在字符串中查找
    const matches = values.match(/([^|]+)@(\d{4}-\d{2}-\d{2})/g);
    if (matches) {
      matches.forEach(match => {
        const parts = match.split('@');
        if (parts.length === 2) {
          items.push({
            name: parts[0].trim(),
            expiryDate: parts[1].trim()
          });
        }
      });
    }
  }

  return items;
}

/**
 * 获取资产的有效到期日期
 * 优先使用 expiryDate，如果为 null 则从 values 中提取最早的日期
 */
export function getAssetExpiryDate(asset: { expiryDate: string | null; values: string }): string | null {
  // 优先使用 expiryDate
  if (asset.expiryDate) {
    return asset.expiryDate;
  }

  // 从 values 中提取日期
  const dates = extractDatesFromValues(asset.values);

  if (dates.length === 0) {
    return null;
  }

  // 返回最早的日期
  dates.sort();
  return dates[0];
}
