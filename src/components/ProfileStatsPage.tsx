import { type LocalUser } from "@/lib/localStorage";
import { RoleAwareHeader } from "./RoleAwareHeader";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ArrowLeft, Users, Eye, MousePointer } from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from "recharts";

interface ProfileStatsPageProps {
    user: LocalUser;
    onNavigate: (page: string) => void;
    onLogout: () => void;
}

export function ProfileStatsPage({ user, onNavigate, onLogout }: ProfileStatsPageProps) {
    // Mock Data for Views Trend - Designed with Hikes and Dips (Sum = 850)
    const viewsData = [
        { name: 'Mon', views: 45 },
        { name: 'Tue', views: 110 },
        { name: 'Wed', views: 85 },
        { name: 'Thu', views: 160 },
        { name: 'Fri', views: 130 },
        { name: 'Sat', views: 190 },
        { name: 'Sun', views: 130 },
    ];

    // Mock Data for Visitor Origins
    const originData = [
        { name: 'Domestic', value: 65, color: '#4F46E5' },
        { name: 'International', value: 35, color: '#10B981' },
    ];

    return (
        <div className="min-h-screen bg-gray-50/50">
            <RoleAwareHeader
                user={user}
                currentPage="home"
                onNavigate={onNavigate}
                onLogout={onLogout}
            />

            <main className="container mx-auto px-4 py-8 max-w-5xl">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onNavigate('home')}
                    className="mb-6 text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
                </Button>

                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Profile Analytics</h1>
                        <p className="text-gray-500 mt-2">Insights into who's viewing your profile.</p>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                <Eye className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Total Views (7d)</p>
                                <h3 className="text-2xl font-bold text-gray-900">850</h3>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Unique Visitors</p>
                                <h3 className="text-2xl font-bold text-gray-900">720</h3>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                                <MousePointer className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Click-through Rate</p>
                                <h3 className="text-2xl font-bold text-gray-900">12.5%</h3>
                                <p className="text-xs text-green-600 mt-1">+2.1% this week</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Views Graph */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Profile Views (Last 7 Days)</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-0">
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={viewsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontSize: 12 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontSize: 12 }}
                                        />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            cursor={{ stroke: '#f1f5f9', strokeWidth: 2 }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="views"
                                            stroke="#8884d8"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorViews)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Visitor Origins */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Visitor Source</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[250px] w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={originData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {originData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="text-center">
                                        <span className="text-3xl font-bold text-gray-900">100%</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 space-y-2">
                                {originData.map((entry) => (
                                    <div key={entry.name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                                            <span className="text-sm text-gray-600">{entry.name}</span>
                                        </div>
                                        <span className="font-bold text-gray-900">{entry.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div >
    );
}
