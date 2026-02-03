import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { CheckoutForm } from "./CheckoutForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
// Public Key (Simulated test key)
// Public Key from .env
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_TYooMQauvdEDq54NiTphI7jx");
export function PaymentModal({ bookingId, price, isOpen, onClose, onSuccess }) {
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
        theme: 'stripe',
    };
    // Pass clientSecret to elements
    const options = {
        clientSecret,
        appearance,
    };
    return (_jsx(Dialog, { open: isOpen, onOpenChange: onClose, children: _jsxs(DialogContent, { className: "sm:max-w-md", children: [_jsx(DialogHeader, { children: _jsxs(DialogTitle, { children: ["Complete Payment (\u20B9", price, ")"] }) }), clientSecret && (_jsx(Elements, { options: options, stripe: stripePromise, children: _jsx(CheckoutForm, { bookingId: bookingId, onSuccess: onSuccess, onCancel: onClose }) })), !clientSecret && isOpen && (_jsx("div", { className: "flex justify-center p-8", children: "Loading payment details..." }))] }) }));
}
