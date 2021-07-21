import { useContext } from "react";
import dayjs from "dayjs";
import { PickyWikiContext } from "../contexts/PickyWikiContext";
import { useListVals } from "react-firebase-hooks/database";
import Flashcard from "../components/Flashcard";
import Loading from "../components/Loading";

const time = Date.now() + 60000;

export default function Study() {
    const {
        state: { auth, firebase },
    } = useContext(PickyWikiContext);

    const [flashcards, flashcardsLoading] = useListVals(
        firebase.database().ref("users/" + auth.currentUser.uid + "/flashcards/"),
        { keyField: "key" }
    );

    const [dueFlashcards] = useListVals(
        firebase
            .database()
            .ref("users/" + auth.currentUser.uid + "/flashcards/")
            .orderByChild("dueDate")
            .endBefore(dayjs(time).toISOString()),
        { keyField: "key" }
    );

    console.log();

    if (flashcardsLoading) return <Loading />;

    if (flashcards.length === 0) return <>no flashcards might wanna add some</>;

    if (
        flashcards.length > 0 &&
        dueFlashcards.filter((item) => !item.ignore).length === 0
    )
        return <>All due cards reviewed!</>;

    return (
        <>
            <Flashcard current={dueFlashcards.filter((item) => !item.ignore)[0]} />
        </>
    );
}
