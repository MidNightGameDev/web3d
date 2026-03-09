import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import NeonButton from './NeonButton.jsx';
import { clearSession } from '../lib/auth.js';

export default function Header() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => {
    clearSession();
    navigate('/welcome');
  };

  const email = localStorage.getItem("auth_user") || "builder@studio.io";

  return (
    <header className="header">
      <span className="header-logo">⬡ 3D Model Builder</span>
      <div className="header-actions">
        <span className="header-user">{email}</span>
        {pathname !== "/" && pathname !== "/welcome" && (
          <NeonButton variant="primary" size="small" onClick={() => navigate("/")}>
            <span style={{ marginRight: 6 }}>⌂</span>Dashboard
          </NeonButton>
        )}
        <NeonButton variant="secondary" size="small" onClick={() => navigate('/market')}>
          Market
        </NeonButton>
        <NeonButton variant="secondary" size="small" onClick={() => navigate('/profile')}>
          Profile
        </NeonButton>
        <NeonButton variant="secondary" size="small" onClick={handleLogout}>
          Logout
        </NeonButton>
      </div>
    </header>
  );
}
