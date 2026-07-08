import API from "./api.js";
import Cache from "./cache.js";
import CONFIG from "../config.js";
import AniListScraper from "./scrapers/anilist-scraper.js";

class AniList {

    static async request(query, variables = {}) {

        return await API.post(
            "https://graphql.anilist.co",
            {
                query,
                variables
            }
        );

    }



    static async getProfile() {

        const cacheKey = "anilist_profile";

        const cached = Cache.get(cacheKey);

        if (cached) {
            return cached;
        }


        const query = `
            query ($username: String) {

                User(name: $username) {

                    id

                    name

                    avatar {
                        large
                    }

                    about


                    statistics {

                        anime {

                            count

                            episodesWatched

                            minutesWatched


                            formats {

                                format

                                count

                            }

                        }



                        manga {

                            count

                            chaptersRead

                            volumesRead


                            formats {

                                format

                                count

                            }

                        }

                    }

                }

            }
        `;



        const data = await this.request(query, {
            username: CONFIG.anilist.username
        });



        if (!data?.data?.User) {

    return await AniListScraper.getProfile(
        CONFIG.anilist.username
    );

}


        const user = data.data.User;



        const result = {

            username: user.name,


            avatar: user.avatar.large,


            about: user.about,



            anime: {

                total:
                    user.statistics.anime.count,


                episodes:
                    user.statistics.anime.episodesWatched,


                minutes:
                    user.statistics.anime.minutesWatched,


                formats:
                    user.statistics.anime.formats.map(item => ({
                        type: item.format,
                        count: item.count
                    }))

            },



            manga: {

                total:
                    user.statistics.manga.count,


                chapters:
                    user.statistics.manga.chaptersRead,


                volumes:
                    user.statistics.manga.volumesRead,


                formats:
                    user.statistics.manga.formats.map(item => ({
                        type: item.format,
                        count: item.count
                    }))

            }

        };



        Cache.set(
            cacheKey,
            result,
            CONFIG.api.cacheTime * 1000
        );



        return result;

    }

}


export default AniList;
