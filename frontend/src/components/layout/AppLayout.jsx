import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { PenSquare, Home, User, LogOut, Sun, Moon, Hash } from "lucide-react";
import { useTheme } from "../theme-provider";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import api from "../../lib/api";
import { toast } from "sonner";
import { mutate } from "swr";

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

  const navItems = [
    { name: "Home", href: "/feed", icon: Home },
    ...(userId ? [{ name: "Profile", href: `/user/${userId}`, icon: User }] : []),
  ];

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
      <main className="w-full max-w-[600px] border-x border-border sm:ml-0 min-h-screen pb-20 sm:pb-0">
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

      {/* Right Sidebar Placeholder (Trending/Suggestions) */}
      <aside className="hidden lg:block w-[350px] pl-8 py-6 sticky top-0 h-screen">
        <div className="rounded-2xl bg-muted/50 p-6 border border-border">
          <h2 className="font-bold text-xl mb-4">What's happening</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Minimalist tech-driven design inspired by modern sensibilities.
            Focused on fast server responses and high-fidelity UIs.
          </p>
        </div>
      </aside>
    </div>
  );
}
