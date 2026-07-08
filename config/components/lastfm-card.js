class LastFMCard {


    static render(data) {


        const container =
            document.querySelector(
                "#lastfm-card"
            );


        if (!container || !data) {
            return;
        }



        container.innerHTML = `


            <img
                class="album-cover"
                src="${data.avatar}"
                alt="LastFM"
            >



            <h4>
                ${data.playing
                    ? "Now Playing"
                    : "Last Played"
                }
            </h4>



            <p>
                ${data.track || ""}
            </p>


            <p>
                ${data.artist || ""}
            </p>



            <p>
                Scrobbles:
                ${data.scrobbles || "Unknown"}
            </p>


        `;

    }

}


export default LastFMCard;
