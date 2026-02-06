
import { useState, useEffect } from "react";
import { RoleAwareHeader } from "./RoleAwareHeader";
import { type LocalUser } from "@/lib/localStorage";
import { Button } from "./ui/button";
import { Heart, MessageCircle, MapPin, Send, Image as ImageIcon, Loader2, Eye, Share2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useRef } from "react";
interface Post {
    id: string;
    user_id: string;
    user_name: string;
    user_avatar: string;
    content: string;
    image?: string;
    city: string;
    likes: number;
    views: number;
    comments: { id?: string; userName: string; text: string; timestamp: string }[];
    created_at: string;
    liked?: boolean;
}

interface CommunityFeedProps {
    user: LocalUser;
    onNavigate: (page: string) => void;
    onLogout: () => void;
}

// ... imports

export function CommunityFeed({ user, onNavigate, onLogout }: CommunityFeedProps) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [newPostContent, setNewPostContent] = useState("");
    const [newPostCity, setNewPostCity] = useState("");
    const [isPosting, setIsPosting] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [availableCities, setAvailableCities] = useState<string[]>([]);
    const [selectedCityFilter, setSelectedCityFilter] = useState<string>("All");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch Cities and Posts
    useEffect(() => {
        // Fetch metadata for cities
        api.fetchMetadata().then((meta: any) => {
            setAvailableCities(meta.cities);
            if (meta.cities.length > 0) {
                // If user has a city, default to that, else first city
                const userCity = user.city ? user.city.split(',')[0].trim() : meta.cities[0];
                setNewPostCity(userCity);
            }
        }).catch(console.error);

        fetchPosts();
    }, []);

    const fetchPosts = (city?: string) => {
        setLoading(true);
        const url = city && city !== "All" ? `/api/community/posts?city=${city}` : '/api/community/posts';
        fetch(url)
            .then(res => res.json())
            .then(data => {
                setPosts(data.map((p: any) => ({ ...p, liked: false })));
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    const handleCityFilterChange = (city: string) => {
        setSelectedCityFilter(city);
        fetchPosts(city);
    };

    const handleLike = async (id: string) => {
        setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1, liked: true } : p));
        await fetch(`/api/community/posts/${id}/like`, { method: 'POST' });
    };

    const handleComment = async (postId: string, text: string) => {
        if (!text.trim()) return;

        const tempId = `temp_${Date.now()}`;
        const optimisticComment = { id: tempId, userName: user.name, text, timestamp: new Date().toISOString() };

        setPosts(prev => prev.map((p: Post) =>
            p.id === postId ? { ...p, comments: [...p.comments, optimisticComment] } : p
        ));

        try {
            const res = await fetch(`/api/community/posts/${postId}/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userName: user.name, text })
            });
            const data = await res.json();

            if (data.success && data.newComment) {
                setPosts(prev => prev.map(p =>
                    p.id === postId
                        ? { ...p, comments: p.comments.map(c => c.id === tempId ? data.newComment : c) }
                        : p
                ));
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to post comment");
            // Rollback optimistic update
            setPosts(prev => prev.map(p =>
                p.id === postId ? { ...p, comments: p.comments.filter(c => c.id !== tempId) } : p
            ));
        }
    };

    const handleDeleteComment = async (postId: string, commentId: string) => {
        setPosts(prev => prev.map((p: Post) => {
            if (p.id === postId) {
                return { ...p, comments: p.comments.filter((c: any) => c.id !== commentId) };
            }
            return p;
        }));

        await fetch(`/api/community/posts/${postId}/comments/${commentId}`, { method: 'DELETE' });
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleCreatePost = async () => {
        if (!newPostContent.trim() && !selectedFile) return;
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
                } as Post, ...prev]);

                // Reset form
                setNewPostContent("");
                handleRemoveFile();
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to post");
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <RoleAwareHeader user={user} currentPage="community" onNavigate={onNavigate} onLogout={onLogout} />

            <main className="container mx-auto px-4 py-8 max-w-2xl">
                {/* City Filter Bar */}
                <div className="mb-8 space-y-4">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1">Filter by City</h2>
                    <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                        <button
                            onClick={() => handleCityFilterChange("All")}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap border ${selectedCityFilter === "All" ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:border-indigo-600 hover:text-indigo-600'}`}
                        >
                            All Stories
                        </button>
                        {availableCities.map(city => (
                            <button
                                key={city}
                                onClick={() => handleCityFilterChange(city)}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap border ${selectedCityFilter === city ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-gray-700 border-gray-100 hover:border-indigo-600 hover:text-indigo-600'}`}
                            >
                                {city}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Create Post Widget */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="flex gap-4">
                        <img
                            src={api.getAssetUrl(user.avatar || "")}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => e.currentTarget.src = "https://github.com/shadcn.png"}
                        />
                        <div className="flex-1 space-y-4">
                            <textarea
                                value={newPostContent}
                                onChange={(e) => setNewPostContent(e.target.value)}
                                placeholder={`What's on your mind, ${user.name}?`}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                                rows={3}
                            />

                            {/* Image Preview */}
                            {previewUrl && (
                                <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden mb-2">
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                                    <button
                                        onClick={handleRemoveFile}
                                        className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                                    >
                                        <div className="w-4 h-4 flex items-center justify-center">x</div>
                                    </button>
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                                        <MapPin className="w-4 h-4 text-indigo-500" />
                                        <select
                                            value={newPostCity}
                                            onChange={(e) => setNewPostCity(e.target.value)}
                                            className="bg-transparent outline-none cursor-pointer"
                                        >
                                            <option value="" disabled>Select City</option>
                                            {availableCities.map(city => (
                                                <option key={city} value={city}>{city}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                    />
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-gray-500 hover:text-indigo-600"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <ImageIcon className="w-4 h-4 mr-2" /> Add Photo
                                    </Button>
                                </div>
                                <Button
                                    onClick={handleCreatePost}
                                    disabled={(!newPostContent.trim() && !selectedFile) || isPosting}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200"
                                >
                                    {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                                    Post
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feed */}
                <div className="space-y-6">
                    {loading ? (
                        [1, 2, 3].map((i: number) => (
                            <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-xl" />
                        ))
                    ) : posts.length > 0 ? (
                        posts.map((post: Post) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                currentUser={user}
                                onLike={() => handleLike(post.id)}
                                onComment={(text) => handleComment(post.id, text)}
                                onDeleteComment={(commentId) => handleDeleteComment(post.id, commentId)}
                            />
                        ))
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            No posts yet. Be the first to share something!
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

function PostCard({ post, currentUser, onLike, onComment, onDeleteComment }: { post: Post, currentUser: LocalUser, onLike: () => void, onComment: (text: string) => void, onDeleteComment: (id: string) => void }) {
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
            } else {
                throw new Error("Web Share not supported");
            }
        } catch (e) {
            navigator.clipboard.writeText(`${post.user_name}: ${post.content}`);
            toast.success("Text copied to clipboard!");
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img src={api.getAssetUrl(post.user_avatar)} alt={post.user_name} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                        <h3 className="font-semibold text-gray-900">{post.user_name}</h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            {new Date(post.created_at).toLocaleDateString()} • <MapPin className="w-3 h-3" /> {post.city}
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 pb-2">
                <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
            </div>
            {post.image && (
                <div className="w-full h-80 bg-gray-100 mt-2">
                    <img src={api.getAssetUrl(post.image)} alt="Post content" className="w-full h-full object-cover" />
                </div>
            )}

            {/* Actions */}
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4 sm:gap-6">
                    <button
                        onClick={onLike}
                        className={`flex items-center gap-2 text-sm font-medium transition-colors ${post.liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                    >
                        <Heart className={`w-5 h-5 ${post.liked ? 'fill-current' : ''}`} />
                        {post.likes}
                    </button>
                    <button
                        onClick={() => setShowComments(!showComments)}
                        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
                    >
                        <MessageCircle className="w-5 h-5" />
                        {post.comments.length}
                    </button>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-400 cursor-default" title="Views">
                        <Eye className="w-5 h-5" />
                        {post.views || 0}
                    </div>
                </div>

                <button
                    onClick={handleShare}
                    className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
                >
                    <Share2 className="w-5 h-5" />
                    <span className="hidden sm:inline">Share</span>
                </button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="bg-gray-50 p-4 border-t border-gray-100">
                    <div className="space-y-4 mb-4 max-h-60 overflow-y-auto">
                        {post.comments.map((c, i) => (
                            <div key={i} className="flex gap-2 text-sm group/comment items-start">
                                <span className="font-bold text-gray-900 whitespace-nowrap">{c.userName}:</span>
                                <span className="text-gray-700 flex-1 break-words">{c.text}</span>
                                {(c.userName === currentUser.name || c.userName === currentUser.email || post.user_id === currentUser.id) && c.id && (
                                    <button
                                        onClick={() => onDeleteComment(c.id!)}
                                        className="text-gray-300 hover:text-red-500 transition-colors p-1 opacity-0 group-hover/comment:opacity-100"
                                        title={post.user_id === currentUser.id ? "Delete as post owner" : "Delete comment"}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-3 items-center pt-2">
                        <div className="relative flex-1 group">
                            <input
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Write a comment..."
                                className="w-full pl-4 pr-12 py-3 text-sm bg-gray-50 border-gray-200 border rounded-[1.25rem] focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-gray-400"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && commentText.trim()) {
                                        onComment(commentText);
                                        setCommentText("");
                                    }
                                }}
                            />
                            <button
                                onClick={() => {
                                    if (commentText.trim()) {
                                        onComment(commentText);
                                        setCommentText("");
                                    }
                                }}
                                disabled={!commentText.trim()}
                                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all duration-200 ${commentText.trim()
                                    ? 'text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transform hover:scale-105'
                                    : 'text-gray-300 pointer-events-none'
                                    }`}
                            >
                                <Send className="w-4 h-4 fill-current" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
