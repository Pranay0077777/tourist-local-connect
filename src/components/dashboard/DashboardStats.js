import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent } from "@/components/ui/card";
import {} from "lucide-react";
export function DashboardStat({ icon: Icon, label, value, subtext, color, loading }) {
    return (_jsx(Card, { className: "border-none shadow-sm hover:shadow-md transition-shadow", children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("div", { className: `p-3 rounded-xl ${color} bg-opacity-10`, children: _jsx(Icon, { className: `w-6 h-6 ${color.replace('bg-', 'text-')}` }) }), subtext && _jsx("span", { className: "text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full", children: subtext })] }), _jsxs("div", { className: "space-y-1", children: [_jsx("p", { className: "text-sm font-medium text-muted-foreground", children: label }), _jsx("h3", { className: "text-2xl font-bold text-foreground font-heading", children: loading ? "..." : value })] })] }) }));
}
