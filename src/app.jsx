import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import BackButton from "./components/BackButton.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Projects from "./pages/Projects.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ProjectDetail from "./pages/ProjectDetail.jsx";
import Editor3D from "./pages/Editor3D.jsx";
import Tutorials from "./pages/Tutorials.jsx";
import Market from "./pages/Market.jsx";
import Templates from "./pages/Templates.jsx";
import Profile from "./pages/Profile.jsx";
import Topup from "./pages/Topup.jsx";

function useAuthToken() {
  const [token, setToken] = React.useState(() => localStorage.getItem("auth_token"));

  React.useEffect(() => {
    const sync = () => setToken(localStorage.getItem("auth_token"));

    // เคส tab เดียวกัน: เราจะยิง event เองตอน login/logout
    window.addEventListener("authchange", sync);

    // เคสหลายแท็บ: storage event จะทำงาน
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener("authchange", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return token;
}

function PrivateRoute({ children }) {
  const token = localStorage.getItem("auth_token");
  return token ? children : <Navigate to="/welcome" replace />;
}

export default function App() {
  const token = useAuthToken();
  const isAuthed = !!token;

  return (
    <>
      <BackButton />

      <Routes>
        {/* Dashboard = หน้าหลัก (ต้อง login) */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* Landing page (public) — เข้าถึงได้จาก login/register/tutorials */}
        <Route path="/welcome" element={<Home />} />

        <Route
          path="/login"
          element={isAuthed ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={isAuthed ? <Navigate to="/" replace /> : <Register />}
        />
        <Route path="/tutorials" element={<Tutorials />} />
        <Route path="/templates" element={<Templates />} />
        <Route
          path="/market"
          element={
            <PrivateRoute>
              <Market />
            </PrivateRoute>
          }
        />

        <Route
          path="/projects"
          element={
            <PrivateRoute>
              <Projects />
            </PrivateRoute>
          }
        />

        <Route
          path="/projects/:id"
          element={
            <PrivateRoute>
              <ProjectDetail />
            </PrivateRoute>
          }
        />

        <Route
          path="/editor/:projectId/:sceneId"
          element={
            <PrivateRoute>
              <Editor3D />
            </PrivateRoute>
          }
        />

        <Route
          path="/preview/:projectId/:sceneId"
          element={
            <PrivateRoute>
              <Editor3D readOnly={true} />
            </PrivateRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />

        <Route
          path="/topup"
          element={
            <PrivateRoute>
              <Topup />
            </PrivateRoute>
          }
        />

        {/* backward compat: /dashboard → / */}
        <Route path="/dashboard" element={<Navigate to="/" replace />} />

        <Route path="*" element={<Navigate to="/welcome" replace />} />
      </Routes>
    </>
  );
}
