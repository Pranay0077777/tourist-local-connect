import { type LucideIcon } from "lucide-react";
interface DashboardStatProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    subtext?: string;
    color: string;
    loading?: boolean;
}
export declare function DashboardStat({ icon: Icon, label, value, subtext, color, loading }: DashboardStatProps): import("react/jsx-runtime").JSX.Element;
export {};
