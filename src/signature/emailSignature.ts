export type SignatureLayout = "portrait" | "brand" | "minimal";
export type SignatureTheme = "ink" | "paper";

export interface SignatureConfig {
  name: string;
  role: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  location: string;
  tagline: string;
  logoUrl: string;
  portraitUrl: string;
  linkedinUrl: string;
  instagramUrl: string;
  xUrl: string;
  ctaLabel: string;
  ctaUrl: string;
  accent: string;
  layout: SignatureLayout;
  theme: SignatureTheme;
  showCompany: boolean;
  showPhone: boolean;
  showLocation: boolean;
  showSocials: boolean;
}

export function createDefaultSignatureConfig(): SignatureConfig {
  return {
    name: "",
    role: "",
    company: "",
    email: "",
    phone: "",
    website: "",
    location: "",
    tagline: "",
    logoUrl: "",
    portraitUrl: "",
    linkedinUrl: "",
    instagramUrl: "",
    xUrl: "",
    ctaLabel: "",
    ctaUrl: "",
    accent: "#a9dce3",
    layout: "portrait",
    theme: "ink",
    showCompany: true,
    showPhone: true,
    showLocation: true,
    showSocials: true
  };
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function normalizeWebUrl(value: string): string | null {
  const raw = value.trim();
  if (!raw) return null;

  try {
    const candidate = /^https?:\/\//i.test(raw) ? raw : "https://" + raw;
    const url = new URL(candidate);
    if ((url.protocol !== "https:" && url.protocol !== "http:") || url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function normalizeImageUrl(value: string): string | null {
  const url = normalizeWebUrl(value);
  if (!url) return null;

  try {
    return new URL(url).protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

function safeColor(value: string, fallback: string): string {
  return /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.length ? parts.map((part) => Array.from(part)[0]?.toUpperCase() ?? "").join("") : "YN";
}

function safeEmail(value: string): string | null {
  const email = value.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

function safePhone(value: string): string | null {
  const phone = value.trim();
  const normalized = phone.replace(/[^\d+]/g, "");
  return normalized.replace(/\+/g, "").length >= 5 ? normalized : null;
}

function makeTextLink(label: string, href: string, color: string): string {
  return '<a href="' + escapeHtml(href) + '" style="color:' + color + ';font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:17px;text-decoration:none;">' +
    escapeHtml(label) + "</a>";
}

export function buildSignatureHtml(config: SignatureConfig): string {
  const dark = config.theme === "ink";
  const background = dark ? "#101214" : "#ffffff";
  const foreground = dark ? "#f4f5f4" : "#17191a";
  const muted = dark ? "#a5abad" : "#62696b";
  const border = dark ? "#353b3e" : "#e2e6e7";
  const accent = safeColor(config.accent, "#a9dce3");
  const name = config.name.trim() || "Your name";
  const titleParts = [config.role.trim(), config.showCompany ? config.company.trim() : ""].filter(Boolean);
  const title = titleParts.join("  ·  ");
  const email = safeEmail(config.email);
  const phone = config.showPhone ? safePhone(config.phone) : null;
  const website = normalizeWebUrl(config.website);
  const websiteLabel = website ? website.replace(/^https?:\/\//i, "").replace(/\/$/, "") : "";
  const imageUrl = config.layout === "portrait"
    ? normalizeImageUrl(config.portraitUrl) || normalizeImageUrl(config.logoUrl)
    : normalizeImageUrl(config.logoUrl);
  const imageSize = config.layout === "portrait" ? 76 : 66;

  const contactLinks: string[] = [];
  if (email) contactLinks.push(makeTextLink(email, "mailto:" + email, foreground));
  if (phone) contactLinks.push(makeTextLink(config.phone.trim(), "tel:" + phone, foreground));
  if (website) contactLinks.push(makeTextLink(websiteLabel, website, foreground));

  const socialLinks: string[] = [];
  if (config.showSocials) {
    const linkedin = normalizeWebUrl(config.linkedinUrl);
    const instagram = normalizeWebUrl(config.instagramUrl);
    const x = normalizeWebUrl(config.xUrl);
    if (linkedin) socialLinks.push(makeTextLink("LinkedIn", linkedin, muted));
    if (instagram) socialLinks.push(makeTextLink("Instagram", instagram, muted));
    if (x) socialLinks.push(makeTextLink("X", x, muted));
  }

  const avatar = config.layout === "minimal" ? "" : imageUrl
    ? '<td width="' + imageSize + '" valign="top" style="width:' + imageSize + 'px;padding:0 17px 0 0;">' +
      '<img src="' + escapeHtml(imageUrl) + '" width="' + imageSize + '" height="' + imageSize +
      '" alt="' + escapeHtml(config.layout === "portrait" ? name : (config.company.trim() || name) + " logo") +
      '" style="display:block;width:' + imageSize + 'px;height:' + imageSize +
      'px;max-width:' + imageSize + 'px;border:0;outline:none;text-decoration:none;object-fit:cover;" />' +
      "</td>"
    : '<td width="' + imageSize + '" height="' + imageSize +
      '" align="center" valign="middle" bgcolor="' + accent +
      '" style="width:' + imageSize + 'px;height:' + imageSize + 'px;padding:0 17px 0 0;">' +
      '<table role="presentation" width="' + imageSize + '" height="' + imageSize +
      '" cellpadding="0" cellspacing="0" border="0" style="width:' + imageSize +
      'px;height:' + imageSize + 'px;border-collapse:collapse;"><tr><td align="center" valign="middle" style="font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:bold;line-height:1;color:#101214;">' +
      escapeHtml(initials(name)) + "</td></tr></table></td>";

  const content = [
    '<div style="margin:0;color:' + foreground + ';font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:700;line-height:25px;letter-spacing:-.35px;">' + escapeHtml(name) + "</div>",
    title ? '<div style="margin:3px 0 0;color:' + muted + ';font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:17px;">' + escapeHtml(title) + "</div>" : "",
    contactLinks.length ? '<div style="margin:12px 0 0;color:' + muted + ';font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:17px;">' + contactLinks.join('<span style="color:' + muted + ';">&nbsp;&nbsp;·&nbsp;&nbsp;</span>') + "</div>" : "",
    config.showLocation && config.location.trim()
      ? '<div style="margin:4px 0 0;color:' + muted + ';font-family:Arial,Helvetica,sans-serif;font-size:10px;line-height:15px;">' + escapeHtml(config.location.trim()) + "</div>"
      : "",
    config.tagline.trim()
      ? '<div style="margin:9px 0 0;color:' + muted + ';font-family:Arial,Helvetica,sans-serif;font-size:10px;line-height:15px;">' + escapeHtml(config.tagline.trim()) + "</div>"
      : "",
    socialLinks.length
      ? '<div style="margin:10px 0 0;color:' + muted + ';font-family:Arial,Helvetica,sans-serif;font-size:10px;line-height:16px;">' +
        socialLinks.join('<span style="color:' + border + ';">&nbsp;&nbsp; / &nbsp;&nbsp;</span>') + "</div>"
      : "",
    config.ctaLabel.trim() && normalizeWebUrl(config.ctaUrl)
      ? '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:13px 0 0;border-collapse:collapse;"><tr><td bgcolor="' + accent +
        '" style="padding:7px 11px;"><a href="' + escapeHtml(normalizeWebUrl(config.ctaUrl) as string) +
        '" style="color:#101214;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:bold;line-height:15px;text-decoration:none;">' +
        escapeHtml(config.ctaLabel.trim()) + "</a></td></tr></table>"
      : ""
  ].filter(Boolean).join("");

  const contentCell = '<td valign="top" style="padding:0 0 0 17px;border-left:2px solid ' + accent + ';">' + content + "</td>";
  const columns = config.layout === "minimal" ? contentCell : avatar + contentCell;
  const wrapperStyle = "width:100%;max-width:560px;border-collapse:collapse;border-spacing:0;background-color:" + background +
    ";font-family:Arial,Helvetica,sans-serif;color:" + foreground + ";";
  const innerStyle = "width:100%;border-collapse:collapse;border-spacing:0;";

  return '<table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" bgcolor="' + background +
    '" style="' + wrapperStyle + '"><tr><td style="padding:18px 20px;border:1px solid ' + border + ';">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="' + innerStyle +
    '"><tr>' + columns + "</tr></table></td></tr></table>";
}

export function buildSignaturePlainText(config: SignatureConfig): string {
  const lines = [
    config.name.trim(),
    [config.role.trim(), config.showCompany ? config.company.trim() : ""].filter(Boolean).join(" · "),
    safeEmail(config.email) ?? "",
    config.showPhone ? config.phone.trim() : "",
    normalizeWebUrl(config.website) ?? "",
    config.showLocation ? config.location.trim() : "",
    config.tagline.trim(),
    config.showSocials ? [
      normalizeWebUrl(config.linkedinUrl),
      normalizeWebUrl(config.instagramUrl),
      normalizeWebUrl(config.xUrl)
    ].filter(Boolean).join(" | ") : ""
  ].filter(Boolean);
  return lines.join("\n");
}

export function buildSignatureDocument(config: SignatureConfig): string {
  const signature = buildSignatureHtml(config);
  return '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Email signature</title></head>' +
    '<body style="margin:24px;padding:0;background:#f3f4f4;">' + signature + "</body></html>";
}
