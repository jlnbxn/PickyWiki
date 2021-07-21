import { useState, useEffect, useContext } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { PickyWikiContext } from "../contexts/PickyWikiContext";

function useWikipediaAuth(code) {
    const [accessToken, setAccessToken] = useState();
    const [refreshToken, setRefreshToken] = useState();
    const [expiresIn, setExpiresIn] = useState();
    const { state, dispatch } = useContext(PickyWikiContext);
    const { auth, firebase, watchlistraw, current, key } = state;
    const [user] = useAuthState(auth);

    const navigate = useNavigate();

    useEffect(() => {
        if (!code) return;
        fetch(`/.netlify/functions/connectToWikipedia`, {
            method: "POST",
            body: code,
        })
            .then((res) => res.json())
            .then((res) => {
                auth
                    .signInWithCustomToken(res.customToken)
                    .then((userCredential) => {
                        const user = userCredential.user;
                        const wikiCredentials = firebase
                            .database()
                            .ref("users/" + auth.currentUser.uid + "/wiki");
                        dispatch({ type: "SET_CUSTOM_AUTH_LOADING" });
                        wikiCredentials.set({
                            expirationDate: Date.now() + res.expiresIn * 1000,
                            refreshToken: res.refreshToken,
                            accessToken: res.accessToken,
                        });
                        // ...
                    })
                    .catch((error) => {
                        var errorCode = error.code;
                        var errorMessage = error.message;
                        // ...
                    });
                setAccessToken(res.accessToken);

                navigate("/");
            })
            .catch((error) => {
                console.log(error);
                // navigate("/");
            });
    }, [code, user]);

    useEffect(() => {
        if (!user) return;

        const wikiCredentials = firebase
            .database()
            .ref("users/" + auth.currentUser.uid + "/wiki");
        wikiCredentials.on("value", (snapshot) => {
            const wikiData = snapshot.val();
            if (wikiData === null) return;
            if (wikiData.expirationDate < new Date()) {
                fetch(`/.netlify/functions/refreshWikipedia`, {
                    method: "POST",
                    body: wikiData.refreshToken,
                })
                    .then((res) => res.json())
                    .then((res) => {
                        console.log(res);
                        setAccessToken(res.accessToken);
                        setRefreshToken(res.refreshToken);
                        setExpiresIn(res.expiresIn);
                    });
            } else {
                setAccessToken(wikiData.accessToken);
            }

            dispatch({ type: "SET_CUSTOM_AUTH_LOADING" });
        });
    }, [user]);

    return accessToken;
}

export default useWikipediaAuth;
