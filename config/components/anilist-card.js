class AniListCard {


    static render(data) {


        const container =
            document.querySelector(
                "#anilist-card"
            );


        if (!container || !data) {
            return;
        }



        const animeFormats =
            data.anime.formats
                .map(
                    item =>
                    `
                    <div>
                        ${item.type}
                        :
                        ${item.count}
                    </div>
                    `
                )
                .join("");



        const mangaFormats =
            data.manga.formats
                .map(
                    item =>
                    `
                    <div>
                        ${item.type}
                        :
                        ${item.count}
                    </div>
                    `
                )
                .join("");



        container.innerHTML = `


            <h4>
                Anime Archive
            </h4>


            <p>
                Total:
                ${data.anime.total}
            </p>


            <p>
                Episodes:
                ${data.anime.episodes}
            </p>



            <div class="format-grid">

                ${animeFormats}

            </div>




            <h4>
                Manga Archive
            </h4>


            <p>
                Total:
                ${data.manga.total}
            </p>


            <p>
                Chapters:
                ${data.manga.chapters}
            </p>



            <div class="format-grid">

                ${mangaFormats}

            </div>


        `;

    }

}


export default AniListCard;