
import { Container, Spinner } from 'react-bootstrap'

function Loading() {
    return (
        <Container
            style={{
                minHeight: '75vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>

            <Spinner animation="border" role="status" variant="secondary">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </Container>


    )
}

export default Loading
