import { useState, useEffect } from "react";
import { RoleAwareHeader } from "./RoleAwareHeader";
import { type LocalUser, getUsers } from "@/lib/localStorage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Users, DollarSign, ShieldCheck, Map, Check, X, FileText } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"

interface AdminDashboardProps {
    currentUser: LocalUser;
    onNavigate: (page: string) => void;
    onLogout: () => void;
}

export function AdminDashboard({ currentUser, onNavigate, onLogout }: AdminDashboardProps) {
    const [allUsers, setAllUsers] = useState<LocalUser[]>([]);
    const [stats, setStats] = useState({
        totalRevenue: 1250000,
        totalUsers: 0,
        activeGuides: 0,
        pendingVerifications: 0
    });


    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const users = getUsers();
        setAllUsers(users);
        setStats(prev => ({
            ...prev,
            totalUsers: users.length,
            activeGuides: users.filter(u => u.role === 'guide' && u.verificationStatus !== 'pending').length,
            pendingVerifications: users.filter(u => u.verificationStatus === 'pending').length
        }));
    };

    const handleVerification = (userId: string, action: 'approve' | 'reject') => {
        const users = getUsers(); // Re-fetch to be safe
        const updatedUsers = users.map(u => {
            if (u.id === userId) {
                return {
                    ...u,
                    verificationStatus: action === 'approve' ? 'verified' : 'rejected'
                } as LocalUser;
            }
            return u;
        });

        // Save back to local storage manually since we don't have a batch save helper exposed, 
        // using the singular saveUser might be inefficient if we had one, but strict replace is better here.
        // We'll trust our saveUser helper matches uniqueness by ID? Actually saveUser matches by EMAIL.
        // Let's use the raw localStorage set for safety here as we have the full array.
        localStorage.setItem('tlc_users', JSON.stringify(updatedUsers));

        loadData(); // Refresh UI
        toast.success(`Guide ${action === 'approve' ? 'Approved' : 'Rejected'} successfully.`);
    };



    const pendingGuides = allUsers.filter(u => u.role === 'guide' && u.verificationStatus === 'pending');

    // Sort registrations by joinDate descending
    const newRegistrations = [...allUsers].sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime()).slice(0, 10);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-background">
            <RoleAwareHeader
                user={currentUser}
                currentPage="admin"
                onNavigate={onNavigate}
                onLogout={onLogout}
            />

            <main className="container mx-auto px-4 py-8 space-y-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Super Admin Control
                    </h1>
                    <p className="text-muted-foreground mt-2">Manage permissions, verify IDs, and monitor platform growth.</p>
                </div>

                <Tabs defaultValue="verifications" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                        <TabsTrigger value="verifications">Verifications</TabsTrigger>
                        <TabsTrigger value="registrations">Registrations</TabsTrigger>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                    </TabsList>

                    {/* --- VERIFICATIONS TAB --- */}
                    <TabsContent value="verifications" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Pending ID Verifications</CardTitle>
                                <CardDescription>Review Aadhar IDs submitted by new guides.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {pendingGuides.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <ShieldCheck className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        <p>No pending verifications. You're all caught up!</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-6">
                                        {pendingGuides.map(guide => (
                                            <div key={guide.id} className="flex flex-col md:flex-row gap-6 p-6 border rounded-lg bg-white dark:bg-card shadow-sm">
                                                {/* ID Preview */}
                                                <div className="w-full md:w-1/3 aspect-video bg-gray-100 rounded-md flex items-center justify-center overflow-hidden border">
                                                    {guide.aadharImage ? (
                                                        <img src={guide.aadharImage} alt="ID" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="flex flex-col items-center text-gray-400">
                                                            <FileText className="w-8 h-8 mb-2" />
                                                            <span className="text-xs">No Image Uploaded</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Details */}
                                                <div className="flex-1 space-y-4">
                                                    <div>
                                                        <h3 className="text-lg font-bold flex items-center gap-2">
                                                            {guide.name}
                                                            <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold">Pending</span>
                                                        </h3>
                                                        <div className="text-sm text-muted-foreground grid grid-cols-2 gap-2 mt-2">
                                                            <p><strong>Email:</strong> {guide.email}</p>
                                                            <p><strong>City:</strong> {guide.city}</p>
                                                            <p><strong>Joined:</strong> {new Date(guide.joinDate).toLocaleDateString()}</p>
                                                            <p><strong>Aadhar ID:</strong> {guide.aadharId || 'NOT PROVIDED'}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-3 pt-2">
                                                        <Button
                                                            className="bg-green-600 hover:bg-green-700 w-full md:w-auto"
                                                            onClick={() => handleVerification(guide.id, 'approve')}
                                                        >
                                                            <Check className="w-4 h-4 mr-2" /> Approve Guide
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            className="w-full md:w-auto"
                                                            onClick={() => handleVerification(guide.id, 'reject')}
                                                        >
                                                            <X className="w-4 h-4 mr-2" /> Reject
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* --- REGISTRATIONS TAB --- */}
                    <TabsContent value="registrations" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>New User Registrations</CardTitle>
                                        <CardDescription>Latest users who joined the platform.</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-1">
                                    {newRegistrations.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">No new registrations found.</div>
                                    ) : newRegistrations.map(user => (
                                        <div key={user.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-muted/50 rounded-lg transition-colors border-b last:border-0 border-gray-100">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                                                    <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} alt={user.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{user.name}</p>
                                                    <p className="text-sm text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                    <span className={cn(
                                                        "px-2.5 py-0.5 rounded-full text-xs font-semibold",
                                                        user.role === 'guide' ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                                                    )}>
                                                        {user.role.toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-500 w-24 text-right">
                                                    {new Date(user.joinDate).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* --- OVERVIEW TAB --- */}
                    <TabsContent value="overview">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
                                    <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.totalUsers}</div>
                                    <p className="text-xs text-muted-foreground">Across all regions</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Active Guides</CardTitle>
                                    <Map className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.activeGuides}</div>
                                    <p className="text-xs text-muted-foreground">Verified & Online</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.pendingVerifications}</div>
                                    <p className="text-xs text-muted-foreground text-orange-600 font-medium">Takes priority</p>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
