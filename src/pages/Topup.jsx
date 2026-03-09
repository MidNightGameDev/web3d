import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../lib/auth.js";
import { getCredits, addCredits } from "../lib/store.js";

const PACKAGES = [
    { id: "bronze", name: "Bronze Starter", credits: 50, price: "149 บาท", color: "#cd7f32" },
    { id: "silver", name: "Silver Builder", credits: 150, price: "449 บาท", color: "#c0c0c0" },
    { id: "gold", name: "Gold Professional", credits: 400, price: "999 บาท", color: "#ffd700", popular: true },
    { id: "platinum", name: "Platinum Studio", credits: 1000, price: "1990 บาท", color: "#e5e4e2" },
];

export default function Topup() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [currentBalance, setCurrentBalance] = useState(0);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            navigate("/login");
            return;
        }
        setUser(currentUser);
        const fetchBalance = async () => {
            const bal = await getCredits(currentUser.email);
            setCurrentBalance(bal);
        };
        fetchBalance();
    }, [navigate]);

    const handlePurchase = async () => {
        if (!selectedPackage) return;

        setIsProcessing(true);

        // Simulate network delay for payment processing
        setTimeout(async () => {
            const newBalance = await addCredits(user.email, selectedPackage.credits);
            setCurrentBalance(newBalance);
            setIsProcessing(false);
            setSelectedPackage(null);

            // Dispatch event so other tabs/components know credits updated
            window.dispatchEvent(new Event("authchange"));

            alert(`Success! ${selectedPackage.credits} credits have been added to your account.`);
        }, 1500);
    };

    if (!user) return null;

    return (
        <div className="p-page">
            <div className="p-bg" aria-hidden="true" />
            <div className="p-grid" aria-hidden="true" />

            <header className="p-topbar">
                <div className="p-brand">
                    <span className="p-brand__logo" style={{ color: "var(--neon-green)", textShadow: "0 0 10px var(--neon-green)" }}>⬡</span>
                    <span className="p-brand__text">Store</span>
                    <span className="p-pill" style={{ borderColor: "var(--neon-green)", color: "var(--neon-green)" }}>Top Up</span>
                </div>
                <div className="p-topbar__right">
                    <div style={{ color: "var(--neon-green)", marginRight: "10px", fontWeight: "bold" }}>
                        Balance: {currentBalance} CR
                    </div>
                    <button className="p-btn p-btn--ghost" onClick={() => navigate(-1)}>
                        Back
                    </button>
                </div>
            </header>

            <main className="p-wrap" style={{ maxWidth: "900px", margin: "40px auto", padding: "0 20px" }}>
                <div style={{ textAlign: "center", marginBottom: "40px" }}>
                    <h1 className="p-title" style={{ fontSize: "2.5rem" }}>
                        Get More <span style={{ color: "var(--neon-green)", textShadow: "0 0 20px rgba(0,255,128,0.5)" }}>Credits</span>
                    </h1>
                    <p className="p-sub" style={{ marginTop: "10px" }}>
                        Unlock more project slots and purchase premium models from the marketplace.
                    </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
                    {PACKAGES.map((pkg) => (
                        <div
                            key={pkg.id}
                            className="p-card"
                            onClick={() => !isProcessing && setSelectedPackage(pkg)}
                            style={{
                                cursor: isProcessing ? "not-allowed" : "pointer",
                                border: selectedPackage?.id === pkg.id ? `2px solid ${pkg.color}` : "1px solid var(--border-color)",
                                transform: selectedPackage?.id === pkg.id ? "translateY(-5px)" : "none",
                                transition: "all 0.2s ease",
                                position: "relative",
                                overflow: "hidden"
                            }}
                        >
                            {pkg.popular && (
                                <div style={{
                                    position: "absolute", top: "10px", right: "-30px", background: pkg.color, color: "#000",
                                    padding: "4px 30px", fontSize: "0.7rem", fontWeight: "bold", transform: "rotate(45deg)"
                                }}>
                                    POPULAR
                                </div>
                            )}
                            <h3 style={{ color: pkg.color, marginBottom: "10px", fontSize: "1.2rem" }}>{pkg.name}</h3>
                            <div style={{ fontSize: "2.5rem", fontWeight: "bold", margin: "20px 0" }}>
                                {pkg.credits} <span style={{ fontSize: "1rem", color: "var(--text-secondary)" }}>CR</span>
                            </div>
                            <div style={{ fontSize: "1.2rem", color: "var(--text-secondary)" }}>{pkg.price}</div>
                        </div>
                    ))}
                </div>

                {selectedPackage && (
                    <div className="p-card" style={{ marginTop: "40px", border: `1px solid ${selectedPackage.color}`, background: "rgba(0,0,0,0.5)" }}>
                        <h2 style={{ marginBottom: "20px" }}>Order Summary</h2>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", color: "var(--text-secondary)" }}>
                            <span>Package:</span>
                            <span style={{ color: "#fff" }}>{selectedPackage.name}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", color: "var(--text-secondary)" }}>
                            <span>Credits to add:</span>
                            <span style={{ color: "var(--neon-pink)" }}>+{selectedPackage.credits} CR</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", color: "var(--text-secondary)", borderTop: "1px solid #333", paddingTop: "10px" }}>
                            <span>Total Due:</span>
                            <span style={{ fontSize: "1.5rem", color: "#fff" }}>{selectedPackage.price}</span>
                        </div>

                        <button
                            className="p-btn p-btn--primary"
                            style={{
                                width: "100%",
                                padding: "15px",
                                background: "var(--neon-pink)",
                                color: "#fff",
                                borderColor: "var(--neon-pink)",
                                fontSize: "1.1rem",
                                fontWeight: "bold",
                                textShadow: "0 1px 2px rgba(0,0,0,0.8)"
                            }}
                            onClick={handlePurchase}
                            disabled={isProcessing}
                        >
                            <span className="p-btn__spark" />
                            {isProcessing ? "Processing Payment..." : `Confirm Purchase - ${selectedPackage.price}`}
                        </button>
                        <p style={{ textAlign: "center", fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "15px" }}>
                            *This is a simulated transaction for demonstration purposes. No real charges will be made.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
