import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "./ui/card";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { setCurrentUser } from "@/lib/localStorage";
import { api } from "@/lib/api";
export function SignIn({ role, onSuccess, onBack, onSwitchToSignUp }) {
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const data = await api.login({ email, role, password });
            // Client-side double check (optional but good for UX)
            if (data.user.role !== role) {
                toast.error(`Please login via ${data.user.role === 'guide' ? 'Guide' : 'Traveller'} Portal`);
                setIsLoading(false);
                return;
            }
            // On success, save user and token
            setCurrentUser({ ...data.user, token: data.token });
            toast.success(`Welcome back, ${data.user.name}!`);
            onSuccess();
        }
        catch (error) {
            console.error("Login failed", error);
            // Show specific error from backend
            toast.error(error.message || "Invalid credentials or role mismatch.");
        }
        finally {
            setIsLoading(false);
        }
    };
    const isGuide = role === 'guide';
    const themeColor = isGuide ? "text-green-600" : "text-blue-600";
    return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center p-4", children: _jsxs(Card, { className: "w-full max-w-md", children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex items-center gap-2 mb-4", children: [_jsx(Button, { variant: "ghost", size: "icon", onClick: onBack, children: _jsx(ArrowLeft, { className: "w-4 h-4" }) }), _jsx("span", { className: `font-semibold ${themeColor}`, children: isGuide ? 'Guide Portal' : 'Traveller Access' })] }), _jsx(CardTitle, { className: "text-2xl", children: "Sign In" }), _jsxs(CardDescription, { children: ["Enter your email to access your ", role, " dashboard"] })] }), _jsx(CardContent, { children: _jsxs("form", { onSubmit: handleLogin, className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { htmlFor: "email", className: "text-sm font-medium", children: "Email" }), _jsx(Input, { id: "email", type: "email", placeholder: "m@example.com", value: email, onChange: (e) => setEmail(e.target.value), required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("label", { htmlFor: "password", className: "text-sm font-medium", children: "Password" }), _jsx("a", { href: "#", className: "text-sm text-blue-600 hover:underline", children: "Forgot password?" })] }), _jsx(Input, { id: "password", type: "password", value: password, onChange: (e) => setPassword(e.target.value), required: true })] }), _jsx(Button, { type: "submit", disabled: isLoading, className: `w-full ${isGuide ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`, children: isLoading ? 'Signing In...' : 'Sign In' })] }) }), _jsx(CardFooter, { className: "flex justify-center", children: _jsxs("p", { className: "text-sm text-gray-500", children: ["Don't have an account?", " ", _jsx("button", { onClick: onSwitchToSignUp, className: "text-blue-600 hover:underline font-medium", children: "Sign up" })] }) })] }) }));
}
