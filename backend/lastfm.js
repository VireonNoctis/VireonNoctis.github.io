import API from "./api.js";
import Cache from "./cache.js";
import CONFIG from "../config.js";


class LastFM {


    static async request(method, params = {}) {

        const query = new URLSearchParams({

            method,

            api_key: CONFIG.lastfm.apiKey,

            format: "json",

            user: CONFIG.lastfm.username,

            ...params

        });


        return await API.get(
            `https://ws.audioscrobbler.com/2.0/?${query}`
        );

    }



    static async getNowPlaying() {


        const cacheKey = "lastfm_now_playing";


        const cached = Cache.get(cacheKey);


        if (cached) {
            return cached;
        }



        const data = await this.request(
            "user.getrecenttracks",
            {
                limit: 1
            }
        );



        const track =
            data?.recenttracks?.track?.[0];



        if (!track) {
            return null;
        }



        const isPlaying =
            track["@attr"]?.nowplaying === "true";



        const result = {


            playing: isPlaying,


            track:
                track.name,


            artist:
                track.artist?.["#text"],


            album:
                track.album?.["#text"],


            cover:
                track.image?.at(-1)?.["#text"],


            url:
                track.url

        };



        Cache.set(
            cacheKey,
            result,
            CONFIG.api.cacheTime * 1000
        );



        return result;

    }





    static async getStats() {


        const cacheKey = "lastfm_stats";


        const cached = Cache.get(cacheKey);


        if (cached) {
            return cached;
        }



        const data = await this.request(
            "user.getinfo"
        );



        const user =
            data?.user;



        if (!user) {
            return null;
        }



        const result = {


            username:
                user.name,


            avatar:
                user.image?.at(-1)?.["#text"],


            scrobbles:
                Number(
                    user.playcount
                ),


            registered:
                user.registered?.unixtime

        };



        Cache.set(
            cacheKey,
            result,
            CONFIG.api.cacheTime * 1000
        );



        return result;

    }


}


export default LastFM;
