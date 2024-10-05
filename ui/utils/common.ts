import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { partial } from "filesize";

export const copyDataToClipboard = (text: string) => {
  return new Promise((resolve, reject) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        resolve("copy success");
      })
      .catch((err) => {
        const errorMessage = `Unable to copy array to clipboard: ${err}`;
        console.error(errorMessage);
        reject(errorMessage);
      });
  });
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const base64ToBinary = (base64: string) =>
  new Uint8Array(
    atob(base64)
      .split("")
      .map((x) => x.charCodeAt(0)),
  );

export const size = partial({ standard: "jedec", round: 0 });

export const size2round = partial({ standard: "jedec" });

export const magnetRegex = /^magnet:\?xt=urn:btih:([0-9a-fA-F]{40,}).*$/;
