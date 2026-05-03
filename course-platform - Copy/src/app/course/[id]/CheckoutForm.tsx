"use client";

import { useState } from "react";
import Script from "next/script";

interface Props {
  courseId: string;
  courseTitle: string;
  price: number;
  slots: string[];
  studentName: string;
  studentEmail: string;
  studentPhone: string;
}

export default function CheckoutForm({ courseId, courseTitle, price, slots, studentName, studentEmail, studentPhone }: Props) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [name, setName] = useState(studentName);
  const [email, setEmail] = useState(studentEmail);
  const [phone, setPhone] = useState(studentPhone);
  const [error, setError] = useState("");
  const [paymentId, setPaymentId] = useState("");

  const formatINR = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) { setError("Please select a time slot."); return; }
    if (!name || !email || !phone) { setError("Please fill in all your details."); return; }
    setError("");
    setLoading(true);

    try {
      // Create Razorpay order
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: price, courseId, courseName: courseTitle }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || "Could not initiate payment");

      // Open Razorpay popup — UPI, GPay, PhonePe, Cards, Net Banking all appear inside
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "CourseHub",
        description: `Enrollment: ${courseTitle}`,
        order_id: orderData.orderId,
        prefill: {
          name,
          email,
          contact: phone,
        },
        theme: { color: "#6366f1" },
        // Let Razorpay show all payment methods (UPI, Cards, Netbanking, Wallets)
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
          emi: false,
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          // Verify payment on server and enroll
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...response,
              courseId,
              selectedSlot,
              name,
              email,
              phone,
            }),
          });
          const verifyData = await verifyRes.json();
          if (!verifyRes.ok) throw new Error(verifyData.error || "Payment verification failed");
          setPaymentId(response.razorpay_payment_id);
          setSuccess(true);
          setLoading(false);
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setError("Payment cancelled. Please try again.");
          },
        },
      };

      // @ts-expect-error — Razorpay loaded via Script tag
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (r: { error: { description: string } }) => {
        setLoading(false);
        setError(`Payment failed: ${r.error.description}`);
      });
      rzp.open();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ textAlign: "center", padding: "2rem 0" }}>
        <div style={{ fontSize: "2rem", fontWeight: 800, color: "#10b981", marginBottom: "0.75rem" }}>
          Payment Successful!
        </div>
        <h4 style={{ marginBottom: "0.5rem", fontSize: "1.2rem" }}>Enrollment Confirmed</h4>
        <p style={{ color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
          Thank you, <strong>{name}</strong>. Your slot has been booked.
        </p>
        {paymentId && (
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Payment ID: <code style={{ color: "var(--primary)" }}>{paymentId}</code>
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      <form onSubmit={handlePayment}>
        {error && (
          <div style={{ color: "#ef4444", marginBottom: "1rem", fontSize: "0.9rem", padding: "0.75rem", background: "rgba(239,68,68,0.1)", borderRadius: "8px" }}>
            {error}
          </div>
        )}

        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "1rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Your Details
        </p>

        <div className="form-group">
          <label className="form-label" htmlFor="enroll-name">Full Name</label>
          <input id="enroll-name" type="text" required className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="enroll-email">Email Address</label>
          <input id="enroll-email" type="email" required className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="enroll-phone">Phone Number</label>
          <input id="enroll-phone" type="tel" required className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
        </div>

        <div className="form-group">
          <label className="form-label">Select Time Slot</label>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {slots.map((slot) => {
              const trimmed = slot.trim();
              const isChecked = selectedSlot === trimmed;
              return (
                <label key={trimmed} style={{
                  display: "flex", alignItems: "center", gap: "0.75rem",
                  padding: "0.75rem 1rem", borderRadius: "8px",
                  border: `1px solid ${isChecked ? "var(--primary)" : "var(--border-color)"}`,
                  background: isChecked ? "rgba(99,102,241,0.15)" : "var(--bg-color)",
                  cursor: "pointer", transition: "all 0.2s",
                }}>
                  <input type="radio" name="slot" value={trimmed} checked={isChecked}
                    onChange={() => setSelectedSlot(trimmed)} style={{ accentColor: "var(--primary)" }} />
                  <span style={{ fontWeight: isChecked ? 600 : 400 }}>{trimmed}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Price summary */}
        <div style={{ margin: "1.5rem 0", padding: "1rem", background: "rgba(0,0,0,0.2)", borderRadius: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
            <span>Course Fee</span><span>{formatINR(price)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border-color)", paddingTop: "0.5rem", marginTop: "0.5rem", fontWeight: "bold", fontSize: "1.1rem" }}>
            <span>Total</span><span>{formatINR(price)}</span>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
          {loading ? "Opening Payment..." : `Pay ${formatINR(price)} Securely`}
        </button>

        {/* Payment method icons */}
        <div style={{ marginTop: "1rem", textAlign: "center" }}>
          <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Pay with</p>
          <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            {["UPI", "GPay", "PhonePe", "Paytm", "Cards", "Net Banking"].map((m) => (
              <span key={m} style={{
                padding: "0.2rem 0.55rem", background: "rgba(255,255,255,0.06)",
                border: "1px solid var(--border-color)", borderRadius: "4px",
                fontSize: "0.7rem", fontWeight: 600, color: "var(--text-secondary)",
              }}>{m}</span>
            ))}
          </div>
          <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginTop: "0.6rem" }}>
            Secured by <strong style={{ color: "#528ff0" }}>Razorpay</strong>
          </p>
        </div>
      </form>
    </>
  );
}
