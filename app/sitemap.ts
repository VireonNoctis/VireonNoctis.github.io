import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://vireonnoctis.github.io/",
      lastModified: new Date("2026-10-23T00:00:00.000Z"),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
