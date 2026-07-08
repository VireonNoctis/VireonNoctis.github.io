// components/social-links.js
import CONFIG from "../config.js";

class SocialLinks {
  static render(socials = CONFIG.socials) {
    const container = document.querySelector("#social-links");
    if (!container) return;

    container.innerHTML = socials.map((social) => `
      <a class="social-card" href="${social.url}" target="_blank" rel="noopener noreferrer">
        <img src="${CONFIG.assets.icons}${social.icon}.svg" alt="${social.name}">
        <span>${social.name}</span>
      </a>
    `).join("");
  }
}

export default SocialLinks;