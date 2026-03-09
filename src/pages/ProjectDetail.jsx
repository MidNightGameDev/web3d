import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import NeonButton from "../components/NeonButton.jsx";
import { getCurrentUser } from "../lib/auth.js";
import { getProject, updateProject } from "../lib/store.js";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);

  const fetchProject = async () => {
    const p = await getProject(id);
    setProject(p);
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  if (!project) {
    return (
      <div className="app-layout">
        <Header />
        <main className="app-content">
          <div className="empty-state">
            <h2>Project not found</h2>
            <NeonButton variant="primary" onClick={() => navigate("/projects")}>
              Back to Projects
            </NeonButton>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleCreateScene = async () => {
    const name = prompt("Scene name:");
    if (!name) return;

    const scene = { id: uuidv4(), name, createdAt: new Date().toISOString() };
    const updated = await updateProject(id, {
      scenes: [...(project.scenes || []), scene]
    });
    if (updated) setProject(updated);
  };

  const handleDeleteScene = async (sceneId) => {
    if (!confirm("Delete this scene?")) return;

    const updated = await updateProject(id, {
      scenes: (project.scenes || []).filter((s) => s.id !== sceneId)
    });
    if (updated) setProject(updated);
  };

  const handlePublishScene = async (sceneId) => {
    const scene = project.scenes?.find((s) => s.id === sceneId);
    if (!scene) return;

    if ((scene.objectCount ?? 0) === 0) {
      alert("❌ Cannot publish: Scene has no objects");
      return;
    }

    const priceStr = prompt('ตั้งราคาขาย (credits):', String(scene.price || 10));
    if (priceStr === null) return;
    const price = Number(priceStr);
    if (!Number.isFinite(price) || price <= 0) {
      alert('กรุณาใส่ราคาที่ถูกต้อง (มากกว่า 0)');
      return;
    }

    const user = getCurrentUser();

    // We already have publishProject at project level, but for individual scenes they have their own price in schema?
    // Wait, the UI publishes the *scene* to the market here? The `store.js` handled it at the project level predominantly, 
    // let's follow what the code was doing: changing project status too.
    const updated = await updateProject(id, {
      status: 'published',
      forSale: true,
      ownerId: user?.id || project.ownerId || '',
      ownerName: user?.username || project.ownerName || '',
      scenes: (project.scenes || []).map((s) =>
        s.id === sceneId
          ? {
            ...s, status: 'published', price, forSale: true,
            ownerId: user?.id || '', ownerName: user?.username || ''
          }
          : s
      ),
    });

    if (updated) {
      setProject(updated);
      alert(`✅ Published "${scene.name}" ราคา ${price} credits`);
    }
  };

  const handleUnpublishScene = async (sceneId) => {
    const updated = await updateProject(id, {
      scenes: (project.scenes || []).map((s) =>
        s.id === sceneId ? { ...s, status: 'draft', forSale: false } : s
      )
    });
    if (updated) setProject(updated);
  };

  return (
    <div className="app-layout">
      <Header />
      <main className="app-content">
        <div className="detail-header fade-in">
          <div>
            <h1 style={{ marginTop: 8 }}>{project.name}</h1>
          </div>

          <NeonButton variant="primary" onClick={handleCreateScene}>
            ＋ New Scene
          </NeonButton>
        </div>

        {!project.scenes || project.scenes.length === 0 ? (
          <div className="empty-state fade-in">
            <h2>No scenes</h2>
            <p>Create a scene to start building 3D models.</p>
          </div>
        ) : (
          <div className="scenes-grid">
            {(project.scenes || []).map((scene) => {
              const publishDisabled = (scene.objectCount ?? 0) === 0;
              const isPublished = scene.status === 'published';
              return (
                <div key={scene.id} className="scene-card fade-in">
                  <h3>{scene.name}</h3>
                  <p style={{ fontSize: "0.85rem", opacity: 0.7 }}>
                    Objects: {scene.objectCount ?? 0}
                    {isPublished && <span style={{ marginLeft: 8, color: '#0f0' }}>● Published — {scene.price ?? 0} cr</span>}
                  </p>
                  <div className="scene-card-actions">
                    <NeonButton
                      variant="primary"
                      size="small"
                      onClick={() => navigate(`/editor/${id}/${scene.id}`)}
                    >
                      Open Editor
                    </NeonButton>

                    {isPublished ? (
                      <NeonButton
                        variant="secondary"
                        size="small"
                        onClick={() => handleUnpublishScene(scene.id)}
                      >
                        ⬇ Unpublish
                      </NeonButton>
                    ) : (
                      <NeonButton
                        variant={publishDisabled ? "secondary" : "primary"}
                        size="small"
                        disabled={publishDisabled}
                        onClick={() => handlePublishScene(scene.id)}
                        title={publishDisabled ? "Add objects to publish" : "Publish to Marketplace"}
                      >
                        🚀 Publish to Market
                      </NeonButton>
                    )}

                    <NeonButton
                      variant="danger"
                      size="small"
                      onClick={() => handleDeleteScene(scene.id)}
                    >
                      Delete
                    </NeonButton>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
