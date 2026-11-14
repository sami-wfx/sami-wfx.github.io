export const SITE = {
  name: "AKYRO",
  // Overridable per deployment (e.g. the GitHub Pages build sets it to the github.io address).
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://saivo.studio",
  email: "hello@saivo.studio",
  telegram: "https://t.me/saivomov",
  instagram: "https://instagram.com/saivo.mov",
} as const;
