import kebabcase from "lodash.kebabcase";

// Preserve published tag URLs (e.g. javaScript → java-script, centOS → cent-os).
export const slugifyStr = (str: string): string => kebabcase(str);
export const slugifyAll = (arr: string[]) => arr.map(slugifyStr);
