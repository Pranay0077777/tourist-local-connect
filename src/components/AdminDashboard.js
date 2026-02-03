import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { RoleAwareHeader } from "./RoleAwareHeader";
import { getUsers } from "@/lib/localStorage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Users, DollarSign, ShieldCheck, Map, Check, X, FileText } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger, } from "@/components/ui/tabs";
export function AdminDashboard({ currentUser, onNavigate, onLogout }) {
    const [allUsers, setAllUsers] = useState([]);
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
    const handleVerification = (userId, action) => {
        const users = getUsers(); // Re-fetch to be safe
        const updatedUsers = users.map(u => {
            if (u.id === userId) {
                return {
                    ...u,
                    verificationStatus: action === 'approve' ? 'verified' : 'rejected'
                };
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
    return (_jsxs("div", { className: "min-h-screen bg-gray-50 dark:bg-background", children: [_jsx(RoleAwareHeader, { user: currentUser, currentPage: "admin", onNavigate: onNavigate, onLogout: onLogout }), _jsxs("main", { className: "container mx-auto px-4 py-8 space-y-8", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent", children: "Super Admin Control" }), _jsx("p", { className: "text-muted-foreground mt-2", children: "Manage permissions, verify IDs, and monitor platform growth." })] }), _jsxs(Tabs, { defaultValue: "verifications", className: "space-y-6", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-3 lg:w-[400px]", children: [_jsx(TabsTrigger, { value: "verifications", children: "Verifications" }), _jsx(TabsTrigger, { value: "registrations", children: "Registrations" }), _jsx(TabsTrigger, { value: "overview", children: "Overview" })] }), _jsx(TabsContent, { value: "verifications", className: "space-y-6", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Pending ID Verifications" }), _jsx(CardDescription, { children: "Review Aadhar IDs submitted by new guides." })] }), _jsx(CardContent, { children: pendingGuides.length === 0 ? (_jsxs("div", { className: "text-center py-12 text-muted-foreground", children: [_jsx(ShieldCheck, { className: "w-12 h-12 mx-auto mb-4 opacity-20" }), _jsx("p", { children: "No pending verifications. You're all caught up!" })] })) : (_jsx("div", { className: "grid gap-6", children: pendingGuides.map(guide => (_jsxs("div", { className: "flex flex-col md:flex-row gap-6 p-6 border rounded-lg bg-white dark:bg-card shadow-sm", children: [_jsx("div", { className: "w-full md:w-1/3 aspect-video bg-gray-100 rounded-md flex items-center justify-center overflow-hidden border", children: guide.aadharImage ? (_jsx("img", { src: guide.aadharImage, alt: "ID", className: "w-full h-full object-cover" })) : (_jsxs("div", { className: "flex flex-col items-center text-gray-400", children: [_jsx(FileText, { className: "w-8 h-8 mb-2" }), _jsx("span", { className: "text-xs", children: "No Image Uploaded" })] })) }), _jsxs("div", { className: "flex-1 space-y-4", children: [_jsxs("div", { children: [_jsxs("h3", { className: "text-lg font-bold flex items-center gap-2", children: [guide.name, _jsx("span", { className: "px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold", children: "Pending" })] }), _jsxs("div", { className: "text-sm text-muted-foreground grid grid-cols-2 gap-2 mt-2", children: [_jsxs("p", { children: [_jsx("strong", { children: "Email:" }), " ", guide.email] }), _jsxs("p", { children: [_jsx("strong", { children: "City:" }), " ", guide.city] }), _jsxs("p", { children: [_jsx("strong", { children: "Joined:" }), " ", new Date(guide.joinDate).toLocaleDateString()] }), _jsxs("p", { children: [_jsx("strong", { children: "Aadhar ID:" }), " ", guide.aadharId || 'NOT PROVIDED'] })] })] }), _jsxs("div", { className: "flex gap-3 pt-2", children: [_jsxs(Button, { className: "bg-green-600 hover:bg-green-700 w-full md:w-auto", onClick: () => handleVerification(guide.id, 'approve'), children: [_jsx(Check, { className: "w-4 h-4 mr-2" }), " Approve Guide"] }), _jsxs(Button, { variant: "destructive", className: "w-full md:w-auto", onClick: () => handleVerification(guide.id, 'reject'), children: [_jsx(X, { className: "w-4 h-4 mr-2" }), " Reject"] })] })] })] }, guide.id))) })) })] }) }), _jsx(TabsContent, { value: "registrations", className: "space-y-6", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { children: [_jsx(CardTitle, { children: "New User Registrations" }), _jsx(CardDescription, { children: "Latest users who joined the platform." })] }) }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-1", children: newRegistrations.length === 0 ? (_jsx("div", { className: "text-center py-8 text-muted-foreground", children: "No new registrations found." })) : newRegistrations.map(user => (_jsxs("div", { className: "flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-muted/50 rounded-lg transition-colors border-b last:border-0 border-gray-100", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-10 h-10 bg-gray-200 rounded-full overflow-hidden", children: _jsx("img", { src: user.avatar || `https://ui-avatars.com/api/?name=${user.name}`, alt: user.name, className: "w-full h-full object-cover" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-gray-900", children: user.name }), _jsx("p", { className: "text-sm text-gray-500", children: user.email })] })] }), _jsxs("div", { className: "flex items-center gap-6", children: [_jsx("div", { className: "text-right", children: _jsx("span", { className: cn("px-2.5 py-0.5 rounded-full text-xs font-semibold", user.role === 'guide' ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"), children: user.role.toUpperCase() }) }), _jsx("div", { className: "text-sm text-gray-500 w-24 text-right", children: new Date(user.joinDate).toLocaleDateString() })] })] }, user.id))) }) })] }) }), _jsx(TabsContent, { value: "overview", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Total Revenue" }), _jsx(DollarSign, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold", children: ["\u20B9", stats.totalRevenue.toLocaleString()] }), _jsx("p", { className: "text-xs text-muted-foreground", children: "+20.1% from last month" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Total Users" }), _jsx(Users, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: stats.totalUsers }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Across all regions" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Active Guides" }), _jsx(Map, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: stats.activeGuides }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Verified & Online" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Pending Approvals" }), _jsx(ShieldCheck, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: stats.pendingVerifications }), _jsx("p", { className: "text-xs text-muted-foreground text-orange-600 font-medium", children: "Takes priority" })] })] })] }) })] })] })] }));
}
