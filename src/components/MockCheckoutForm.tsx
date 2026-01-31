import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Lock, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface MockCheckoutFormProps {
    bookingId: string;
    onSuccess: () => void;
    onCancel: () => void;
    amount?: number;
}

export function MockCheckoutForm({ bookingId, onSuccess, onCancel, amount }: MockCheckoutFormProps) {
    const [cardNumber, setCardNumber] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvc, setCvc] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const [step, setStep] = useState<'card' | 'otp'>('card');
    const [otp, setOtp] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        // Simulate network request for card validation
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Simple validation for the demo/test card
        if (cardNumber.replace(/\s/g, '').startsWith('4242')) {
            setIsProcessing(false);
            setStep('otp');
            toast.info("Redirecting to Bank Verification...");
        } else {
            toast.error("Card declined. Try using the test card (4242...)");
            setIsProcessing(false);
        }
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
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
                } else {
                    // Try backend first
                    await api.updateBookingStatus(bookingId, 'confirmed');
                }
            } catch (err) {
                console.warn("Mock payment backend update failed", err);
            }

            toast.success("Payment Successful");
            onSuccess();
        } else {
            toast.error("Invalid OTP. Use 123456");
            setIsProcessing(false);
        }
    };

    // Format card number with spaces
    const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 16) val = val.slice(0, 16);
        val = val.replace(/(\d{4})/g, '$1 ').trim();
        setCardNumber(val);
    };

    // Format expiry
    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 4) val = val.slice(0, 4);
        if (val.length >= 2) {
            val = val.slice(0, 2) + '/' + val.slice(2);
        }
        setExpiry(val);
    };

    if (step === 'otp') {
        return (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div className="bg-white border rounded-lg p-6 shadow-sm">
                    <div className="flex justify-center mb-6">
                        <div className="w-12 h-12 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold text-xl italic">
                            VISA
                        </div>
                    </div>

                    <div className="text-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800">Verified by Visa</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            An OTP has been sent to your mobile number ending in **89
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase text-gray-500">Enter OTP</Label>
                            <Input
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                                placeholder="123456"
                                className="text-center text-2xl tracking-widest font-mono h-12"
                                maxLength={6}
                                autoFocus
                            />
                            <p className="text-xs text-center text-blue-500 cursor-pointer hover:underline">Resend OTP</p>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={isProcessing}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 text-lg shadow-lg mt-6"
                    >
                        {isProcessing ? "Verifying..." : "Confirm Payment"}
                    </Button>
                    <Button type="button" variant="ghost" onClick={onCancel} className="w-full mt-2">
                        Cancel Transaction
                    </Button>
                </div>
            </form>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4 flex items-center gap-2">
                <Lock className="w-4 h-4 text-green-600" />
                <span className="text-xs text-gray-600 font-medium tracking-wide">SSL SECURE PAYMENT</span>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase text-gray-500">Card Number</Label>
                    <div className="relative">
                        <Input
                            value={cardNumber}
                            onChange={handleCardChange}
                            placeholder="0000 0000 0000 0000"
                            className="pl-10 font-mono"
                            required
                        />
                        <CreditCard className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase text-gray-500">Expiry</Label>
                        <Input
                            value={expiry}
                            onChange={handleExpiryChange}
                            placeholder="MM / YY"
                            className="font-mono"
                            maxLength={5}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase text-gray-500">CVC</Label>
                        <Input
                            value={cvc}
                            onChange={(e) => setCvc(e.target.value.slice(0, 3))}
                            placeholder="123"
                            className="font-mono"
                            maxLength={3}
                            required
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-3 mt-6">
                <Button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-6 text-lg shadow-lg"
                >
                    {isProcessing ? (
                        "Processing Payment..."
                    ) : (
                        `Pay ₹${amount || ''}`
                    )}
                </Button>

                <Button type="button" variant="outline" onClick={onCancel} className="w-full">
                    Cancel
                </Button>
            </div>
        </form>
    );
}
