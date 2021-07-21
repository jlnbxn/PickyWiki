import { useContext, useEffect } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { PickyWikiContext } from "../contexts/PickyWikiContext";
import { useAuthState } from "react-firebase-hooks/auth";
import useWikipediaAuth from "../hooks/useWikipediaAuth";
import Star from "../star.svg";
import dayjs from "dayjs";

import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";

function Layout({ children }) {
  const { state, dispatch } = useContext(PickyWikiContext);
  const { auth, firebase, wikipediaApi, userName } = state;
  const [user, loading, error] = useAuthState(auth);

  const navigate = useNavigate();

  const code = new URLSearchParams(window.location.search).get("code");
  const accessToken = useWikipediaAuth(code);

  useEffect(() => {
    if (!accessToken || !user) return;
    wikipediaApi.setAccessToken(accessToken);
    syncWatchlist().then(() =>
      dispatch({ type: "SET_IS_UPDATING", isUpdating: false })
    );
    wikipediaApi
      .getCurrentUser()
      .then((res) => dispatch({ type: "SET_WIKIPEDIA_USER", userName: res }));
  }, [accessToken, user]);

  const syncWatchlist = async () => {
    let watchlist = await wikipediaApi.getWatchlist();
    const firebaseFlashcards = firebase
      .database()
      .ref("users/" + auth.currentUser.uid + "/flashcards");
    const flashcards = await firebaseFlashcards
      .once("value")
      .then((snapshot) => snapshot.val());
    const flashcardsArray =
      flashcards !== null
        ? Object.values(flashcards).map((item) => item.front)
        : [];
    let promises = [];
    const filtered = watchlist.filter(
      (item) => !flashcardsArray.includes(item.title)
    );
    for (let i = 0; i < filtered.length; i++) {
      let item = filtered[i];
      await createFlashcard(item.title).then((res) => {
        dispatch({
          type: "SET_PROGRESS",
          progress: `Creating Flashcard ${item.title}`,
        });
        promises.push(firebaseFlashcards.push(res));
      });
    }
    await Promise.all(promises);
  };

  const createFlashcard = async (keyword) => {
    let getPageId = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${keyword}`
    );
    let pageId = await getPageId.json();
    if (getPageId.status === 404 || !pageId.content_urls) {
      pageId.extract = "This Article got deleted.";
      pageId.extract_html = "This Article got deleted.";
      pageId.content_urls = { desktop: { page: "Not found." } };
    }
    return {
      front: keyword,
      back: pageId.extract_html,
      interval: 0,
      repetition: 0,
      efactor: 2.5,
      description: pageId.description ? pageId.description : "",
      thumbnail: pageId.thumbnail ? pageId.thumbnail.source : "",
      originalimage: pageId.originalimage ? pageId.originalimage.source : "",
      dueDate: dayjs(Date.now()).toISOString(),
    };
  };

  const signOut = () => {
    firebase
      .auth()
      .signOut()
      .then(() => { })
      .catch((error) => {
        navigate("/signin");
      });
  };

  return (
    <>
      <Navbar
        expand="lg"
        bg="light"
        variant="light"
        className="mb-4 px-2 py-2 "
      >
        <Container className="px-4">
          <RouterLink to="/" className="navbar-brand">
            <span className="align-middle me-1">PickyWiki</span>
            <img src={Star} alt="An SVG of an eye" />
          </RouterLink>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse
            id="basic-navbar-nav"
            className="justify-content-end"
          >
            <Nav className="justify-content-end">
              <RouterLink to="/about" className="nav-link">
                About
              </RouterLink>
              {user ? (
                <Nav.Link onClick={() => signOut()}>Sign Out</Nav.Link>
              ) : (
                ""
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container role="main" className="px-4">
        {children}
      </Container>
    </>
  );
}

export default Layout;
