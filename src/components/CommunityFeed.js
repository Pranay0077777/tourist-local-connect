import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { RoleAwareHeader } from "./RoleAwareHeader";
import {} from "@/lib/localStorage";
import { Button } from "./ui/button";
import { Heart, MessageCircle, MapPin, Send, Image as ImageIcon, Loader2, Eye, Share2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRef } from "react"; // Add useRef
// ... imports
export function CommunityFeed({ user, onNavigate, onLogout }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newPostContent, setNewPostContent] = useState("");
    const [newPostCity, setNewPostCity] = useState("Chennai"); // Default
    const [isPosting, setIsPosting] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = useRef(null);
    // Fetch Posts
    useEffect(() => {
        fetch('/api/community/posts')
            .then(res => res.json())
            .then(data => {
            setPosts(data.map((p) => ({ ...p, liked: false })));
            setLoading(false);
        })
            .catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);
    const handleLike = async (id) => {
        setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1, liked: true } : p));
        await fetch(`/api/community/posts/${id}/like`, { method: 'POST' });
    };
    const handleComment = async (id, text) => {
        if (!text.trim())
            return;
        // Optimistic UI update
        const newComment = { userName: user.name, text, timestamp: new Date().toISOString() };
        setPosts(prev => prev.map(p => p.id === id ? { ...p, comments: [...p.comments, newComment] } : p));
        await fetch(`/api/community/posts/${id}/comment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userName: user.name, text })
        });
    };
    const handleDeleteComment = async (postId, commentId) => {
        setPosts(prev => prev.map(p => {
            if (p.id === postId) {
                return { ...p, comments: p.comments.filter(c => c.id !== commentId) };
            }
            return p;
        }));
        await fetch(`/api/community/posts/${postId}/comments/${commentId}`, { method: 'DELETE' });
    };
    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };
    const handleRemoveFile = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current)
            fileInputRef.current.value = "";
    };
    const handleCreatePost = async () => {
        if (!newPostContent.trim() && !selectedFile)
            return;
        setIsPosting(true);
        try {
            let imageUrl = undefined;
            if (selectedFile) {
                const formData = new FormData();
                formData.append('image', selectedFile);
                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });
                const uploadData = await uploadRes.json();
                if (uploadData.success) {
                    imageUrl = uploadData.url;
                }
            }
            const newPost = {
                userId: user.id,
                userName: user.name,
                userAvatar: user.avatar || "https://github.com/shadcn.png",
                content: newPostContent,
                city: newPostCity,
                image: imageUrl
            };
            const res = await fetch('/api/community/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPost)
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Posted successfully!");
                setPosts(prev => [{
                        ...newPost,
                        id: data.id,
                        likes: 0,
                        comments: [],
                        created_at: new Date().toISOString(),
                        user_id: user.id, // match Post interface
                        user_name: user.name,
                        user_avatar: user.avatar || "",
                        liked: false,
                        views: 0
                    }, ...prev]);
                // Reset form
                setNewPostContent("");
                handleRemoveFile();
            }
        }
        catch (err) {
            console.error(err);
            toast.error("Failed to post");
        }
        finally {
            setIsPosting(false);
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx(RoleAwareHeader, { user: user, currentPage: "community", onNavigate: onNavigate, onLogout: onLogout }), _jsxs("main", { className: "container mx-auto px-4 py-8 max-w-2xl", children: [_jsx("div", { className: "bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8", children: _jsxs("div", { className: "flex gap-4", children: [_jsx("img", { src: user.avatar?.startsWith('http') ? user.avatar : `http://localhost:3001${user.avatar}`, alt: user.name, className: "w-10 h-10 rounded-full object-cover", onError: (e) => e.currentTarget.src = "https://github.com/shadcn.png" }), _jsxs("div", { className: "flex-1 space-y-4", children: [_jsx("textarea", { value: newPostContent, onChange: (e) => setNewPostContent(e.target.value), placeholder: `What's on your mind, ${user.name}?`, className: "w-full bg-gray-50 border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none", rows: 3 }), previewUrl && (_jsxs("div", { className: "relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden mb-2", children: [_jsx("img", { src: previewUrl, alt: "Preview", className: "w-full h-full object-contain" }), _jsx("button", { onClick: handleRemoveFile, className: "absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70", children: _jsx("div", { className: "w-4 h-4 flex items-center justify-center", children: "x" }) })] })), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full", children: [_jsx(MapPin, { className: "w-4 h-4 text-indigo-500" }), _jsxs("select", { value: newPostCity, onChange: (e) => setNewPostCity(e.target.value), className: "bg-transparent outline-none cursor-pointer", children: [_jsx("option", { value: "Chennai", children: "Chennai" }), _jsx("option", { value: "Hyderabad", children: "Hyderabad" }), _jsx("option", { value: "Bangalore", children: "Bangalore" }), _jsx("option", { value: "Kochi", children: "Kochi" }), _jsx("option", { value: "Madurai", children: "Madurai" }), _jsx("option", { value: "Mumbai", children: "Mumbai" })] })] }), _jsx("input", { type: "file", ref: fileInputRef, className: "hidden", accept: "image/*", onChange: handleFileSelect }), _jsxs(Button, { variant: "ghost", size: "sm", className: "text-gray-500 hover:text-indigo-600", onClick: () => fileInputRef.current?.click(), children: [_jsx(ImageIcon, { className: "w-4 h-4 mr-2" }), " Add Photo"] })] }), _jsxs(Button, { onClick: handleCreatePost, disabled: (!newPostContent.trim() && !selectedFile) || isPosting, className: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200", children: [isPosting ? _jsx(Loader2, { className: "w-4 h-4 animate-spin" }) : _jsx(Send, { className: "w-4 h-4 mr-2" }), "Post"] })] })] })] }) }), _jsx("div", { className: "space-y-6", children: loading ? ([1, 2, 3].map(i => (_jsx("div", { className: "h-64 bg-gray-200 animate-pulse rounded-xl" }, i)))) : posts.length > 0 ? (posts.map(post => (_jsx(PostCard, { post: post, currentUser: user, onLike: () => handleLike(post.id), onComment: (text) => handleComment(post.id, text), onDeleteComment: (commentId) => handleDeleteComment(post.id, commentId) }, post.id)))) : (_jsx("div", { className: "text-center py-12 text-gray-500", children: "No posts yet. Be the first to share something!" })) })] })] }));
}
function PostCard({ post, currentUser, onLike, onComment, onDeleteComment }) {
    const [commentText, setCommentText] = useState("");
    const [showComments, setShowComments] = useState(false);
    // Increment view on mount
    useEffect(() => {
        // Simple distinct view count (could be improved with session tracking)
        fetch(`/api/community/posts/${post.id}/view`, { method: 'POST' }).catch(console.error);
    }, [post.id]);
    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: `Post by ${post.user_name}`,
                    text: post.content,
                    url: window.location.href
                });
            }
            else {
                throw new Error("Web Share not supported");
            }
        }
        catch (e) {
            navigator.clipboard.writeText(`${post.user_name}: ${post.content}`);
            toast.success("Text copied to clipboard!");
        }
    };
    return (_jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden", children: [_jsx("div", { className: "p-4 flex items-center justify-between", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("img", { src: post.user_avatar, alt: post.user_name, className: "w-10 h-10 rounded-full object-cover" }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-gray-900", children: post.user_name }), _jsxs("p", { className: "text-xs text-gray-500 flex items-center gap-1", children: [new Date(post.created_at).toLocaleDateString(), " \u2022 ", _jsx(MapPin, { className: "w-3 h-3" }), " ", post.city] })] })] }) }), _jsx("div", { className: "px-4 pb-2", children: _jsx("p", { className: "text-gray-800 whitespace-pre-wrap", children: post.content }) }), post.image && (_jsx("div", { className: "w-full h-80 bg-gray-100 mt-2", children: _jsx("img", { src: post.image, alt: "Post content", className: "w-full h-full object-cover" }) })), _jsxs("div", { className: "px-4 py-3 border-t border-gray-100 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-4 sm:gap-6", children: [_jsxs("button", { onClick: onLike, className: `flex items-center gap-2 text-sm font-medium transition-colors ${post.liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`, children: [_jsx(Heart, { className: `w-5 h-5 ${post.liked ? 'fill-current' : ''}` }), post.likes] }), _jsxs("button", { onClick: () => setShowComments(!showComments), className: "flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors", children: [_jsx(MessageCircle, { className: "w-5 h-5" }), post.comments.length] }), _jsxs("div", { className: "flex items-center gap-2 text-sm font-medium text-gray-400 cursor-default", title: "Views", children: [_jsx(Eye, { className: "w-5 h-5" }), post.views || 0] })] }), _jsxs("button", { onClick: handleShare, className: "flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors", children: [_jsx(Share2, { className: "w-5 h-5" }), _jsx("span", { className: "hidden sm:inline", children: "Share" })] })] }), showComments && (_jsxs("div", { className: "bg-gray-50 p-4 border-t border-gray-100", children: [_jsx("div", { className: "space-y-4 mb-4 max-h-60 overflow-y-auto", children: post.comments.map((c, i) => (_jsxs("div", { className: "flex gap-2 text-sm group/comment items-start", children: [_jsxs("span", { className: "font-bold text-gray-900 whitespace-nowrap", children: [c.userName, ":"] }), _jsx("span", { className: "text-gray-700 flex-1 break-words", children: c.text }), (c.userName === currentUser.name || c.userName === currentUser.email) && c.id && (_jsx("button", { onClick: () => onDeleteComment(c.id), className: "text-gray-300 hover:text-red-500 transition-colors p-1", title: "Delete comment", children: _jsx(Trash2, { className: "w-3.5 h-3.5" }) }))] }, i))) }), _jsx("div", { className: "flex gap-3 items-center pt-2", children: _jsxs("div", { className: "relative flex-1 group", children: [_jsx("input", { type: "text", value: commentText, onChange: (e) => setCommentText(e.target.value), placeholder: "Write a comment...", className: "w-full pl-4 pr-12 py-3 text-sm bg-gray-50 border-gray-200 border rounded-[1.25rem] focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-gray-400", onKeyDown: (e) => {
                                        if (e.key === 'Enter' && commentText.trim()) {
                                            onComment(commentText);
                                            setCommentText("");
                                        }
                                    } }), _jsx("button", { onClick: () => {
                                        if (commentText.trim()) {
                                            onComment(commentText);
                                            setCommentText("");
                                        }
                                    }, disabled: !commentText.trim(), className: `absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all duration-200 ${commentText.trim()
                                        ? 'text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transform hover:scale-105'
                                        : 'text-gray-300 pointer-events-none'}`, children: _jsx(Send, { className: "w-4 h-4 fill-current" }) })] }) })] }))] }));
}
