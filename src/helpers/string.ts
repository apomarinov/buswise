import crypto from "crypto";

export const capitalize = (s?: string) => {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const md5 = (str: string) => {
  return crypto.createHash("md5").update(str).digest("hex");
};

export const sumCharactersToNumber = (str: string) =>
  str.split("").reduce((prev, curr) => prev + curr.charCodeAt(0), 0);

export const colorFromString = (str?: string) => {
  if (!str) return "";
  return `hsl(${sumCharactersToNumber(md5(str)) % 360}, 70%, 60%)`;
};

export async function sleep(ms: number) {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve(true);
    }, ms),
  );
}
