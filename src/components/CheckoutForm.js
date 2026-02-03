import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useState } from "react";
import { Button } from "./ui/button";
import { Lock, Zap } from "lucide-react";
export function CheckoutForm({ bookingId, onSuccess, onCancel, amount }) {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements)
            return;
        setIsProcessing(true);
        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.href, // Placeholder
            },
            redirect: "if_required",
        });
        if (error) {
            setMessage(error.message || "An unexpected error occurred.");
            setIsProcessing(false);
        }
        else if (paymentIntent && paymentIntent.status === "succeeded") {
            handleBackendUpdate();
        }
        else {
            setMessage("Payment processing...");
            setIsProcessing(false);
        }
    };
    const handleBackendUpdate = async () => {
        try {
            await fetch(`/api/bookings/${bookingId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'confirmed' })
            });
            onSuccess();
        }
        catch (e) {
            setMessage("Payment succeeded but failed to update booking. Please contact support.");
            setIsProcessing(false);
        }
    };
    // DEBUG / DEMO ONLY: Quick Pay implementation
    const handleDemoPay = async () => {
        setIsProcessing(true);
        // Simulate network delay
        setTimeout(async () => {
            await handleBackendUpdate();
        }, 1500);
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { className: "bg-blue-50/50 p-3 rounded-lg border border-blue-100 mb-4", children: [_jsxs("p", { className: "text-xs text-blue-600 flex items-center gap-2", children: [_jsx(Lock, { className: "w-3 h-3" }), " Secure Payment via Stripe (Test Mode)"] }), _jsxs("p", { className: "text-xs text-gray-500 mt-1 pl-5", children: ["Use ", _jsx("span", { className: "font-mono bg-white px-1 rounded border", children: "4242 4242 4242 4242" }), " as card number."] })] }), _jsx(PaymentElement, {}), message && (_jsx("div", { className: "p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100", children: message })), _jsxs("div", { className: "flex flex-col gap-3 mt-6", children: [_jsx(Button, { type: "submit", disabled: isProcessing || !stripe || !elements, className: "w-full bg-primary hover:bg-primary/90 text-whitefont-bold py-6 text-lg shadow-lg", children: isProcessing ? "Processing..." : `Pay ₹${amount || ''}` }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { type: "button", variant: "outline", onClick: onCancel, className: "flex-1", children: "Cancel" }), _jsxs(Button, { type: "button", variant: "ghost", onClick: handleDemoPay, disabled: isProcessing, className: "flex-1 text-xs text-gray-400 hover:text-primary hover:bg-primary/5", children: [_jsx(Zap, { className: "w-3 h-3 mr-1" }), " Demo Quick Pay"] })] })] })] }));
}
