import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { PenSquare, Home, User, LogOut, Sun, Moon, Hash, ShieldCheck, TrendingUp, Terminal, Layers } from "lucide-react";
import { useTheme } from "../theme-provider";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import api from "../../lib/api";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";
import { fetcher } from "../../lib/api";

export default function AppLayout() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [userId, setUserId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const id = localStorage.getItem("user_id");
    if (!token) {
      navigate("/login", { replace: true });
    } else {
      setUserId(id);
    }
  }, [navigate]);

  if (!localStorage.getItem("token")) {
    return null; // Prevents flashing the UI while redirecting
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      await api.post("/posts", { 
        title: title.trim(), 
        content: content.trim() 
      });
      setContent("");
      setTitle("");
      setIsModalOpen(false);
      mutate("/posts");
      toast.success("Posted successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post");
    } finally {
      setSubmitting(false);
    }
  };

  const role = localStorage.getItem("role");

  const navItems = [
    { name: "Home", href: "/feed", icon: Home },
    ...(userId ? [{ name: "Profile", href: `/user/${userId}`, icon: User }] : []),
    ...(role === "admin" ? [{ name: "Admin", href: "/admin", icon: ShieldCheck }] : []),
  ];

  const { data: posts } = useSWR("/posts", fetcher);
  
  // Compute top creators dynamically from current cache
  const userPostCounts = {};
  if (posts) {
     posts.forEach(post => {
        if (!userPostCounts[post.user_id]) {
           userPostCounts[post.user_id] = { id: post.user_id, name: post.user_name || `User ${post.user_id}`, count: 0 };
        }
        userPostCounts[post.user_id].count++;
     });
  }
  const topCreators = Object.values(userPostCounts).sort((a, b) => b.count - a.count).slice(0, 4);

  return (
    <div className="flex justify-center min-h-screen bg-background text-foreground transition-colors duration-200">
      {/* Sidebar Navigation */}
      <header className="fixed bottom-0 z-50 w-full border-t border-border bg-background/80 backdrop-blur-md sm:sticky sm:top-0 sm:h-screen sm:w-64 sm:border-r sm:border-t-0 sm:bg-transparent">
        <div className="flex h-full flex-col justify-between p-4 sm:p-6 overflow-y-auto">
          <div className="flex sm:flex-col gap-6 w-full items-center sm:items-start justify-around sm:justify-start">
            {/* Logo */}
            <Link to="/feed" className="hidden sm:flex items-center gap-3 p-2 hover:opacity-80 transition-opacity mb-2">
              <Hash className="h-9 w-9 text-primary" />
              <span className="text-2xl font-bold tracking-tight">Platform</span>
            </Link>

            {/* Nav Links */}
            <nav className="flex sm:flex-col gap-3 w-full sm:pt-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-4 rounded-full px-4 py-3 text-xl transition-all hover:bg-muted ${
                      isActive ? "font-bold text-primary" : "text-muted-foreground font-medium"
                    }`}
                  >
                    <item.icon className="h-7 w-7" strokeWidth={isActive ? 2.5 : 2} />
                    <span className="hidden sm:inline">{item.name}</span>
                  </Link>
                );
              })}

              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button className="hidden sm:flex mt-4 rounded-full py-6 text-xl font-bold hover:shadow-lg transition-all">
                    Create Post
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] border-border p-6 rounded-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold">What's on your mind?</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handlePost} className="flex flex-col gap-4 mt-4">
                    <input 
                      type="text"
                      placeholder="Give it a catchy title... (optional)"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="bg-transparent border-b border-border focus:border-primary outline-none py-2 text-xl font-semibold placeholder:text-muted-foreground transition-colors"
                    />
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Start typing your minimalist masterpiece..."
                      className="min-h-[150px] resize-none border-none p-0 focus-visible:ring-0 text-lg placeholder:text-muted-foreground bg-transparent mt-2"
                    />
                    <div className="flex justify-end pt-4 border-t border-border">
                      <Button type="submit" disabled={!content.trim() || submitting} className="rounded-full font-bold px-8 py-5 text-lg">
                        {submitting ? "Posting..." : "Post"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </nav>
          </div>

          <div className="hidden sm:flex flex-col gap-4 pb-4">
             {/* Simple user display via dicebear */}
             <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl border border-border/50 bg-muted/20">
               <Avatar className="h-10 w-10">
                 <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=user${userId}`} alt="Me" />
                 <AvatarFallback>ME</AvatarFallback>
               </Avatar>
               <div className="flex flex-col">
                  <span className="text-sm font-bold">My Account</span>
               </div>
             </div>

            <Button
              variant="outline"
              size="icon"
              className="rounded-full shadow-sm hover:bg-muted ml-4"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              <span className="sr-only">Toggle theme</span>
            </Button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 rounded-full hover:bg-muted px-4 py-3 transition-colors text-red-500 hover:text-red-600 font-medium text-lg w-fit ml-2"
            >
              <LogOut className="h-6 w-6" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-[600px] border-x border-border/40 sm:ml-0 min-h-screen pb-20 sm:pb-0">
        <div className="flex items-center justify-between sm:hidden p-4 border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-40">
           <Hash className="h-7 w-7 text-primary" />
           <div className="flex gap-4">
             <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(true)}>
                <PenSquare className="h-5 w-5 text-primary" />
             </Button>
             <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
             </Button>
           </div>
        </div>
        
        {/* Mobile Dialog that syncs with same state */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="sm:max-w-[500px] border-border p-6 max-w-[95vw] rounded-2xl bottom-top">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">New Post</DialogTitle>
              </DialogHeader>
              <form onSubmit={handlePost} className="flex flex-col gap-4 mt-2">
                <input 
                  type="text"
                  placeholder="Title (optional)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-transparent border-b border-border focus:border-primary outline-none py-2 text-lg font-semibold placeholder:text-muted-foreground transition-colors"
                />
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's happening?"
                  className="min-h-[120px] resize-none border-none p-0 focus-visible:ring-0 text-lg placeholder:text-muted-foreground bg-transparent mt-2"
                />
                <div className="flex justify-end pt-4 border-t border-border">
                  <Button type="submit" disabled={!content.trim() || submitting} className="rounded-full font-bold px-8 py-5">
                    Post
                  </Button>
                </div>
              </form>
            </DialogContent>
        </Dialog>

        <Outlet />
      </main>

      {/* Right Sidebar - Beautifully Reintegrated */}
      <aside className="hidden lg:block w-[350px] pl-8 py-6 sticky top-0 h-screen overflow-y-auto overflow-x-hidden">
        
        {/* Top Creators Widget */}
        <div className="rounded-2xl border border-border/50 bg-background/50 backdrop-blur-xl mb-6 overflow-hidden relative group transition-all duration-300 hover:border-primary/30">
           <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
           <div className="p-5 relative z-10">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                 <TrendingUp className="h-5 w-5 text-primary" /> Top Creators
              </h2>
              <div className="flex flex-col gap-4">
                 {topCreators.length > 0 ? topCreators.map((creator) => (
                    <Link to={`/user/${creator.id}`} key={creator.id} className="flex items-center justify-between group/user">
                       <div className="flex items-center gap-3">
                         <Avatar className="h-10 w-10 transition-transform group-hover/user:scale-105 border border-border/50">
                           <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${creator.name}`} />
                           <AvatarFallback>U</AvatarFallback>
                         </Avatar>
                         <div className="flex flex-col">
                           <span className="font-bold text-sm group-hover/user:underline">{creator.name}</span>
                           <span className="text-xs text-muted-foreground">{creator.count} posts</span>
                         </div>
                       </div>
                       <Button variant="ghost" size="sm" className="h-8 rounded-full text-xs font-semibold px-4 opacity-0 group-hover/user:opacity-100 transition-opacity">View</Button>
                    </Link>
                 )) : (
                    <div className="text-sm text-muted-foreground text-center py-4">No data yet</div>
                 )}
              </div>
           </div>
        </div>

        {/* Project Architecture Post */}
        <div className="rounded-2xl bg-gradient-to-br from-muted/40 to-background border border-border/50 p-6 relative overflow-hidden group">
           <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors duration-500" />
           <h2 className="font-bold text-lg mb-2 flex items-center gap-2 relative z-10">
              <Layers className="h-5 w-5 text-primary" /> System Architecture
           </h2>
           <p className="text-muted-foreground text-sm leading-relaxed mb-4 relative z-10">
             A highly-responsive fullstack monolith. Built for ultimate speed and minimal visual clutter.
           </p>
           <div className="flex flex-wrap gap-2 relative z-10">
              <div className="px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-500 text-xs font-bold font-mono flex items-center gap-1 border border-blue-500/20">
                 REACT 19
              </div>
              <div className="px-3 py-1.5 rounded-full bg-green-500/10 text-green-500 text-xs font-bold font-mono flex items-center gap-1 border border-green-500/20">
                 FLASK
              </div>
              <div className="px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-500 text-xs font-bold font-mono flex items-center gap-1 border border-orange-500/20">
                 SWR CACHE
              </div>
              <div className="px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-500 text-xs font-bold font-mono flex items-center gap-1 border border-purple-500/20">
                 SQLAlchemy
              </div>
           </div>
           
           <div className="mt-5 pt-4 border-t border-border/50 flex items-center justify-between relative z-10 text-xs text-muted-foreground font-mono">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Edge Ready</span>
              <span>v1.0.0</span>
           </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground/60 px-2 justify-center">
           <a href="#" className="hover:underline">Terms of Service</a>
           <a href="#" className="hover:underline">Privacy Policy</a>
           <a href="#" className="hover:underline">Cookie Policy</a>
           <a href="#" className="hover:underline">Accessibility</a>
           <span>© 2026 BlogStack</span>
        </div>

      </aside>
    </div>
  );
}
