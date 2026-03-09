import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import NeonButton from "./NeonButton.jsx";

export default function BackButton() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // หน้าไม่ต้องมี Back
  const HIDE_ON = ["/", "/welcome", "/login", "/register"];
  if (HIDE_ON.includes(pathname)) return null;

  return (
    <div className="wb-back-wrap">
      <NeonButton
        variant="secondary"
        size="small"
        className="wb-back-btn"
        onClick={() => navigate(-1)}
        title="Back"
      >
        ← Back
      </NeonButton>
    </div>
  );
}
