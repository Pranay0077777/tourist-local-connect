import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { setCurrentUser } from "@/lib/localStorage";
import { Button } from "./ui/button";
import { ArrowLeft, Save, User, MapPin, Mail, Phone, Loader2, ShieldCheck, Languages } from "lucide-react";
import { toast } from "sonner";
import { RoleAwareHeader } from "./RoleAwareHeader";
import { api } from "@/lib/api";
export function ProfileSettings({ user, onNavigate, onLogout }) {
    const [isLoading, setIsLoading] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState('idle');
    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        city: user.city || "",
        bio: user.bio || "",
        avatar: user.avatar || "",
        hourlyRate: 0,
        specialties: [],
        languages: [],
        experience: "",
        preferredLanguage: user.preferences?.language || "en"
    });
    useEffect(() => {
        if (user.role === 'guide') {
            api.getGuideById(user.id).then(guide => {
                if (guide) {
                    setFormData(prev => ({
                        ...prev,
                        hourlyRate: guide.hourlyRate,
                        specialties: guide.specialties,
                        languages: guide.languages,
                        experience: guide.experience || ""
                    }));
                    if (guide.verified) {
                        setVerificationStatus('verified');
                    }
                }
            }).catch(() => {
                // ignore if not found or error
            });
        }
    }, [user.id, user.role]);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const handleVerify = async () => {
        setVerificationStatus('processing');
        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        try {
            await fetch(`/api/guides/${user.id}/verify`, { method: 'POST' });
            setVerificationStatus('verified');
            // Update local session to reflect verification so Dashboard updates immediately
            // Using aadhar_number as proxy for verification status till we have full backend sync
            const updatedUser = { ...user, aadhar_number: "VERIFIED" };
            setCurrentUser(updatedUser);
            toast.success("Identity Verified Successfully!");
        }
        catch (error) {
            toast.error("Verification failed");
            setVerificationStatus('idle');
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        try {
            const updatedUser = {
                ...user,
                name: formData.name,
                phone: formData.phone,
                city: formData.city,
                bio: formData.bio,
                avatar: formData.avatar,
                hourly_rate: formData.hourlyRate,
                specialties: formData.specialties,
                languages: formData.languages,
                experience: formData.experience,
                preferences: {
                    ...user.preferences,
                    language: formData.preferredLanguage
                }
            };
            // Call API
            console.log("Submitting profile update...", updatedUser);
            await api.updateUser(user.id, {
                name: formData.name,
                phone: formData.phone,
                city: formData.city,
                bio: formData.bio,
                avatar: formData.avatar,
                hourly_rate: formData.hourlyRate,
                specialties: formData.specialties,
                languages: formData.languages,
                experience: formData.experience
            });
            // Update local session
            console.log("Calling setCurrentUser with:", updatedUser.avatar);
            setCurrentUser(updatedUser);
            toast.success("Profile updated successfully!");
            // No need for a full reload, as the local session is updated.
            // If the header doesn't update, we can trigger a soft navigation or state update.
        }
        catch (error) {
            console.error("Failed to update profile", error);
            toast.error("Failed to update profile");
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx(RoleAwareHeader, { user: user, currentPage: "profile", onNavigate: onNavigate, onLogout: onLogout }), _jsxs("main", { className: "container mx-auto px-4 py-8 max-w-2xl", children: [_jsxs(Button, { variant: "ghost", size: "sm", onClick: () => onNavigate('home'), className: "mb-6 text-gray-600 hover:text-gray-900", children: [_jsx(ArrowLeft, { className: "w-4 h-4 mr-1" }), " Back to Dashboard"] }), _jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden", children: [_jsxs("div", { className: "bg-indigo-50 px-6 py-8 border-b border-indigo-100 flex flex-col items-center", children: [_jsx("div", { className: "w-24 h-24 rounded-full bg-white border-4 border-white shadow-md mb-4 overflow-hidden flex items-center justify-center", children: formData.avatar ? (_jsx("img", { src: formData.avatar.startsWith('http') ? formData.avatar : `http://localhost:3001${formData.avatar}`, alt: "Profile", className: "w-full h-full object-cover" })) : (_jsx(User, { className: "w-10 h-10 text-gray-300" })) }), _jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Edit Profile" }), _jsxs("p", { className: "text-indigo-600 font-medium capitalize", children: [user.role, " Account"] })] }), _jsxs("form", { onSubmit: handleSubmit, className: "p-6 md:p-8 space-y-6", children: [_jsxs("div", { className: "grid md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("label", { className: "text-sm font-medium text-gray-700 flex items-center gap-1.5", children: [_jsx(User, { className: "w-4 h-4 text-gray-400" }), " Full Name"] }), _jsx("input", { type: "text", name: "name", value: formData.name, onChange: handleChange, required: true, className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("label", { className: "text-sm font-medium text-gray-700 flex items-center gap-1.5", children: [_jsx(Mail, { className: "w-4 h-4 text-gray-400" }), " Email"] }), _jsx("input", { type: "email", name: "email", value: formData.email, disabled: true, className: "w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-500 cursor-not-allowed" })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("label", { className: "text-sm font-medium text-gray-700 flex items-center gap-1.5", children: [_jsx(Phone, { className: "w-4 h-4 text-gray-400" }), " Phone Number"] }), _jsx("input", { type: "tel", name: "phone", value: formData.phone, onChange: handleChange, className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("label", { className: "text-sm font-medium text-gray-700 flex items-center gap-1.5", children: [_jsx(MapPin, { className: "w-4 h-4 text-gray-400" }), " City / Location"] }), _jsx("input", { type: "text", name: "city", value: formData.city, onChange: handleChange, className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium text-gray-700", children: "Profile Picture" }), _jsx("div", { className: "flex items-center gap-4", children: _jsx("input", { type: "file", accept: "image/*", onChange: async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            const formData = new FormData();
                                                            formData.append('image', file);
                                                            try {
                                                                const res = await fetch('/api/upload', {
                                                                    method: 'POST',
                                                                    body: formData
                                                                });
                                                                const data = await res.json();
                                                                if (data.success) {
                                                                    setFormData(prev => ({ ...prev, avatar: data.url }));
                                                                    toast.success("Image uploaded!");
                                                                }
                                                                else {
                                                                    toast.error("Upload failed: " + data.error);
                                                                }
                                                            }
                                                            catch (err) {
                                                                console.error(err);
                                                                toast.error("Upload failed");
                                                            }
                                                        }
                                                    }, className: "w-full text-sm text-gray-500\r\n                                          file:mr-4 file:py-2 file:px-4\r\n                                          file:rounded-full file:border-0\r\n                                          file:text-sm file:font-semibold\r\n                                          file:bg-indigo-50 file:text-indigo-700\r\n                                          hover:file:bg-indigo-100\r\n                                        " }) })] }), _jsx("input", { type: "hidden", name: "avatar", value: formData.avatar }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium text-gray-700", children: "Bio" }), _jsx("textarea", { name: "bio", value: formData.bio, onChange: handleChange, rows: 4, className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none", placeholder: "Tell us a bit about yourself..." })] }), _jsxs("div", { className: "space-y-4 pt-4 border-t border-gray-100", children: [_jsx("h3", { className: "text-lg font-bold text-gray-900", children: "AI & App Preferences" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("label", { className: "text-sm font-medium text-gray-700 flex items-center gap-2", children: [_jsx(Languages, { className: "w-4 h-4 text-indigo-600" }), " AI Chat Translation (Target Language)"] }), _jsxs("select", { name: "preferredLanguage", value: formData.preferredLanguage, onChange: (e) => setFormData(prev => ({ ...prev, preferredLanguage: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all", children: [_jsx("option", { value: "en", children: "English (Default)" }), _jsx("option", { value: "hi", children: "Hindi (\u0928\u092E\u0938\u094D\u0924\u0947)" }), _jsx("option", { value: "ta", children: "Tamil (\u0BB5\u0BA3\u0B95\u0BCD\u0B95\u0BAE\u0BCD)" }), _jsx("option", { value: "te", children: "Telugu (\u0C28\u0C2E\u0C38\u0C4D\u0C24\u0C47)" }), _jsx("option", { value: "ml", children: "Malayalam (\u0C28\u0C2E\u0C38\u0C4D\u0D15\u0D3E\u0D30\u0D02)" }), _jsx("option", { value: "fr", children: "French (Bonjour)" })] }), _jsx("p", { className: "text-xs text-gray-500 italic", children: "Incoming chat messages will be automatically translated to this language." })] })] }), user.role === 'guide' && (_jsxs("div", { className: "space-y-6 pt-4 border-t border-gray-100", children: [_jsx("h3", { className: "text-lg font-bold text-gray-900", children: "Professional Details" }), _jsxs("div", { className: "grid md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium text-gray-700", children: "Hourly Rate (\u20B9)" }), _jsx("input", { type: "number", name: "hourlyRate", value: formData.hourlyRate, onChange: (e) => setFormData(prev => ({ ...prev, hourlyRate: parseInt(e.target.value) })), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium text-gray-700", children: "Experience (e.g. 5+ years)" }), _jsx("input", { type: "text", name: "experience", value: formData.experience, onChange: handleChange, className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium text-gray-700", children: "Specialties (comma separated)" }), _jsx("input", { type: "text", name: "specialties", value: formData.specialties.join(", "), onChange: (e) => setFormData(prev => ({ ...prev, specialties: e.target.value.split(",").map(s => s.trim()).filter(s => s !== "") })), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium text-gray-700", children: "Languages (comma separated)" }), _jsx("input", { type: "text", name: "languages", value: formData.languages.join(", "), onChange: (e) => setFormData(prev => ({ ...prev, languages: e.target.value.split(",").map(s => s.trim()).filter(s => s !== "") })), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" })] }), _jsxs("div", { className: "pt-6 border-t border-gray-100", children: [_jsxs("h3", { className: "text-lg font-bold text-gray-900 mb-4 flex items-center gap-2", children: [_jsx(ShieldCheck, { className: "w-5 h-5 text-indigo-600" }), " Identity Verification"] }), _jsx("div", { className: "bg-gray-50 rounded-xl p-4 border border-gray-200", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium text-gray-900", children: "Government ID Check" }), _jsx("p", { className: "text-sm text-gray-500 mt-1", children: "Upload your ID to get the \"Verified\" badge." })] }), verificationStatus === 'verified' ? (_jsxs("div", { className: "flex items-center gap-2 text-green-600 font-bold bg-green-50 px-3 py-1.5 rounded-lg border border-green-100", children: [_jsx(ShieldCheck, { className: "w-4 h-4" }), " Verified"] })) : (_jsx(Button, { type: "button", variant: "outline", onClick: handleVerify, disabled: verificationStatus === 'processing', className: "border-indigo-200 text-indigo-700 hover:bg-indigo-50", children: verificationStatus === 'processing' ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-3 h-3 mr-2 animate-spin" }), " Verifying..."] })) : ("Verify Now") }))] }) })] })] })), user.role === 'guide' && (_jsxs("div", { className: "space-y-6 pt-4 border-t border-gray-100", children: [_jsx("h3", { className: "text-lg font-bold text-gray-900 border-l-4 border-indigo-600 pl-3", children: "Local Expertise & Hidden Gems" }), _jsxs("p", { className: "text-sm text-gray-500", children: ["Help travelers find you by sharing your unique local knowledge. ", _jsx("strong", { children: "Tip:" }), " Add these details to your Bio!"] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "text-sm font-medium text-gray-700", children: "Expertise Tags (Add to Specialties)" }), _jsx("div", { className: "flex flex-wrap gap-2", children: ['Temples', 'Beaches', 'Street Food', 'History', 'Nightlife', 'Shopping'].map(tag => (_jsxs("button", { type: "button", onClick: () => {
                                                                        if (!formData.specialties.includes(tag)) {
                                                                            setFormData(prev => ({ ...prev, specialties: [...prev.specialties, tag] }));
                                                                            toast.success(`Added ${tag} to specialties`);
                                                                        }
                                                                    }, className: "px-3 py-1 bg-white border border-gray-200 rounded-full text-sm hover:border-indigo-500 hover:text-indigo-600 transition-colors", children: ["+ ", tag] }, tag))) })] }), _jsxs("div", { className: "space-y-2 bg-indigo-50 p-4 rounded-lg border border-indigo-100", children: [_jsx("label", { className: "text-sm font-bold text-indigo-900", children: "Bio Template Helper" }), _jsx("p", { className: "text-xs text-indigo-600 mb-2", children: "Click to append these starters to your Bio:" }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx(Button, { type: "button", variant: "outline", size: "sm", className: "bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50", onClick: () => setFormData(prev => ({ ...prev, bio: prev.bio + "\n\nI specialize in ancient Temples such as..." })), children: "\uD83C\uDFDB\uFE0F I specialize in Temples..." }), _jsx(Button, { type: "button", variant: "outline", size: "sm", className: "bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50", onClick: () => setFormData(prev => ({ ...prev, bio: prev.bio + "\n\nI know the best hidden Beaches like..." })), children: "\uD83C\uDFD6\uFE0F I know hidden Beaches..." }), _jsx(Button, { type: "button", variant: "outline", size: "sm", className: "bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50", onClick: () => setFormData(prev => ({ ...prev, bio: prev.bio + "\n\nFor Foodies, I can show you..." })), children: "\uD83C\uDF5B For Foodies..." })] })] })] })] })), _jsx("div", { className: "pt-4 flex justify-end", children: _jsx(Button, { type: "submit", disabled: isLoading, className: "bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8", children: isLoading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" }), " Saving..."] })) : (_jsxs(_Fragment, { children: [_jsx(Save, { className: "w-4 h-4 mr-2" }), " Save Changes"] })) }) })] })] })] })] }));
}
