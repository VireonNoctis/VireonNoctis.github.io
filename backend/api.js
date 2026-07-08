class API {
    static async get(url, options = {}) {
        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                    ...options.headers
                }
            });

            if (!response.ok) {
                throw new Error(
                    `API request failed: ${response.status}`
                );
            }

            return await response.json();

        } catch (error) {
            console.error("[API ERROR]", error);
            return null;
        }
    }


    static async post(url, body, options = {}) {
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    ...options.headers
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                throw new Error(
                    `API request failed: ${response.status}`
                );
            }

            return await response.json();

        } catch (error) {
            console.error("[API ERROR]", error);
            return null;
        }
    }
}


export default API;
