import type { FontStyle, FontWeight } from "satori";

export type FontOptions = {
  name: string;
  data: ArrayBuffer;
  weight: FontWeight | undefined;
  style: FontStyle | undefined;
};

type FontSource = {
  name: string;
  weight: FontWeight;
  style: FontStyle;
  font?: string; // legacy Google font query
  css?: string; // external CSS that declares @font-face
};

async function loadFontFromCss(cssUrl: string): Promise<ArrayBuffer> {
  const css = await fetch(cssUrl).then(res => {
    if (!res.ok) {
      throw new Error("Failed to download font CSS. Status: " + res.status);
    }
    return res.text();
  });

  const resource = css.match(/src:\s*url\(([^)]+)\)/);

  if (!resource) throw new Error("Failed to locate font file in CSS");

  const res = await fetch(resource[1]);

  if (!res.ok) {
    throw new Error("Failed to download font file. Status: " + res.status);
  }

  return res.arrayBuffer();
}

async function loadGoogleFont(
  font: string | undefined,
  text: string,
  cssUrl?: string
): Promise<ArrayBuffer> {
  if (cssUrl) {
    return loadFontFromCss(cssUrl);
  }

  if (!font) throw new Error("Font name is required when no CSS URL is given");

  const API = `https://fonts.googleapis.com/css2?family=${font}&text=${encodeURIComponent(text)}`;

  const css = await (
    await fetch(API, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1",
      },
    })
  ).text();

  const resource = css.match(
    /src: url\((.+)\) format\('(opentype|truetype)'\)/
  );

  if (!resource) throw new Error("Failed to download dynamic font");

  const res = await fetch(resource[1]);

  if (!res.ok) {
    throw new Error("Failed to download dynamic font. Status: " + res.status);
  }

  const fonts: ArrayBuffer = await res.arrayBuffer();
  return fonts;
}

async function loadGoogleFonts(
  text: string
): Promise<
  Array<{ name: string; data: ArrayBuffer; weight: number; style: string }>
> {
  const fontsConfig: FontSource[] = [
    {
      name: "LXGW WenKai Screen",
      css: "https://cdn.jsdelivr.net/npm/lxgw-wenkai-screen-web/lxgwwenkaiscreen/result.css",
      weight: 400 as FontWeight,
      style: "normal" as FontStyle,
    },
  ];

  const fonts = await Promise.all(
    fontsConfig.map(async ({ name, font, css, weight, style }) => {
      const data = await loadGoogleFont(font, text, css);
      return { name, data, weight, style };
    })
  );

  return fonts;
}

export default loadGoogleFonts;
