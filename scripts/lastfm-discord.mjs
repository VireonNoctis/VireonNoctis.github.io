#!/usr/bin/env node

import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const USERNAME = "reasfeetadmirer";
const PROFILE_URL = "https://www.last.fm/user/reasfeetadmirer";
const DISPLAY_NAME = "Vireon The Slop King";
const API_URL = "https://ws.audioscrobbler.com/2.0/";
const STATE_PATH = join(process.cwd(), ".lastfm-discord-state.json");
const apiKey = process.env.LASTFM_API_KEY;
const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

function setOutput(name, value) {
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, name + "=" + value + "\n", "utf8");
  }
}

setOutput("state_changed", "false");

if (!apiKey || !webhookUrl) {
  throw new Error("Missing LASTFM_API_KEY or DISCORD_WEBHOOK_URL. Add both as repository Actions secrets.");
}

function readState() {
  try {
    const state = JSON.parse(readFileSync(STATE_PATH, "utf8"));
    return state && typeof state === "object" ? state : {};
  } catch {
    return {};
  }
}

async function lastfm(method, params = {}) {
  const url = new URL(API_URL);
  url.searchParams.set("method", method);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("format", "json");
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) {
    throw new Error("Last.fm " + method + " failed with HTTP " + response.status + ".");
  }

  const payload = await response.json();
  if (payload?.error) {
    throw new Error("Last.fm " + method + " returned API error " + payload.error + ".");
  }
  return payload;
}

async function optionalLastfm(method, params = {}) {
  try {
    return await lastfm(method, params);
  } catch (error) {
    console.warn("[Last.fm] " + method + " unavailable: " + error.message);
    return null;
  }
}

function artistNameOf(track) {
  const artist = track?.artist;
  if (typeof artist === "string") return artist.trim();
  return String(artist?.["#text"] || artist?.name || "").trim();
}

function getTags(payload) {
  const raw = payload?.toptags?.tag;
  const items = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const unique = [];
  for (const item of items) {
    const value = String(typeof item === "string" ? item : item?.name || "").trim();
    if (!value) continue;
    const normalized = value.toLocaleLowerCase("en-US");
    if (!unique.some((existing) => existing.toLocaleLowerCase("en-US") === normalized)) {
      unique.push(value);
    }
    if (unique.length >= 3) break;
  }
  return unique;
}

function formatCount(value) {
  if (value === undefined || value === null || value === "") return "—";
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) return "—";
  return Math.round(number).toLocaleString("en-US");
}

function escapeMarkdown(value) {
  const reserved = new Set(["\\", "*", "_", "~", "|", ">", "[", "]", "(", ")", "!"]);
  return Array.from(String(value), (character) => reserved.has(character) ? "\\" + character : character).join("");
}

function validLastfmUrl(value) {
  try {
    const url = new URL(String(value || ""));
    return url.protocol === "https:" && (url.hostname === "last.fm" || url.hostname.endsWith(".last.fm"))
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function buildTrackUrl(artist, title, candidate) {
  const knownUrl = validLastfmUrl(candidate);
  if (knownUrl) return knownUrl;
  const segment = (value) => encodeURIComponent(value).replaceAll("%20", "+");
  return "https://www.last.fm/music/" + segment(artist) + "/_/" + segment(title);
}

function findArtwork(trackInfo, recentTrack) {
  const images = [
    ...(Array.isArray(trackInfo?.album?.image) ? trackInfo.album.image : []),
    ...(Array.isArray(recentTrack?.image) ? recentTrack.image : [])
  ];
  // Last.fm commonly orders artwork from smallest to largest; prefer the
  // highest-resolution available image for Discord's right-side thumbnail.
  for (const image of images.reverse()) {
    const value = typeof image === "string" ? image : image?.["#text"];
    try {
      const url = new URL(String(value || ""));
      if (url.protocol === "https:" && url.hostname) return url.toString();
    } catch {
      // Ignore empty and invalid image URLs.
    }
  }
  return null;
}

function isLoved(value) {
  return value === true || value === 1 || String(value).toLowerCase() === "1" || String(value).toLowerCase() === "true";
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendWebhook(payload) {
  let response;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000)
    });

    if (response.ok) return;

    if (response.status === 429 && attempt < 2) {
      let waitMs = 1000;
      try {
        const body = await response.json();
        if (Number.isFinite(Number(body?.retry_after))) {
          waitMs = Math.max(250, Math.ceil(Number(body.retry_after) * 1000));
        }
      } catch {
        // Use the default wait time when Discord does not return JSON.
      }
      await delay(Math.min(waitMs, 10000));
      continue;
    }

    if (response.status >= 500 && attempt < 2) {
      await delay(800 * (attempt + 1));
      continue;
    }

    throw new Error("Discord webhook failed with HTTP " + response.status + ". Check DISCORD_WEBHOOK_URL and webhook permissions.");
  }
  throw new Error("Discord webhook did not accept the message" + (response ? " (HTTP " + response.status + ")." : "."));
}

