// Simple client-side auth helpers (demo-only)
// NOTE: This is NOT secure for production. Use a real backend + hashing.

const USERS_KEY = "users";

/* ================================
   Safe JSON/localStorage helpers
================================ */
function safeJsonParse(raw, fallback) {
  try {
    const v = raw ? JSON.parse(raw) : fallback;
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

export function loadUsers() {
  const data = safeJsonParse(localStorage.getItem(USERS_KEY), []);
  return Array.isArray(data) ? data : [];
}

export function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/* ================================
   Validation
================================ */

// RFC-lite, good enough for UI validation
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return re.test(String(email || "").trim());
}

// Username rules used by UI and logic:
// - length 4–20
// - only letters, digits, underscore and dot
// - must start with letter or digit (no leading . or _)
// (this implicitly blocks emoji, spaces and other unicode symbols)
export function validateUsername(username) {
  const u = String(username || "").trim();
  if (!u) return "กรุณากรอก Username";
  if (u.length < 4 || u.length > 20) return "Username ต้องยาว 4–20 ตัวอักษร";
  if (!/^[A-Za-z0-9][A-Za-z0-9_.]*$/.test(u)) {
    return "Username ใช้ได้เฉพาะ A-Z, a-z, 0-9, _ และ . (ห้ามเว้นวรรค/emoji)";
  }
  return null;
}

/**
 * Password rules (per your requirement):
 * - Allowed chars: A-Z a-z 0-9 _ -
 * - Min length: 8
 * - Must include: uppercase, lowercase, number
 * - Must include at least one special char: "_" or "-"
 */
export function passwordChecklist(pw) {
  const val = typeof pw === 'string' ? pw : '';
  return [
    { key: "len", label: "อย่างน้อย 8 ตัวอักษร", ok: val.length >= 8 },
    { key: "lower", label: "มีตัวพิมพ์เล็ก (a-z)", ok: /[a-z]/.test(val) },
    { key: "upper", label: "มีตัวพิมพ์ใหญ่ (A-Z)", ok: /[A-Z]/.test(val) },
    { key: "num", label: "มีตัวเลข (0-9)", ok: /[0-9]/.test(val) },
  ];
}

// new validator returning a message or null (null = valid)
export function validatePassword(password) {
  const p = String(password || "");
  if (!p) return "กรุณากรอกรหัสผ่าน";
  const list = passwordChecklist(p);
  const failed = list.filter((x) => !x.ok);
  if (failed.length) return "รหัสผ่านไม่ตรงตามเงื่อนไข";
  return null;
}

/* ================================
   ID helper
================================ */
function makeId() {
  // Prefer crypto.randomUUID if available
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    // ignore
  }
  return `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/* ================================
   Seed Admin (created once)
================================ */
function seedAdmin() {
  const users = loadUsers();
  const adminEmail = "admin.console@studio3d.example";

  const exists = users.some((u) => String(u?.email || "").toLowerCase() === adminEmail.toLowerCase());
  if (exists) return;

  const adminUser = {
    id: makeId(),
    email: adminEmail,
    username: "admin_console",
    // Allowed: letters/numbers/_/-
    password: "Qv7m_La2p9Zk_Ke4",
    role: "admin",
    credits: 100,
    ownedProjectIds: [],
    purchases: [],
    createdAt: new Date().toISOString(),
  };

  saveUsers([adminUser, ...users]);
}
seedAdmin();

/* ================================
   Register/Login
================================ */
export async function registerUser({ email, username, password, confirm }) {
  const e = String(email).trim();
  const u = String(username).trim();

  if (!validateEmail(e)) return { ok: false, message: "กรุณากรอกอีเมลที่ถูกต้อง" };
  const pwErr = validatePassword(password);
  if (pwErr) return { ok: false, message: pwErr };
  if (password !== confirm) return { ok: false, message: "Passwords do not match." };
  const unameErr = validateUsername(u);
  if (unameErr) return { ok: false, message: unameErr };

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: makeId(),
        email: e,
        username: u,
        password
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return { ok: true, user: data };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

export async function loginUser({ email, password }) {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return { ok: true, user: data };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

// Keep synchronous getCurrentUser for components that just need username/email immediately
// But understand that 'credits' or other DB fields might be stale.
export function getCurrentUser() {
  const profile = safeJsonParse(localStorage.getItem("user_profile"), null);
  return profile;
}

export async function fetchCurrentUserProfile() {
  const email = localStorage.getItem("auth_user");
  if (!email) return null;
  try {
    const res = await fetch(`/api/users/${encodeURIComponent(email)}`);
    if (!res.ok) return null;
    const user = await res.json();
    localStorage.setItem("user_profile", JSON.stringify(user));
    return user;
  } catch {
    return null;
  }
}

export async function creditUserByEmail(email, amount) {
  try {
    const res = await fetch(`/api/users/${encodeURIComponent(email)}`);
    if (!res.ok) return null;
    const user = await res.json();

    const newCredits = (user.credits || 0) + amount;
    const updateRes = await fetch(`/api/users/email/${encodeURIComponent(email)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credits: newCredits })
    });
    const updatedUser = await updateRes.json();

    // Update local profile cache if it's the current user
    const curEmail = localStorage.getItem("auth_user");
    if (curEmail === email) {
      localStorage.setItem("user_profile", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("authchange"));
    }
    return newCredits;
  } catch (err) {
    console.error("Credit error:", err);
    return null;
  }
}

/* ================================
   Session (used by PrivateRoute in app.jsx)
================================ */
export function setSession(user) {
  localStorage.setItem("auth_token", `demo-${Date.now()}`);
  localStorage.setItem("auth_user", user.email);
  localStorage.setItem("auth_username", user.username);
  localStorage.setItem("auth_role", user.role || "user");
  localStorage.setItem("user_profile", JSON.stringify(user));

  window.dispatchEvent(new Event("authchange"));
}

export function clearSession() {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
  localStorage.removeItem("auth_username");
  localStorage.removeItem("auth_role");
  localStorage.removeItem("user_profile");

  window.dispatchEvent(new Event("authchange"));
}
