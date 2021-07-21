import { createContext, useReducer } from "react";
import WikipediaApi from "../api/wikipedia";
import { pickyWikiReducer } from "../reducers/pickyWikiReducer";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";

if (firebase.apps.length === 0) {
    firebase.initializeApp({
        apiKey: "AIzaSyBqRR8F9JL3joTuDnweRdi1LcropYZm840",
        authDomain: "pickywiki-b2d78.firebaseapp.com",
        projectId: "pickywiki-b2d78",
        storageBucket: "pickywiki-b2d78.appspot.com",
        messagingSenderId: "47691852607",
        appId: "1:47691852607:web:b6816e78999c86ebf3418a",
        measurementId: "G-6YLZGX47ED",
        databaseURL:
            "https://pickywiki-b2d78-default-rtdb.europe-west1.firebasedatabase.app",
    });
}
const auth = firebase.auth();

export const PickyWikiContext = createContext();

const wikipediaApi = new WikipediaApi({
    clientId: process.env.REACT_APP_CLIENT_ID,
    redirectUri: encodeURIComponent(process.env.REACT_APP_URL),
});

const PickyWikiContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(pickyWikiReducer, {
        wikipediaApi,
        zoom: 1,
        auth,
        firebase,
        customAuthLoading: true,
        isUpdating: true,
    });

    return (
        <PickyWikiContext.Provider value={{ state, dispatch }}>
            {children}
        </PickyWikiContext.Provider>
    );
};

export default PickyWikiContextProvider;
