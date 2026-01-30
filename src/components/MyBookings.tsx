import { type LocalUser, type Booking } from "@/lib/localStorage";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Calendar, ArrowLeft, Clock, MapPin, CheckCircle2, XCircle, Star, CreditCard, User } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { socket } from "@/lib/socket";
import { toast } from "sonner";
import { PaymentModal } from "./PaymentModal";
import { ReviewModal } from "./ReviewModal";

interface MyBookingsProps {
    user: LocalUser;
    onNavigate: (page: string) => void;
    onLogout: () => void;
}
import { LiveTracker } from "./LiveTracker";

export function MyBookings({ user, onNavigate }: MyBookingsProps) {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBookingForPayment, setSelectedBookingForPayment] = useState<Booking | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedBookingForReview, setSelectedBookingForReview] = useState<Booking | null>(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [selectedBookingForTracking, setSelectedBookingForTracking] = useState<Booking | null>(null);

    const isGuide = user.role === 'guide';

    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true);
            try {
                const apiBookings = isGuide
                    ? await api.getBookingRequests(user.id)
                    : await api.getBookings(user.id);

                setBookings(apiBookings || []);
            } catch (error) {
                console.error("Failed to load bookings", error);
                setBookings([]);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();

        const handleUpdate = (updatedBooking: any) => {
            const isRelevant = isGuide
                ? (updatedBooking.guideId === user.id || updatedBooking.guide_id === user.id)
                : (updatedBooking.userId === user.id || updatedBooking.touristId === user.id);

            if (isRelevant) {
                setBookings(prev => {
                    const exists = prev.find(b => b.id === updatedBooking.id);
                    if (exists) {
                        return prev.map(b => b.id === updatedBooking.id ? { ...b, ...updatedBooking } : b);
                    } else {
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

    const handleCancel = async (id: string) => {
        if (!confirm("Are you sure you want to cancel this booking?")) return;

        try {
            await api.updateBookingStatus(id, 'cancelled');
            setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
            toast.success("Booking cancelled successfully");
        } catch (error) {
            toast.error("Failed to cancel booking");
        }
    };

    const handleAccept = async (id: string) => {
        try {
            await api.updateBookingStatus(id, 'confirmed');
            setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'confirmed' } : b));
            toast.success("Booking accepted!");
        } catch (error) {
            toast.error("Failed to accept booking");
        }
    };

    const handleReview = (booking: Booking) => {
        setSelectedBookingForReview(booking);
        setIsReviewModalOpen(true);
    };

    const handlePay = (booking: Booking) => {
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

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200 sticky top-0 z-20 px-4 py-3 md:px-8 shadow-sm">
                <div className="container mx-auto flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onNavigate('home')}
                        className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    >
                        <ArrowLeft className="w-5 h-5 mr-1" />
                        Back to Home
                    </Button>
                    <span className="font-bold text-gray-900">
                        {isGuide ? "Booking Requests" : "My Trips"}
                    </span>
                </div>
            </div>

            <main className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold font-heading text-gray-900">
                        {isGuide ? "Incoming Requests" : "My Trips"}
                    </h1>
                    <p className="text-gray-500">
                        {isGuide ? "Manage your tour schedules and requests" : "Manage your upcoming adventures"}
                    </p>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-48 w-full bg-gray-200 animate-pulse rounded-xl"></div>
                        ))}
                    </div>
                ) : bookings.length > 0 ? (
                    <div className="space-y-4">
                        {bookings.map((booking) => (
                            <Card key={booking.id} className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-6 flex flex-col md:flex-row gap-6">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-xl text-gray-900 mb-1">{booking.tourType}</h3>
                                                <p className="text-gray-500 text-sm flex items-center gap-1">
                                                    {isGuide ? (
                                                        <>Requested by <span className="font-bold text-gray-700">{booking.touristName}</span></>
                                                    ) : (
                                                        <>with <span className="font-bold text-gray-700">{booking.guideName}</span></>
                                                    )}
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1
                                                ${booking.status === 'confirmed' || booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                    booking.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {booking.status === 'confirmed' || booking.status === 'completed' ? <CheckCircle2 className="w-3 h-3" /> :
                                                    booking.status === 'cancelled' ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                {booking.status}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                            <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                                                <Calendar className="w-4 h-4 text-primary" /> {booking.date}
                                            </span>
                                            <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                                                <Clock className="w-4 h-4 text-primary" /> {booking.time} ({booking.duration}h)
                                            </span>
                                            {booking.location && (
                                                <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                                                    <MapPin className="w-4 h-4 text-primary" /> {booking.location}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-row md:flex-col justify-between items-end border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 min-w-[140px]">
                                        <div className="text-right">
                                            <p className="text-xs text-gray-400">Total Price</p>
                                            <p className="text-2xl font-bold text-gray-900">₹{booking.totalPrice}</p>
                                        </div>

                                        <div className="space-y-2 w-full md:w-auto mt-auto">
                                            {!isGuide && booking.status === 'pending' && (
                                                <Button
                                                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                                                    onClick={() => handlePay(booking)}
                                                >
                                                    <CreditCard className="w-4 h-4 mr-2" /> Pay Now
                                                </Button>
                                            )}

                                            {isGuide && booking.status === 'pending' && (
                                                <Button
                                                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                                                    onClick={() => handleAccept(booking.id)}
                                                >
                                                    <CheckCircle2 className="w-4 h-4 mr-2" /> Accept
                                                </Button>
                                            )}

                                            {(booking.status === 'pending' || booking.status === 'confirmed') && (
                                                <Button
                                                    variant="outline"
                                                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleCancel(booking.id)}
                                                >
                                                    {isGuide ? "Decline" : "Cancel"}
                                                </Button>
                                            )}

                                            {booking.status === 'confirmed' && (
                                                <Button
                                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white animate-pulse"
                                                    onClick={() => setSelectedBookingForTracking(booking)}
                                                >
                                                    <MapPin className="w-4 h-4 mr-2" /> Track Live
                                                </Button>
                                            )}

                                            {!isGuide && booking.status === 'completed' && (
                                                <Button
                                                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                                                    onClick={() => handleReview(booking)}
                                                >
                                                    <Star className="w-4 h-4 mr-1 fill-current" /> Review
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="border-dashed border-2 border-gray-200 bg-white">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                                {isGuide ? <User className="w-10 h-10 text-blue-500" /> : <Calendar className="w-10 h-10 text-blue-500" />}
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">
                                {isGuide ? "No pending requests" : "No upcoming trips"}
                            </h2>
                            <p className="text-gray-500 max-w-md mb-8">
                                {isGuide
                                    ? "You don't have any booking requests at the moment."
                                    : "You haven't booked any guides yet. Finds a local expert to start your journey!"
                                }
                            </p>
                            {!isGuide && (
                                <Button
                                    size="lg"
                                    className="bg-accent hover:bg-accent/90 text-white font-bold"
                                    onClick={() => onNavigate('browseGuides')}
                                >
                                    Find a Guide
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}

                {selectedBookingForPayment && !isGuide && (
                    <PaymentModal
                        isOpen={isPaymentModalOpen}
                        onClose={() => setIsPaymentModalOpen(false)}
                        onSuccess={handlePaymentSuccess}
                        bookingId={selectedBookingForPayment.id}
                        price={selectedBookingForPayment.totalPrice}
                    />
                )}

                {selectedBookingForReview && !isGuide && (
                    <ReviewModal
                        isOpen={isReviewModalOpen}
                        onClose={() => setIsReviewModalOpen(false)}
                        onSuccess={() => { }}
                        guideId={selectedBookingForReview.guideId}
                        guideName={selectedBookingForReview.guideName}
                        userName={user.name}
                        tourType={selectedBookingForReview.tourType}
                    />
                )}

                {selectedBookingForTracking && (
                    <LiveTracker
                        bookingId={selectedBookingForTracking.id}
                        currentUser={user}
                        targetName={isGuide ? selectedBookingForTracking.touristName : selectedBookingForTracking.guideName}
                        onClose={() => setSelectedBookingForTracking(null)}
                    />
                )}
            </main>
        </div>
    );
}
