import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import useSWR from "swr";
import { fetcher } from "../lib/api";
import api from "../lib/api";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { ArrowLeft, Trash2, Edit2, MessageCircle, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import LikeButton from "@/components/LikeButton";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem("user_id");
  const role = localStorage.getItem("role");
  
  const { data: post, error: postError } = useSWR(`/posts/${id}`, fetcher);
  const { data: comments, error: commentsError, mutate: mutateComments } = useSWR(`/comments/${id}`, fetcher);
  const { data: likeStats } = useSWR(`/posts/${id}/likestats`, fetcher);

  const [commentContent, setCommentContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // For Edit Post
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/comments/${id}`, { content: commentContent.trim() });
      setCommentContent("");
      mutateComments();
      toast.success("Comment added");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await api.delete(`/posts/${id}`);
      toast.success("Post deleted");
      navigate("/feed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete post");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete your comment?")) return;
    try {
      await api.delete(`/comments/${commentId}`);
      toast.success("Comment deleted");
      mutateComments();
    } catch (err) {
       toast.error(err.response?.data?.message || "Failed to delete comment");
    }
  };

  const handleUpdatePost = async () => {
    try {
      await api.put(`/posts/${id}`, { title: editTitle, content: editContent });
      toast.success("Post updated");
      setIsEditing(false);
      // Trigger SWR re-fetch or rely on manual mutate if needed (can be passed via global mutate or let SWR handle it eventually)
      // Since we just have the single fetcher, we can force a window reload or mutate globally.
      window.location.reload(); 
    } catch (err) {
      toast.error("Failed to update post");
    }
  };

  if (postError) return <div className="p-6 text-center text-red-500">Post not found.</div>;
  if (!post) return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-32 w-full" />
    </div>
  );

  const isOwner = currentUserId && (parseInt(currentUserId) === post.user_id);
  const isAdmin = role === "admin";

  return (
    <div className="flex flex-col w-full pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border flex items-center p-3 sm:p-4 gap-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <span className="font-bold text-xl">Post</span>
      </div>

      <motion.article 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="p-4 sm:p-6 border-b border-border"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
             <Link to={`/user/${post.user_id}`}>
                <Avatar className="h-12 w-12 transition-transform hover:scale-105">
                  <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${post.user_name || post.user_id}`} alt="avatar" />
                  <AvatarFallback className="bg-secondary font-bold text-lg">U{post.user_id}</AvatarFallback>
                </Avatar>
             </Link>
             <div>
                <Link to={`/user/${post.user_id}`} className="font-bold text-lg hover:underline block">
                  {post.user_name || `User ${post.user_id}`}
                </Link>
                <span className="text-muted-foreground text-sm">
                  {new Date(post.created_at).toLocaleString()}
                </span>
             </div>
          </div>

          {(isOwner || isAdmin) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full"><MoreHorizontal className="h-5 w-5" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isOwner && (
                  <DropdownMenuItem onClick={() => {
                    setIsEditing(true);
                    setEditTitle(post.title || "");
                    setEditContent(post.content);
                  }}>
                    <Edit2 className="mr-2 h-4 w-4" /> Edit Post
                  </DropdownMenuItem>
                 )}
                 <DropdownMenuItem onClick={handleDeletePost} className="text-red-500 hover:text-red-600 focus:text-red-600">
                   <Trash2 className="mr-2 h-4 w-4" /> Delete
                 </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4 mt-4">
            <input 
              className="w-full bg-transparent border border-border p-2 rounded-md font-bold text-xl" 
              value={editTitle} 
              onChange={(e) => setEditTitle(e.target.value)} 
              placeholder="Title" 
            />
             <Textarea 
               value={editContent} 
               onChange={(e)=>setEditContent(e.target.value)} 
               className="min-h-[150px] text-lg"
             />
             <div className="flex gap-2 justify-end">
               <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
               <Button onClick={handleUpdatePost}>Save</Button>
             </div>
          </div>
        ) : (
          <div className="mt-4">
            {post.title && post.title !== "Untitled Post" && (
                <h1 className="text-2xl font-bold mb-3">{post.title}</h1>
            )}
            <p className="text-xl leading-relaxed whitespace-pre-wrap">{post.content}</p>
            <div className="mt-6 flex items-center gap-4 text-muted-foreground">
              <LikeButton postId={post.id} initialLikes={post.likes} />
              {(likeStats?.total_likes || post.likes) > 0 && (
                <Dialog>
                  <DialogTrigger asChild>
                    <span className="text-sm font-medium hover:underline cursor-pointer hover:text-foreground transition-colors">
                      {likeStats?.total_likes || post.likes} Likes
                    </span>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md border-border rounded-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold">Liked by</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-2 mt-4 max-h-[50vh] overflow-y-auto pr-2">
                       {likeStats?.liked_by?.length > 0 ? (
                         likeStats.liked_by.map(user => (
                            <Link key={user.user_id} to={`/user/${user.user_id}`} className="flex items-center gap-3 hover:bg-muted/50 p-2 rounded-xl transition-colors">
                               <Avatar className="h-10 w-10">
                                  <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.name || user.user_id}`} />
                                  <AvatarFallback>U{user.user_id}</AvatarFallback>
                               </Avatar>
                               <span className="font-bold hover:underline text-lg">{user.name || `User ${user.user_id}`}</span>
                            </Link>
                         ))
                       ) : (
                         <div className="text-center text-muted-foreground p-4">Loading...</div>
                       )}
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        )}
      </motion.article>

      {/* Reply Section */}
      <div className="p-4 border-b border-border">
         <form onSubmit={handleAddComment} className="flex gap-4">
            <Avatar className="h-10 w-10 shrink-0 mt-1">
              <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=user${currentUserId}`} alt="avatar" />
              <AvatarFallback className="bg-primary/10 text-primary">ME</AvatarFallback>
            </Avatar>
            <div className="flex flex-col w-full gap-2">
              <Textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Post your reply"
                className="min-h-[80px] resize-none border-none p-0 focus-visible:ring-0 text-lg sm:text-lg placeholder:text-muted-foreground bg-transparent"
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={!commentContent.trim() || submitting} className="rounded-full px-6 font-bold">
                  Reply
                </Button>
              </div>
            </div>
         </form>
      </div>

      {/* Comments List */}
      <div className="flex flex-col">
        {!comments ? (
           <div className="p-6 text-center text-muted-foreground">Loading replies...</div>
        ) : comments.length === 0 ? (
           <div className="p-8 text-center text-muted-foreground">No replies yet.</div>
        ) : (
           comments.map(comment => {
             const isCommentOwner = currentUserId && (parseInt(currentUserId) === comment.user_id);
             return (
               <div key={comment.id} className="p-4 sm:p-5 border-b border-border hover:bg-muted/20 transition-colors flex gap-4">
                  <Link to={`/user/${comment.user_id}`} className="shrink-0">
                    <Avatar className="h-10 w-10 hover:scale-105 transition-transform">
                      <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${comment.user_name || comment.user_id}`} alt="avatar" />
                      <AvatarFallback className="bg-muted text-sm font-semibold">U{comment.user_id}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex flex-col w-full">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <Link to={`/user/${comment.user_id}`} className="font-bold hover:underline">{comment.user_name || `User ${comment.user_id}`}</Link>
                         <span className="text-muted-foreground text-sm">· {formatDistanceToNow(new Date(comment.created_at))}</span>
                      </div>
                      {(isCommentOwner || isAdmin) && (
                         <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-red-500" onClick={() => handleDeleteComment(comment.id)}>
                            <Trash2 className="h-4 w-4" />
                         </Button>
                      )}
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-[15px] sm:text-base text-foreground/90">{comment.content}</p>
                  </div>
               </div>
             )
           })
        )}
      </div>
    </div>
  );
}
