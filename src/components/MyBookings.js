import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import {} from "@/lib/localStorage";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Calendar, ArrowLeft, Clock, MapPin, CheckCircle2, XCircle, Star, CreditCard, User } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { socket } from "@/lib/socket";
import { toast } from "sonner";
import { PaymentModal } from "./PaymentModal";
import { ReviewModal } from "./ReviewModal";
import { LiveTracker } from "./LiveTracker";
export function MyBookings({ user, onNavigate }) {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBookingForPayment, setSelectedBookingForPayment] = useState(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [selectedBookingForTracking, setSelectedBookingForTracking] = useState(null);
    const isGuide = user.role === 'guide';
    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true);
            try {
                const apiBookings = isGuide
                    ? await api.getBookingRequests(user.id)
                    : await api.getBookings(user.id);
                setBookings(apiBookings || []);
            }
            catch (error) {
                console.error("Failed to load bookings", error);
                setBookings([]);
            }
            finally {
                setLoading(false);
            }
        };
        fetchBookings();
        const handleUpdate = (updatedBooking) => {
            const isRelevant = isGuide
                ? (updatedBooking.guideId === user.id || updatedBooking.guide_id === user.id)
                : (updatedBooking.userId === user.id || updatedBooking.touristId === user.id);
            if (isRelevant) {
                setBookings(prev => {
                    const exists = prev.find(b => b.id === updatedBooking.id);
                    if (exists) {
                        return prev.map(b => b.id === updatedBooking.id ? { ...b, ...updatedBooking } : b);
                    }
                    else {
                        return [updatedBooking, ...prev];
                    }
                });
                toast.info(isGuide ? "New booking request!" : "Booking updated!");
            }
        };
        socket.on('booking_updated', handleUpdate);
        socket.on('booking_created', handleUpdate);
        return () => {
            socket.off('booking_updated', handleUpdate);
            socket.off('booking_created', handleUpdate);
        };
    }, [user.id, isGuide]);
    const handleCancel = async (id) => {
        if (!confirm("Are you sure you want to cancel this booking?"))
            return;
        try {
            await api.updateBookingStatus(id, 'cancelled');
            setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
            toast.success("Booking cancelled successfully");
        }
        catch (error) {
            toast.error("Failed to cancel booking");
        }
    };
    const handleAccept = async (id) => {
        try {
            await api.updateBookingStatus(id, 'confirmed');
            setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'confirmed' } : b));
            toast.success("Booking accepted!");
        }
        catch (error) {
            toast.error("Failed to accept booking");
        }
    };
    const handleReview = (booking) => {
        setSelectedBookingForReview(booking);
        setIsReviewModalOpen(true);
    };
    const handlePay = (booking) => {
        setSelectedBookingForPayment(booking);
        setIsPaymentModalOpen(true);
    };
    const handlePaymentSuccess = () => {
        setIsPaymentModalOpen(false);
        if (selectedBookingForPayment) {
            setBookings(prev => prev.map(b => b.id === selectedBookingForPayment.id ? { ...b, status: 'confirmed' } : b));
            toast.success("Payment successful! Your trip is confirmed.");
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("div", { className: "bg-white border-b border-gray-200 sticky top-0 z-20 px-4 py-3 md:px-8 shadow-sm", children: _jsxs("div", { className: "container mx-auto flex items-center justify-between", children: [_jsxs(Button, { variant: "ghost", size: "sm", onClick: () => onNavigate('home'), className: "text-gray-600 hover:text-gray-900 hover:bg-gray-100", children: [_jsx(ArrowLeft, { className: "w-5 h-5 mr-1" }), "Back to Home"] }), _jsx("span", { className: "font-bold text-gray-900", children: isGuide ? "Booking Requests" : "My Trips" })] }) }), _jsxs("main", { className: "container mx-auto px-4 py-8 max-w-4xl", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-3xl font-bold font-heading text-gray-900", children: isGuide ? "Incoming Requests" : "My Trips" }), _jsx("p", { className: "text-gray-500", children: isGuide ? "Manage your tour schedules and requests" : "Manage your upcoming adventures" })] }), loading ? (_jsx("div", { className: "space-y-4", children: [1, 2, 3].map(i => (_jsx("div", { className: "h-48 w-full bg-gray-200 animate-pulse rounded-xl" }, i))) })) : bookings.length > 0 ? (_jsx("div", { className: "space-y-4", children: bookings.map((booking) => (_jsx(Card, { className: "border border-gray-100 shadow-sm hover:shadow-md transition-shadow", children: _jsxs(CardContent, { className: "p-6 flex flex-col md:flex-row gap-6", children: [_jsxs("div", { className: "flex-1 space-y-4", children: [_jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-bold text-xl text-gray-900 mb-1", children: booking.tourType }), _jsx("p", { className: "text-gray-500 text-sm flex items-center gap-1", children: isGuide ? (_jsxs(_Fragment, { children: ["Requested by ", _jsx("span", { className: "font-bold text-gray-700", children: booking.touristName })] })) : (_jsxs(_Fragment, { children: ["with ", _jsx("span", { className: "font-bold text-gray-700", children: booking.guideName })] })) })] }), _jsxs("span", { className: `px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1
                                                ${booking.status === 'confirmed' || booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                            booking.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`, children: [booking.status === 'confirmed' || booking.status === 'completed' ? _jsx(CheckCircle2, { className: "w-3 h-3" }) :
                                                                booking.status === 'cancelled' ? _jsx(XCircle, { className: "w-3 h-3" }) : _jsx(Clock, { className: "w-3 h-3" }), booking.status] })] }), _jsxs("div", { className: "flex flex-wrap gap-4 text-sm text-gray-600", children: [_jsxs("span", { className: "flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg", children: [_jsx(Calendar, { className: "w-4 h-4 text-primary" }), " ", booking.date] }), _jsxs("span", { className: "flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg", children: [_jsx(Clock, { className: "w-4 h-4 text-primary" }), " ", booking.time, " (", booking.duration, "h)"] }), booking.location && (_jsxs("span", { className: "flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg", children: [_jsx(MapPin, { className: "w-4 h-4 text-primary" }), " ", booking.location] }))] })] }), _jsxs("div", { className: "flex flex-row md:flex-col justify-between items-end border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 min-w-[140px]", children: [_jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-xs text-gray-400", children: "Total Price" }), _jsxs("p", { className: "text-2xl font-bold text-gray-900", children: ["\u20B9", booking.totalPrice] })] }), _jsxs("div", { className: "space-y-2 w-full md:w-auto mt-auto", children: [!isGuide && booking.status === 'pending' && (_jsxs(Button, { className: "w-full bg-green-600 hover:bg-green-700 text-white", onClick: () => handlePay(booking), children: [_jsx(CreditCard, { className: "w-4 h-4 mr-2" }), " Pay Now"] })), isGuide && booking.status === 'pending' && (_jsxs(Button, { className: "w-full bg-green-600 hover:bg-green-700 text-white", onClick: () => handleAccept(booking.id), children: [_jsx(CheckCircle2, { className: "w-4 h-4 mr-2" }), " Accept"] })), (booking.status === 'pending' || booking.status === 'confirmed') && (_jsx(Button, { variant: "outline", className: "w-full text-red-600 hover:text-red-700 hover:bg-red-50", onClick: () => handleCancel(booking.id), children: isGuide ? "Decline" : "Cancel" })), booking.status === 'confirmed' && (_jsxs(Button, { className: "w-full bg-blue-600 hover:bg-blue-700 text-white animate-pulse", onClick: () => setSelectedBookingForTracking(booking), children: [_jsx(MapPin, { className: "w-4 h-4 mr-2" }), " Track Live"] })), !isGuide && booking.status === 'completed' && (_jsxs(Button, { className: "w-full bg-yellow-500 hover:bg-yellow-600 text-white", onClick: () => handleReview(booking), children: [_jsx(Star, { className: "w-4 h-4 mr-1 fill-current" }), " Review"] }))] })] })] }) }, booking.id))) })) : (_jsx(Card, { className: "border-dashed border-2 border-gray-200 bg-white", children: _jsxs(CardContent, { className: "flex flex-col items-center justify-center py-16 text-center", children: [_jsx("div", { className: "w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6", children: isGuide ? _jsx(User, { className: "w-10 h-10 text-blue-500" }) : _jsx(Calendar, { className: "w-10 h-10 text-blue-500" }) }), _jsx("h2", { className: "text-xl font-bold text-gray-900 mb-2", children: isGuide ? "No pending requests" : "No upcoming trips" }), _jsx("p", { className: "text-gray-500 max-w-md mb-8", children: isGuide
                                        ? "You don't have any booking requests at the moment."
                                        : "You haven't booked any guides yet. Finds a local expert to start your journey!" }), !isGuide && (_jsx(Button, { size: "lg", className: "bg-accent hover:bg-accent/90 text-white font-bold", onClick: () => onNavigate('browseGuides'), children: "Find a Guide" }))] }) })), selectedBookingForPayment && !isGuide && (_jsx(PaymentModal, { isOpen: isPaymentModalOpen, onClose: () => setIsPaymentModalOpen(false), onSuccess: handlePaymentSuccess, bookingId: selectedBookingForPayment.id, price: selectedBookingForPayment.totalPrice })), selectedBookingForReview && !isGuide && (_jsx(ReviewModal, { isOpen: isReviewModalOpen, onClose: () => setIsReviewModalOpen(false), onSuccess: () => { }, guideId: selectedBookingForReview.guideId, guideName: selectedBookingForReview.guideName, userName: user.name, tourType: selectedBookingForReview.tourType })), selectedBookingForTracking && (_jsx(LiveTracker, { bookingId: selectedBookingForTracking.id, currentUser: user, targetName: isGuide ? selectedBookingForTracking.touristName : selectedBookingForTracking.guideName, onClose: () => setSelectedBookingForTracking(null) }))] })] }));
}
