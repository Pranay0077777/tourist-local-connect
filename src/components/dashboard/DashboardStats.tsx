import { Card, CardContent } from "@/components/ui/card";
import { type LucideIcon } from "lucide-react";

interface DashboardStatProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    subtext?: string;
    color: string;
    loading?: boolean;
}

export function DashboardStat({ icon: Icon, label, value, subtext, color, loading }: DashboardStatProps) {
    return (
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
                        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
                    </div>
                    {subtext && <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">{subtext}</span>}
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">{label}</p>
                    <h3 className="text-2xl font-bold text-foreground font-heading">{loading ? "..." : value}</h3>
                </div>
            </CardContent>
        </Card>
    );
}
