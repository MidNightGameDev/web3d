import React from "react";
import { useNavigate } from "react-router-dom";
import heroBanner from "../assets/ChatGPT Image Feb 27, 2026, 01_50_30 PM.png";
import { canCreateProject, createProjectWithLimit, listProjects as loadProjects, LIMITS, getCredits } from '../lib/store.js';
import { getCurrentUser, clearSession } from '../lib/auth.js';

function uid() {
  return (crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`).toString();
}

export default function Dashboard() {
  const navigate = useNavigate();
  const email = localStorage.getItem("auth_user") || "you@studio.io";
  const [credits, setCredits] = React.useState(getCurrentUser()?.credits ?? getCredits(email));
  const [userProjects, setUserProjects] = React.useState([]);

  React.useEffect(() => {
    async function init() {
      const allProjects = await loadProjects();
      const currentUser = getCurrentUser();
      const filtered = allProjects.filter(p => p.ownerId === currentUser?.id);
      setUserProjects(filtered);
    }
    init();
  }, []);

  const goSection = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const openEditor = (projectId, sceneId) => {
    // ถ้า editor route ของคุณเป็นแบบอื่น แก้ตรงนี้จุดเดียว
    navigate(`/editor/${projectId}/${sceneId}`);
  };

  const ensureDefaultProject = async () => {
    let list = await loadProjects();

    if (!list.length) {
      try {
        const next = await createProjectWithLimit({
          name: "My First Project",
          ownerId: getCurrentUser()?.id,
          ownerName: getCurrentUser()?.username,
          price: 10,
        });
        const p = next[0];
        return { projectId: p.id, sceneId: p.scenes[0].id };
      } catch (err) {
        console.error("Failed to create default", err);
        return null;
      }
    }

    const p = list[0];
    if (!p.scenes || p.scenes.length === 0) {
      // should ideally not happen with backend schema defaults, but just in case
      return { projectId: p.id, sceneId: 'default' };
    }

    return { projectId: p.id, sceneId: p.scenes[0].id };
  };

  const createNewProject = async () => {
    const check = await canCreateProject();
    if (!check.ok) {
      alert('ไม่สามารถสร้างโปรเจกต์ได้: ' + (check.reason || 'จำกัดครบแล้ว'));
      return;
    }
    if (check.needsPayment) {
      if (!confirm(`สร้างโปรเจกต์เพิ่มต้องใช้ ${check.cost} credits. ดำเนินการต่อ?`)) {
        return;
      }
    }

    const list = await loadProjects();
    const newName = `New Project ${list.length + 1}`;

    try {
      const next = await createProjectWithLimit({
        name: newName,
        ownerId: getCurrentUser()?.id,
        ownerName: getCurrentUser()?.username,
        price: 10,
      });
      setUserProjects(next.filter(p => p.ownerId === getCurrentUser()?.id));
      setCredits(getCurrentUser()?.credits ?? 0);
      const id0 = next[0].id;
      const sid = next[0].scenes?.[0]?.id;
      openEditor(id0, sid);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    clearSession();
    navigate("/welcome", { replace: true });
  };

  // demo items (กดแล้วเข้า editor ได้)
  const demoItems = [
    { key: "helmet", name: "Futuristic Helmet", files: 6 },
    { key: "car", name: "Cyber Car", files: 7 },
    { key: "robot", name: "Robot Companion", files: 3 },
  ];

  const openFromProject = async (project) => {
    if (project && project.scenes?.[0]) {
      openEditor(project.id, project.scenes[0].id);
      return;
    }
    const res = await ensureDefaultProject();
    if (res) openEditor(res.projectId, res.sceneId);
  };

  return (
    <div className="dash" id="dashboard">
      {/* Sidebar */}
      <aside className="dash-sidebar">
        <div
          className="dash-brand"
          role="button"
          tabIndex={0}
          onClick={() => navigate("/")}
          onKeyDown={(e) => e.key === "Enter" && navigate("/")}
        >
          <div className="dash-brand-icon">⬢</div>
          <div className="dash-brand-text">3D Model Builder</div>
        </div>

        <button className="dash-new-project-btn" type="button" onClick={createNewProject}>
          ＋ New Project
        </button>
        <div style={{ padding: '8px 12px', fontSize: 13, color: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Credits: {credits}</span>
          <button
            type="button"
            onClick={() => navigate("/topup")}
            style={{ color: "var(--neon-green)", border: "1px solid var(--neon-green)", padding: "2px 6px", borderRadius: "4px", fontSize: "11px", background: "rgba(0,255,128,0.1)", cursor: "pointer" }}
          >
            Top Up ＋
          </button>
        </div>
        <nav className="dash-nav">
          <a
            className="dash-nav-item active"
            href="#dashboard"
            onClick={(e) => {
              e.preventDefault();
              navigate("/");
            }}
          >
            Dashboard
          </a>

          <a
            className="dash-nav-item"
            href="#projects"
            onClick={(e) => {
              e.preventDefault();
              navigate("/projects");
            }}
          >
            Projects
          </a>

          <a
            className="dash-nav-item"
            href="#templates"
            onClick={(e) => {
              e.preventDefault();
              navigate("/templates");
            }}
          >
            Templates
          </a>

          <a
            className="dash-nav-item"
            href="#tutorials"
            onClick={(e) => {
              e.preventDefault();
              navigate("/tutorials");
            }}
          >
            Tutorials
          </a>

          <a
            className="dash-nav-item"
            href="#market"
            onClick={(e) => {
              e.preventDefault();
              navigate("/market");
            }}
          >
            Market
          </a>
        </nav>

        <div className="dash-sidebar-footer">
          <button className="dash-icon-btn" title="Menu" type="button" onClick={() => goSection("dashboard")}>
            ≡
          </button>
          <button className="dash-icon-btn" title="Search" type="button" onClick={() => alert("Search coming soon!")}>
            ⌕
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="dash-main">
        {/* Topbar */}
        <header className="dash-topbar">
          <div className="dash-topbar-links">
            <span className="dash-top-link active" role="button" tabIndex={0} onClick={() => navigate("/projects")}>
              Projects
            </span>
            <span className="dash-top-link" role="button" tabIndex={0} onClick={() => goSection("assets")}>
              Assets
            </span>
            <span className="dash-top-link" role="button" tabIndex={0} onClick={() => navigate("/templates")}>
              Templates
            </span>
            <span className="dash-top-link" role="button" tabIndex={0} onClick={() => navigate("/tutorials")}>
              Tutorials
            </span>
            <span className="dash-top-link" role="button" tabIndex={0} onClick={() => goSection("about")}>
              About
            </span>
          </div>

          <div className="dash-user">
            <div className="dash-user-pill">
              <span className="dash-user-mail">✉</span>
              <span className="dash-user-text">{email}</span>
            </div>
            <div className="dash-avatar" title="Profile" onClick={() => navigate("/profile")} style={{ cursor: "pointer" }} />
            <button className="dash-logout" type="button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        {/* Hero */}
        <section className="dash-hero" style={{ backgroundImage: `url(${heroBanner})` }}>
          <div className="dash-hero-overlay" />
          <div className="dash-hero-content">
            <h1 className="dash-hero-title">Welcome back!</h1>
            <p className="dash-hero-subtitle">
              Create and <span>customize 3D models</span> with ease
            </p>

            <button className="dash-hero-btn" type="button" onClick={createNewProject}>
              ＋ New Project
            </button>
          </div>
        </section>

        {/* Content */}
        <section className="dash-content">
          {/* Projects */}
          <div className="dash-row">
            <div className="dash-row-head">
              <h2 className="dash-row-title" id="projects">Your Projects</h2>

              <button
                className="dash-seeall"
                type="button"
                onClick={() => {
                  // ถ้าคุณมีหน้า /projects จริง ใช้บรรทัดนี้:
                  // navigate("/projects");
                  goSection("projects");
                }}
              >
                See All →
              </button>
            </div>

            <div className="dash-grid-3">
              {userProjects.slice(0, 3).map((project) => (
                <div
                  key={project.id}
                  className="dash-card dash-card-img"
                  role="button"
                  tabIndex={0}
                  onClick={() => openFromProject(project)}
                  onKeyDown={(e) => e.key === "Enter" && openFromProject(project)}
                  style={{ cursor: "pointer" }}
                >
                  <div className={`dash-card-thumb`} style={{ background: 'rgba(0, 255, 128, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                    🧊
                  </div>
                  <div className="dash-card-meta">
                    <div className="dash-card-name">{project.name}</div>
                    <div className="dash-card-sub">{(project.scenes || []).length} scenes • actual</div>
                  </div>
                </div>
              ))}
              {userProjects.length === 0 && (
                <div className="dash-empty-status" style={{ gridColumn: 'span 3', textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <p style={{ color: '#888' }}>No projects yet. Create one to get started!</p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom */}
          <div className="dash-bottom">
            <div className="dash-bottom-left">
              <div className="dash-panel" id="assets">
                <h3 className="dash-panel-title">Asset Library</h3>
                <p className="dash-panel-desc">Discover and manage your 3D assets</p>
                <button className="dash-panel-btn" type="button" onClick={() => goSection("assets")}>
                  View Assets
                </button>
              </div>

              <div className="dash-panel" id="templates">
                <h3 className="dash-panel-title">Quick Start Templates</h3>
                <p className="dash-panel-desc">Use pre-made templates to speed up your workflow</p>
                <button className="dash-panel-btn" type="button" onClick={() => navigate("/templates")}>
                  Browse Templates
                </button>
              </div>
            </div>

            <aside className="dash-recent">
              <div className="dash-recent-head">
                <h3 className="dash-recent-title">Recent Files</h3>
                <button className="dash-seeall small" type="button" onClick={() => navigate("/projects")}>
                  See All
                </button>
              </div>

              <div className="dash-recent-list">
                {userProjects.slice(0, 5).map((project) => (
                  <div
                    key={project.id}
                    className="dash-recent-item"
                    role="button"
                    tabIndex={0}
                    onClick={() => openFromProject(project)}
                    onKeyDown={(e) => e.key === "Enter" && openFromProject(project)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="dot" />
                    <div>
                      <div className="dash-recent-name">{project.name}</div>
                      <div className="dash-recent-sub">{(project.scenes || []).length} scenes</div>
                    </div>
                  </div>
                ))}
                {userProjects.length === 0 && (
                  <div style={{ padding: '20px', textAlign: 'center', fontSize: '13px', color: '#666' }}>
                    No recent files
                  </div>
                )}
              </div>
            </aside>
          </div>

          {/* scroll targets */}
          <div style={{ height: 1 }} id="tutorials" />
          <div style={{ height: 1 }} id="settings" />
          <div style={{ height: 1 }} id="about" />
        </section>
      </main>
    </div>
  );
}