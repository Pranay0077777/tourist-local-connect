import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { CheckoutForm } from "./CheckoutForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

// Public Key (Simulated test key)
// Public Key from .env
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_TYooMQauvdEDq54NiTphI7jx");

interface PaymentModalProps {
    bookingId: string;
    price: number;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function PaymentModal({ bookingId, price, isOpen, onClose, onSuccess }: PaymentModalProps) {
    const [clientSecret, setClientSecret] = useState("");

    useEffect(() => {
        if (isOpen && bookingId) {
            // Create PaymentIntent as soon as the page loads
            const API_URL = import.meta.env.VITE_API_URL || '';
            fetch(`${API_URL}/api/payments/create-payment-intent`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bookingId }),
            })
                .then((res) => res.json())
                .then((data) => setClientSecret(data.clientSecret));
        }
    }, [isOpen, bookingId]);

    const appearance = {
        theme: 'stripe' as const,
    };

    // Pass clientSecret to elements
    const options = {
        clientSecret,
        appearance,
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Complete Payment (₹{price})</DialogTitle>
                </DialogHeader>

                {clientSecret && (
                    <Elements options={options} stripe={stripePromise}>
                        <CheckoutForm bookingId={bookingId} onSuccess={onSuccess} onCancel={onClose} />
                    </Elements>
                )}
                {!clientSecret && isOpen && (
                    <div className="flex justify-center p-8">
                        Loading payment details...
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
