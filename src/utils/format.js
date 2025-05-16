/**
 * 格式化日期时间
 * @param {string|Date} dateTime - 需要格式化的日期时间
 * @param {string} format - 格式化模式，默认为'YYYY-MM-DD HH:mm:ss'
 * @returns {string} - 格式化后的日期时间字符串
 */
export function formatDateTime(dateTime, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!dateTime) return '';

  const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;

  // 如果日期无效，返回原始值
  if (isNaN(date.getTime())) {
    return dateTime;
  }

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  // 补零函数
  const padZero = (num) => (num < 10 ? '0' + num : num);

  return format
    .replace('YYYY', year)
    .replace('MM', padZero(month))
    .replace('DD', padZero(day))
    .replace('HH', padZero(hours))
    .replace('mm', padZero(minutes))
    .replace('ss', padZero(seconds));
}
