import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "./ui/card";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { setCurrentUser } from "@/lib/localStorage";
import { api } from "@/lib/api";

interface SignInProps {
    role: 'guide' | 'tourist';
    onSuccess: () => void;
    onBack: () => void;
    onSwitchToSignUp: () => void;
}

export function SignIn({ role, onSuccess, onBack, onSwitchToSignUp }: SignInProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const data = await api.login({ email, role, password });

            // Client-side double check (optional but good for UX)
            if (data.user.role !== role) {
                toast.error(`Please login via ${data.user.role === 'guide' ? 'Guide' : 'Traveller'} Portal`);
                return;
            }

            // On success, save user and token
            setCurrentUser({ ...data.user, token: data.token });
            toast.success(`Welcome back, ${data.user.name}!`);
            onSuccess();
        } catch (error: any) {
            console.error("Login failed", error);
            // Show specific error from backend
            toast.error(error.message || "Invalid credentials or role mismatch.");
        }
    };

    const isGuide = role === 'guide';
    const themeColor = isGuide ? "text-green-600" : "text-blue-600";

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <div className="flex items-center gap-2 mb-4">
                        <Button variant="ghost" size="icon" onClick={onBack}>
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <span className={`font-semibold ${themeColor}`}>
                            {isGuide ? 'Guide Portal' : 'Traveller Access'}
                        </span>
                    </div>
                    <CardTitle className="text-2xl">Sign In</CardTitle>
                    <CardDescription>
                        Enter your email to access your {role} dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">Email</label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="text-sm font-medium">Password</label>
                                <a href="#" className="text-sm text-blue-600 hover:underline">Forgot password?</a>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className={`w-full ${isGuide ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                            Sign In
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-gray-500">
                        Don't have an account?{" "}
                        <button
                            onClick={onSwitchToSignUp}
                            className="text-blue-600 hover:underline font-medium"
                        >
                            Sign up
                        </button>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
