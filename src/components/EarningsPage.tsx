import { useState, useEffect } from "react";
import { type LocalUser } from "@/lib/localStorage";
import { RoleAwareHeader } from "./RoleAwareHeader";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { ArrowLeft, Wallet, TrendingUp, DollarSign, Calendar } from "lucide-react";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from "recharts";

interface EarningsPageProps {
    user: LocalUser;
    onNavigate: (page: string) => void;
    onLogout: () => void;
}

export function EarningsPage({ user, onNavigate, onLogout }: EarningsPageProps) {
    const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
    const [data, setData] = useState<any[]>([]);
    const [summary, setSummary] = useState({ today: 0, yesterday: 0, thisWeek: 0, total: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            // MOCK DATA FOR PRESENTATION (tester@gmail.com)
            if (user.email === 'tester@gmail.com') {
                const mockSummary = {
                    today: 3500,
                    yesterday: 2800,
                    thisWeek: 18500,
                    total: 85000
                };

                let mockGraph: any[] = [];
                if (period === 'daily') {
                    mockGraph = [
                        { name: '08:00', value: 0 },
                        { name: '10:00', value: 1200 },
                        { name: '12:00', value: 1800 },
                        { name: '14:00', value: 0 },
                        { name: '16:00', value: 500 },
                        { name: '18:00', value: 0 },
                        { name: '20:00', value: 0 },
                    ];
                } else if (period === 'weekly') {
                    mockGraph = [
                        { name: 'Mon', value: 2100 },
                        { name: 'Tue', value: 3500 },
                        { name: 'Wed', value: 1200 },
                        { name: 'Thu', value: 4800 },
                        { name: 'Fri', value: 3200 },
                        { name: 'Sat', value: 5400 },
                        { name: 'Sun', value: 2800 },
                    ];
                } else if (period === 'monthly') {
                    mockGraph = [
                        { name: 'Jan', value: 8500 },
                        { name: 'Feb', value: 12400 },
                        { name: 'Mar', value: 9800 },
                        { name: 'Apr', value: 15600 },
                        { name: 'May', value: 14200 },
                        { name: 'Jun', value: 24500 },
                    ];
                }

                setData(mockGraph);
                setSummary(mockSummary);
                setLoading(false);
                return;
            }

            try {
                // Fetch mock earnings from backend for regular users
                const res = await fetch(`http://localhost:3001/api/guides/${user.id}/earnings?period=${period}`);
                const json = await res.json();
                setData(json.graph || []);
                setSummary(json.summary || { today: 0, yesterday: 0, thisWeek: 0, total: 0 });
            } catch (error) {
                console.error("Failed to fetch earnings", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user.id, period, user.email]);

    return (
        <div className="min-h-screen bg-gray-50">
            <RoleAwareHeader
                user={user}
                currentPage="calendar" // highlight nothing specific or calendar
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

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Earnings & Analytics</h2>
                        <p className="text-gray-500 mt-1">Track your revenue and financial growth.</p>
                    </div>

                    <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                        {(['daily', 'weekly', 'monthly'] as const).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${period === p
                                    ? 'bg-primary text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    } capitalize`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="bg-gradient-to-br from-green-500 to-green-600 border-none text-white shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-green-100 font-medium text-sm">Total Earnings</p>
                                    <h3 className="text-4xl font-bold mt-2">₹{summary.total.toLocaleString()}</h3>
                                </div>
                                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                    <Wallet className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-green-100 text-sm">
                                <TrendingUp className="w-4 h-4" />
                                <span>+12% vs last month</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-gray-500 font-medium text-sm">Today's Revenue</p>
                                    <h3 className="text-3xl font-bold mt-2 text-gray-900">₹{summary.today.toLocaleString()}</h3>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-xl">
                                    <DollarSign className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-gray-500 text-sm">
                                <span>Yesterday: <span className="font-semibold">₹{summary.yesterday.toLocaleString()}</span></span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-gray-500 font-medium text-sm">This Week</p>
                                    <h3 className="text-3xl font-bold mt-2 text-gray-900">₹{summary.thisWeek.toLocaleString()}</h3>
                                </div>
                                <div className="p-3 bg-purple-50 rounded-xl">
                                    <Calendar className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-gray-500 text-sm">
                                <span className="text-green-600 font-medium flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" /> On track
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Graph */}
                <Card className="border-none shadow-md">
                    <CardHeader>
                        <CardTitle>Revenue Trends</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-0">
                        <div className="h-[400px] w-full">
                            {loading ? (
                                <div className="h-full w-full flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    {period === 'monthly' ? (
                                        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                            <XAxis
                                                dataKey="name"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                                dy={10}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                                tickFormatter={(value) => `₹${value / 1000}k`}
                                            />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Revenue']}
                                            />
                                            <Bar dataKey="value" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={50} />
                                        </BarChart>
                                    ) : (
                                        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                            <XAxis
                                                dataKey="name"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                                dy={10}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                                tickFormatter={(value) => `₹${value}`}
                                            />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Revenue']}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="value"
                                                stroke="#4F46E5"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorValue)"
                                            />
                                        </AreaChart>
                                    )}
                                </ResponsiveContainer>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
