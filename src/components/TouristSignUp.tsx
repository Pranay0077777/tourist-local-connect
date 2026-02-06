import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardFooter } from "./ui/card";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { setCurrentUser } from "@/lib/localStorage";

interface TouristSignUpProps {
    onSuccess: () => void;
    onBack: () => void;
}

export function TouristSignUp({ onSuccess, onBack }: TouristSignUpProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', phone: '', city: ''
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

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error("Please enter a valid email address");
            setIsLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            toast.error("Password must be at least 6 characters long");
            setIsLoading(false);
            return;
        }

        if (formData.phone && formData.phone.length !== 10) {
            toast.error("Please enter an exact 10-digit phone number");
            setIsLoading(false);
            return;
        }

        try {
            const data = await api.register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: 'tourist',
                phone: formData.phone,
                city: formData.city
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
        <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <h2 className="text-xl font-bold text-blue-700">Traveller Registration</h2>
                    <p className="text-sm text-gray-500">Create your account to start exploring</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
                        <Input name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required />
                        <Input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
                        <Input name="phone" placeholder="Phone Number (Optional)" value={formData.phone} onChange={handleChange} />
                        <Input name="city" placeholder="Home City (Optional)" value={formData.city} onChange={handleChange} />

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 mt-4"
                        >
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter>
                    <Button variant="link" onClick={onBack} className="w-full text-gray-500">
                        Back to Login
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
