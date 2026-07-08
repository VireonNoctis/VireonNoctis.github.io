import CONFIG from "./config.js";
import GitHub from "./backend/github.js";
import AniList from "./backend/anilist.js";
import LastFM from "./backend/lastfm.js";
import SocialLinks from "./components/social-links.js";
import GitHubCard from "./components/github-card.js";
import AniListCard from "./components/anilist-card.js";
import LastFMCard from "./components/lastfm-card.js";
import StatsCard from "./components/stats-card.js";




function loadProfile() {


    const avatar =
        document.querySelector(
            "#profile-avatar"
        );


    const name =
        document.querySelector(
            "#profile-name"
        );


    const title =
        document.querySelector(
            "#profile-title"
        );


    const description =
        document.querySelector(
            "#profile-description"
        );




    if (avatar) {

        avatar.src =
            CONFIG.profile.avatar;

    }



    if (name) {

        name.textContent =
            CONFIG.profile.name;

    }



    if (title) {

        title.textContent =
            CONFIG.profile.title;

    }



    if (description) {

        description.textContent =
            CONFIG.profile.description;

    }



}








async function safeFetch(callback) {


    try {


        return await callback();


    } catch(error) {


        console.error(
            "API Error:",
            error
        );


        return null;


    }


}








async function loadSocials() {


    SocialLinks.render(
        CONFIG.socials
    );


}








async function loadStats() {


    const github =
        await safeFetch(
            () =>
                GitHub.getProfile()
        );



    const anilist =
        await safeFetch(
            () =>
                AniList.getProfile()
        );



    const lastfm =
        await safeFetch(
            () =>
                LastFM.getStats()
        );






    StatsCard.render({

        github,

        anilist,

        lastfm

    });






    if (github) {


        GitHubCard.render(
            github
        );


    }






    if (anilist) {


        AniListCard.render(
            anilist
        );


    }






    if (lastfm) {


        LastFMCard.render(
            lastfm
        );


    }



}








function setupTheme() {


    document.documentElement
        .style
        .setProperty(
            "--gold",
            CONFIG.theme.colors.gold
        );



    document.documentElement
        .style
        .setProperty(
            "--crimson",
            CONFIG.theme.colors.crimson
        );



    document.documentElement
        .style
        .setProperty(
            "--jade",
            CONFIG.theme.colors.jade
        );



    document.documentElement
        .style
        .setProperty(
            "--ink",
            CONFIG.theme.colors.ink
        );



    document.documentElement
        .style
        .setProperty(
            "--paper",
            CONFIG.theme.colors.paper
        );


}








async function init() {



    console.log(
        "Initializing Imperial Archive..."
    );



    setupTheme();



    loadProfile();



    await loadSocials();



    await loadStats();




    console.log(
        "帝國檔案 ready."
    );



}







init();