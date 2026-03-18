import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { type LocalUser } from "@/lib/localStorage";
import { adminApi } from "@/lib/adminApi";
import type { 
    AdminOverviewStats, 
    AdminGuide, 
    AdminTourist, 
    AdminBookingsOverview 
} from "@/lib/adminApi";
import { 
    Users, DollarSign, ShieldCheck, Map, 
    Check, X, FileText, BarChart3, MessageSquare, 
    LogOut, UserCircle, Briefcase, Calendar, Edit2
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";

interface AdminDashboardProps {
    currentUser: LocalUser;
    onNavigate: (page: string) => void;
    onLogout: () => void;
}

type TabType = 'overview' | 'verifications' | 'tourists' | 'bookings' | 'contact';

export function AdminDashboard({ currentUser, onNavigate, onLogout }: AdminDashboardProps) {
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Data States
    const [overviewData, setOverviewData] = useState<AdminOverviewStats | null>(null);
    const [guidesData, setGuidesData] = useState<AdminGuide[]>([]);
    const [touristsData, setTouristsData] = useState<AdminTourist[]>([]);
    const [bookingsData, setBookingsData] = useState<AdminBookingsOverview | null>(null);

    // UI States
    const [expandedAadhaar, setExpandedAadhaar] = useState<string | null>(null);
    const [messageSubject, setMessageSubject] = useState("Regarding verification");
    const [messageBody, setMessageBody] = useState("");
    const [messagingGuideId, setMessagingGuideId] = useState<string | null>(null);
    const [editingVerificationsId, setEditingVerificationsId] = useState<string | null>(null);

    // Check admin role
    if ((currentUser.role as string) !== 'admin') {
        return <Navigate to="/" replace />;
    }

    useEffect(() => {
        loadTabData(activeTab);
    }, [activeTab]);

    const loadTabData = async (tab: TabType) => {
        setIsLoading(true);
        setError(null);
        try {
            if (tab === 'overview') {
                const data = await adminApi.getOverviewStats();
                setOverviewData(data);
            } else if (tab === 'verifications' || tab === 'contact') {
                const data = await adminApi.getGuides();
                setGuidesData(data);
            } else if (tab === 'tourists') {
                const data = await adminApi.getTourists();
                setTouristsData(data);
            } else if (tab === 'bookings') {
                const data = await adminApi.getBookings();
                setBookingsData(data);
            }
        } catch (err: any) {
            setError(err.message || "Failed to load data.");
            toast.error("Error loading dashboard data. Mocking data for display purposes.");
            // If backend is not yet implemented, provide mock data for display
            mockDataForTab(tab);
        } finally {
            setIsLoading(false);
        }
    };

    const mockDataForTab = (tab: TabType) => {
        if (tab === 'overview') {
            setOverviewData({
                totalGuides: 145, pendingVerifications: 12, totalTourists: 892, monthlyRevenue: 450000,
                bookingsPerMonth: [
                    { month: 'Jan', bookings: 65 }, { month: 'Feb', bookings: 85 },
                    { month: 'Mar', bookings: 120 }, { month: 'Apr', bookings: 90 },
                    { month: 'May', bookings: 150 }, { month: 'Jun', bookings: 200 }
                ],
                recentApplications: [
                    { id: '1', name: 'Ravi Kumar', city: 'Delhi', email: 'ravi@example.com', languages: ['English', 'Hindi'], joinDate: new Date().toISOString(), verificationStatus: 'pending' }
                ]
            });
        } else if (tab === 'verifications' || tab === 'contact') {
            setGuidesData([
                { id: '1', name: 'Ravi Kumar', city: 'Delhi', email: 'ravi@example.com', languages: ['English', 'Hindi'], joinDate: new Date().toISOString(), verificationStatus: 'pending', aadharId: '123456789012', dob: '1990-05-15', address: '123 Main St, Delhi' },
                { id: '2', name: 'Anita Sharma', city: 'Mumbai', email: 'anita@example.com', languages: ['English', 'Marathi'], joinDate: new Date(Date.now() - 86400000).toISOString(), verificationStatus: 'verified', aadharId: '987654321098', dob: '1988-10-20', address: '456 Sea Link, Mumbai' }
            ]);
        } else if (tab === 'tourists') {
            setTouristsData([
                { id: 't1', name: 'John Doe', email: 'john@example.com', joinDate: '2023-11-01', numberOfTrips: 4, status: 'active' },
                { id: 't2', name: 'Jane Smith', email: 'jane@example.com', joinDate: '2024-01-15', numberOfTrips: 1, status: 'inactive' }
            ]);
        } else if (tab === 'bookings') {
            setBookingsData({
                totalBookings: 1250, totalRevenue: 2500000, averageTourValue: 2000,
                recentTransactions: [
                    { id: 'b1', touristName: 'John Doe', guideName: 'Ravi Kumar', tourName: 'Old Delhi Heritage Walk', date: '2024-03-20', amount: 1500, paymentStatus: 'paid' },
                    { id: 'b2', touristName: 'Jane Smith', guideName: 'Anita Sharma', tourName: 'Mumbai Street Food', date: '2024-03-25', amount: 2000, paymentStatus: 'upcoming' }
                ]
            });
        }
    };

    const handleVerifyGuide = async (id: string, status: 'verified' | 'rejected') => {
        try {
            await adminApi.verifyGuide(id, status);
            toast.success(`Guide ${status} successfully`);
            loadTabData('verifications'); // Reload
        } catch (err) {
            toast.error(`Failed to ${status} guide. Updating locally for preview.`);
            // Mock local update
            setGuidesData(prev => prev.map(g => g.id === id ? { ...g, verificationStatus: status } : g));
        }
    };

    const handleBlockUser = async (id: string, isBlocked: boolean) => {
        if (!window.confirm(`Are you sure you want to ${isBlocked ? 'block' : 'unblock'} this user?`)) return;
        try {
            await adminApi.blockUser(id, isBlocked);
            toast.success(`User ${isBlocked ? 'blocked' : 'unblocked'} successfully`);
            loadTabData(activeTab); // Reload current tab
        } catch (err) {
            toast.error("Failed to update user status");
        }
    };

    const handleRemoveUser = async (id: string) => {
        if (!window.confirm("Are you sure you want to PERMANENTLY remove this user? This cannot be undone.")) return;
        try {
            await adminApi.removeUser(id);
            toast.success("User permanently removed");
            loadTabData(activeTab); // Reload current tab
        } catch (err) {
            toast.error("Failed to remove user");
        }
    };

    const handleSendMessage = async () => {
        if (!messagingGuideId || !messageBody) return;
        try {
            await adminApi.messageGuide(messagingGuideId, messageSubject, messageBody);
            toast.success("Message sent successfully");
            setMessagingGuideId(null);
            setMessageBody("");
        } catch (err) {
            toast.error("Failed to send message. (Expected on mocked backend)");
            setMessagingGuideId(null);
            setMessageBody("");
        }
    };

    const maskAadhaar = (aadhaar?: string) => {
        if (!aadhaar) return 'Not Provided';
        const clean = aadhaar.replace(/\D/g, '');
        if (clean.length < 4) return clean;
        return `XXXX XXXX ${clean.slice(-4)}`;
    };

    const getInitials = (name?: string) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    // --- RENDER HELPERS ---

    const renderSidebar = () => (
        <aside className="w-64 bg-white dark:bg-card border-r border-border flex flex-col h-full sticky top-0">
            <div className="p-6 border-b border-border">
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Admin Portal
                </h2>
                <p className="text-xs text-muted-foreground mt-1">Tourist Local Connect</p>
            </div>
            
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {[
                    { id: 'overview', icon: BarChart3, label: 'Overview' },
                    { id: 'verifications', icon: ShieldCheck, label: 'Guide Verifications' },
                    { id: 'tourists', icon: Users, label: 'Tourists' },
                    { id: 'bookings', icon: DollarSign, label: 'Bookings & Payments' },
                    { id: 'contact', icon: MessageSquare, label: 'Contact Guides' }
                ].map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as TabType)}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors",
                            activeTab === item.id 
                                ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" 
                                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-accent"
                        )}
                    >
                        <item.icon className="w-5 h-5" />
                        {item.label}
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-border">
                <div className="flex items-center gap-3 px-4 py-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                        {getInitials(currentUser.name)}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium truncate">{currentUser.name}</p>
                        <p className="text-xs text-muted-foreground truncate">Super Admin</p>
                    </div>
                </div>
                <button 
                    onClick={onLogout}
                    className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/20 rounded-md transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </button>
            </div>
        </aside>
    );

    const renderOverview = () => {
        if (!overviewData) return null;
        return (
            <div className="space-y-6 animate-in fade-in">
                <h1 className="text-2xl font-bold">Platform Overview</h1>
                
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card><CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Briefcase className="w-6 h-6" /></div>
                            <div><p className="text-sm text-muted-foreground">Total Guides</p><h3 className="text-2xl font-bold">{overviewData.totalGuides}</h3></div>
                        </div>
                    </CardContent></Card>
                    <Card><CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg"><ShieldCheck className="w-6 h-6" /></div>
                            <div><p className="text-sm text-muted-foreground">Pending Verifications</p><h3 className="text-2xl font-bold">{overviewData.pendingVerifications}</h3></div>
                        </div>
                    </CardContent></Card>
                    <Card><CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 text-green-600 rounded-lg"><Users className="w-6 h-6" /></div>
                            <div><p className="text-sm text-muted-foreground">Total Tourists</p><h3 className="text-2xl font-bold">{overviewData.totalTourists}</h3></div>
                        </div>
                    </CardContent></Card>
                    <Card><CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><DollarSign className="w-6 h-6" /></div>
                            <div><p className="text-sm text-muted-foreground">Monthly Revenue</p><h3 className="text-2xl font-bold">₹{overviewData.monthlyRevenue.toLocaleString()}</h3></div>
                        </div>
                    </CardContent></Card>
                </div>

                {/* Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Bookings Per Month</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={overviewData.bookingsPerMonth}>
                                <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="bookings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Recent Applications */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Guide Applications</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="divide-y">
                            {overviewData.recentApplications.map(app => (
                                <div key={app.id} className="py-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-medium text-gray-600">
                                            {getInitials(app.name)}
                                        </div>
                                        <div>
                                            <p className="font-medium">{app.name}</p>
                                            <p className="text-sm text-muted-foreground">{app.city} • Applied {new Date(app.joinDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Badge status={app.verificationStatus} />
                                        <Button variant="outline" size="sm" onClick={() => setActiveTab('verifications')}>Review</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    };

    const renderVerifications = () => {
        const pending = guidesData.filter(g => g.verificationStatus === 'pending');
        const resolved = guidesData.filter(g => g.verificationStatus !== 'pending');

        return (
            <div className="space-y-6 animate-in fade-in">
                <h1 className="text-2xl font-bold">Guide Verifications</h1>
                
                <h2 className="text-lg font-semibold mt-8 mb-4">Pending Approval ({pending.length})</h2>
                {pending.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground border rounded-lg bg-white/50 dark:bg-card">No pending verifications.</div>
                ) : (
                    <div className="grid gap-4">
                        {pending.map(guide => (
                            <Card key={guide.id}>
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row gap-6 items-start">
                                        <div className="flex gap-4 flex-1">
                                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center font-medium text-gray-600">
                                                {getInitials(guide.name)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg flex items-center gap-2">{guide.name} <Badge status="pending" /></h3>
                                                <p className="text-sm text-muted-foreground">{guide.city} • {guide.languages.join(", ")}</p>
                                                <p className="text-sm text-muted-foreground mt-1">{guide.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2 min-w-[200px]">
                                            <Button 
                                                variant="outline" 
                                                onClick={() => setExpandedAadhaar(expandedAadhaar === guide.id ? null : guide.id)}
                                            >
                                                {expandedAadhaar === guide.id ? "Hide Aadhaar Details" : "View Aadhaar"}
                                            </Button>
                                            <div className="flex gap-2">
                                                <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleVerifyGuide(guide.id, 'verified')}><Check className="w-4 h-4 mr-2"/> Accept</Button>
                                                <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={() => handleVerifyGuide(guide.id, 'rejected')}><X className="w-4 h-4 mr-2"/> Reject</Button>
                                            </div>
                                            <div className="flex gap-2 mt-2">
                                                <Button variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleBlockUser(guide.id, !guide.isBlocked)}>
                                                    {guide.isBlocked ? "Unblock" : "Block"}
                                                </Button>
                                                <Button variant="destructive" className="flex-1 bg-red-700 hover:bg-red-800" onClick={() => handleRemoveUser(guide.id)}>
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {expandedAadhaar === guide.id && (
                                        <div className="mt-6 pt-6 border-t grid md:grid-cols-2 gap-6 animate-in slide-in-from-top-2">
                                            <div className="space-y-2 text-sm">
                                                <div className="grid grid-cols-3 gap-2"><span className="text-muted-foreground">Aadhaar No:</span> <span className="col-span-2 font-mono font-medium">{maskAadhaar(guide.aadharId)}</span></div>
                                                <div className="grid grid-cols-3 gap-2"><span className="text-muted-foreground">Name:</span> <span className="col-span-2">{guide.name}</span></div>
                                                <div className="grid grid-cols-3 gap-2"><span className="text-muted-foreground">DOB:</span> <span className="col-span-2">{guide.dob || 'N/A'}</span></div>
                                                <div className="grid grid-cols-3 gap-2"><span className="text-muted-foreground">Address:</span> <span className="col-span-2">{guide.address || 'N/A'}</span></div>
                                            </div>
                                            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center h-32 text-muted-foreground text-sm border border-dashed">
                                                {guide.aadharImage ? <img src={guide.aadharImage} alt="Aadhaar" className="h-full object-contain" /> : "No Image Uploaded"}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                <h2 className="text-lg font-semibold mt-8 mb-4">Recently Processed</h2>
                <div className="bg-white dark:bg-card border rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-muted/50 border-b">
                            <tr>
                                <th className="px-6 py-3 font-medium">Guide</th>
                                <th className="px-6 py-3 font-medium">City</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {resolved.map(guide => (
                                <tr key={guide.id}>
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium">{getInitials(guide.name)}</div>
                                        {guide.name}
                                    </td>
                                    <td className="px-6 py-4">{guide.city}</td>
                                    <td className="px-6 py-4"><Badge status={guide.verificationStatus} /></td>
                                    <td className="px-6 py-4 flex gap-2 justify-end">
                                        {editingVerificationsId === guide.id ? (
                                            <>
                                                <Button variant="outline" size="sm" onClick={() => handleBlockUser(guide.id, !guide.isBlocked)}>
                                                    {guide.isBlocked ? "Unblock" : "Block"}
                                                </Button>
                                                <Button variant="destructive" size="sm" onClick={() => handleRemoveUser(guide.id)}>
                                                    Delete
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => setEditingVerificationsId(null)}>
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </>
                                        ) : (
                                            <Button variant="ghost" size="sm" onClick={() => setEditingVerificationsId(guide.id)}>
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderTourists = () => (
        <div className="space-y-6 animate-in fade-in">
            <h1 className="text-2xl font-bold">Tourists Management</h1>
            <div className="bg-white dark:bg-card border rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-muted/50 border-b">
                        <tr>
                            <th className="px-6 py-3 font-medium">Name</th>
                            <th className="px-6 py-3 font-medium">Email</th>
                            <th className="px-6 py-3 font-medium">Joined Date</th>
                            <th className="px-6 py-3 font-medium">Trips</th>
                            <th className="px-6 py-3 font-medium">Status</th>
                            <th className="px-6 py-3 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {touristsData.map(tourist => (
                            <tr key={tourist.id}>
                                <td className="px-6 py-4 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-medium">{getInitials(tourist.name)}</div>
                                    <span className="font-medium">{tourist.name}</span>
                                </td>
                                <td className="px-6 py-4 text-muted-foreground">{tourist.email}</td>
                                <td className="px-6 py-4">{new Date(tourist.joinDate).toLocaleDateString()}</td>
                                <td className="px-6 py-4">{tourist.numberOfTrips}</td>
                                <td className="px-6 py-4"><Badge status={tourist.status} /></td>
                                <td className="px-6 py-4 flex gap-2 justify-end">
                                    <Button variant="outline" size="sm" onClick={() => handleBlockUser(tourist.id, tourist.status !== 'blocked')}>
                                        {tourist.status === 'blocked' ? "Unblock" : "Block"}
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleRemoveUser(tourist.id)}>
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderBookings = () => {
        if (!bookingsData) return null;
        return (
            <div className="space-y-6 animate-in fade-in">
                <h1 className="text-2xl font-bold">Bookings & Payments</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card><CardContent className="p-6">
                        <p className="text-sm text-muted-foreground mb-1">Total Bookings</p>
                        <h3 className="text-3xl font-bold">{bookingsData.totalBookings}</h3>
                    </CardContent></Card>
                    <Card><CardContent className="p-6">
                        <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                        <h3 className="text-3xl font-bold text-green-600">₹{bookingsData.totalRevenue.toLocaleString()}</h3>
                    </CardContent></Card>
                    <Card><CardContent className="p-6">
                        <p className="text-sm text-muted-foreground mb-1">Average Tour Value</p>
                        <h3 className="text-3xl font-bold text-blue-600">₹{bookingsData.averageTourValue.toLocaleString()}</h3>
                    </CardContent></Card>
                </div>

                <h2 className="text-lg font-semibold mt-8 mb-4">Recent Transactions</h2>
                <div className="bg-white dark:bg-card border rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-muted/50 border-b">
                            <tr>
                                <th className="px-6 py-3 font-medium">Tour Details</th>
                                <th className="px-6 py-3 font-medium">Participants</th>
                                <th className="px-6 py-3 font-medium">Date</th>
                                <th className="px-6 py-3 font-medium">Amount</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {bookingsData.recentTransactions.map(tx => (
                                <tr key={tx.id}>
                                    <td className="px-6 py-4 font-medium">{tx.tourName}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-muted-foreground">Tourist: {tx.touristName}</span>
                                            <span className="text-xs">Guide: {tx.guideName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{new Date(tx.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 font-medium">₹{tx.amount}</td>
                                    <td className="px-6 py-4"><Badge status={tx.paymentStatus} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderContact = () => (
        <div className="space-y-6 animate-in fade-in">
            <h1 className="text-2xl font-bold">Contact Guides</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {guidesData.map(guide => (
                    <Card key={guide.id} className="flex flex-col">
                        <CardContent className="p-6 flex-1">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
                                    {getInitials(guide.name)}
                                </div>
                                <div>
                                    <h3 className="font-bold">{guide.name}</h3>
                                    <p className="text-sm text-muted-foreground">{guide.city}</p>
                                </div>
                            </div>
                            <div className="space-y-2 mb-4">
                                <p className="text-sm text-muted-foreground truncate">{guide.email}</p>
                                <div className="flex gap-2">
                                    <Badge status={guide.verificationStatus} />
                                    {guide.isBlocked && <Badge status="blocked" />}
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" onClick={() => handleBlockUser(guide.id, !guide.isBlocked)}>
                                    {guide.isBlocked ? "Unblock Guide" : "Block Guide"}
                                </Button>
                                <Button variant="destructive" className="w-full bg-red-700 hover:bg-red-800" onClick={() => handleRemoveUser(guide.id)}>
                                    Permanent Delete
                                </Button>
                            </div>

                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="w-full" onClick={() => setMessagingGuideId(guide.id)}>
                                        <MessageSquare className="w-4 h-4 mr-2" /> Message
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Message {guide.name}</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Subject</label>
                                            <select 
                                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                value={messageSubject}
                                                onChange={e => setMessageSubject(e.target.value)}
                                            >
                                                <option>Regarding verification</option>
                                                <option>Document resubmission</option>
                                                <option>Policy update</option>
                                                <option>Other</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Message Body</label>
                                            <textarea 
                                                className="w-full min-h-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                                                placeholder="Type your message here..."
                                                value={messageBody}
                                                onChange={e => setMessageBody(e.target.value)}
                                            ></textarea>
                                        </div>
                                        <Button className="w-full" onClick={handleSendMessage} disabled={!messageBody}>Send Message</Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-background overflow-hidden text-foreground">
            {renderSidebar()}
            <main className="flex-1 overflow-y-auto p-8 border-l border-border">
                {isLoading ? (
                    <div className="flex h-full items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <>
                        {activeTab === 'overview' && renderOverview()}
                        {activeTab === 'verifications' && renderVerifications()}
                        {activeTab === 'tourists' && renderTourists()}
                        {activeTab === 'bookings' && renderBookings()}
                        {activeTab === 'contact' && renderContact()}
                    </>
                )}
            </main>
        </div>
    );
}

// Reusable Status Badge Component
const Badge = ({ status }: { status: string }) => {
    let colors = "bg-gray-100 text-gray-800";
    
    switch (status.toLowerCase()) {
        case 'pending': colors = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500"; break;
        case 'verified':
        case 'active':
        case 'paid': 
            colors = "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500"; break;
        case 'rejected': 
        case 'inactive':
        case 'refunded':
            colors = "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500"; break;
        case 'upcoming': 
            colors = "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500"; break;
    }

    return (
        <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize", colors)}>
            {status}
        </span>
    );
};
