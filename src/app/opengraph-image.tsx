import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { translations } from "@/lib/i18n/translations";

const t = translations.ru;

export const alt = t.meta.title;
export const size = { width: 1200, height: 630 };
export const dynamic = "force-static";
export const contentType = "image/png";

// PT Sans has full Cyrillic coverage so the Russian subtitle renders correctly.
const ptSansBold = await readFile(join(process.cwd(), "public/fonts/PTSans-Bold.ttf"));

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#070812",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "radial-gradient(60% 60% at 50% 45%, rgba(115,87,255,0.22) 0%, rgba(7,8,18,0) 70%)",
          }}
        />
        <div
          style={{
            display: "flex",
            fontSize: 200,
            fontWeight: 700,
            letterSpacing: -6,
            fontFamily: "PT Sans",
            backgroundImage:
              "linear-gradient(115deg, #7f85a8 0%, #eceeff 25%, #ffffff 40%, #8f93b8 55%, #dfe2f5 75%, #4a4d6a 100%)",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          AKYRO
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 18,
            fontSize: 30,
            letterSpacing: 4,
            fontFamily: "PT Sans",
            fontWeight: 700,
            color: "rgba(245,245,245,0.6)",
            textTransform: "uppercase",
          }}
        >
          {t.footer.role}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "PT Sans", data: ptSansBold, style: "normal", weight: 700 }],
    }
  );
}
