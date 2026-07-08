// components/github-card.js
class GitHubCard {
  static render(data) {
    const container = document.querySelector("#github-card");
    if (!container || !data) return;

    container.innerHTML = `
      <div class="stat-row">
        <div><span>Repositories</span><strong>${data.repositories ?? 0}</strong></div>
        <div><span>Followers</span><strong>${data.followers ?? 0}</strong></div>
        <div><span>Following</span><strong>${data.following ?? 0}</strong></div>
      </div>
      <a href="${data.profile}" target="_blank" rel="noopener noreferrer">View GitHub Profile</a>
    `;
  }
}

export default GitHubCard;