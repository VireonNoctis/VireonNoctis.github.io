import API from "../api.js";
import SOURCES from "./sources.js";


class AniListScraper {


    static async getProfile(username) {

        const url =
            `${SOURCES.anilist.profile}${username}`;


        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0"
            }
        });


        if (!response.ok) {
            return null;
        }


        const html = await response.text();



        const extract = (regex) => {

            const match = html.match(regex);

            return match ? match[1] : null;

        };



        return {

            source: "AniList Scraper",

            username,


            avatar:
                extract(
                    /<img[^>]+class="avatar[^>]+src="([^"]+)"/
                ),


            statistics: {

                raw: html.length

            }

        };

    }

}


export default AniListScraper;
