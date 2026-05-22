import { isInteger } from "@shared/utils";

export const isValidDayDate = (
  startDate: Date,
  endDate: Date,
  dayDate: Date,
): boolean => {
  const startDateTimestamp = startDate.getTime();
  const endDateTimestamp = endDate.getTime();
  const dayDateTimestamp = dayDate.getTime();

  return (
    startDateTimestamp <= dayDateTimestamp &&
    endDateTimestamp > dayDateTimestamp
  );
};

export const isValidDailyQuota = (dailyQuota: number): boolean =>
  isInteger(dailyQuota) && dailyQuota <= 10 && dailyQuota >= 0;

export const isValidTotalEstimateCents = (totalEstimateCents: number) =>
  isInteger(totalEstimateCents) && totalEstimateCents >= 0;

export const isValidApiReference = (apiRef: string) =>
  apiRef.length > 8 && apiRef.match(/[a-z]\d+/);