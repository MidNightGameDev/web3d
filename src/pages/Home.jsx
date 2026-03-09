import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import NeonButton from "../components/NeonButton.jsx";

export default function Home() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  const stats = useMemo(
    () => [
      { label: "Create Scenes", value: "3D" },
      { label: "Publish to Market", value: "1-click" },
      { label: "Neon Tools", value: "Pro" },
      { label: "Reply Comments", value: "Threaded" },
    ],
    []
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="landing">
      {/* animated background layers */}
      <div className="landing-bg" aria-hidden="true" />
      <div className="landing-grid" aria-hidden="true" />
      <div className="landing-orb landing-orb--a" aria-hidden="true" />
      <div className="landing-orb landing-orb--b" aria-hidden="true" />

      {/* top nav */}
      <header className={`landing-nav ${scrolled ? "landing-nav--scrolled" : ""}`}>
        <div className="landing-nav__left">
          <div className="landing-brand">
            <span className="landing-brand__mark">⬡</span>
            <span className="landing-brand__text">3D Model Builder</span>
          </div>
          <span className="landing-nav__tag">Neon • Cyberpunk • Web3D</span>
        </div>

        <div className="landing-nav__right">
          <NeonButton variant="secondary" size="small" onClick={() => navigate("/tutorials")}>
            Tutorial
          </NeonButton>
          <NeonButton variant="secondary" size="small" onClick={() => navigate("/login")}>
            Log in
          </NeonButton>
          <NeonButton variant="primary" size="small" onClick={() => navigate("/register")}>
            Sign up
          </NeonButton>
        </div>
      </header>

      {/* HERO */}
      <main className="landing-main">
        <section className="landing-hero">
          <div className="landing-hero__left">
            <div className="badge-row">
              <span className="chip chip--glow">✨ New UI</span>
              <span className="chip">3D Editor</span>
              <span className="chip">Marketplace</span>
              <span className="chip">Credits</span>
            </div>

            <h1 className="landing-title">
              Build, Edit, and{" "}
              <span className="text-neon">Publish</span>
              <br />
              3D Models in the Browser
            </h1>

            <p className="landing-subtitle">
              สร้างซีน 3D • แก้โมเดล • ตั้งราคา • Publish เข้า Market • ซื้อขายด้วยเครดิต
              <br />
              เหมาะทั้งมือใหม่และคนทำงานจริง — มี tutorial ช่วยเริ่มต้นทันที
            </p>

            <div className="landing-cta">
              <NeonButton variant="primary" onClick={() => navigate("/register")}>
                Start Building
              </NeonButton>

              <NeonButton variant="secondary" onClick={() => navigate("/login")}>
                Continue
              </NeonButton>

              <button className="link-btn" onClick={() => navigate("/tutorials")}>
                Learn the basics →
              </button>
            </div>

            <div className="landing-stats">
              {stats.map((s) => (
                <div key={s.label} className="stat-card">
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* right showcase */}
          <div className="landing-hero__right">
            <div className="showcase">
              <div className="showcase__top">
                <div className="dots">
                  <span className="dot dot--r" />
                  <span className="dot dot--y" />
                  <span className="dot dot--g" />
                </div>
                <div className="showcase__title">Realtime Neon Workspace</div>
              </div>

              <div className="showcase__body">
                <div className="mini-panels">
                  <div className="mini-panel">
                    <div className="mini-panel__title">Scene</div>
                    <div className="mini-panel__item active">Cube_01</div>
                    <div className="mini-panel__item">Light</div>
                    <div className="mini-panel__item">Camera</div>
                  </div>

                  <div className="mini-panel">
                    <div className="mini-panel__title">Inspector</div>
                    <div className="kv">
                      <span>Position</span>
                      <span className="kv__val">0, 1, 0</span>
                    </div>
                    <div className="kv">
                      <span>Rotation</span>
                      <span className="kv__val">0, 0, 0</span>
                    </div>
                    <div className="kv">
                      <span>Scale</span>
                      <span className="kv__val">1, 1, 1</span>
                    </div>
                  </div>
                </div>

                <div className="glow-canvas">
                  <div className="glow-canvas__hint">
                    Drag • Orbit • Move • Save • Publish
                  </div>
                  <div className="glow-canvas__rings" aria-hidden="true" />
                </div>
              </div>

              <div className="showcase__bottom">
                <span className="pill">Draft</span>
                <span className="pill pill--hot">Published</span>
                <span className="pill">Market</span>
                <span className="pill">Owned</span>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="landing-section">
          <h2 className="section-title">What you can do</h2>
          <p className="section-sub">
            UI เน้นชัด ใช้ง่าย และมีลูกเล่นแบบ Neon — พร้อม workflow ครบตั้งแต่สร้างจนขาย
          </p>

          <div className="feature-grid">
            <FeatureCard
              icon="🧊"
              title="Create & Edit"
              desc="สร้างวัตถุในฉาก ปรับตำแหน่ง/หมุน/สเกล มี inspector + gizmo"
            />
            <FeatureCard
              icon="🛍️"
              title="Market & Purchase"
              desc="Publish เข้าตลาด ตั้งราคา ซื้อด้วยเครดิต พร้อมสถานะ Owned"
            />
            <FeatureCard
              icon="💬"
              title="Comments + Replies"
              desc="คอมเมนต์และตอบกลับแบบ thread ทำให้ feedback workflow ชัดเจน"
            />
            <FeatureCard
              icon="⚡"
              title="Limits + Credits"
              desc="มี limit สำหรับผู้ใช้ฟรี และจ่ายเครดิตเพื่อสร้างเพิ่มได้"
            />
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="landing-section landing-section--tight">
          <h2 className="section-title">Quick start</h2>
          <div className="steps">
            <Step n="01" title="Create Project" desc="สร้างโปรเจกต์และซีนเพื่อเริ่มทำงาน" />
            <Step n="02" title="Open Editor" desc="เพิ่มวัตถุ ปรับแกน Move/Rotate/Scale" />
            <Step n="03" title="Save + Publish" desc="บันทึก แล้ว Publish เข้า Market ให้คนอื่นซื้อได้" />
          </div>

          <div className="landing-bottom-cta">
            <NeonButton variant="primary" onClick={() => navigate("/register")}>
              Create your first project
            </NeonButton>
            <NeonButton variant="secondary" onClick={() => navigate("/tutorials")}>
              View tutorial
            </NeonButton>
          </div>
        </section>

        <footer className="landing-footer">
          <div className="landing-footer__left">
            <span className="landing-footer__brand">⬡ 3D Model Builder</span>
            <span className="landing-footer__muted">Cyberpunk Neon UI</span>
          </div>
          <div className="landing-footer__right">
            <button className="link-btn" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              Back to top ↑
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="feature-card">
      <div className="feature-card__icon">{icon}</div>
      <div className="feature-card__title">{title}</div>
      <div className="feature-card__desc">{desc}</div>
      <div className="feature-card__shine" aria-hidden="true" />
    </div>
  );
}

function Step({ n, title, desc }) {
  return (
    <div className="step-card">
      <div className="step-num">{n}</div>
      <div className="step-title">{title}</div>
      <div className="step-desc">{desc}</div>
    </div>
  );
}