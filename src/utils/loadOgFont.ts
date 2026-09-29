import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

// Server/build only: no network request and no font payload in the client bundle.
let font: Promise<Buffer> | undefined;
export function loadOgFont() {
  return (font ??= readFile(
    resolve("src/assets/fonts/LXGWWenKaiLite-Regular.ttf")
  ));
}
