import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardFooter } from "./ui/card";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { setCurrentUser } from "@/lib/localStorage";
export function TouristSignUp({ onSuccess, onBack }) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', phone: '', city: ''
    });
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handleSubmit = async (e) => {
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
        if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
            toast.error("Please enter a valid 10-digit phone number");
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
        }
        catch (error) {
            console.error("Registration failed", error);
            toast.error(error.message || "Registration failed. Try again.");
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-blue-50 flex items-center justify-center p-4", children: _jsxs(Card, { className: "w-full max-w-md", children: [_jsxs(CardHeader, { children: [_jsx("h2", { className: "text-xl font-bold text-blue-700", children: "Traveller Registration" }), _jsx("p", { className: "text-sm text-gray-500", children: "Create your account to start exploring" })] }), _jsx(CardContent, { children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsx(Input, { name: "name", placeholder: "Full Name", value: formData.name, onChange: handleChange, required: true }), _jsx(Input, { name: "email", type: "email", placeholder: "Email Address", value: formData.email, onChange: handleChange, required: true }), _jsx(Input, { name: "password", type: "password", placeholder: "Password", value: formData.password, onChange: handleChange, required: true }), _jsx(Input, { name: "phone", placeholder: "Phone Number (Optional)", value: formData.phone, onChange: handleChange }), _jsx(Input, { name: "city", placeholder: "Home City (Optional)", value: formData.city, onChange: handleChange }), _jsx(Button, { type: "submit", disabled: isLoading, className: "w-full bg-blue-600 hover:bg-blue-700 mt-4", children: isLoading ? 'Creating Account...' : 'Create Account' })] }) }), _jsx(CardFooter, { children: _jsx(Button, { variant: "link", onClick: onBack, className: "w-full text-gray-500", children: "Back to Login" }) })] }) }));
}
