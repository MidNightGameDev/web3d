import { getCurrentUser, creditUserByEmail } from './auth.js';

// Backend API helpers

export async function loadProjects() {
  try {
    const res = await fetch('/api/projects');
    if (!res.ok) throw new Error('Failed to fetch projects');
    const data = await res.json();
    return ensureProjectSchema(data);
  } catch (err) {
    console.error(err);
    return [];
  }
}

// Ensure schema is still useful for initial syncs
export function ensureProjectSchema(projects) {
  return (projects || []).map((p) => ({
    status: 'draft',
    objectCount: 0,
    price: 10,
    forSale: false,
    ownerId: '',
    ownerName: '',
    comments: [],
    updatedAt: p.createdAt || new Date().toISOString(),
    ...p,
    scenes: (p.scenes || []).map((s) => ({
      status: 'draft',
      tags: [],
      price: 0,
      likes: 0,
      comments: [],
      objectCount: 0,
      updatedAt: s.createdAt || new Date().toISOString(),
      ...s,
    })),
  }));
}

export async function updateScene(projectId, sceneId, updates) {
  const project = await getProject(projectId);
  if (!project) return null;

  const updatedScenes = (project.scenes || []).map((s) => (s.id === sceneId ? { ...s, ...updates } : s));
  return updateProject(projectId, { scenes: updatedScenes });
}

export async function publishScene(projectId, sceneId) {
  return updateScene(projectId, sceneId, { status: 'published' });
}

export async function publishProject(projectId, price) {
  const user = getCurrentUser();
  const project = await getProject(projectId);
  if (!project) return null;

  const numPrice = Number(price);
  const patch = {
    status: 'published',
    forSale: true,
    price: Number.isFinite(numPrice) && numPrice > 0 ? numPrice : (project.price || 10),
    ownerId: user?.id || project.ownerId || '',
    ownerName: user?.username || project.ownerName || '',
    publishedAt: new Date().toISOString(),
  };

  return updateProject(projectId, patch);
}

export async function unpublishProject(projectId) {
  return updateProject(projectId, { status: 'draft', forSale: false });
}

export async function listProjects() {
  return loadProjects();
}

export async function canCreateProject() {
  const user = getCurrentUser();
  if (!user) return { ok: false, reason: 'NOT_SIGNED_IN' };

  const projects = await listProjects();
  const ownedCount = projects.filter((p) => p.ownerId === user.id).length;

  if (ownedCount < LIMITS.freeProjects) {
    return { ok: true, needsPayment: false, cost: 0, ownedCount };
  }

  const cost = LIMITS.extraProjectCost;
  const credits = user.credits ?? await getCredits(user.email);

  if (credits < cost) {
    return { ok: false, needsPayment: true, cost, ownedCount, reason: 'NOT_ENOUGH_CREDITS' };
  }

  return { ok: true, needsPayment: true, cost, ownedCount };
}

export async function createProjectWithLimit(payload) {
  const check = await canCreateProject();
  if (!check.ok && check.reason === 'NOT_ENOUGH_CREDITS') {
    const err = new Error(`Not enough credits. You need ${check.cost} credits to create a new project.`);
    err.code = check.reason;
    err.meta = check;
    throw err;
  }
  if (!check.ok) {
    const err = new Error('Cannot create project');
    err.code = check.reason || 'LIMIT_REACHED';
    err.meta = check;
    throw err;
  }

  if (check.needsPayment) {
    const user = getCurrentUser();
    const res = await chargeCredits(user.email, check.cost);
    if (!res.ok) {
      throw new Error('Failed to charge credits');
    }
  }

  return createProject(payload);
}

export function cloneProject(project, newOwnerId, newOwnerName) {
  const projectId = crypto.randomUUID();

  return {
    ...project,
    _id: undefined, // remove DB id before creating a new one
    id: projectId,
    ownerId: newOwnerId,
    ownerName: newOwnerName,
    status: 'draft',
    forSale: false,
    price: 10,
    createdAt: new Date().toISOString(),
    publishedAt: null,
    comments: [],
    likes: 0,
    likedBy: [],
    scenes: (project.scenes || []).map(s => ({
      ...s,
      _id: undefined,
      id: crypto.randomUUID(),
      status: 'draft',
      price: 0,
      likes: 0,
      comments: [],
      createdAt: new Date().toISOString()
    }))
  };
}

/**
 * Social Helpers
 */
export async function toggleLike(projectId) {
  const project = await getProject(projectId);
  const user = getCurrentUser();
  if (!user || !project) return null;

  const likedBy = project.likedBy || [];
  const isLiked = likedBy.includes(user.id);
  const newLikedBy = isLiked
    ? likedBy.filter(id => id !== user.id)
    : [...likedBy, user.id];

  return updateProject(projectId, {
    likedBy: newLikedBy,
    likes: newLikedBy.length
  });
}

export async function addComment(projectId, text) {
  const project = await getProject(projectId);
  const user = getCurrentUser();
  if (!user || !text.trim() || !project) return null;

  const newComment = {
    id: crypto.randomUUID(),
    userId: user.id,
    username: user.username,
    text: text.trim(),
    createdAt: new Date().toISOString(),
    replies: []
  };

  return updateProject(projectId, {
    comments: [...(project.comments || []), newComment]
  });
}

