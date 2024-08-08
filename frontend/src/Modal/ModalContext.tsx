import React, { createContext, useContext, useState, ReactNode } from 'react';
import Modal from './Modal'

type ModalContextType = {
    showModal: (prompt: string, onConfirm?: () => void, onCancel?: () => void) => void;
    hideModal: () => void;
    modalState: ModalStateType;
};

type ModalStateType = {
    isOpen: boolean;
    prompt: string;
    onConfirm?: () => void;
    onCancel?: () => void;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [modalState, setModalState] = useState<ModalStateType>({
        isOpen: false,
        prompt: '',
    });

    const showModal = (prompt: string, onConfirm?: () => void, onCancel?: () => void) => {
        setModalState({
            isOpen: true,
            prompt,
            onConfirm,
            onCancel,
        });
    };

    const hideModal = () => {
        setModalState({
            isOpen: false,
            prompt: '',
            onConfirm: undefined,
            onCancel: undefined,
        });
    };

    return (
        <ModalContext.Provider value={{ modalState, showModal, hideModal }}>
            {children}
            <Modal />
        </ModalContext.Provider>
    );
};

export const useModal = (): ModalContextType => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};
