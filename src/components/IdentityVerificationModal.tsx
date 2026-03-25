import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { ShieldCheck, Mail, Smartphone, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface IdentityVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    onSuccess: () => void;
}

export function IdentityVerificationModal({ isOpen, onClose, userId, onSuccess }: IdentityVerificationModalProps) {
    const [step, setStep] = useState<'intro' | 'aadhar' | 'otp' | 'success'>('intro');
    const [aadharNumber, setAadharNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSendOtp = () => {
        if (aadharNumber.length !== 12 || isNaN(Number(aadharNumber))) {
            toast.error("Please enter a valid 12-digit Aadhar number");
            return;
        }
        setIsLoading(true);
        // Simulate API call to trigger OTP
        setTimeout(() => {
            setIsLoading(false);
            setStep('otp');
            toast.success("OTP sent to your registered mobile number");
        }, 1500);
    };

    const handleVerifyOtp = async () => {
        if (otp.length !== 6 || isNaN(Number(otp))) {
            toast.error("Please enter a valid 6-digit OTP");
            return;
        }
        setIsLoading(true);
        try {
            // Simulate verifying OTP and updating DB
            await new Promise(resolve => setTimeout(resolve, 2000));
            // Setting verification status to pending or verified depending on business logic
            // The original handleVerify set it to pending
            await api.updateUser(userId, { verificationStatus: 'pending', aadhar_number: aadharNumber });
            setStep('success');
        } catch (error) {
            toast.error("Verification failed");
        } finally {
            setIsLoading(false);
        }
    };

    const handleFinish = () => {
        onSuccess();
        onClose();
        // Reset state for next time
        setTimeout(() => setStep('intro'), 500);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                onClose();
                setTimeout(() => setStep('intro'), 500);
            }
        }}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold font-heading flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-indigo-600" />
                        Identity Verification
                    </DialogTitle>
                </DialogHeader>

                <div className="py-6">
                    {step === 'intro' && (
                        <div className="space-y-6 text-center">
                            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto">
                                <ShieldCheck className="w-8 h-8 text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Build Trust with Tourists</h3>
                                <p className="text-sm text-gray-600">
                                    Verified guides get up to 3x more bookings. We verify your identity using Government ID integration.
                                </p>
                            </div>
                            <div className="flex flex-col gap-3 text-left bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-3 text-sm text-gray-700">
                                    <Smartphone className="w-4 h-4 text-indigo-500" /> Mobile OTP Verification
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-700">
                                    <Mail className="w-4 h-4 text-indigo-500" /> Email Validation
                                </div>
                            </div>
                            <Button className="w-full h-12 rounded-xl text-base font-bold bg-indigo-600 hover:bg-indigo-700" onClick={() => setStep('aadhar')}>
                                Start Verification
                            </Button>
                        </div>
                    )}

                    {step === 'aadhar' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Enter Aadhar Details</h3>
                                <p className="text-sm text-gray-500">Your details are encrypted and securely validated.</p>
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="aadhar">12-Digit Aadhar Number</Label>
                                <Input
                                    id="aadhar"
                                    placeholder="XXXX XXXX XXXX"
                                    value={aadharNumber}
                                    onChange={(e) => setAadharNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                                    className="h-12 text-lg tracking-widest text-center font-mono"
                                />
                            </div>
                            <Button 
                                className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold"
                                onClick={handleSendOtp}
                                disabled={isLoading || aadharNumber.length !== 12}
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send OTP"}
                            </Button>
                        </div>
                    )}

                    {step === 'otp' && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Enter OTP</h3>
                                <p className="text-sm text-gray-500">We've sent a 6-digit code to your Aadhar-linked mobile number.</p>
                            </div>
                            <div className="space-y-3 flex flex-col items-center">
                                <Input
                                    id="otp"
                                    placeholder="------"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="h-14 text-2xl tracking-[0.5em] text-center font-mono w-48"
                                />
                            </div>
                            <Button 
                                className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold"
                                onClick={handleVerifyOtp}
                                disabled={isLoading || otp.length !== 6}
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : "Verify Identity"}
                            </Button>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="space-y-6 text-center py-4">
                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle2 className="w-10 h-10 text-green-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Verification Under Review!</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Your identity marks have been securely received. An admin will review and grant you the Verified badge shortly.
                                </p>
                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-left space-y-2 mb-6">
                                    <p className="text-sm text-blue-800 font-bold">Next Steps for Security:</p>
                                    <p className="text-xs text-blue-700 flex items-start gap-2">
                                        <span className="font-bold">1.</span> 
                                        <span>Our team will contact you shortly via phone call to verify your details.</span>
                                    </p>
                                    <p className="text-xs text-blue-700 flex items-start gap-2">
                                        <span className="font-bold">2.</span> 
                                        <span>Please email a copy of your Official ID to <span className="font-bold">admin@localy.com</span>.</span>
                                    </p>
                                    <p className="text-xs text-blue-700 font-medium italic mt-2 border-t border-blue-200 pt-2">
                                        Stay tuned! These strict measures ensure maximum safety for all travelers.
                                    </p>
                                </div>
                            </div>
                            <Button className="w-full h-12 rounded-xl bg-green-600 hover:bg-green-700 font-bold text-white" onClick={handleFinish}>
                                Back to Profile
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
