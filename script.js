import CONFIG from "./config.js";
import GitHub from "./backend/github.js";
import AniList from "./backend/anilist.js";
import LastFM from "./backend/lastfm.js";
import SocialLinks from "./components/social-links.js";
import GitHubCard from "./components/github-card.js";
import AniListCard from "./components/anilist-card.js";
import LastFMCard from "./components/lastfm-card.js";
import StatsCard from "./components/stats-card.js";


async function loadProfile() {


    document.querySelector(
        "#profile-name"
    ).textContent =
        CONFIG.profile.name;



    document.querySelector(
        "#profile-title"
    ).textContent =
        CONFIG.profile.title;



    document.querySelector(
        "#profile-description"
    ).textContent =
        CONFIG.profile.description;



    document.querySelector(
        "#profile-avatar"
    ).src =
        CONFIG.profile.avatar;


}





async function loadData() {


    console.log(
        "Loading Imperial Archive..."
    );



    const [

        github,

        anilist,

        lastfm

    ] = await Promise.all([


        GitHub.getProfile(),


        AniList.getProfile(),


        LastFM.getStats()

    ]);





    console.log({
        github,
        anilist,
        lastfm
    });





    SocialLinks.render();





    StatsCard.render({

        github,

        anilist,

        lastfm

    });





    GitHubCard.render(
        github
    );





    AniListCard.render(
        anilist
    );





    LastFMCard.render(
        lastfm
    );



}





async function init() {


    await loadProfile();


    await loadData();



    console.log(
        "帝國檔案 initialized."
    );


}



init();