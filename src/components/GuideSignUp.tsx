import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardFooter } from "./ui/card";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { setCurrentUser } from "@/lib/localStorage";

interface GuideSignUpProps {
    onSuccess: () => void;
    onBack: () => void;
}

export function GuideSignUp({ onSuccess, onBack }: GuideSignUpProps) {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', phone: '', city: '',
        aadharNumber: '', hourlyRate: '', languages: '', specializations: '', dob: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === 'phone') {
            const digits = value.replace(/\D/g, '');
            // Do not allow starting with 0
            if (digits.startsWith('0')) {
                toast.error("Phone number cannot start with zero");
                return;
            }
            if (digits.length <= 10) {
                setFormData(prev => ({ ...prev, phone: digits }));
            }
            return;
        }

        if (name === 'aadharNumber') {
            const digits = value.replace(/\D/g, '');
            if (digits.length <= 12) {
                // Format: XXXX XXXX XXXX
                const formatted = digits.match(/.{1,4}/g)?.join(' ') || digits;
                setFormData(prev => ({ ...prev, aadharNumber: formatted }));
            }
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation for Step 1
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error("Please enter a valid email address");
            return;
        }

        if (formData.password.length < 6) {
            toast.error("Password must be at least 6 characters long");
            return;
        }

        if (formData.phone.length !== 10) {
            toast.error("Please enter an exact 10-digit phone number");
            return;
        }

        setStep(2);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const data = await api.register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: 'guide',
                phone: formData.phone,
                city: formData.city,
                aadharNumber: formData.aadharNumber,
                hourlyRate: formData.hourlyRate,
                languages: formData.languages,
                specializations: formData.specializations,
                dob: formData.dob
            });

            // Auto-login with the new token
            setCurrentUser({ ...data.user, token: data.token });
            toast.success("Registration Successful! Welcome.");
            onSuccess(); // Directly go to dashboard
        } catch (error: any) {
            console.error("Registration failed", error);
            toast.error(error.message || "Registration failed. Try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <h2 className="text-xl font-bold text-green-700">Guide Registration</h2>
                    <p className="text-sm text-gray-500">Step {step} of 2</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={step === 1 ? handleNext : handleSubmit} className="space-y-4">

                        {step === 1 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                <Input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
                                <Input name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required />
                                <Input name="dob" type="date" placeholder="Date of Birth" value={formData.dob} onChange={handleChange} required className="block" title="Date of Birth" />
                                <Input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
                                <Input name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required />
                                <Input name="city" placeholder="City" value={formData.city} onChange={handleChange} required />
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 ml-1">Aadhar Card Number (12 Digits)</label>
                                    <Input name="aadharNumber" placeholder="XXXX XXXX XXXX" value={formData.aadharNumber} onChange={handleChange} required />
                                </div>
                                <Input name="hourlyRate" type="number" placeholder="Hourly Rate (₹)" value={formData.hourlyRate} onChange={handleChange} required />
                                <Input name="languages" placeholder="Languages (e.g. English, Hindi)" value={formData.languages} onChange={handleChange} required />
                                <Input name="specializations" placeholder="Specialties (e.g. History, Food)" value={formData.specializations} onChange={handleChange} required />
                            </div>
                        )}

                        <div className="flex gap-4 pt-4">
                            {step === 2 && (
                                <Button type="button" variant="outline" onClick={() => setStep(1)} className="w-full">
                                    Back
                                </Button>
                            )}
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-green-600 hover:bg-green-700"
                            >
                                {step === 1 ? 'Next Step' : (isLoading ? 'Registering...' : 'Complete Registration')}
                            </Button>
                        </div>
                    </form>
                </CardContent>
                <CardFooter>
                    <Button variant="link" onClick={onBack} className="w-full text-gray-500">
                        Cancel Registration
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
