function Features() {
  return (
    <section className="features">
      <h2>Why Choose AuthValidator?</h2>
      <div className="feature-grid">
        <div className="feature-card">
          <h3>🔒 Secure</h3>
          <p>We use cryptographic verification to ensure documents cannot be faked or altered.</p>
        </div>
        <div className="feature-card">
          <h3>⚡ Fast</h3>
          <p>Instant validation results powered by optimized backend algorithms.</p>
        </div>
        <div className="feature-card">
          <h3>🌍 Accessible</h3>
          <p>Works across devices and browsers with offline support as a Progressive Web App.</p>
        </div>
      </div>
    </section>
  );
}

export default Features;
