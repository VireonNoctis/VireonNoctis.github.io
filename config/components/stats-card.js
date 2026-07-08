class StatsCard {


    static render({
        github,
        anilist,
        lastfm
    }) {


        const container =
            document.querySelector(
                "#stats-card"
            );


        if (!container) {
            return;
        }



        container.innerHTML = `


            <div class="stats-grid">


                <div class="stat-box">

                    <h4>
                        GitHub
                    </h4>

                    <p>
                        Repositories:
                        ${github?.repositories ?? 0}
                    </p>

                    <p>
                        Followers:
                        ${github?.followers ?? 0}
                    </p>

                    <p>
                        Following:
                        ${github?.following ?? 0}
                    </p>

                </div>





                <div class="stat-box">

                    <h4>
                        Anime
                    </h4>

                    <p>
                        Total:
                        ${anilist?.anime.total ?? 0}
                    </p>

                    <p>
                        Episodes:
                        ${anilist?.anime.episodes ?? 0}
                    </p>

                    <p>
                        Hours:
                        ${Math.floor(
                            (anilist?.anime.minutes ?? 0) / 60
                        )}
                    </p>

                </div>





                <div class="stat-box">

                    <h4>
                        Manga
                    </h4>


                    <p>
                        Total:
                        ${anilist?.manga.total ?? 0}
                    </p>


                    <p>
                        Chapters:
                        ${anilist?.manga.chapters ?? 0}
                    </p>


                    <p>
                        Volumes:
                        ${anilist?.manga.volumes ?? 0}
                    </p>

                </div>





                <div class="stat-box">

                    <h4>
                        Last.fm
                    </h4>


                    <p>
                        Scrobbles:
                        ${lastfm?.scrobbles ?? 0}
                    </p>

                </div>



            </div>


        `;

    }

}


export default StatsCard;