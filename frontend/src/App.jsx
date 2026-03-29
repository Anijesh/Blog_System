import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Feed from "./pages/Feed";
import PostDetail from "./pages/PostDetail";
import UserProfile from "./pages/UserProfile";

export default function App() {
  const token = localStorage.getItem("token");

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to={token ? "/feed" : "/login"} replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes inside AppLayout */}
      <Route element={<AppLayout />}>
        <Route path="/feed" element={<Feed />} />
        <Route path="/post/:id" element={<PostDetail />} />
        <Route path="/user/:id" element={<UserProfile />} />
      </Route>
    </Routes>
  );
}
