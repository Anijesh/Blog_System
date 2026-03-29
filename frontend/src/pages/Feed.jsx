import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useSWR from "swr";
import { fetcher } from "../lib/api";
import api from "../lib/api";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, Share, MoreHorizontal, Edit2, Trash2 } from "lucide-react";
import LikeButton from "@/components/LikeButton";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";

export default function Feed() {
  const currentUserId = localStorage.getItem("user_id");
  const role = localStorage.getItem("role");
  const navigate = useNavigate();
  const { data: posts, error, isLoading, mutate } = useSWR("/posts", fetcher);

  const [editingPostId, setEditingPostId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const handleDeletePost = async (e, postId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await api.delete(`/posts/${postId}`);
      toast.success("Post deleted");
      mutate();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete post");
    }
  };

  const handleUpdatePost = async (e, postId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.put(`/posts/${postId}`, { title: editTitle, content: editContent });
      toast.success("Post updated");
      setEditingPostId(null);
      mutate();
    } catch (err) {
      toast.error("Failed to update post");
    }
  };

  if (error) return <div className="p-4 text-red-500 text-center">Failed to load posts.</div>;

  return (
    <div className="flex flex-col w-full">
      {/* Feed List */}
      <div className="flex flex-col">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 border-b border-border flex gap-4">
               <Skeleton className="h-12 w-12 rounded-full" />
               <div className="space-y-2 flex-1">
                 <Skeleton className="h-4 w-[200px]" />
                 <Skeleton className="h-4 w-full" />
                 <Skeleton className="h-4 w-full" />
                 <Skeleton className="h-4 w-2/3" />
               </div>
            </div>
          ))
        ) : posts?.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No posts yet. Be the first to share something!</div>
        ) : (
          <AnimatePresence>
            {[...(posts || [])].reverse().map((post) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="p-4 sm:p-5 border-b border-border hover:bg-muted/30 transition-colors block cursor-pointer"
              >
                 <Link to={`/post/${post.id}`} className="flex gap-4">
                  <Link to={`/user/${post.user_id}`} className="shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12 transition-transform hover:scale-105">
                      <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${post.user_name || post.user_id}`} alt="avatar" />
                      <AvatarFallback className="bg-secondary text-secondary-foreground font-semibold">
                        U{post.user_id}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Link to={`/user/${post.user_id}`} onClick={(e) => e.stopPropagation()} className="font-bold hover:underline truncate">
                          {post.user_name || `User ${post.user_id}`}
                        </Link>
                        <span className="text-muted-foreground text-sm">·</span>
                        <span className="text-muted-foreground text-sm whitespace-nowrap">
                          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      
                      {((currentUserId && parseInt(currentUserId) === post.user_id) || role === "admin") && (
                        <div onClick={(e) => e.preventDefault()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {parseInt(currentUserId) === post.user_id && (
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingPostId(post.id);
                                  setEditTitle(post.title || "");
                                  setEditContent(post.content);
                                }}>
                                  <Edit2 className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={(e) => handleDeletePost(e, post.id)} className="text-red-500 hover:text-red-600 focus:text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </div>
                    
                    {editingPostId === post.id ? (
                      <div className="space-y-3 mt-2" onClick={(e) => e.preventDefault()}>
                        <input 
                          className="w-full bg-transparent border border-border p-2 rounded-md font-bold text-lg" 
                          value={editTitle} 
                          onChange={(e) => setEditTitle(e.target.value)} 
                          placeholder="Title" 
                        />
                         <Textarea 
                           value={editContent} 
                           onChange={(e)=>setEditContent(e.target.value)} 
                           className="min-h-[100px] text-base"
                         />
                         <div className="flex gap-2 justify-end">
                           <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setEditingPostId(null); }}>Cancel</Button>
                           <Button size="sm" onClick={(e) => handleUpdatePost(e, post.id)}>Save</Button>
                         </div>
                      </div>
                    ) : (
                      <>
                        {post.title && post.title !== "Untitled Post" && (
                           <h3 className="font-bold text-lg mb-1">{post.title}</h3>
                        )}
                        <p className="text-foreground/90 whitespace-pre-wrap break-words leading-relaxed">
                          {post.content}
                        </p>
                      </>
                    )}
                    
                    <div className="flex justify-between items-center mt-4 text-muted-foreground max-w-sm" onClick={(e) => e.preventDefault()}>
                      <button 
                         className="flex items-center gap-2 hover:text-primary transition-colors group"
                         onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigate(`/post/${post.id}`);
                         }}
                      >
                         <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors">
                           <MessageCircle className="h-5 w-5" />
                         </div>
                      </button>
                      <LikeButton postId={post.id} initialLikes={post.likes} />
                      <button className="flex items-center gap-2 hover:text-green-500 transition-colors group">
                        <div className="p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
                           <Share className="h-5 w-5" />
                         </div>
                      </button>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
