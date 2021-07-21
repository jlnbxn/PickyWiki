const fetch = require("node-fetch");

exports.handler = async (event, context) => {
    const clientId = process.env.REACT_APP_CLIENT_ID;
    const clientSecret = process.env.REACT_APP_CLIENT_SECRET;
    const redirectUri = process.env.REACT_APP_URL;

    let refreshToken = event.body;

    const data = {
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
    };

    const formBody = Object.keys(data)
        .map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
        .join("&");
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formBody,
    };

    try {
        const response = await fetch(
            `https://en.wikipedia.org/w/rest.php/oauth2/access_token`,
            options
        ).then((res) => res.json());

        return {
            statusCode: 200,
            body: JSON.stringify({
                accessToken: response.access_token,
                refreshToken: response.refresh_token,
                expiresIn: response.expires_in,
            }),
        };
    } catch (error) {
        console.log(error);

        return {
            statusCode: 500,
            body: JSON.stringify(error),
        };
    }
};
