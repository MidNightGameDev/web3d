import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, clearSession } from "../lib/auth.js";
import { listProjects, getCredits } from "../lib/store.js";

export default function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [credits, setCredits] = useState(0);
    const [stats, setStats] = useState({ owned: 0, published: 0 });

    useEffect(() => {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            navigate("/login");
            return;
        }
        setUser(currentUser);

        const fetchData = async () => {
            const bal = await getCredits(currentUser.email);
            setCredits(bal);

            // Calculate simple stats
            const allProjects = await listProjects();
            const owned = allProjects.filter(p => p.ownerId === currentUser.id);
            const published = owned.filter(p => p.status === "published");
            setStats({ owned: owned.length, published: published.length });
        };
        fetchData();
    }, [navigate]);

    const handleLogout = () => {
        clearSession();
        navigate("/login", { replace: true });
    };

    if (!user) return null;

    return (
        <div className="p-page">
            {/* background layers */}
            <div className="p-bg" aria-hidden="true" />
            <div className="p-grid" aria-hidden="true" />
            <div className="p-orb p-orb--a" aria-hidden="true" />
            <div className="p-orb p-orb--b" aria-hidden="true" />

            {/* top bar */}
            <header className="p-topbar">
                <div className="p-brand">
                    <span className="p-brand__logo">⬡</span>
                    <span className="p-brand__text">3D Model Builder</span>
                    <span className="p-pill">Profile</span>
                </div>

                <div className="p-topbar__right">
                    <button className="p-btn p-btn--ghost" onClick={() => navigate("/")}>
                        Dashboard
                    </button>
                    <button className="p-btn p-btn--danger" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </header>

            <main className="p-wrap" style={{ maxWidth: "600px", margin: "40px auto" }}>
                <div className="p-card" style={{ padding: "40px 30px", textAlign: "center" }}>

                    {/* Avatar Placeholder */}
                    <div style={{
                        width: "80px", height: "80px", borderRadius: "50%", background: "var(--neon-purple)",
                        margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "2rem", color: "#fff", boxShadow: "0 0 20px var(--neon-purple)"
                    }}>
                        {user.username ? user.username.charAt(0).toUpperCase() : "U"}
                    </div>

                    <h1 className="p-title" style={{ fontSize: "2rem" }}>
                        {user.username}
                    </h1>
                    <p style={{ color: "var(--text-secondary)", marginBottom: "30px" }}>{user.email}</p>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "30px" }}>
                        <div style={{ background: "rgba(0,0,0,0.3)", padding: "15px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "8px" }}>Balance</div>
                            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--neon-green)", textShadow: "0 0 10px rgba(0,255,128,0.5)" }}>
                                {credits} CR
                            </div>
                        </div>
                        <div style={{ background: "rgba(0,0,0,0.3)", padding: "15px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "8px" }}>Projects</div>
                            <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#fff" }}>
                                {stats.owned}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                        <button className="p-btn p-btn--primary" onClick={() => navigate("/topup")}>
                            <span className="p-btn__spark" />
                            Top Up Credits
                        </button>
                        <button className="p-btn p-btn--ghost" onClick={() => navigate("/projects")}>
                            View Projects
                        </button>
                    </div>

                </div>
            </main>
        </div>
    );
}
