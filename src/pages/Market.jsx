import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ensureProjectSchema, listProjects as loadProjects, getCredits, purchaseProject, getCurrentUser, toggleLike, addComment, addReply } from '../lib/store.js';
import { clearSession } from '../lib/auth.js';

const user = getCurrentUser();



function uid() {
  return (crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`).toString();
}

export default function Market() {
  const navigate = useNavigate();
  const email = localStorage.getItem('auth_user') || 'builder@studio.io';

  const [projects, setProjects] = useState([]);
  const [q, setQ] = useState('');
  const [activeCommentProjectId, setActiveCommentProjectId] = useState(null);

  const fetchProjects = async () => {
    const list = await loadProjects();
    setProjects(list);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const [credits, setCredits] = useState(0);

  useEffect(() => {
    const fetchCredits = async () => {
      const c = await getCredits(user?.email || email);
      setCredits(c);
    };
    fetchCredits();
  }, [user?.email, email]);

  // Show published projects with forSale=true
  const publishedProjects = useMemo(() => {
    return projects
      .filter((p) => p.status === 'published' && p.forSale)
      .filter((p) => {
        const s = q.trim().toLowerCase();
        if (!s) return true;
        const hay = [
          p.name, p.ownerName, ...(p.tags || []),
          ...(p.scenes || []).map(sc => sc.name),
        ].filter(Boolean).join(' ').toLowerCase();
        return hay.includes(s);
      })
      .sort((a, b) => String(b.publishedAt || b.createdAt).localeCompare(String(a.publishedAt || a.createdAt)));
  }, [projects, q]);

  const handleLike = async (projectId) => {
    const updated = await toggleLike(projectId);
    if (updated) {
      setProjects((prev) => prev.map((p) => (p.id === projectId ? updated : p)));
    }
  };

  const handleBuy = async (projectId) => {
    const proj = projects.find(p => p.id === projectId);
    if (!proj) return;
    const price = Number(proj.price || 0);
    if (!Number.isFinite(price) || price <= 0) {
      alert('โมเดลนี้ไม่ได้ตั้งราคาไว้');
      return;
    }
    if (proj.ownerId === user?.id) {
      alert('คุณไม่สามารถซื้อโมเดลของตัวเองได้');
      return;
    }
    if (!confirm(`ยืนยันซื้อ "${proj.name}" ราคา ${price} credits ?`)) return;

    try {
      const res = await purchaseProject(projectId);
      if (res.alreadyOwned) {
        alert('คุณเป็นเจ้าของโมเดลนี้อยู่แล้ว');
        return;
      }
      await fetchProjects();
      const newCredits = await getCredits(user?.email || email);
      setCredits(newCredits);
      alert(`ซื้อสำเร็จ! เหลือเครดิต ${newCredits}`);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddComment = async (projectId, text) => {
    const updated = await addComment(projectId, text);
    if (updated) {
      setProjects((prev) => prev.map((p) => (p.id === projectId ? updated : p)));
    }
  };

  const handleAddReply = async (projectId, commentId, text) => {
    const updated = await addReply(projectId, commentId, text);
    if (updated) {
      setProjects((prev) => prev.map((p) => (p.id === projectId ? updated : p)));
    }
  };

  const openPreview = (project) => {
    if (!project.scenes || project.scenes.length === 0) {
      alert("โปรเจกต์นี้ไม่มี Scene สำหรับแสดงผล");
      return;
    }
    navigate(`/preview/${project.id}/${project.scenes[0].id}`);
  };

  const handleLogout = () => {
    clearSession();
    navigate('/welcome');
  };

  return (
    <div className="m-page">
      <div className="m-bg" aria-hidden="true" />
      <div className="m-grid" aria-hidden="true" />
      <div className="m-orb m-orb--a" aria-hidden="true" />
      <div className="m-orb m-orb--b" aria-hidden="true" />

      <header className="m-topbar">
        <div className="m-brand">
          <span className="m-brand__logo">⬡</span>
          <span className="m-brand__text">3D Model Builder</span>
          <span className="m-pill">Market</span>
        </div>

        <div className="m-topbar__right">
          <div className="m-credits">
            <span className="m-credits__dot" />
            Credits: <b>{credits ?? 0}</b>
          </div>

          <button className="m-btn m-btn--ghost" onClick={() => navigate("/")}>
            Home
          </button>
          <button className="m-btn m-btn--ghost" onClick={() => navigate("/projects")}>
            Projects
          </button>
          <button className="m-btn m-btn--danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="m-wrap">
        {/* Hero */}
        <section className="m-hero">
          <div className="m-hero__left">
            <h1 className="m-title">
              Marketplace <span className="m-title__neon">Neon</span>
            </h1>



            <p className="m-sub">
              <b>Publish</b> = นำโมเดลไปแสดงในตลาด (Market) ให้คนอื่นเห็นและซื้อได้
              <br />
              ระบบค้นหาจะค้นจาก: <b>ชื่อโมเดล</b>, <b>tag</b>, และ <b>ชื่อผู้สร้าง/โปรเจกต์</b>
            </p>

            <div className="m-info">
              <div className="m-info__row">
                <span className="m-bullet" /> Published = แสดงในตลาดได้ทันที
              </div>
              <div className="m-info__row">
                <span className="m-bullet" /> Draft = ยังไม่แสดงในตลาด
              </div>
              <div className="m-info__row">
                <span className="m-bullet" /> ซื้อแล้วจะขึ้นสถานะ <b>Owned</b>
              </div>
            </div>
          </div>

          {/* Sidebar (filters) */}
          <aside className="m-side">
            <div className="m-side__card">
              <div className="m-search">
                <span className="m-search__icon">⌕</span>
                <input
                  className="m-search__input"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="ค้นหา: ชื่อโมเดล, tag, ผู้สร้าง"
                />
              </div>



              <div className="m-side__title" style={{ marginTop: 14 }}>
                Quick tags
              </div>
              <div className="m-tags">
                {["chair", "lowpoly", "pheeraphong"].map((t) => (
                  <button key={t} className="m-tag" onClick={() => setQ(t)}>
                    {t}
                  </button>
                ))}
              </div>

              <div className="m-miniNote">
                Tip: คลิก tag เพื่อเติมคำค้นหาเร็ว ๆ
              </div>
            </div>
          </aside>
        </section>

        {/* Grid */}
        <section className="m-section">
          <div className="m-section__head">
            <h2 className="m-h2">Published Models</h2>
            <div className="m-muted">
              Showing <b>{publishedProjects.length}</b> items
            </div>
          </div>

          {publishedProjects.length === 0 ? (
            <div className="m-empty">
              <div className="m-empty__icon">🛍️</div>
              <div className="m-empty__title">No models for sale</div>
              <div className="m-empty__sub">
                ยังไม่มีโมเดลที่ Publish ขาย — ลอง Publish โปรเจกต์ของคุณดู!
              </div>
            </div>
          ) : (
            <div className="m-cards">
              {publishedProjects.map((item) => {
                const price = item.price ?? 0;
                const likes = item.likes ?? 0;
                const sceneCount = (item.scenes || []).length;
                const isOwner = item.ownerId === user?.id;
                const alreadyOwned = (user?.ownedProjectIds || []).includes(item.id);

                return (
                  <div key={item.id} className="m-card">
                    {/* preview */}
                    <div className="m-card__preview">
                      <div className="m-preview__grid" aria-hidden="true" />
                      <div className="m-preview__badgeRow">
                        <span className="m-badge is-pub">Published</span>
                        <span className="m-badge is-soft">{sceneCount} scenes</span>
                      </div>

                      <div className="m-preview__title">{item.name || "Untitled Project"}</div>
                      <div className="m-preview__meta">
                        <span>Seller: {item.ownerName || "-"}</span>
                      </div>
                    </div>

                    {/* content */}
                    <div className="m-card__body">
                      <div className="m-row">
                        <div>
                          <div className="m-priceLabel">Price</div>
                          <div className="m-price">{price} credits</div>
                        </div>

                        <div className="m-tagsInline">
                          {(item.tags || []).slice(0, 3).map((t) => (
                            <span key={t} className="m-tagPill">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="m-actions">
                        <button className="m-btn m-btn--ghost" onClick={() => openPreview(item)}>
                          👁 Preview
                        </button>

                        <button
                          className={`m-btn m-btn--ghost ${item.likedBy?.includes(user?.id) ? 'm-btn--active' : ''}`}
                          onClick={() => handleLike(item.id)}
                        >
                          ♥ {item.likedBy?.includes(user?.id) ? 'Liked' : 'Like'} <span className="m-count">{likes}</span>
                        </button>

                        <button className="m-btn m-btn--ghost" onClick={() => setActiveCommentProjectId(item.id)}>
                          💬 Comment <span className="m-count">{(item.comments || []).length}</span>
                        </button>

                        {isOwner ? (
                          <button className="m-btn m-btn--disabled" disabled title="โมเดลของคุณ">
                            Your Model
                          </button>
                        ) : alreadyOwned ? (
                          <button className="m-btn m-btn--disabled" disabled title="ซื้อแล้ว">
                            ✓ Owned
                          </button>
                        ) : (
                          <button
                            className="m-btn m-btn--primary"
                            onClick={() => handleBuy(item.id)}
                            title="Buy model"
                          >
                            Buy {price} cr
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="m-card__glow" aria-hidden="true" />
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <footer className="m-footer">
          <span>© 2026 3D Model Builder — Cyberpunk Edition</span>
          <button className="m-link" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            Back to top ↑
          </button>
        </footer>
      </main>

      {/* Comment Modal */}
      {activeCommentProjectId && (() => {
        const item = projects.find(p => p.id === activeCommentProjectId);
        if (!item) return null;
        return (
          <div className="m-modal-overlay" onClick={() => setActiveCommentProjectId(null)}>
            <div className="m-modal-content" onClick={e => e.stopPropagation()}>
              <div className="m-modal-header">
                <h3>Comments for {item.name || "Untitled Project"}</h3>
                <button className="m-modal-close" onClick={() => setActiveCommentProjectId(null)}>✕</button>
              </div>
              <div className="m-modal-body">
                <div className="m-social" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
                  <div className="m-comment-input-row">
                    <input
                      className="m-comment-input"
                      placeholder="Write a comment..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.target.value.trim()) {
                          handleAddComment(item.id, e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                  </div>
                  <div className="m-comment-list">
                    {(item.comments || []).length === 0 && (
                      <div className="m-muted" style={{ textAlign: 'center', marginTop: 20 }}>No comments yet. Be the first!</div>
                    )}
                    {(item.comments || []).slice().reverse().map(comment => (
                      <div key={comment.id} className="m-comment-item">
                        <div className="m-comment-bubble">
                          <div className="m-comment-user">{comment.username || 'User'}</div>
                          <div className="m-comment-text">{comment.text}</div>
                        </div>
                        <div className="m-comment-actions">
                          <span className="m-comment-time">{new Date(comment.createdAt).toLocaleDateString()}</span>
                          <button className="m-reply-btn" onClick={() => {
                            const reply = prompt(`Reply to ${comment.username}:`);
                            if (reply) handleAddReply(item.id, comment.id, reply);
                          }}>Reply</button>
                        </div>

                        {/* Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="m-reply-list">
                            {comment.replies.map(reply => (
                              <div key={reply.id} className="m-reply-item">
                                <div className="m-comment-bubble">
                                  <div className="m-comment-user">{reply.username || 'User'}</div>
                                  <div className="m-comment-text">{reply.text}</div>
                                </div>
                                <div className="m-comment-actions">
                                  <span className="m-comment-time">{new Date(reply.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
