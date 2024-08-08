import { useModal } from './ModalContext';
import './Modal.css';

const Modal = () => {
    const { modalState, hideModal } = useModal();

    if (!modalState.isOpen) return null;

    const handleConfirm = () => {
        if (modalState.onConfirm) modalState.onConfirm();
        hideModal();
    };

    const handleCancel = () => {
        if (modalState.onCancel) modalState.onCancel();
        hideModal();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{modalState.prompt}</h2>
                <div className="modal-buttons">
                    <button onClick={handleConfirm}>Yes</button>
                    <button onClick={handleCancel}>No</button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
