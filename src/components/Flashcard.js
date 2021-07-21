import { useState, useEffect, useContext } from "react";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import ButtonToolbar from "react-bootstrap/ButtonToolbar";
import { supermemo } from "supermemo";
import dayjs from "dayjs";
import { PickyWikiContext } from "../contexts/PickyWikiContext";
import ImageModal from "../components/ImageModal";


const ratings = [{
    grade: 0,
    description: "complete blackout."
},
{
    grade: 1,
    description: "incorrect response; the correct one remembered."
},
{
    grade: 2,
    description: "incorrect response; where the correct one seemed easy to recall."
},
{
    grade: 3,
    description: "correct response recalled with serious difficulty."
},
{
    grade: 4,
    description: "correct response after a hesitation."
},
{
    grade: 5,
    description: "perfect response."
}

]


function Flashcard({ current }) {
    const { state, dispatch } = useContext(PickyWikiContext);
    const { auth, firebase, wikipediaApi, zoom, progress, wikipediaUser, userName, isUpdating, } = state;
    const [showAnswer, setShowAnswer] = useState(false);
    const [modalShow, setModalShow] = useState(false);
    const [imageUrl, setImageUrl] = useState('')

    useEffect(() => {
        if (!current) return
        wikipediaApi.getThumbnailUrl(current.front).then(res => setImageUrl(res))
    }, [current])

    const rateCurrent = async (grade) => {
        let updatedFlashcard = practice(current, grade);
        setShowAnswer(false);
        const fbFlashcard = firebase
            .database()
            .ref("users/" + auth.currentUser.uid + "/flashcards/" + current.key);
        await fbFlashcard.update(updatedFlashcard);
    };

    const ignore = async (current) => {
        setShowAnswer(false);
        const fbFlashcard = firebase
            .database()
            .ref("users/" + auth.currentUser.uid + "/flashcards/" + current.key);
        await fbFlashcard.update({
            ...current,
            ignore: true
        });
    };


    const practice = (flashcard, grade) => {
        const { interval, repetition, efactor } = supermemo(flashcard, grade);
        const dueDate = dayjs(Date.now()).add(interval, "day").toISOString();
        return { ...flashcard, interval, repetition, efactor, dueDate };
    };

    return (
        <>
            <ButtonToolbar aria-label="Zoom">
                <Button variant="outline-danger" className="me-1" onClick={() => ignore(current)}>Ignore</Button>
                <Button variant="outline-secondary" onClick={() => { dispatch({ type: 'ZOOM_IN' }) }} className="me-1">+</Button>
                <Button variant="outline-secondary" onClick={() => { dispatch({ type: 'ZOOM_OUT' }) }} className="me-1">-</Button>
            </ButtonToolbar>
            <Container
                className="p-0 mb-4 mt-4"
                style={{
                    minHeight: '75vh',
                    fontSize: zoom + 'rem'
                }}>
                <Card
                    className={
                        current.back === "This Article got deleted."
                            ? "mb-2 bg-danger text-white"
                            : "mb-2 "
                    }
                >
                    <Card.Body className="p-0">
                        <Card.Text>{current.front}</Card.Text>
                        <hr />
                        {showAnswer &&
                            <Card.Text
                                dangerouslySetInnerHTML={{ __html: current.back }}
                            />
                        }
                        {imageUrl && <Card.Img variant="bottom" src={imageUrl}
                            onClick={() => setModalShow(true)}
                            style={{
                                width: '50%',
                                visibility: showAnswer ? 'visible' : 'hidden',
                                height: showAnswer ? '100%' : '0'
                            }} />}
                        {/* empty div to compensate for fixed bottom toolbar on smaller screens */}
                        <div style={{ minHeight: '6rem' }}></div>
                    </Card.Body>
                </Card>
            </Container >
            <Container id="ansarea">
                <Row className="justify-content-center">
                    <Col xs="auto">
                        {!showAnswer ? (
                            <Button size="lg" onClick={() => setShowAnswer(true)}>
                                Show Answer
                            </Button>
                        ) : (
                            <ButtonToolbar aria-label="Basic example" >
                                <ButtonGroup size="lg">
                                    {ratings.map((item) => (
                                        <OverlayTrigger
                                            key={item.grade}
                                            placement="top"
                                            overlay={
                                                <Tooltip id={`tooltip-${item.grade}`}>
                                                    {item.description}
                                                </Tooltip>
                                            }
                                        >
                                            <Button className="me-1" variant="outline-secondary" onClick={() => rateCurrent(item.grade)}>{item.grade}</Button>
                                        </OverlayTrigger>
                                    ))}
                                </ButtonGroup>
                            </ButtonToolbar>
                        )}
                    </Col>

                </Row>
                <ImageModal
                    show={modalShow}
                    onHide={() => setModalShow(false)}
                    imageUrl={imageUrl}
                    title={current.front}
                    description={current.description}
                />
            </Container>


        </>
    )
}

export default Flashcard
