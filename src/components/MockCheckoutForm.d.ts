interface MockCheckoutFormProps {
    bookingId: string;
    onSuccess: () => void;
    onCancel: () => void;
    amount?: number;
}
export declare function MockCheckoutForm({ bookingId, onSuccess, onCancel, amount }: MockCheckoutFormProps): import("react/jsx-runtime").JSX.Element;
export {};
