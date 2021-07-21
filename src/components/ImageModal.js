import Modal from "react-bootstrap/Modal";
import Image from "react-bootstrap/Image";

function ImageModal({ show, onHide, imageUrl, title, description }) {
    return (
        <Modal
            show={show}
            onHide={onHide}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>{title}</Modal.Header>
            <Image
                src={imageUrl}
                style={{
                    width: "100%",
                }}
            />
            <Modal.Body>{description}</Modal.Body>
        </Modal>
    );
}

export default ImageModal;
