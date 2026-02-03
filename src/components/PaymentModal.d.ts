interface PaymentModalProps {
    bookingId: string;
    price: number;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}
export declare function PaymentModal({ bookingId, price, isOpen, onClose, onSuccess }: PaymentModalProps): import("react/jsx-runtime").JSX.Element;
export {};
