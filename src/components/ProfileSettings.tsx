import { useState, useEffect } from "react";
import { type LocalUser, setCurrentUser } from "@/lib/localStorage";
import { Button } from "./ui/button";
import { ArrowLeft, Save, User, MapPin, Mail, Phone, Loader2, ShieldCheck, Languages } from "lucide-react";
import { toast } from "sonner";
import { RoleAwareHeader } from "./RoleAwareHeader";
import { api } from "@/lib/api";

interface ProfileSettingsProps {
    user: LocalUser;
    onNavigate: (page: string) => void;
    onLogout: () => void;
}

export function ProfileSettings({ user, onNavigate, onLogout }: ProfileSettingsProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState<'idle' | 'processing' | 'verified'>('idle');
    const parseArray = (val: any) => {
        if (Array.isArray(val)) return val;
        if (typeof val === 'string' && val.trim()) {
            try {
                const parsed = JSON.parse(val);
                return Array.isArray(parsed) ? parsed : [parsed];
            } catch (e) {
                return val.split(',').map((s: string) => s.trim()).filter(Boolean);
            }
        }
        return [];
    };

    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        city: user.city || "",
        bio: user.bio || "",
        avatar: user.avatar || "",
        hourlyRate: user.hourly_rate || 0,
        specialties: parseArray(user.specialties),
        languages: parseArray(user.languages),
        experience: user.experience || "",
        preferredLanguage: user.preferences?.language || "en"
    });

    useEffect(() => {
        if (user.role === 'guide') {
            api.getGuideById(user.id).then(guide => {
                if (guide) {
                    setFormData(prev => ({
                        ...prev,
                        hourlyRate: guide.hourlyRate,
                        specialties: parseArray(guide.specialties),
                        languages: parseArray(guide.languages),
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    const handleVerify = async () => {
        setVerificationStatus('processing');

        try {
            await fetch(`/api/guides/${user.id}/verify`, { method: 'POST' });
            setVerificationStatus('verified');

            // Update local session to reflect verification so Dashboard updates immediately
            const updatedUser = { ...user, verificationStatus: 'verified' as LocalUser['verificationStatus'] };
            setCurrentUser(updatedUser);

            toast.success("Identity Verified Successfully!");
        } catch (error) {
            toast.error("Verification failed");
            setVerificationStatus('idle');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (formData.phone && formData.phone.length !== 10) {
            toast.error("Please enter an exact 10-digit phone number");
            setIsLoading(false);
            return;
        }

        try {
            const updatedUser: LocalUser = {
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
            api.updateUser(user.id, {
                name: formData.name,
                phone: formData.phone,
                city: formData.city,
                bio: formData.bio,
                avatar: formData.avatar,
                hourly_rate: formData.hourlyRate,
                specialties: formData.specialties,
                languages: formData.languages,
                experience: formData.experience
            }).catch(error => {
                console.error("Delayed error handle: Failed to update profile on server", error);
                toast.error("Profile update failed on server. Reverting...");
                // Rollback local state if needed (optional for UX)
            });

            // Update local session IMMEDIATELY (Optimistic UI)
            setCurrentUser(updatedUser);
            toast.success("Profile updated instantly!");
            setIsLoading(false);

        } catch (error) {
            console.error("Failed to update profile", error);
            toast.error("Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <RoleAwareHeader
                user={user}
                currentPage="profile"
                onNavigate={onNavigate}
                onLogout={onLogout}
            />

            <main className="container mx-auto px-4 py-8 max-w-2xl">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onNavigate('home')}
                    className="mb-6 text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
                </Button>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-indigo-50 px-6 py-8 border-b border-indigo-100 flex flex-col items-center">
                        <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-md mb-4 overflow-hidden flex items-center justify-center">
                            {formData.avatar ? (
                                <img
                                    src={formData.avatar.startsWith('http') ? formData.avatar : `http://localhost:3001${formData.avatar}`}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User className="w-10 h-10 text-gray-300" />
                            )}
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
                        <p className="text-indigo-600 font-medium capitalize">{user.role} Account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                    <User className="w-4 h-4 text-gray-400" /> Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                    <Mail className="w-4 h-4 text-gray-400" /> Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    disabled
                                    className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-500 cursor-not-allowed"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                    <Phone className="w-4 h-4 text-gray-400" /> Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4 text-gray-400" /> City / Location
                                </label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Profile Picture</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            // 1. Instant Preview (Optimistic)
                                            const previewUrl = URL.createObjectURL(file);
                                            setFormData(prev => ({ ...prev, avatar: previewUrl }));

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
                                                } else {
                                                    toast.error("Upload failed: " + data.error);
                                                }
                                            } catch (err) {
                                                console.error(err);
                                                toast.error("Upload failed");
                                            }
                                        }
                                    }}
                                    className="w-full text-sm text-gray-500
                                          file:mr-4 file:py-2 file:px-4
                                          file:rounded-full file:border-0
                                          file:text-sm file:font-semibold
                                          file:bg-indigo-50 file:text-indigo-700
                                          hover:file:bg-indigo-100
                                        "
                                />
                            </div>
                        </div>
                        {/* Hidden Avatar URL fallback/debug */}
                        <input type="hidden" name="avatar" value={formData.avatar} />

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Bio</label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                                placeholder="Tell us a bit about yourself..."
                            />
                        </div>

                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">AI & App Preferences</h3>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <Languages className="w-4 h-4 text-indigo-600" /> AI Chat Translation (Target Language)
                                </label>
                                <select
                                    name="preferredLanguage"
                                    value={formData.preferredLanguage}
                                    onChange={(e) => setFormData(prev => ({ ...prev, preferredLanguage: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                >
                                    <option value="en">English (Default)</option>
                                    <option value="hi">Hindi (नमस्ते)</option>
                                    <option value="ta">Tamil (வணக்கம்)</option>
                                    <option value="te">Telugu (నమస్తే)</option>
                                    <option value="ml">Malayalam (నమస్കാരം)</option>
                                    <option value="fr">French (Bonjour)</option>
                                </select>
                                <p className="text-xs text-gray-500 italic">Incoming chat messages will be automatically translated to this language.</p>
                            </div>
                        </div>

                        {user.role === 'guide' && (
                            <div className="space-y-6 pt-4 border-t border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900">Professional Details</h3>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Hourly Rate (₹)</label>
                                        <input
                                            type="number"
                                            name="hourlyRate"
                                            value={formData.hourlyRate}
                                            onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: parseInt(e.target.value) }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Experience (e.g. 5+ years)</label>
                                        <input
                                            type="text"
                                            name="experience"
                                            value={formData.experience}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Specialties (comma separated)</label>
                                    <input
                                        type="text"
                                        name="specialties"
                                        value={formData.specialties.join(", ")}
                                        onChange={(e) => setFormData(prev => ({ ...prev, specialties: e.target.value.split(",").map(s => s.trim()).filter(s => s !== "") }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Languages (comma separated)</label>
                                    <input
                                        type="text"
                                        name="languages"
                                        value={formData.languages.join(", ")}
                                        onChange={(e) => setFormData(prev => ({ ...prev, languages: e.target.value.split(",").map(s => s.trim()).filter(s => s !== "") }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    />
                                </div>

                                <div className="pt-6 border-t border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <ShieldCheck className="w-5 h-5 text-indigo-600" /> Identity Verification
                                    </h3>

                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-gray-900">Government ID Check</p>
                                                <p className="text-sm text-gray-500 mt-1">Upload your ID to get the "Verified" badge.</p>
                                            </div>
                                            {verificationStatus === 'verified' ? (
                                                <div className="flex items-center gap-2 text-green-600 font-bold bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                                                    <ShieldCheck className="w-4 h-4" /> Verified
                                                </div>
                                            ) : (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={handleVerify}
                                                    disabled={verificationStatus === 'processing'}
                                                    className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                                                >
                                                    {verificationStatus === 'processing' ? (
                                                        <><Loader2 className="w-3 h-3 mr-2 animate-spin" /> Verifying...</>
                                                    ) : (
                                                        "Verify Now"
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {user.role === 'guide' && (
                            <div className="space-y-6 pt-4 border-t border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 border-l-4 border-indigo-600 pl-3">Local Expertise & Hidden Gems</h3>
                                <p className="text-sm text-gray-500">Help travelers find you by sharing your unique local knowledge. <strong>Tip:</strong> Add these details to your Bio!</p>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Expertise Tags (Add to Specialties)</label>
                                        <div className="flex flex-wrap gap-2">
                                            {['Temples', 'Beaches', 'Street Food', 'History', 'Nightlife', 'Shopping'].map(tag => (
                                                <button
                                                    key={tag}
                                                    type="button"
                                                    onClick={() => {
                                                        if (!formData.specialties.includes(tag)) {
                                                            setFormData(prev => ({ ...prev, specialties: [...prev.specialties, tag] }));
                                                            toast.success(`Added ${tag} to specialties`);
                                                        }
                                                    }}
                                                    className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm hover:border-indigo-500 hover:text-indigo-600 transition-colors"
                                                >
                                                    + {tag}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                                        <label className="text-sm font-bold text-indigo-900">Bio Template Helper</label>
                                        <p className="text-xs text-indigo-600 mb-2">Click to append these starters to your Bio:</p>
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                                                onClick={() => setFormData(prev => ({ ...prev, bio: prev.bio + "\n\nI specialize in ancient Temples such as..." }))}
                                            >
                                                🏛️ I specialize in Temples...
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                                                onClick={() => setFormData(prev => ({ ...prev, bio: prev.bio + "\n\nI know the best hidden Beaches like..." }))}
                                            >
                                                🏖️ I know hidden Beaches...
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                                                onClick={() => setFormData(prev => ({ ...prev, bio: prev.bio + "\n\nFor Foodies, I can show you..." }))}
                                            >
                                                🍛 For Foodies...
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}


                        <div className="pt-4 flex justify-end">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" /> Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
