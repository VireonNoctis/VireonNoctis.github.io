// components/lastfm-card.js
class LastFMCard {
  static render(data) {
    const container = document.querySelector("#lastfm-card");
    if (!container || !data) return;

    container.innerHTML = `
      <h4>Music Archive</h4>
      <p>${data.playing ? "Now Playing" : "Last Played"}</p>
      <p>${data.track ?? ""}</p>
      <p>${data.artist ?? ""}</p>
      <p>Scrobbles: ${data.scrobbles ?? 0}</p>
    `;
  }
}

export default LastFMCard;