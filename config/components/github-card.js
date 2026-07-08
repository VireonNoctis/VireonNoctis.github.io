class GitHubCard {


    static render(data) {


        const container =
            document.querySelector(
                "#github-card"
            );


        if (!container || !data) {
            return;
        }



        container.innerHTML = `

            <div class="stat-row">

                <div>
                    <span>Repositories</span>
                    <strong>
                        ${data.repositories}
                    </strong>
                </div>


                <div>
                    <span>Followers</span>
                    <strong>
                        ${data.followers}
                    </strong>
                </div>


                <div>
                    <span>Following</span>
                    <strong>
                        ${data.following}
                    </strong>
                </div>

            </div>


            <a 
                href="${data.profile}"
                target="_blank"
            >
                View Imperial Repository
            </a>

        `;

    }

}


export default GitHubCard;
