import React from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, clearSession } from "../lib/auth.js";

export default function Templates() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  const userEmail = getCurrentUser()?.email || getCurrentUser()?.username || "builder@studio.io";

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
          <span className="p-pill">Cyberpunk Edition</span>
        </div>

        <div className="p-topbar__right">
          <div className="p-user">
            <span className="p-user__dot" />
            <span className="p-user__email">{userEmail}</span>
          </div>

          <button className="p-btn p-btn--ghost" onClick={() => navigate("/")}>
            Dashboard
          </button>

          <button className="p-btn p-btn--danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="p-wrap">
        <section className="p-hero" style={{ textAlign: "center", justifyContent: "center" }}>
          <div>
            <h1 className="p-title" style={{ fontSize: "3rem" }}>
              Quick <span className="p-title__neon">Templates</span>
            </h1>
            <p className="p-sub" style={{ fontSize: "1.2rem", marginTop: "16px" }}>
              Start building faster with pre-made cyberpunk rooms, vehicles, and assets.
            </p>
          </div>
        </section>

        <section className="p-section">
          <div className="p-empty" style={{ margin: "40px auto", maxWidth: "600px" }}>
            <div className="p-empty__icon">🚀</div>
            <div className="p-empty__title">Coming Soon</div>
            <div className="p-empty__sub">
              The Templates feature is currently under active development. <br />
              We are working hard to bring you the best 3D starting assets! Check back later.
            </div>
            <br />
            <button className="p-btn p-btn--primary" onClick={() => navigate("/projects")}>
              <span className="p-btn__spark" aria-hidden="true" />
              Go to Projects Workspace
            </button>
            <br /><br />
            <button className="p-link" onClick={() => navigate("/")}>
              ← Back to Dashboard
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}