const recentResponse = await lastfm("user.getRecentTracks", {
  user: USERNAME,
  limit: 10,
  extended: 1
});

const rawTracks = recentResponse?.recenttracks?.track;
const recentTracks = Array.isArray(rawTracks) ? rawTracks : rawTracks ? [rawTracks] : [];
const currentTrack = recentTracks.find((item) => String(item?.["@attr"]?.nowplaying).toLowerCase() === "true");

if (!currentTrack) {
  console.log("Last.fm does not currently report a now-playing track. Nothing was posted.");
  process.exit(0);
}

const title = String(currentTrack?.name || "").trim();
const artist = artistNameOf(currentTrack);
if (!title || !artist) {
  throw new Error("Last.fm reported a now-playing item without a usable track title or artist.");
}

const mbid = String(currentTrack?.mbid || "").trim().toLowerCase();
const trackKey = mbid ? "mbid:" + mbid : artist.toLocaleLowerCase("en-US") + " :: " + title.toLocaleLowerCase("en-US");
const previous = readState();

if (previous.trackKey === trackKey) {
  console.log("The current track was already posted; no duplicate Discord message was sent.");
  process.exit(0);
}

const trackParams = { artist, track: title, username: USERNAME, autocorrect: 1 };
const [trackInfoPayload, artistInfoPayload, userInfoPayload, trackTagsPayload] = await Promise.all([
  optionalLastfm("track.getInfo", trackParams),
  optionalLastfm("artist.getInfo", { artist, username: USERNAME, autocorrect: 1 }),
  optionalLastfm("user.getInfo", { user: USERNAME }),
  optionalLastfm("track.getTopTags", { artist, track: title, autocorrect: 1 })
]);

const enrichedTrack = trackInfoPayload?.track || {};
const enrichedArtist = artistInfoPayload?.artist || {};
const userInfo = userInfoPayload?.user || {};
const album = String(currentTrack?.album?.["#text"] || enrichedTrack?.album?.title || "").trim();
const preferredTrackUrl = currentTrack?.url || enrichedTrack?.url;
const trackUrl = buildTrackUrl(artist, title, preferredTrackUrl);
let tags = getTags(trackTagsPayload?.toptags);
if (!tags.length) tags = getTags(artistInfoPayload?.artist?.tags);
if (!tags.length) {
  const artistTagsPayload = await optionalLastfm("artist.getTopTags", { artist, autocorrect: 1 });
  tags = getTags(artistTagsPayload?.toptags);
}
tags = tags.slice(0, 3).map((tag) => tag.toLocaleLowerCase("en-US"));

const artistScrobbles = enrichedArtist?.stats?.userplaycount ?? enrichedArtist?.userplaycount;
const totalScrobbles = userInfo?.playcount;
const loved = isLoved(enrichedTrack?.userloved);
const descriptionLines = [
  "Now playing for [" + DISPLAY_NAME + "](<" + PROFILE_URL + ">)",
  "### [" + escapeMarkdown(title) + "](<" + trackUrl + ">)",
  "**" + escapeMarkdown(artist) + "**" + (album ? " • *" + escapeMarkdown(album) + "*" : ""),
  tags.length ? "-# " + tags.map(escapeMarkdown).join(", ") : null,
  "-# " + (loved ? "❤️ Loved track · " : "") + formatCount(artistScrobbles) + " artist scrobbles · " + formatCount(totalScrobbles) + " total scrobbles"
].filter(Boolean);

const artwork = findArtwork(enrichedTrack, currentTrack);
const embed = {
  description: descriptionLines.join("\n"),
  color: 0xD51007,
  footer: { text: "Last.fm • Vireon" }
};
// Discord renders thumbnail artwork on the right side of the embed.
if (artwork) embed.thumbnail = { url: artwork };

await sendWebhook({
  embeds: [embed],
  allowed_mentions: { parse: [] }
});

writeFileSync(
  STATE_PATH,
  JSON.stringify({ trackKey, artist, title, notifiedAt: new Date().toISOString() }, null, 2) + "\n",
  "utf8"
);
setOutput("state_changed", "true");
console.log("Posted a new Last.fm notification for: " + artist + " — " + title);
