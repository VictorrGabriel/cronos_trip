import { isInteger } from "./validation.helper";

export const isValidVisitOrderNumber = (order: unknown): boolean => {
  return (
    typeof order === "number" && (isInteger(order) || order <= 10 || order > 0)
  );
};

export const hasMinuteLeft = (minutesSum: number, minuteToAdd: number): boolean => {
  const dayMinutes = 24 * 60;
  const remainingMinutes = dayMinutes - minutesSum;

  return remainingMinutes - minuteToAdd >= 0;
};