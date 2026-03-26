import React from 'react';
import { useNavigate } from 'react-router-dom';
import './IntroScreen.css';
const DjCreativeLogo = require('./assets/djcreative-logo.png');

function IntroScreen() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">

      {/* NAV */}
      <nav className="landing-nav">
        <img src={DjCreativeLogo} alt="DakJen Creative" className="landing-nav-logo" />
      </nav>

      {/* HERO */}
      <section className="landing-hero">
        <div className="landing-hero-content">
          <p className="landing-hero-eyebrow">Real Estate Lease-Up Marketing</p>
          <h1 className="landing-hero-headline">
            Marketing that moves<br />
            <span className="landing-hero-accent">properties.</span>
          </h1>
          <p className="landing-hero-sub">
            DakJen Creative is a full-service marketing agency specializing in lease-up campaigns for multifamily and commercial real estate. We combine strategic storytelling with real-time data transparency so you always know exactly where your budget is going.
          </p>
        </div>
      </section>

      {/* SERVICES */}
      <section className="landing-section landing-section--light">
        <div className="landing-container">
          <p className="landing-section-eyebrow">What We Do</p>
          <h2 className="landing-section-title">End-to-end marketing for lease-up projects</h2>
          <div className="landing-cards">
            <div className="landing-card">
              <div className="landing-card-icon">📱</div>
              <h3>Social Media Marketing</h3>
              <p>Targeted campaigns across Facebook, Instagram, Google Ads, LinkedIn, and more — designed to drive qualified leads to your property.</p>
            </div>
            <div className="landing-card">
              <div className="landing-card-icon">📢</div>
              <h3>Physical Marketing</h3>
              <p>Billboards, radio, podcasts, printed collateral, and jobsite signage that build brand presence in your local market.</p>
            </div>
            <div className="landing-card">
              <div className="landing-card-icon">📊</div>
              <h3>Real-Time Reporting</h3>
              <p>Live budget tracking and spend analytics through your client portal — full transparency into performance as it happens, not weeks later.</p>
            </div>
            <div className="landing-card">
              <div className="landing-card-icon">🎯</div>
              <h3>Strategy & Planning</h3>
              <p>Custom lease-up strategies built around your project timeline, target demographic, and market conditions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="landing-section landing-section--dark">
        <div className="landing-container">
          <p className="landing-section-eyebrow landing-section-eyebrow--light">The DJC Portal</p>
          <h2 className="landing-section-title landing-section-title--light">Your marketing, completely transparent</h2>
          <div className="landing-steps">
            <div className="landing-step">
              <div className="landing-step-number">01</div>
              <h3>See your spend in real time</h3>
              <p>Every dollar allocated to social media or physical marketing is logged and visible in your portal the moment it's committed.</p>
            </div>
            <div className="landing-step">
              <div className="landing-step-number">02</div>
              <h3>Track performance by channel</h3>
              <p>Social media, physical marketing, and individual category breakdowns — no more waiting for a monthly PDF to know what's working.</p>
            </div>
            <div className="landing-step">
              <div className="landing-step-number">03</div>
              <h3>Make informed decisions faster</h3>
              <p>With live data at your fingertips, you can reallocate budget, double down on what works, and keep your lease-up on schedule.</p>
            </div>
          </div>
        </div>
      </section>

      {/* WHY DJC */}
      <section className="landing-section landing-section--light">
        <div className="landing-container landing-split">
          <div className="landing-split-text">
            <p className="landing-section-eyebrow">Why DakJen Creative</p>
            <h2 className="landing-section-title">Built for lease-up, from day one</h2>
            <p className="landing-split-body">
              Most marketing agencies treat real estate as an afterthought. We built our entire practice around the unique pressures of lease-up — tight timelines, cost-per-lead accountability, and the need to fill units fast without burning through your budget.
            </p>
            <ul className="landing-checklist">
              <li>Specialists in multifamily and commercial lease-up</li>
              <li>Full-service: strategy, creative, media buying, and reporting</li>
              <li>Client portal with live budget visibility</li>
              <li>Dedicated team for each project</li>
            </ul>
          </div>
          <div className="landing-split-visual">
            <div className="landing-stat-grid">
              <div className="landing-stat">
                <div className="landing-stat-number">100%</div>
                <div className="landing-stat-label">Budget Transparency</div>
              </div>
              <div className="landing-stat">
                <div className="landing-stat-number">Real‑Time</div>
                <div className="landing-stat-label">Spend Tracking</div>
              </div>
              <div className="landing-stat">
                <div className="landing-stat-number">Multi-Channel</div>
                <div className="landing-stat-label">Campaign Management</div>
              </div>
              <div className="landing-stat">
                <div className="landing-stat-number">Custom</div>
                <div className="landing-stat-label">Strategy Per Project</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMING SOON */}
      <section className="landing-coming-soon">
        <div className="landing-container landing-coming-soon-inner">
          <p className="landing-section-eyebrow landing-section-eyebrow--light">Client Portal</p>
          <h2>Our Lease-Up Marketing Portal is coming soon</h2>
          <p>We're building a dedicated client portal where you'll get real-time visibility into your lease-up campaign — spend tracking, performance breakdowns, and reporting, all in one place.</p>
          <button className="landing-coming-soon-btn" disabled>
            Notify Me When It Launches
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <img src={DjCreativeLogo} alt="DakJen Creative" className="landing-footer-logo" />
        <p className="landing-footer-copy">© {new Date().getFullYear()} DakJen Creative. All rights reserved.</p>
        <button className="landing-footer-login" onClick={() => navigate('/login')}>
          Staff Login
        </button>
      </footer>

    </div>
  );
}

export default IntroScreen;
