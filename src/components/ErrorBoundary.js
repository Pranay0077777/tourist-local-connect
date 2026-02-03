import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Component } from 'react';
import { Button } from './ui/button';
class ErrorBoundary extends Component {
    state = {
        hasError: false,
        error: null
    };
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50 p-4", children: _jsxs("div", { className: "max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center space-y-4 border border-red-100", children: [_jsx("div", { className: "w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto", children: _jsx("span", { className: "text-3xl", children: "\u26A0\uFE0F" }) }), _jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Oops! Something went wrong." }), _jsx("p", { className: "text-gray-500", children: this.state.error?.message || "An unexpected error occurred." }), _jsx(Button, { onClick: () => window.location.reload(), className: "w-full bg-red-600 hover:bg-red-700 text-white", children: "Refresh Page" })] }) }));
        }
        return this.props.children;
    }
}
export default ErrorBoundary;
