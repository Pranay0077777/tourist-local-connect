import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardFooter } from "./ui/card";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { setCurrentUser } from "@/lib/localStorage";
export function GuideSignUp({ onSuccess, onBack }) {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', phone: '', city: '',
        aadharNumber: '', hourlyRate: '', languages: '', specializations: '', dob: ''
    });
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handleNext = (e) => {
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
        if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
            toast.error("Please enter a valid 10-digit phone number");
            return;
        }
        setStep(2);
    };
    const handleSubmit = async (e) => {
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
        }
        catch (error) {
            console.error("Registration failed", error);
            toast.error(error.message || "Registration failed. Try again.");
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-green-50 flex items-center justify-center p-4", children: _jsxs(Card, { className: "w-full max-w-lg", children: [_jsxs(CardHeader, { children: [_jsx("h2", { className: "text-xl font-bold text-green-700", children: "Guide Registration" }), _jsxs("p", { className: "text-sm text-gray-500", children: ["Step ", step, " of 2"] })] }), _jsx(CardContent, { children: _jsxs("form", { onSubmit: step === 1 ? handleNext : handleSubmit, className: "space-y-4", children: [step === 1 && (_jsxs("div", { className: "space-y-4 animate-in fade-in slide-in-from-right-4", children: [_jsx(Input, { name: "name", placeholder: "Full Name", value: formData.name, onChange: handleChange, required: true }), _jsx(Input, { name: "email", type: "email", placeholder: "Email Address", value: formData.email, onChange: handleChange, required: true }), _jsx(Input, { name: "dob", type: "date", placeholder: "Date of Birth", value: formData.dob, onChange: handleChange, required: true, className: "block", title: "Date of Birth" }), _jsx(Input, { name: "password", type: "password", placeholder: "Password", value: formData.password, onChange: handleChange, required: true }), _jsx(Input, { name: "phone", placeholder: "Phone Number", value: formData.phone, onChange: handleChange, required: true }), _jsx(Input, { name: "city", placeholder: "City", value: formData.city, onChange: handleChange, required: true })] })), step === 2 && (_jsxs("div", { className: "space-y-4 animate-in fade-in slide-in-from-right-4", children: [_jsx(Input, { name: "aadharNumber", placeholder: "Aadhar Number (Verification)", value: formData.aadharNumber, onChange: handleChange, required: true }), _jsx(Input, { name: "hourlyRate", type: "number", placeholder: "Hourly Rate (\u20B9)", value: formData.hourlyRate, onChange: handleChange, required: true }), _jsx(Input, { name: "languages", placeholder: "Languages (e.g. English, Hindi)", value: formData.languages, onChange: handleChange, required: true }), _jsx(Input, { name: "specializations", placeholder: "Specialties (e.g. History, Food)", value: formData.specializations, onChange: handleChange, required: true })] })), _jsxs("div", { className: "flex gap-4 pt-4", children: [step === 2 && (_jsx(Button, { type: "button", variant: "outline", onClick: () => setStep(1), className: "w-full", children: "Back" })), _jsx(Button, { type: "submit", disabled: isLoading, className: "w-full bg-green-600 hover:bg-green-700", children: step === 1 ? 'Next Step' : (isLoading ? 'Registering...' : 'Complete Registration') })] })] }) }), _jsx(CardFooter, { children: _jsx(Button, { variant: "link", onClick: onBack, className: "w-full text-gray-500", children: "Cancel Registration" }) })] }) }));
}
