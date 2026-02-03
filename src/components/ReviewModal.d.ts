interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    guideId: string;
    guideName: string;
    userName: string;
    tourType: string;
    onSuccess: () => void;
}
export declare function ReviewModal({ isOpen, onClose, guideId, guideName, userName, tourType, onSuccess }: ReviewModalProps): import("react/jsx-runtime").JSX.Element;
export {};
