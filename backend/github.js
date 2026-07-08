import API from "./api.js";
import Cache from "./cache.js";
import CONFIG from "../config.js";


class GitHub {

    static async getProfile() {

        const cacheKey = "github_profile";

        const cached = Cache.get(cacheKey);

        if (cached) {
            return cached;
        }


        const username = CONFIG.github.username;

        const data = await API.get(
            `https://api.github.com/users/${username}`
        );


        if (!data) {
            return null;
        }


        const result = {
            username: data.login,
            avatar: data.avatar_url,
            name: data.name,

            bio: data.bio,

            followers: data.followers,
            following: data.following,

            repositories: data.public_repos,

            created: data.created_at,

            profile: data.html_url
        };


        Cache.set(
            cacheKey,
            result,
            CONFIG.api.cacheTime * 1000
        );


        return result;
    }



    static async getRepositories() {

        const cacheKey = "github_repositories";

        const cached = Cache.get(cacheKey);

        if (cached) {
            return cached;
        }


        const username = CONFIG.github.username;


        const repos = await API.get(
            `https://api.github.com/users/${username}/repos?per_page=100`
        );


        if (!repos) {
            return [];
        }


        const result = repos.map(repo => ({
            name: repo.name,
            description: repo.description,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            language: repo.language,
            url: repo.html_url
        }));


        Cache.set(
            cacheKey,
            result,
            CONFIG.api.cacheTime * 1000
        );


        return result;
    }

}


export default GitHub;
