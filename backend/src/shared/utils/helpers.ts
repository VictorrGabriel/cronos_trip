import { nanoid } from "nanoid";

export const customNanoId = (n: number = 21) => {
  return nanoid(n);
};

export const normalizeString = (str: string) => {
  return str
    .normalize("NFD")
    .replace(/\p{Mn}/gu, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLocaleLowerCase();
};

export const capitalizeFirstLetter = (str: string) => {
  let newStr = "";
  if (str.length === 0) return str;
  for (const char of str) {
    if (char === " ") continue;
    char.toUpperCase() + str.slice(1);
    newStr = str.charAt(0).toUpperCase() + str.slice(1);
  }

  return newStr;
};
