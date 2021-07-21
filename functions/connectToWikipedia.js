const fetch = require("node-fetch");
const admin = require("firebase-admin");

const serviceAccount = {
    type: process.env.FB_SERVICE_ACCOUNT_TYPE,
    project_id: process.env.FB_SERVICE_ACCOUNT_PROJECT_ID,
    private_key_id: process.env.FB_SERVICE_ACCOUNT_PRIVATE_KEY_ID,
    private_key: process.env.FB_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email: process.env.FB_SERVICE_ACCOUNT_CLIENT_EMAIL,
    client_id: process.env.FB_SERVICE_ACCOUNT_CLIENT_ID,
    auth_uri: process.env.FB_SERVICE_ACCOUNT_AUTH_URI,
    token_uri: process.env.FB_SERVICE_ACCOUNT_TOKEN_URI,
    auth_provider_x509_cert_url:
        process.env.FB_SERVICE_ACCOUNT_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FB_SERVICE_ACCOUNT_CLIENT_X509_CERT_URL,
};

if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL:
            "https://pickywiki-b2d78-default-rtdb.europe-west1.firebasedatabase.app",
    });
}

exports.handler = async (event, context) => {
    const clientId = process.env.REACT_APP_CLIENT_ID;
    const clientSecret = process.env.REACT_APP_CLIENT_SECRET;
    const redirectUri = process.env.REACT_APP_URL;
    let code = event.body;

    const data = {
        grant_type: "authorization_code",
        code: code,
        client_secret: clientSecret,
        client_id: clientId,
        redirect_uri: redirectUri,
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
            `https://en.wikipedia.org/w/rest.php/oauth2/access_token?grant_type=authorization_code&code=${code}&client_id=${clientId}&client_secret=${clientSecret}redirect_uri=${redirectUri}`,
            options
        ).then((res) => res.json());
        console.log(response);

        const userInfo = await fetch(
            "https://en.wikipedia.org/w/api.php?action=query&meta=userinfo&uiprop=rights&format=json",
            {
                headers: {
                    Authorization: `Bearer ${response.access_token}`,
                    "Content-Type": "application/json; charset=UTF-8",
                },
            }
        ).then((res) => res.json());

        const wikipediaUserId = userInfo.query.userinfo.id.toString();

        const customToken = await admin.auth().createCustomToken(wikipediaUserId);

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "text/html",
            },
            body: JSON.stringify({
                customToken,
                accessToken: response.access_token,
                refreshToken: response.refresh_token,
                expiresIn: response.expires_in,
            }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify(error),
        };
    }
};
