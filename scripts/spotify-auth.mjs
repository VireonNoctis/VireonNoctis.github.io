import { createServer } from "node:http";
import { randomBytes } from "node:crypto";

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectUri = "http://127.0.0.1:8888/callback";

if (!clientId || !clientSecret) {
  console.error("Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in your local shell first.");
  process.exit(1);
}

const state = randomBytes(24).toString("hex");
const authUrl = new URL("https://accounts.spotify.com/authorize");
authUrl.search = new URLSearchParams({
  client_id: clientId,
  response_type: "code",
  redirect_uri: redirectUri,
  scope: "user-read-currently-playing",
  state
}).toString();

const server = createServer(async (request, response) => {
  const callbackUrl = new URL(request.url ?? "/", redirectUri);
  if (callbackUrl.pathname !== "/callback") {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found.");
    return;
  }

  if (callbackUrl.searchParams.get("state") !== state) {
    response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Authorization state did not match. You can close this tab and retry.");
    server.close();
    return;
  }

  const code = callbackUrl.searchParams.get("code");
  const providerError = callbackUrl.searchParams.get("error");
  if (providerError || !code) {
    response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Spotify authorization was not completed. You can close this tab and retry.");
    console.error("Spotify authorization was declined or failed.");
    server.close();
    return;
  }

  try {
    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(clientId + ":" + clientSecret).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri
      })
    });
    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenData.refresh_token) {
      throw new Error("Token exchange failed. Check the app credentials and the exact redirect URI in Spotify Developer Dashboard.");
    }

    response.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Spotify authorization completed. Return to your terminal to finish setup.");
    console.log("\nSpotify authorization succeeded.");
    console.log("Copy the following value into the GitHub Actions secret SPOTIFY_REFRESH_TOKEN:");
    console.log("\n" + tokenData.refresh_token + "\n");
    console.log("Do not paste this token into source files, issues, or public chat.");
  } catch (error) {
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("The token exchange failed. Check the terminal for a safe error message.");
    console.error(error instanceof Error ? error.message : "Spotify token exchange failed.");
  } finally {
    server.close();
  }
});

server.on("error", (error) => {
  console.error("Could not start the local callback server. Make sure port 8888 is available.");
  process.exitCode = 1;
});
server.listen(8888, "127.0.0.1", () => {
  console.log("Open the following URL in your browser to authorize Spotify:\n");
  console.log(authUrl.toString() + "\n");
  console.log("Waiting for Spotify's callback on 127.0.0.1:8888 ...");
});
