import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import heroBanner from "../assets/ChatGPT Image Feb 27, 2026, 01_50_30 PM.png";
import {
  validateEmail,
  validateUsername,
  validatePassword,
  passwordChecklist,
  registerUser,
  setSession,
} from "../lib/auth.js";

export default function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});

  const pwError = useMemo(() => validatePassword(password), [password]);
  const pwList = useMemo(() => passwordChecklist(password), [password]);

  // derived helpers for UI
  const confirmTouched = confirm.length > 0;
  const confirmOk = password === confirm;
  const canSubmit =
    validateEmail(email) &&
    !validateUsername(username) && // validator returns string on error
    !pwError &&
    confirmOk;

  // field-level validation run on submit
  const validate = () => {
    const next = {};
    if (!email || !validateEmail(email)) next.email = "กรุณากรอกอีเมลที่ถูกต้อง";
    const uErr = validateUsername(username);
    if (uErr) next.username = uErr;
    if (pwError) next.password = pwError;
    if (!confirm) next.confirm = "กรุณายืนยันรหัสผ่าน";
    if (password && confirm && password !== confirm) next.confirm = "รหัสผ่านไม่ตรงกัน";
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const eVal = String(email).trim();
    const uVal = String(username).trim();

    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) return;

    const res = await registerUser({ email: eVal, username: uVal, password, confirm });
    if (!res.ok) {
      setError(res.message || "Sign up failed.");
      return;
    }

    setSession(res.user);
    navigate("/", { replace: true });
  };

  // clear errors as user types correct data
  React.useEffect(() => {
    if (errors.confirm && password && confirm && password === confirm) {
      setErrors((prev) => {
        const { confirm, ...rest } = prev;
        return rest;
      });
    }
    // generic email/username/password cleanup
    if (errors.email && validateEmail(email)) {
      setErrors((prev) => {
        const { email, ...rest } = prev;
        return rest;
      });
    }
    if (errors.username) {
      const uErr = validateUsername(username);
      if (!uErr) {
        setErrors((prev) => {
          const { username, ...rest } = prev;
          return rest;
        });
      }
    }
    if (errors.password && !pwError) {
      setErrors((prev) => {
        const { password, ...rest } = prev;
        return rest;
      });
    }
  }, [password, confirm, email, username, pwError, errors]);

  return (
    <div className="login-page login-page--bg" style={{ backgroundImage: `url(${heroBanner})` }}>
      <div className="login-bg-overlay" />


      <div className="login-card login-card--glow">
        <h1 className="login-title">Create Account</h1>
        <p className="login-subtitle">Start building 3D models in minutes</p>

        {error && <div className="login-error">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label className="login-label">Email</label>
            <input
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@studio.io"
              type="email"
              required
            />
          </div>

          <div className="login-field">
            <label className="login-label">Username</label>
            <input
              className="login-input"
              value={username}
              onChange={(e) => {
                const v = e.target.value;
                setUsername(v);
                // realtime warn
                const uErr = validateUsername(v);
                if (uErr) {
                  setErrors((prev) => ({ ...prev, username: uErr }));
                } else {
                  setErrors((prev) => {
                    const { username, ...rest } = prev;
                    return rest;
                  });
                }
              }}
              onBlur={() => {
                const uErr = validateUsername(username);
                if (uErr) {
                  setErrors((prev) => ({ ...prev, username: uErr }));
                }
              }}
              placeholder="yourname_01"
              type="text"
              required
            />
            <div className="hint-text">Allowed: a–z, A–Z, 0–9, _ and . (4–20)</div>
            {errors.username && (
              <div className="hint-text" style={{ color: "salmon" }}>
                {errors.username}
              </div>
            )}
          </div>

          <div className="login-field">
            <label className="login-label">Password</label>
            <input
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              type="password"
              required
            />
            <div className="hint-text">ใช้ 8 ตัวอักษรขึ้นไป พร้อมตัวพิมพ์ใหญ่/เล็ก และตัวเลข</div>
            {password.length > 0 && (
              <ul className="password-checklist" style={{ paddingLeft: 20, margin: 0 }}>
                {pwList.map((item) => (
                  <li
                    key={item.key}
                    style={{ color: item.ok ? "lightgreen" : "salmon" }}
                  >
                    {item.ok ? "✔" : "✘"} {item.label}
                  </li>
                ))}
              </ul>
            )}
            {errors.password && (
              <div className="hint-text" style={{ color: "salmon" }}>
                {errors.password}
              </div>
            )}
          </div>

          <div className="login-field">
            <label className="login-label">Confirm Password</label>
            <input
              className="login-input"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              type="password"
              required
            />
            {/* field-level error goes under the input */}
            {errors.confirm && (
              <div className="hint-text" style={{ color: "salmon" }}>
                {errors.confirm}
              </div>
            )}
            {/* optional live-match hints (not considered an error until submit) */}
            {confirmTouched && !confirmOk && !errors.confirm && (
              <div className="hint-text" style={{ color: "salmon" }}>
                Passwords do not match
              </div>
            )}
            {confirmTouched && confirmOk && (
              <div className="hint-text" style={{ color: "lightgreen" }}>
                Passwords match ✓
              </div>
            )}
          </div>

          <button
            className="login-submit-btn"
            type="submit"
            disabled={!canSubmit}
            style={!canSubmit ? { opacity: 0.7, cursor: "not-allowed" } : undefined}
          >
            Create Account
          </button>
        </form>

        <div className="auth-alt">
          <button type="button" className="auth-link" onClick={() => navigate("/login")}>
            Already have an account? <span>Sign in</span>
          </button>
        </div>
      </div>
    </div>
  );
}
