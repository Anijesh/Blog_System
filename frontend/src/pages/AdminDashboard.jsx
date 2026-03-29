import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "../lib/api";
import api from "../lib/api";
import { formatDistanceToNow } from "date-fns";
import { Trash2, UserCog, ShieldCheck, Mail, ShieldAlert } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Link, Navigate } from "react-router-dom";

export default function AdminDashboard() {
  const currentRole = localStorage.getItem("role");
  
  // Protect route
  if (currentRole !== "admin") {
    return <Navigate to="/feed" replace />;
  }

  const { data: users, error, isLoading, mutate } = useSWR("/admin/users", fetcher);
  const [deletingId, setDeletingId] = useState(null);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you highly sure you want to completely delete this user? This action cannot be reversed.")) return;
    
    setDeletingId(userId);
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success("User deleted successfully.");
      mutate();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete user.");
    } finally {
      setDeletingId(null);
    }
  };

  if (error) {
    // If 403 or other error
    if (error.response?.status === 403) return <Navigate to="/feed" replace />;
    return <div className="p-8 text-center text-red-500 font-medium">Failed to load users.</div>;
  }

  return (
    <div className="flex flex-col w-full pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border flex items-center p-4 sm:p-5 gap-4">
        <ShieldCheck className="h-6 w-6 text-primary" />
        <h1 className="font-bold text-xl sm:text-2xl">Admin Dashboard</h1>
      </div>

      <div className="p-4 sm:p-6 lg:p-8">
         <div className="mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
              <UserCog className="h-5 w-5" /> User Management
            </h2>
            <p className="text-muted-foreground">Manage your platform's users, verify accounts, and perform moderation actions.</p>
         </div>

         {/* Stats Cards (Optional nice touch based on the users array) */}
         {users && !isLoading && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
               <div className="p-4 rounded-xl border border-border bg-muted/20 flex flex-col items-center justify-center">
                 <span className="text-3xl font-black">{users.length}</span>
                 <span className="text-sm font-medium text-muted-foreground text-center">Total Users</span>
               </div>
               <div className="p-4 rounded-xl border border-border bg-muted/20 flex flex-col items-center justify-center">
                 <span className="text-3xl font-black">{users.filter(u => u.role === 'admin').length}</span>
                 <span className="text-sm font-medium text-muted-foreground text-center">Administrators</span>
               </div>
               <div className="p-4 rounded-xl border border-border bg-muted/20 flex flex-col items-center justify-center sm:col-span-1 col-span-2">
                 <span className="text-3xl font-black">{users.filter(u => u.role === 'user').length}</span>
                 <span className="text-sm font-medium text-muted-foreground text-center">Standard Users</span>
               </div>
            </div>
         )}

         <div className="rounded-2xl border border-border overflow-hidden bg-background">
           <div className="overflow-x-auto">
             <table className="w-full text-left text-sm whitespace-nowrap">
               <thead className="bg-muted/40 border-b border-border text-muted-foreground">
                 <tr>
                   <th className="px-6 py-4 font-semibold w-full">User</th>
                   <th className="px-6 py-4 font-semibold">Role</th>
                   <th className="px-6 py-4 font-semibold">Joined</th>
                   <th className="px-6 py-4 font-semibold text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-border">
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                             <Skeleton className="h-10 w-10 rounded-full" />
                             <div className="space-y-2">
                               <Skeleton className="h-4 w-24" />
                               <Skeleton className="h-3 w-32" />
                             </div>
                           </div>
                        </td>
                        <td className="px-6 py-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                        <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-8 rounded-full ml-auto" /></td>
                      </tr>
                    ))
                  ) : (
                    users?.map(user => (
                      <tr key={user.id} className="hover:bg-muted/10 transition-colors group">
                         <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                             <Link to={`/user/${user.id}`} className="shrink-0">
                               <Avatar className="h-10 w-10 transition-transform group-hover:scale-105 border border-border">
                                  <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.name || user.id}`} />
                                  <AvatarFallback className="font-bold">U{user.id}</AvatarFallback>
                               </Avatar>
                             </Link>
                             <div className="flex flex-col max-w-[150px] sm:max-w-xs">
                               <Link to={`/user/${user.id}`} className="font-bold hover:underline truncate text-base">
                                 {user.name}
                               </Link>
                               <span className="text-muted-foreground flex items-center gap-1 text-xs truncate mt-0.5">
                                 <Mail className="h-3 w-3 shrink-0" /> {user.email}
                               </span>
                             </div>
                           </div>
                         </td>
                         <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                               user.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-secondary text-secondary-foreground'
                            }`}>
                               {user.role === 'admin' && <ShieldAlert className="h-3 w-3" />}
                               {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                         </td>
                         <td className="px-6 py-4 text-muted-foreground">
                            {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                         </td>
                         <td className="px-6 py-4 text-right">
                            {user.role !== 'admin' ? (
                               <Button 
                                 variant="ghost" 
                                 size="icon" 
                                 className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors rounded-full"
                                 onClick={() => handleDeleteUser(user.id)}
                                 disabled={deletingId === user.id}
                               >
                                 <Trash2 className="h-4 w-4" />
                               </Button>
                            ) : (
                               <span className="text-xs text-muted-foreground opacity-50 px-2">Protected</span>
                            )}
                         </td>
                      </tr>
                    ))
                  )}
               </tbody>
             </table>
           </div>
         </div>
      </div>
    </div>
  );
}
