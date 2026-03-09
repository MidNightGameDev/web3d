import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // log ไว้ด้วย เผื่อดูใน console
    console.error("🔥 React crashed:", error);
    console.error("🔎 Component stack:", info?.componentStack);
    this.setState({ info });
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{ padding: 24, fontFamily: "monospace" }}>
        <h2 style={{ color: "#b00020" }}>⚠️ App crashed (runtime error)</h2>
        <p>ดู error ด้านล่าง แล้วเอาไปแก้ไฟล์ที่เกี่ยวข้อง</p>

        <div style={{ whiteSpace: "pre-wrap", background: "#111", color: "#fff", padding: 16, borderRadius: 8 }}>
          {String(this.state.error)}
        </div>

        {this.state.info?.componentStack && (
          <>
            <h3 style={{ marginTop: 16 }}>Component stack</h3>
            <div style={{ whiteSpace: "pre-wrap", background: "#111", color: "#fff", padding: 16, borderRadius: 8 }}>
              {this.state.info.componentStack}
            </div>
          </>
        )}

        <p style={{ marginTop: 16, opacity: 0.8 }}>
          👉 เปิด DevTools (F12) → Console จะมี error เต็ม ๆ
        </p>
      </div>
    );
  }
}
