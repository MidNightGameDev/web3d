import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createProjectWithLimit, canCreateProject, publishProject, unpublishProject, loadMyProjects, deleteProject, updateProject } from "../lib/store.js";
import { getCurrentUser, clearSession } from "../lib/auth.js";

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [credits, setCredits] = useState(getCurrentUser()?.credits ?? 0);

  const fetchProjects = async () => {
    const user = getCurrentUser();
    const list = await loadMyProjects(user?.id);
    setProjects(list);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async () => {
    const name = prompt("Project name:");
    if (!name) return;

    const check = await canCreateProject();
    if (!check.ok && check.reason === 'NOT_ENOUGH_CREDITS') {
      alert(`Limit reached. You need ${check.cost} credits to create a new project. Current credits: ${credits}`);
      return;
    } else if (!check.ok) {
      alert("Limit reached or another error occurred.");
      return;
    }

    if (check.needsPayment) {
      if (!confirm(`You have reached the free limit. Creating a new project costs ${check.cost} credits. Proceed?`)) {
        return;
      }
    }

    try {
      await createProjectWithLimit({
        name,
        ownerId: getCurrentUser()?.id,
        ownerName: getCurrentUser()?.username,
        price: 10,
      });
      // Reload only user's own projects
      const user = getCurrentUser();
      const myProjects = await loadMyProjects(user?.id);
      setProjects(myProjects);
      setCredits(user?.credits ?? 0);

      // Navigate to the editor for the newly created project (first in list)
      const newProject = myProjects[0];
      if (newProject && newProject.scenes && newProject.scenes.length > 0) {
        navigate(`/editor/${newProject.id}/${newProject.scenes[0].id}`);
      }
    } catch (err) {
      alert(err?.message || "Create project failed");
    }
  };

  const handleDelete = async (project) => {
    if (!confirm('Delete this project?')) return;
    await deleteProject(project.id);
    // Reload only user's own projects after delete
    const user = getCurrentUser();
    const myProjects = await loadMyProjects(user?.id);
    setProjects(myProjects);
  };

  const handleOpen = (project) => {
    if (project.scenes && project.scenes.length > 0) {
      navigate(`/editor/${project.id}/${project.scenes[0].id}`);
    } else {
      // Fallback in case of unexpected data structure
      navigate(`/projects/${project.id}`);
    }
  };

  const handleDetails = (project) => navigate(`/projects/${project.id}`);

  const handleRename = async (project) => {
    const newName = prompt('Rename project:', project.name);
    if (!newName || newName === project.name) return;
    const updated = await updateProject(project.id, { name: newName });
    if (updated) {
      setProjects((prev) => prev.map((p) => (p.id === project.id ? updated : p)));
    }
  };

  const handlePublish = async (project) => {
    const priceStr = prompt('นำโมเดลเข้าสู่ตลาด (Market)\nตั้งราคาขาย (credits):', String(project.price || 10));
    if (priceStr === null) return; // cancelled
    const price = Number(priceStr);
    if (!Number.isFinite(price) || price <= 0) {
      alert('กรุณาใส่ราคาที่ถูกต้อง (มากกว่า 0)');
      return;
    }
    const updated = await publishProject(project.id, price);
    if (updated) {
      setProjects((prev) => prev.map((p) => (p.id === project.id ? updated : p)));
      alert(`✅ Published "${project.name}" ราคา ${price} credits`);
    }
  };

  const handleUnpublish = async (project) => {
    if (!confirm(`ถอน "${project.name}" ออกจาก Market?`)) return;
    const updated = await unpublishProject(project.id);
    if (updated) {
      setProjects((prev) => prev.map((p) => (p.id === project.id ? updated : p)));
    }
  };

  const handleLogout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  const filteredProjects = (projects || []).filter((p) =>
    (p.name || "").toLowerCase().includes((search || "").toLowerCase())
  );

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

          <button className="p-btn p-btn--ghost" onClick={() => navigate("/market")}>
            Market
          </button>

          <button className="p-btn p-btn--danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="p-wrap">


        {/* hero */}
        <section className="p-hero">
          <div className="p-hero__left">
            <h1 className="p-title">
              My Projects <span className="p-title__neon">Workspace</span>
            </h1>

            <p className="p-sub">
              Create → Edit → Save → Publish → Sell in Market
              <br />
              ใช้ Search เพื่อหาโปรเจกต์เร็วขึ้น และตรวจ Credits ได้ที่แถบด้านขวา
            </p>

            <div className="p-kpis">
              <div className="p-kpi">
                <div className="p-kpi__value">{(projects || []).length}</div>
                <div className="p-kpi__label">Total Projects</div>
              </div>
              <div className="p-kpi">
                <div className="p-kpi__value">{credits ?? 0}</div>
                <div className="p-kpi__label">Credits</div>
              </div>
              <div className="p-kpi">
                <div className="p-kpi__value">
                  {(projects || []).filter((p) => p.status === "published").length}
                </div>
                <div className="p-kpi__label">Published</div>
              </div>
            </div>
          </div>

          <div className="p-hero__right">
            <div className="p-actions">
              <div className="p-search">
                <span className="p-search__icon">⌕</span>
                <input
                  className="p-search__input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search projects by name..."
                />
              </div>

              <button className="p-btn p-btn--primary" onClick={handleCreateProject}>
                <span className="p-btn__spark" aria-hidden="true" />
                + New Project
              </button>
            </div>

            <div className="p-tipcard">
              <div className="p-tipcard__title">Quick tips</div>
              <ul className="p-tiplist">
                <li>
                  <span className="p-bullet" /> Click <b>Open Editor</b> to edit the model
                </li>
                <li>
                  <span className="p-bullet" /> Use <b>Save</b> then <b>Publish to Market</b> to sell your model
                </li>
                <li>
                  <span className="p-bullet" /> If limit reached → pay credits to create more
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* projects list */}
        <section className="p-section">
          <div className="p-section__head">
            <h2 className="p-h2">Your projects</h2>
            <div className="p-muted">
              Showing <b>{(filteredProjects || []).length}</b> items
            </div>
          </div>

          {(filteredProjects || []).length === 0 ? (
            <div className="p-empty">
              <div className="p-empty__icon">🧊</div>
              <div className="p-empty__title">No projects found</div>
              <div className="p-empty__sub">Create a new project to start building 3D scenes.</div>
              <button className="p-btn p-btn--primary" onClick={handleCreateProject}>
                + Create first project
              </button>
            </div>
          ) : (
            <div className="p-gridcards">
              {(filteredProjects || []).map((p) => (
                <div key={p.id} className="p-card">
                  <div className="p-card__top">
                    <div>
                      <div className="p-card__title">{p.name || "Untitled Project"}</div>
                      <div className="p-card__meta">
                        <span className={`p-badge ${p.status === "published" ? "is-pub" : "is-draft"}`}>
                          {p.status === "published" ? "Published" : "Draft"}
                        </span>
                        <span className="p-dot">•</span>
                        <span>{p.scenes?.length ?? 0} scenes</span>
                      </div>
                    </div>

                    <div className="p-card__price">
                      <div className="p-card__priceLabel">Price</div>
                      <div className="p-card__priceVal">{p.price ?? 0} cr</div>
                    </div>
                  </div>

                  <div className="p-card__actions">
                    <button className="p-btn p-btn--primary" onClick={() => handleOpen(p)}>
                      Open Editor
                    </button>
                    <button className="p-btn p-btn--ghost" onClick={() => handleDetails(p)}>
                      Details
                    </button>
                    <button className="p-btn p-btn--ghost" onClick={() => handleRename(p)}>
                      Rename
                    </button>
                    {p.status === 'published' ? (
                      <button className="p-btn p-btn--ghost" onClick={() => handleUnpublish(p)}>
                        ⬇ Unpublish
                      </button>
                    ) : (
                      <button className="p-btn p-btn--primary" onClick={() => handlePublish(p)}>
                        🚀 Publish to Market
                      </button>
                    )}
                    <button className="p-btn p-btn--danger" onClick={() => handleDelete(p)}>
                      Delete
                    </button>
                  </div>

                  <div className="p-card__glow" aria-hidden="true" />
                </div>
              ))}
            </div>
          )}
        </section>

        <footer className="p-footer">
          <span>© 2026 3D Model Builder — Cyberpunk Edition</span>
          <button className="p-link" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            Back to top ↑
          </button>
        </footer>
      </main>
    </div>
  );
}
