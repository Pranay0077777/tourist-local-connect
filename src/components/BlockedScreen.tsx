import { Lock, Mail, Phone, ArrowLeft } from "lucide-react";

export function BlockedScreen() {
    const handleLogout = () => {
        localStorage.removeItem('tlc_current_user');
        window.dispatchEvent(new Event('user-session-updated'));
        window.location.href = '/welcome';
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 border-8 border-red-500">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-2xl border-2 border-red-500 text-center space-y-6 animate-in slide-in-from-bottom-4 fade-in">
                <div className="mx-auto w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center shadow-inner">
                    <Lock className="w-12 h-12" />
                </div>
                
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Account Suspended</h1>
                    <p className="text-gray-600 mt-2">
                        Your account has been temporarily disabled by the administration due to policy violations or incorrect profile information.
                    </p>
                </div>

                <div className="bg-red-50 border border-red-100 p-5 rounded-xl text-left space-y-4">
                    <h3 className="font-bold text-red-900 border-b border-red-200 pb-2">Admin Contact Details</h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-red-800 font-medium">
                            <div className="p-2 bg-red-100 rounded-lg"><Mail className="w-5 h-5 text-red-600" /></div>
                            <a href="mailto:admin33@tlc.com" className="hover:underline">admin33@tlc.com</a>
                        </div>
                        <div className="flex items-center gap-3 text-red-800 font-medium">
                            <div className="p-2 bg-red-100 rounded-lg"><Phone className="w-5 h-5 text-red-600" /></div>
                            <a href="tel:+919392593410" className="hover:underline">+91 9392593410</a>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl px-4 py-3.5 font-bold transition-all shadow-lg hover:shadow-xl active:scale-95"
                >
                    <ArrowLeft className="w-5 h-5" /> Return to Home
                </button>
            </div>
        </div>
    );
}
