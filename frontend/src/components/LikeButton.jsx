import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "../lib/api";
import api from "../lib/api";
import { Heart } from "lucide-react";
import { toast } from "sonner";

export default function LikeButton({ postId, initialLikes }) {
  const currentUserId = parseInt(localStorage.getItem("user_id"));
  
  // We use SWR to fetch the detailed likes for this post
  const { data, mutate } = useSWR(`/posts/${postId}/likestats`, fetcher);
  
  // If SWR data hasn't loaded, fallback to the initial likes count from the posts payload
  const likesCount = data?.total_likes !== undefined ? data.total_likes : initialLikes;
  
  // Determine if current user liked the post
  const hasLiked = data?.liked_by?.some((u) => u.user_id === currentUserId);

  const toggleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUserId) {
        toast.error("Please login to like posts");
        return;
    }

    // Optimistic SWR update
    const previousData = data;
    mutate(
      {
        total_likes: hasLiked ? likesCount - 1 : likesCount + 1,
        liked_by: hasLiked
          ? (data?.liked_by || []).filter((u) => u.user_id !== currentUserId)
          : [...(data?.liked_by || []), { user_id: currentUserId, name: "Me" }],
      },
      false
    );

    try {
      if (hasLiked) {
        await api.delete(`/posts/${postId}/like`);
      } else {
        await api.post(`/posts/${postId}/like`);
      }
      mutate();
    } catch (err) {
      // Revert optimistic update
      mutate(previousData, false);
      toast.error(err.response?.data?.message || "Failed to update like");
    }
  };

  return (
    <button
      onClick={toggleLike}
      className={`flex items-center gap-1 transition-colors group ${
        hasLiked ? "text-pink-500" : "hover:text-pink-500"
      }`}
    >
      <div
        className={`p-2 rounded-full transition-colors ${
          hasLiked ? "bg-pink-500/10" : "group-hover:bg-pink-500/10"
        }`}
      >
        <Heart className={`h-5 w-5 ${hasLiked ? "fill-current" : ""}`} />
      </div>
      <span className="text-sm font-medium">{likesCount || 0}</span>
    </button>
  );
}
