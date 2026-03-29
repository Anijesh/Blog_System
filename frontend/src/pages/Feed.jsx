import { useState } from "react";
import { Link } from "react-router-dom";
import useSWR from "swr";
import { fetcher } from "../lib/api";
import api from "../lib/api";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, Share, MoreHorizontal } from "lucide-react";
import LikeButton from "@/components/LikeButton";
import { toast } from "sonner";

export default function Feed() {
  const { data: posts, error, isLoading } = useSWR("/posts", fetcher);

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
                    <div className="flex items-center gap-2 mb-1">
                      <Link to={`/user/${post.user_id}`} onClick={(e) => e.stopPropagation()} className="font-bold hover:underline truncate">
                        {post.user_name || `User ${post.user_id}`}
                      </Link>
                      <span className="text-muted-foreground text-sm">·</span>
                      <span className="text-muted-foreground text-sm whitespace-nowrap">
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    {post.title && post.title !== "Untitled Post" && (
                       <h3 className="font-bold text-lg mb-1">{post.title}</h3>
                    )}
                    <p className="text-foreground/90 whitespace-pre-wrap break-words leading-relaxed">
                      {post.content}
                    </p>
                    
                    <div className="flex justify-between items-center mt-4 text-muted-foreground max-w-sm" onClick={(e) => e.preventDefault()}>
                      <button className="flex items-center gap-2 hover:text-primary transition-colors group">
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
