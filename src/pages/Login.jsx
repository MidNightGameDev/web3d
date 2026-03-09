import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import heroBanner from "../assets/ChatGPT Image Feb 27, 2026, 01_50_30 PM.png";
import { loginUser, setSession, validateEmail, passwordChecklist, validatePassword } from "../lib/auth.js";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const pwError = useMemo(() => validatePassword(password), [password]);
  const pwList = useMemo(() => passwordChecklist(password), [password]);

  useEffect(() => {
    const saved = localStorage.getItem("remembered_email");
    if (saved) {
      setEmail(saved);
      setRemember(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setError("");

    const eVal = String(email).trim();

    if (!validateEmail(eVal)) {
      setError("Please enter a valid email.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    const res = await loginUser({ email: eVal, password });
    if (!res.ok) {
      setError(res.message || "Sign in failed.");
      return;
    }

    setSession(res.user);

    if (remember) localStorage.setItem("remembered_email", eVal);
    else localStorage.removeItem("remembered_email");

    navigate("/", { replace: true });
  };

  return (
    <div className="login-page login-page--bg" style={{ backgroundImage: `url(${heroBanner})` }}>
      <div className="login-bg-overlay" />


      <div className="login-card login-card--glow">
        <h1 className="login-title">3D Model Builder</h1>
        <p className="login-subtitle">Sign in to your workspace</p>

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
            <label className="login-label">Password</label>
            <input
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              type="password"
              required
            />
            {(password.length > 0 || submitted) && (
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
            {pwError && submitted && (
              <div className="hint-text" style={{ color: "salmon" }}>
                {pwError}
              </div>
            )}
          </div>

          <label className="login-remember">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            <span>Remember me</span>
          </label>

          <button className="login-submit-btn" type="submit">
            Sign In
          </button>
        </form>

        <div className="auth-alt">
          <button type="button" className="auth-link" onClick={() => navigate("/register")}>
            Don’t have an account? <span>Sign up</span>
          </button>
        </div>
      </div>
    </div>
  );
}