export async function addReply(projectId, commentId, text) {
  const project = await getProject(projectId);
  const user = getCurrentUser();
  if (!user || !text.trim() || !project) return null;

  const newReply = {
    id: crypto.randomUUID(),
    userId: user.id,
    username: user.username,
    text: text.trim(),
    createdAt: new Date().toISOString()
  };

  const comments = (project.comments || []).map(c => {
    if (c.id === commentId) {
      return {
        ...c,
        replies: [...(c.replies || []), newReply]
      };
    }
    return c;
  });

  return updateProject(projectId, { comments });
}


// project helpers --------------------------------

export async function getProject(projectId) {
  const projects = await loadProjects();
  return projects.find((p) => p.id === projectId) || null;
}

export async function updateProject(projectId, patch) {
  try {
    const res = await fetch(`/api/projects/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch)
    });
    if (!res.ok) throw new Error('Failed to update project');
    return await res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function createProject({ name, ownerId, ownerName, price = 10 }) {
  const id = crypto.randomUUID();
  const sceneId = crypto.randomUUID();

  const project = {
    id,
    name,
    createdAt: new Date().toISOString(),
    scenes: [
      {
        id: sceneId,
        name: "Main Scene",
        createdAt: new Date().toISOString(),
        status: 'draft',
        objectCount: 0,
        price: 0,
        likes: 0,
        comments: [],
        tags: []
      }
    ],
    status: 'draft',
    objectCount: 0,
    price,
    forSale: false,
    ownerId: ownerId || '',
    ownerName: ownerName || '',
    comments: [],
  };

  try {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project)
    });
    if (!res.ok) throw new Error('Failed to create project');

    // Always return full list so UI logic expecting an array nextProjects still works mostly verbatim (will need adjustment in components though)
    // Actually, components expect new project tree, let's just return the single array or latest full list
    return await listProjects();
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// --- purchase support (buyers / sellers) ---

export async function purchaseProject(projectId) {
  const user = getCurrentUser();
  if (!user) throw new Error('Not signed in');

  const project = await getProject(projectId);
  if (!project || project.status !== 'published' || !project.forSale) {
    throw new Error('Not for sale');
  }

  if (project.ownerId === user.id) {
    throw new Error('You cannot buy your own model');
  }

  if ((user.ownedProjectIds || []).includes(projectId)) {
    return { ok: true, alreadyOwned: true };
  }

  const price = Number(project.price || 0);
  const currentCredits = await getCredits(user.email);
  if (currentCredits < price) {
    throw new Error('Not enough credits');
  }

  // charge buyer wallet
  const res = await chargeCredits(user.email, price);
  if (!res.ok) {
    throw new Error('Not enough credits');
  }

  const nextOwned = [...(user.ownedProjectIds || []), projectId];
  const nextPurchases = [
    ...(user.purchases || []),
    { id: crypto.randomUUID(), projectId, price, at: Date.now(), sellerId: project.ownerId },
  ];

  await fetch(`/api/users/email/${encodeURIComponent(user.email)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ownedProjectIds: nextOwned,
      purchases: nextPurchases,
    })
  });

  // credit seller
  if (project.ownerId) {
    await creditUserByEmail(project.ownerId, price);
  }

  // Clone the project for the buyer
  const cloned = cloneProject(project, user.id, user.username || user.email);
  try {
    await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cloned)
    });
  } catch (err) {
    console.error("Clone failed", err);
  }

  return { ok: true, clonedId: cloned.id };
}

export async function deleteProject(projectId) {
  try {
    const res = await fetch(`/api/projects/${projectId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete project');
    return await listProjects();
  } catch (err) {
    console.error(err);
    return null;
  }
}

// --- Credits / coin system (per user email) ---
export function walletKey(email) {
  return `wallet_${String(email || '').toLowerCase()}`;
}

export async function getCredits(email) {
  try {
    const res = await fetch(`/api/users/${encodeURIComponent(email)}`);
    if (!res.ok) return 100;
    const user = await res.json();
    return user.credits !== undefined ? user.credits : 100;
  } catch {
    return 100;
  }
}

export async function chargeCredits(email, amount) {
  try {
    const now = await getCredits(email);
    if (now < amount) return { ok: false, credits: now };
    const next = now - amount;

    await fetch(`/api/users/email/${encodeURIComponent(email)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credits: next })
    });

    // Update local context if it's us
    const curEmail = localStorage.getItem("auth_user");
    if (curEmail === email) {
      const u = JSON.parse(localStorage.getItem("user_profile") || "{}");
      localStorage.setItem("user_profile", JSON.stringify({ ...u, credits: next }));
      window.dispatchEvent(new Event("authchange"));
    }

    return { ok: true, credits: next };
  } catch {
    return { ok: false, credits: 0 };
  }
}

export async function addCredits(email, amount) {
  return await creditUserByEmail(email, amount);
}

// --- Limits (demo policy) ---
export const LIMITS = {
  freeProjects: 3,
  extraProjectCost: 10, // credits per project over quota
  freeScenes: 20,
  createProjectCost: 0,
  createSceneCost: 0,
};

// Re-export auth functions for convenience
export { getCurrentUser, creditUserByEmail } from './auth.js';
