import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getCurrentUser, clearSession } from "../lib/auth.js";

export default function Tutorials() {
  const location = useLocation();
  const navigate = useNavigate();

  // Scroll to hash
  useEffect(() => {
    const hash = location.hash?.replace("#", "");
    if (!hash) return;
    const el = document.getElementById(hash);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [location.hash]);

  const handleLogout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  const userEmail = getCurrentUser()?.email || getCurrentUser()?.username || "builder@studio.io";
  const user = getCurrentUser();

  return (
    <div className="p-page">
      {/* background layers */}
      <div className="p-bg" aria-hidden="true" />
      <div className="p-grid" aria-hidden="true" />
      <div className="p-orb p-orb--a" aria-hidden="true" />
      <div className="p-orb p-orb--b" aria-hidden="true" />

      {/* top bar */}
      <header className="p-topbar" style={{ position: "sticky", top: 0, zIndex: 50 }}>
        <div className="p-brand">
          <span className="p-brand__logo">⬡</span>
          <span className="p-brand__text">3D Model Builder</span>
          <span className="p-pill">Tutorials</span>
        </div>

        <div className="p-topbar__right">
          {user ? (
            <>
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
            </>
          ) : (
            <>
              <button className="p-btn p-btn--ghost" onClick={() => navigate("/login")}>
                Sign In
              </button>
              <button className="p-btn p-btn--primary" onClick={() => navigate("/register")}>
                Sign Up
              </button>
            </>
          )}
        </div>
      </header>

      <main className="p-wrap" style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* hero */}
        <section className="p-hero" style={{ textAlign: "center", justifyContent: "center" }}>
          <div>
            <h1 className="p-title" style={{ fontSize: "2.5rem" }}>
              Getting <span className="p-title__neon">Started</span>
            </h1>
            <p className="p-sub" style={{ fontSize: "1.1rem", marginTop: "16px", marginBottom: "32px" }}>
              เรียนรู้การใช้งานระบบ 3D Model Builder เบื้องต้น
            </p>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
              <Link className="p-btn p-btn--ghost" style={{ fontSize: "0.85rem" }} to="/tutorials#step-1">1. Create Account</Link>
              <Link className="p-btn p-btn--ghost" style={{ fontSize: "0.85rem" }} to="/tutorials#step-2">2. New Project</Link>
              <Link className="p-btn p-btn--ghost" style={{ fontSize: "0.85rem" }} to="/tutorials#step-3">3. 3D Editor</Link>
              <Link className="p-btn p-btn--ghost" style={{ fontSize: "0.85rem" }} to="/tutorials#step-4">4. Manage & Save</Link>
              <Link className="p-btn p-btn--ghost" style={{ fontSize: "0.85rem" }} to="/tutorials#publish">Publish to Market</Link>
            </div>
          </div>
        </section>

        {/* content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", paddingBottom: "60px" }}>

          <div id="step-1" className="p-card">
            <h2 className="p-h2" style={{ marginBottom: "16px" }}>1️⃣ สร้างบัญชี และเข้าสู่ระบบ</h2>
            <div style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.6" }}>
              <p style={{ marginBottom: "12px" }}>
                เริ่มต้นโดยสมัครสมาชิกหรือเข้าสู่ระบบเพื่อเข้าถึงพื้นที่ทำงานของคุณ
                บัญชีของคุณจะใช้สำหรับจัดการโปรเจกต์และบันทึกโมเดล 3D ทั้งหมด
              </p>
              <p style={{ marginBottom: "20px" }}>
                Start by creating an account or signing in to access your workspace.
                Your account allows you to manage projects and save all your 3D models securely.
              </p>
              <div style={{ display: "flex", gap: "12px" }}>
                <button className="p-btn p-btn--ghost" onClick={() => navigate("/login")}>Go to Login</button>
                <button className="p-btn p-btn--primary" onClick={() => navigate("/register")}>Create Account</button>
              </div>
            </div>
          </div>

          <div id="step-2" className="p-card">
            <h2 className="p-h2" style={{ marginBottom: "16px" }}>2️⃣ สร้างโปรเจกต์ใหม่</h2>
            <div style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.6" }}>
              <p style={{ marginBottom: "12px" }}>
                ไปที่หน้า <b>Projects</b> แล้วคลิก “+ New Project” เพื่อเริ่มสร้างงานใหม่
                ตั้งชื่อโปรเจกต์ ระบบจะจำกัดการสร้างฟรี แลกกับการใช้ Credits ได้
              </p>
              <p style={{ marginBottom: "20px" }}>
                Click “+ New Project” to start a new creation.
                Give your project a name and choose your workspace setup.
              </p>
              <div style={{ display: "flex", gap: "12px" }}>
                <button className="p-btn p-btn--primary" onClick={() => navigate("/projects")}>Open Projects Workspace</button>
              </div>
            </div>
          </div>

          <div id="step-3" className="p-card">
            <h2 className="p-h2" style={{ marginBottom: "16px" }}>3️⃣ ใช้งาน 3D Editor</h2>
            <div style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.6" }}>
              <p style={{ marginBottom: "12px" }}>ภายใน Editor คุณสามารถ:</p>
              <ul style={{ paddingLeft: "20px", marginBottom: "16px" }}>
                <li style={{ marginBottom: "4px" }}>เพิ่มวัตถุ (Add Object): Cube, Sphere, Cylinder, Light</li>
                <li style={{ marginBottom: "4px" }}>ใช้ลูกศร (Gizmo) ในการปรับตำแหน่ง (Translate) หมุน (Rotate) ย่อขยาย (Scale)</li>
                <li style={{ marginBottom: "4px" }}>ใช้ Inspector ขวามือ ในการเปลี่ยนสี หรือเปลี่ยน Properties</li>
              </ul>
            </div>
          </div>

          <div id="step-4" className="p-card">
            <h2 className="p-h2" style={{ marginBottom: "16px" }}>4️⃣ บันทึกข้อมูลและ ส่งออกโมเดล</h2>
            <div style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.6" }}>
              <p style={{ marginBottom: "12px" }}>
                กด “Save” บนเมนูบาร์ซ้ายเพื่อบันทึกงาน ระบบมีการจำกัดจำนวน Scene โปรเจกต์ใน Editor
                และคุณสามารถกด Export เป็นไฟล์ .GLB หรือ .JSON ออกไปใช้งานจริงนอกเว็บได้
              </p>
              <p style={{ marginBottom: "20px" }}>
                Use the Top Sidebar buttons to Save limits, or Export data.
              </p>
            </div>
          </div>

          <div id="publish" className="p-card">
            <h2 className="p-h2" style={{ marginBottom: "16px" }}>🚀 เผยแพร่ไปยัง Marketplace</h2>
            <div style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.6" }}>
              <p style={{ marginBottom: "12px" }}>
                เมื่อโมเดลของคุณทำเสร็จแล้ว สามารถกลับไปหน้า Projects แล้วเลือกโปรเจกต์เพื่อนำมาตั้งราคาขาย!
                โปรเจกต์ที่ตั้งค่า <b>Published</b> จะปรากฏแก่ผู้ใช้อื่น และสามารถถูกซื้อได้ด้วยระบบ Credits ภายในเว็บ.
              </p>
              <div style={{ display: "flex", gap: "12px" }}>
                <button className="p-btn p-btn--primary" onClick={() => navigate("/market")}>
                  <span className="p-btn__spark" aria-hidden="true" />
                  Explore Market
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}