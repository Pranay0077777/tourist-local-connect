import { useState, useEffect, useRef } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { type LocalUser } from "@/lib/localStorage";
import { type Message } from "@/types";
import { Send, Search, Phone, Video, MoreVertical, ChevronLeft, Languages, Check, CheckCheck } from "lucide-react";
import { RoleAwareHeader } from "./RoleAwareHeader";
import { socket } from "@/lib/socket";
import { api } from "@/lib/api";

interface MessagesProps {
    currentUser: LocalUser;
    onNavigate: (page: string) => void;
    onLogout: () => void;
    onViewProfile: (guideId: string) => void;
    initialContactId?: string | null;
}

export function Messages({ currentUser, onNavigate, onLogout, onViewProfile, initialContactId }: MessagesProps) {
    const [activeConversationId, setActiveConversationId] = useState<string | null>(initialContactId || null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");
    const [conversations, setConversations] = useState<any[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [showTranslation, setShowTranslation] = useState<Record<string, boolean>>({});
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const loadConversations = async () => {
        try {
            const conversationData = await api.getConversations(currentUser.id);

            const convos = conversationData.map((data: any) => ({
                id: data.id,
                name: data.name,
                avatar: data.avatar,
                lastMessage: data.lastMessage || "Start chatting...",
                time: data.timestamp ? new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
                unread: data.unreadCount || 0
            }));

            // If we have an active conversation that isn't in the list (new chat), add it manually
            if (activeConversationId && !convos.some((c: any) => c.id === activeConversationId)) {
                try {
                    let user: any = await api.getGuideById(activeConversationId);
                    if (!user) user = await api.getUserById(activeConversationId);

                    if (user) {
                        convos.unshift({
                            id: activeConversationId,
                            name: user.name,
                            avatar: user.avatar,
                            lastMessage: "Start chatting...",
                            time: "",
                            unread: 0
                        });
                    }
                } catch (error) {
                    console.error("Failed to load active user details", error);
                }
            }

            setConversations(convos);
        } catch (error) {
            console.error("Failed to load conversations", error);
        }
    };

    // Initial load of conversations
    useEffect(() => {
        loadConversations();
    }, [currentUser.id]);

    // Socket Connection & Room Joining
    useEffect(() => {
        socket.connect();

        socket.on('receive_message', (data: any) => {
            if (activeConversationId && (data.senderId === activeConversationId || data.receiverId === activeConversationId)) {
                setMessages(prev => {
                    if (prev.some(m => m.id === data.id)) return prev;
                    return [...prev, {
                        id: data.id || `msg_${Date.now()}`,
                        senderId: data.senderId,
                        receiverId: data.receiverId,
                        text: data.text,
                        timestamp: data.timestamp || new Date().toISOString(),
                        isRead: false,
                        translatedText: data.translatedText
                    }];
                });
            }
        });

        socket.on('typing_start', () => setIsTyping(true));
        socket.on('typing_stop', () => setIsTyping(false));

        return () => {
            socket.off('receive_message');
            socket.off('typing_start');
            socket.off('typing_stop');
            socket.disconnect();
        };
    }, [activeConversationId]);

    // Join Room on Chat Switch
    useEffect(() => {
        if (activeConversationId) {
            const ids = [currentUser.id, activeConversationId].sort();
            const roomId = `room_${ids[0]}_${ids[1]}`;

            socket.emit('join_room', roomId);
            setIsTyping(false);

            api.getMessages(currentUser.id, activeConversationId)
                .then(setMessages)
                .catch(console.error);

            api.markMessagesAsRead(currentUser.id, activeConversationId)
                .then(() => {
                    setConversations(prev => prev.map(c =>
                        c.id === activeConversationId ? { ...c, unread: 0 } : c
                    ));
                })
                .catch(console.error);
        }
    }, [activeConversationId]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    const handleTyping = (text: string) => {
        setInputText(text);

        if (!activeConversationId) return;

        const ids = [currentUser.id, activeConversationId].sort();
        const roomId = `room_${ids[0]}_${ids[1]}`;

        socket.emit('typing_start', { roomId });

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('typing_stop', { roomId });
        }, 1000);
    };

    const handleSend = () => {
        if (!inputText.trim() || !activeConversationId) return;

        const ids = [currentUser.id, activeConversationId].sort();
        const roomId = `room_${ids[0]}_${ids[1]}`;

        const msgData = {
            roomId,
            senderId: currentUser.id,
            receiverId: activeConversationId,
            text: inputText
        };

        socket.emit('send_message', msgData);

        setInputText("");
        socket.emit('typing_stop', { roomId });

        setTimeout(loadConversations, 500);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <RoleAwareHeader
                user={currentUser}
                currentPage="messages"
                onNavigate={onNavigate}
                onLogout={onLogout}
            />

            <div className="flex-1 flex overflow-hidden h-[calc(100vh-64px)]">
                {/* Sidebar (Conversation List) */}
                <div className={`w-full md:w-80 lg:w-96 bg-white border-r border-gray-200 flex flex-col ${activeConversationId ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center gap-2 mb-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="-ml-2 text-gray-400 hover:text-gray-900"
                                onClick={() => onNavigate('home')}
                                title="Back to Home"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </Button>
                            <h1 className="text-xl font-bold text-gray-900">Messages</h1>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input placeholder="Search chats..." className="pl-9 bg-gray-50 border-transparent focus:bg-white transition-all" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {conversations.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">
                                <p>No messages yet.</p>
                                <p className="text-sm">Book a guide to start chatting!</p>
                            </div>
                        ) : (
                            conversations.map(chat => (
                                <div
                                    key={chat.id}
                                    onClick={() => setActiveConversationId(chat.id)}
                                    className={`p-4 flex gap-4 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-50 ${activeConversationId === chat.id ? 'bg-primary/5' : ''}`}
                                >
                                    <div className="relative">
                                        <img src={chat.avatar} alt={chat.name} className="w-12 h-12 rounded-full object-cover" />
                                        {chat.unread > 0 && (
                                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
                                                {chat.unread}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className={`font-bold truncate ${chat.unread > 0 ? 'text-gray-900' : 'text-gray-700'}`}>{chat.name}</h3>
                                            <span className="text-xs text-gray-400 whitespace-nowrap">{chat.time}</span>
                                        </div>
                                        <p className={`text-sm truncate ${chat.unread > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                                            {isTyping && activeConversationId === chat.id ? "Typing..." : chat.lastMessage}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Main Chat Window */}
                {activeConversationId ? (
                    <div className="flex-1 flex flex-col h-full bg-[#fafafa]">
                        {/* Chat Header */}
                        <div className="bg-white p-4 border-b border-gray-200 flex items-center justify-between shadow-sm z-10">
                            <div className="flex items-center gap-3">
                                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setActiveConversationId(null)}>
                                    <ChevronLeft className="w-6 h-6" />
                                </Button>
                                {(() => {
                                    const activeChat = conversations.find(c => c.id === activeConversationId);
                                    return (
                                        <div
                                            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={() => activeChat && onViewProfile(activeChat.id)}
                                            title="View Profile"
                                        >
                                            <div className="relative">
                                                <img src={activeChat?.avatar} alt="User" className="w-10 h-10 rounded-full object-cover" />
                                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></span>
                                            </div>
                                            <div>
                                                <h2 className="font-bold text-gray-900">{activeChat?.name}</h2>
                                                <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                                                    {isTyping ? "Typing..." : "Online"}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                            <div className="flex items-center gap-2 text-gray-400">
                                <Button variant="ghost" size="icon"><Phone className="w-5 h-5" /></Button>
                                <Button variant="ghost" size="icon"><Video className="w-5 h-5" /></Button>
                                <Button variant="ghost" size="icon"><MoreVertical className="w-5 h-5" /></Button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg) => {
                                const isMe = msg.senderId === currentUser.id;
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div
                                            className={`max-w-[75%] md:max-w-[60%] px-4 py-3 rounded-2xl text-sm shadow-sm ${isMe
                                                ? 'bg-primary text-primary-foreground rounded-tr-none'
                                                : 'bg-white text-gray-900 border border-gray-100 rounded-tl-none'
                                                }`}
                                        >
                                            <p>{showTranslation[msg.id] && msg.translatedText ? msg.translatedText : msg.text}</p>
                                            <div className="flex items-center justify-end mt-1 gap-1.5">
                                                {msg.translatedText && (
                                                    <button
                                                        onClick={() => setShowTranslation(prev => ({ ...prev, [msg.id]: !prev[msg.id] }))}
                                                        className={`text-[10px] flex items-center gap-1 hover:opacity-80 transition-opacity mr-auto ${isMe ? 'text-primary-foreground/70' : 'text-primary'}`}
                                                    >
                                                        <Languages className="w-3 h-3" />
                                                        {showTranslation[msg.id] ? "Original" : "Translate"}
                                                    </button>
                                                )}
                                                <span className={`text-[10px] ${isMe ? 'text-primary-foreground/70' : 'text-gray-400'}`}>
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {isMe && (
                                                    <span className={msg.isRead ? 'text-blue-300' : 'text-primary-foreground/50'}>
                                                        {msg.isRead ? <CheckCheck className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-4 shadow-sm flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-gray-200">
                            <div className="flex gap-2">
                                <Input
                                    value={inputText}
                                    onChange={(e) => handleTyping(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Type a message..."
                                    className="flex-1 rounded-full bg-gray-50 border-gray-200 focus:bg-white"
                                />
                                <Button onClick={handleSend} size="icon" className="rounded-full w-10 h-10 shrink-0">
                                    <Send className="w-5 h-5 ml-0.5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="hidden md:flex flex-1 flex-col items-center justify-center text-gray-400 bg-gray-50/50">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Send className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-lg font-medium text-gray-500">Select a conversation to start chatting</p>
                    </div>
                )}
            </div>
        </div >
    );
}
