import CONFIG from "../config.js";


class SocialLinks {


    static render() {


        const container =
            document.querySelector(
                "#social-links"
            );


        if (!container) {
            return;
        }



        container.innerHTML = "";



        CONFIG.socials.forEach(
            social => {


                const link =
                    document.createElement(
                        "a"
                    );


                link.className =
                    "social-card";


                link.href =
                    social.url;


                link.target =
                    "_blank";



                link.rel =
                    "noopener noreferrer";



                link.innerHTML = `

                    <img
                        src="assets/icons/${social.icon}.svg"
                        alt="${social.name}"
                    >

                    <span>
                        ${social.name}
                    </span>

                `;



                container.appendChild(
                    link
                );

            }
        );

    }


}


export default SocialLinks;