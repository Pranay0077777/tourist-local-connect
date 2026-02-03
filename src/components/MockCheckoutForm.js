import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Lock, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
export function MockCheckoutForm({ bookingId, onSuccess, onCancel, amount }) {
    const [cardNumber, setCardNumber] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvc, setCvc] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [step, setStep] = useState('card');
    const [otp, setOtp] = useState("");
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        // Simulate network request for card validation
        await new Promise(resolve => setTimeout(resolve, 1500));
        // Simple validation for the demo/test card
        if (cardNumber.replace(/\s/g, '').startsWith('4242')) {
            setIsProcessing(false);
            setStep('otp');
            toast.info("Redirecting to Bank Verification...");
        }
        else {
            toast.error("Card declined. Try using the test card (4242...)");
            setIsProcessing(false);
        }
    };
    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        if (otp === "123456") {
            // Try to update backend, but don't block on it
            try {
                // If it's a demo, use local storage immediately
                if (bookingId.startsWith('demo_')) {
                    import("@/lib/localStorage").then(({ updateBookingStatus }) => {
                        updateBookingStatus(bookingId, 'confirmed');
                    });
                }
                else {
                    // Try backend first
                    await api.updateBookingStatus(bookingId, 'confirmed');
                }
            }
            catch (err) {
                console.warn("Mock payment backend update failed", err);
            }
            toast.success("Payment Successful");
            onSuccess();
        }
        else {
            toast.error("Invalid OTP. Use 123456");
            setIsProcessing(false);
        }
    };
    // Format card number with spaces
    const handleCardChange = (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 16)
            val = val.slice(0, 16);
        val = val.replace(/(\d{4})/g, '$1 ').trim();
        setCardNumber(val);
    };
    // Format expiry
    const handleExpiryChange = (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 4)
            val = val.slice(0, 4);
        if (val.length >= 2) {
            val = val.slice(0, 2) + '/' + val.slice(2);
        }
        setExpiry(val);
    };
    if (step === 'otp') {
        return (_jsx("form", { onSubmit: handleOtpSubmit, className: "space-y-6", children: _jsxs("div", { className: "bg-white border rounded-lg p-6 shadow-sm", children: [_jsx("div", { className: "flex justify-center mb-6", children: _jsx("div", { className: "w-12 h-12 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold text-xl italic", children: "VISA" }) }), _jsxs("div", { className: "text-center mb-6", children: [_jsx("h3", { className: "text-lg font-bold text-gray-800", children: "Verified by Visa" }), _jsx("p", { className: "text-sm text-gray-500 mt-1", children: "An OTP has been sent to your mobile number ending in **89" })] }), _jsx("div", { className: "space-y-4", children: _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-xs font-semibold uppercase text-gray-500", children: "Enter OTP" }), _jsx(Input, { value: otp, onChange: (e) => setOtp(e.target.value.slice(0, 6)), placeholder: "123456", className: "text-center text-2xl tracking-widest font-mono h-12", maxLength: 6, autoFocus: true }), _jsx("p", { className: "text-xs text-center text-blue-500 cursor-pointer hover:underline", children: "Resend OTP" })] }) }), _jsx(Button, { type: "submit", disabled: isProcessing, className: "w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 text-lg shadow-lg mt-6", children: isProcessing ? "Verifying..." : "Confirm Payment" }), _jsx(Button, { type: "button", variant: "ghost", onClick: onCancel, className: "w-full mt-2", children: "Cancel Transaction" })] }) }));
    }
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { className: "bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4 flex items-center gap-2", children: [_jsx(Lock, { className: "w-4 h-4 text-green-600" }), _jsx("span", { className: "text-xs text-gray-600 font-medium tracking-wide", children: "SSL SECURE PAYMENT" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-xs font-semibold uppercase text-gray-500", children: "Card Number" }), _jsxs("div", { className: "relative", children: [_jsx(Input, { value: cardNumber, onChange: handleCardChange, placeholder: "0000 0000 0000 0000", className: "pl-10 font-mono", required: true }), _jsx(CreditCard, { className: "w-4 h-4 text-gray-400 absolute left-3 top-3" })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-xs font-semibold uppercase text-gray-500", children: "Expiry" }), _jsx(Input, { value: expiry, onChange: handleExpiryChange, placeholder: "MM / YY", className: "font-mono", maxLength: 5, required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { className: "text-xs font-semibold uppercase text-gray-500", children: "CVC" }), _jsx(Input, { value: cvc, onChange: (e) => setCvc(e.target.value.slice(0, 3)), placeholder: "123", className: "font-mono", maxLength: 3, required: true })] })] })] }), _jsxs("div", { className: "flex flex-col gap-3 mt-6", children: [_jsx(Button, { type: "submit", disabled: isProcessing, className: "w-full bg-primary hover:bg-primary/90 text-white font-bold py-6 text-lg shadow-lg", children: isProcessing ? ("Processing Payment...") : (`Pay ₹${amount || ''}`) }), _jsx(Button, { type: "button", variant: "outline", onClick: onCancel, className: "w-full", children: "Cancel" })] })] }));
}
