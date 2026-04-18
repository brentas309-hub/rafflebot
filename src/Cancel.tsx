export default function Cancel() {
  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>❌ Payment Cancelled</h1>
      <p>Your payment was not completed.</p>
      <a href="/" style={{ color: "#4f46e5" }}>
        Back to Dashboard
      </a>
    </div>
  );
}