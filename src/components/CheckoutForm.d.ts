interface CheckoutFormProps {
    bookingId: string;
    onSuccess: () => void;
    onCancel: () => void;
    amount?: number;
}
export declare function CheckoutForm({ bookingId, onSuccess, onCancel, amount }: CheckoutFormProps): import("react/jsx-runtime").JSX.Element;
export {};
