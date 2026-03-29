import { useParams, Link, useNavigate } from "react-router-dom";
import useSWR from "swr";
import { fetcher } from "../lib/api";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MessageCircle, Share, CalendarDays, Mail, ShieldAlert } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import LikeButton from "@/components/LikeButton";

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  // We fetch all posts because there isn't a specific user posts endpoint in backend
  const { data: posts, error, isLoading } = useSWR("/posts", fetcher);

  const isOwnProfile = id === localStorage.getItem("user_id");
  const { data: myProfile } = useSWR(isOwnProfile ? "/user" : null, fetcher);
  const profileData = myProfile?.[0];

  if (error) return <div className="p-4 text-center text-red-500">Failed to load profile.</div>;

  const userPosts = posts ? posts.filter((p) => p.user_id === parseInt(id)) : [];
  const displayName = profileData?.name || userPosts[0]?.user_name || `User ${id}`;

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border flex items-center p-3 gap-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex flex-col">
          <h2 className="font-bold text-xl leading-tight">{displayName}</h2>
          <span className="text-sm text-muted-foreground">{userPosts.length} posts</span>
        </div>
      </div>

      {/* Profile Info */}
      <div className="border-b border-border pb-6">
        <div className="h-32 bg-muted/40 overflow-hidden relative" />
        <div className="px-4 sm:px-6 relative">
          <div className="flex justify-between items-end -mt-16 mb-4 relative z-10 w-full">
             <div className="p-1 rounded-full bg-background">
               <Avatar className="h-32 w-32 border-4 border-background">
                 <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${displayName}`} alt="avatar" />
                 <AvatarFallback className="bg-primary text-primary-foreground text-4xl font-bold">U{id}</AvatarFallback>
               </Avatar>
             </div>
             {/* Follow Button Placeholder */}
             <div className="pt-16">
               <Button className="rounded-full font-bold px-6">Follow</Button>
             </div>
          </div>

          <div className="mt-2 flex items-center gap-3">
             <h1 className="text-2xl font-bold">{displayName}</h1>
             {profileData?.role && (
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                   profileData.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-secondary text-secondary-foreground'
                }`}>
                   {profileData.role === 'admin' && <ShieldAlert className="h-3 w-3" />}
                   {profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1)}
                </span>
             )}
          </div>
          <p className="text-muted-foreground">@user{id}</p>
          
          <div className="mt-4 text-[15px] space-y-4 text-foreground/90">
             {profileData?.email && (
                <div className="flex items-center gap-2 font-medium">
                   <Mail className="h-4 w-4 text-muted-foreground" />
                   <span>{profileData.email}</span>
                </div>
             )}
             <p className="leading-relaxed whitespace-pre-wrap">Minimalist content creator. Sharing thoughts, code, and design on this beautiful platform.</p>
             <div className="flex items-center gap-2 text-muted-foreground mt-4">
                <CalendarDays className="h-4 w-4" />
                <span>Joined recently</span>
             </div>
             <div className="flex gap-4 mt-4 font-medium">
               <div className="flex gap-1 hover:underline cursor-pointer">
                  <span className="text-foreground">12</span> <span className="text-muted-foreground">Following</span>
               </div>
               <div className="flex gap-1 hover:underline cursor-pointer">
                  <span className="text-foreground">45</span> <span className="text-muted-foreground">Followers</span>
               </div>
             </div>
          </div>
        </div>
      </div>

      <div className="border-b border-border">
         <div className="flex">
            <div className="flex-1 py-4 text-center border-b-[3px] border-primary font-bold transition-colors hover:bg-muted/30 cursor-pointer">
               Posts
            </div>
            <div className="flex-1 py-4 text-center text-muted-foreground font-medium hover:bg-muted/30 transition-colors cursor-pointer">
               Replies
            </div>
            <div className="flex-1 py-4 text-center text-muted-foreground font-medium hover:bg-muted/30 transition-colors cursor-pointer">
               Likes
            </div>
         </div>
      </div>

      {/* User's Posts Feed */}
      <div className="flex flex-col">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 border-b border-border flex gap-4">
               <Skeleton className="h-12 w-12 rounded-full shrink-0" />
               <div className="space-y-2 flex-1">
                 <Skeleton className="h-4 w-[200px]" />
                 <Skeleton className="h-4 w-full" />
                 <Skeleton className="h-4 w-2/3" />
               </div>
            </div>
          ))
        ) : userPosts.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
             <div className="text-left max-w-sm mx-auto">
                <h3 className="text-xl font-bold text-foreground">Nothing to see here</h3>
                <p className="mt-2">@user{id} hasn't posted anything yet.</p>
             </div>
          </div>
        ) : (
          <AnimatePresence>
            {[...userPosts].reverse().map((post) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="p-4 sm:p-5 border-b border-border hover:bg-muted/30 transition-colors block cursor-pointer"
              >
                 <Link to={`/post/${post.id}`} className="flex gap-4">
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 transition-transform hover:scale-105">
                     <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${post.user_name || post.user_id}`} alt="avatar" />
                     <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                      U{post.user_id}
                     </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold hover:underline truncate">{post.user_name || `User ${post.user_id}`}</span>
                      <span className="text-muted-foreground text-sm">·</span>
                      <span className="text-muted-foreground text-sm whitespace-nowrap">
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    {post.title && post.title !== "Untitled Post" && (
                       <h3 className="font-bold text-lg mb-1">{post.title}</h3>
                    )}
                    <p className="text-foreground/90 whitespace-pre-wrap break-words leading-relaxed text-[15px] sm:text-base">
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
