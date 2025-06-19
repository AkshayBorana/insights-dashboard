/**
 * The function generates the start and end dates and their timestamps for a given period (e.g., last month, last quarter, last year)
 *
 * @param config - Config object defining the period:
 *                 - `monthOffset`: Number of months to offset from the current month (e.g., -1 for last month).
 *                 - `startMonth`: Starting month (0-based) or undefined for month-based periods.
 *                 - `endMonth`: Ending month (0-based ) or undefined for month-based periods.
 *                 - `yearOffset`: Number of years to offset from the current year (e.g., -1 for last year).
 * @returns Object - Object containing:
 *                   - `firstDay` : Date object of firt day.
 *                   - `firstDayTimeStamp`: Timestamp of the first day.
 *                   - `lastDay`: Date object of last day.
 *                   - `lastDayTimeStamp`: Timestamp of the last day.
 */
export const getDateLabels = (config: {
  monthOffset?: number;
  startMonth?: number;
  endMonth?: number;
  yearOffset?: number;
}) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const yearOffset = config.yearOffset ?? 0;
  const targetYear = currentYear + yearOffset;

  // Calculate the adjusted month with offset, defaulting to current month if not specified
  const adjustedMonth =
    config.monthOffset !== undefined
      ? (currentMonth + config.monthOffset + 12) % 12
      : config.startMonth
      ? config.startMonth - 1
      : currentMonth;

  // First day calculation
  const firstDay = new Date(targetYear, adjustedMonth, 1);
  firstDay.setHours(0, 0, 0, 0);

  // Last day calculation
  const lastDay =
    config.endMonth !== undefined
      ? new Date(targetYear, config.endMonth, 0)
      : new Date(targetYear, adjustedMonth + 1, 0);
  lastDay.setHours(23, 59, 59, 999);

  return {
    firstDay,
    firstDayTimeStamp: firstDay.getTime(),
    lastDay,
    lastDayTimeStamp: lastDay.getTime(),
  };
};
