import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import './LandingPage.css';

const DEMO_ACCOUNTS = [
  { role: '🛡️ Admin',       email: 'admin@quantumkairoz.com',   password: 'Admin@123' },
  { role: '🎯 QA Director',  email: 'qa@quantumkairoz.com',      password: 'QA@123' },
  { role: '🔬 Lab Head',     email: 'labhead@quantumkairoz.com', password: 'Lab@123' },
  { role: '🧪 QC Analyst',   email: 'analyst@quantumkairoz.com', password: 'QC@123' },
  { role: '🤝 Partner',      email: 'partner@quantumkairoz.com', password: 'Partner@123' },
];

const FEATURES = [
  { icon: '🏛️', name: 'Lab Registry',          tag: 'registry',     desc: 'Centralized repository of all internal and partner labs with detailed profile drawers, capability mapping, and status tracking.' },
  { icon: '🔬', name: 'Equipment Management',  tag: 'equipment',    desc: 'Track utilization, calibration schedules, and performance metrics across all laboratory instruments with visual matrix views.' },
  { icon: '📋', name: 'Certifications',        tag: 'certifications',desc: 'Monitor certification health scores, expiry timelines, and compliance status for NABL, GMP, ISO, and FDA standards.' },
  { icon: '⚠️', name: 'CAPA Management',       tag: 'capa',         desc: 'Full corrective and preventive action lifecycle with severity classification, root cause analysis, and automated workflow triggers.' },
  { icon: '🕵️', name: 'Audit Management',      tag: 'audits',       desc: 'Schedule, track, and analyze audits with score trends, calendar heatmaps, and multi-standard support (GMP, NABL, FDA, ISO).' },
  { icon: '🤝', name: 'Partner Management',    tag: 'partners',     desc: 'End-to-end partner lifecycle management with onboarding wizard, performance scoring, and collaboration tools.' },
  { icon: '🧭', name: 'AI Lab Finder',         tag: 'finder',       desc: 'Intelligent lab matching engine that scores and ranks partner labs based on capability, compliance, and performance criteria.' },
  { icon: '📄', name: 'SOP Management',        tag: 'sop',          desc: 'Version-controlled standard operating procedures with due-for-review alerts, approval chains, and role-based access.' },
  { icon: '🧪', name: 'Batch Records (BMR)',   tag: 'bmr',          desc: 'Digital batch manufacturing records with yield trend analytics, monthly output tracking, and full audit trail.' },
  { icon: '📁', name: 'Document Management',   tag: 'dms',          desc: 'Centralized DMS with versioning, download controls, metadata tagging, and role-based document access.' },
  { icon: '🧾', name: 'Test Requests',         tag: 'requests',     desc: 'Volume trend analytics, auto-pricing engine, and smart approval triggers for requests exceeding ₹50K thresholds.' },
  { icon: '⚙️', name: 'Approval Workflows',    tag: 'workflows',    desc: '5 configurable workflow templates with multi-step approvals, role-based notifications, and auto-trigger integrations.' },
  { icon: '🔌', name: 'Integration Hub',       tag: 'integrations', desc: 'Pre-built connectors for ERP, LIMS, and QMS systems with 6 integration templates and real-time sync monitoring.' },
  { icon: '📊', name: 'Analytics Dashboard',   tag: 'analytics',    desc: 'Real-time KPI summaries, trend charts, partner mapping, and risk heatmaps — all cached for instant response.' },
  { icon: '🔔', name: 'Notifications',         tag: 'notifications',desc: 'Real-time alerts across all modules with filtering by type, priority, and read status. Never miss a critical event.' },
  { icon: '🚀', name: 'Partner Onboarding',    tag: 'onboarding',   desc: 'Guided 5-step wizard for partner registration with document collection, approval routing, and status tracking.' },
];

const TICKER_ITEMS = [
  { icon: '✔', label: 'NABL Compliant' },
  { icon: '🛡', label: 'FDA 21 CFR Part 11' },
  { icon: '⏱', label: 'Real-time CAPA Tracking' },
  { icon: '🤝', label: 'Multi-lab Partner Management' },
  { icon: '🔌', label: 'ERP / LIMS / QMS Integrations' },
  { icon: '📊', label: 'AI-powered Lab Scoring' },
  { icon: '🔒', label: 'Role-based Access Control' },
];

export default function LandingPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [modalOpen, setModalOpen]     = useState(false);
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [remember, setRemember]       = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const emailRef                      = useRef<HTMLInputElement>(null);

  // If already authenticated, go straight to dashboard
  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  // Escape key closes modal
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Scroll animations
  useEffect(() => {
    const els = document.querySelectorAll('.lp-fade');
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('lp-visible'); }),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const openModal = useCallback(() => {
    setModalOpen(true);
    setError('');
    document.body.style.overflow = 'hidden';
    setTimeout(() => emailRef.current?.focus(), 300);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    document.body.style.overflow = '';
    setError('');
    setEmail('');
    setPassword('');
  }, []);

  const fillAccount = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setError('');
    emailRef.current?.focus();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      closeModal();
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Invalid credentials. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const tickerContent = [...TICKER_ITEMS, ...TICKER_ITEMS]; // duplicate for seamless loop

  return (
    <div className="lp">
      {/* ── NAV ───────────────────────────────────────────── */}
      <nav className="lp-nav">
        <a href="#hero" className="lp-nav-logo">
          <div className="lp-logo-mark">Q</div>
          <div>
            <div className="lp-logo-text">Quantum Kairoz</div>
            <div className="lp-logo-sub">by Forge Quantum Solutions</div>
          </div>
        </a>
        <ul className="lp-nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#how-it-works">How it works</a></li>
          <li><a href="#compliance">Compliance</a></li>
          <li><a href="#roles">Roles</a></li>
        </ul>
        <div className="lp-nav-cta">
          <button className="lp-btn lp-btn-ghost" onClick={openModal}>Sign in</button>
          <button className="lp-btn lp-btn-primary" onClick={openModal}>Get started</button>
        </div>
      </nav>

      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="lp-hero" id="hero">
        <div className="lp-hero-grid" />
        <div className="lp-hero-badge">
          <span className="dot" />
          Pharma-grade Quality Intelligence Platform
        </div>
        <h1>
          One Platform for<br />
          <span className="accent">Quality, Labs &amp; Partners</span>
        </h1>
        <p>
          Quantum Kairoz unifies lab registry, equipment tracking, CAPA management, compliance audits,
          and partner onboarding into a single intelligent platform — purpose-built for pharmaceutical operations.
        </p>
        <div className="lp-hero-actions">
          <button className="lp-btn lp-btn-primary lp-btn-lg" onClick={openModal}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>
            Sign in to platform
          </button>
          <a href="#features" className="lp-btn lp-btn-outline">Explore features</a>
        </div>
        <div className="lp-hero-stats">
          {[['16+','Integrated Modules'],['5','Role-based Access Levels'],['20+','Workflow Templates'],['100%','GMP / NABL / FDA Ready']].map(([num, label]) => (
            <div className="lp-stat" key={label}>
              <span className="num">{num}</span>
              <div className="label">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TICKER ────────────────────────────────────────── */}
      <div className="lp-ticker-wrap">
        <div className="lp-ticker">
          {tickerContent.map((item, i) => (
            <span className="lp-ticker-item" key={i}>
              <span>{item.icon}</span>
              {item.label}
            </span>
          ))}
        </div>
      </div>

      {/* ── FEATURES ──────────────────────────────────────── */}
      <section className="lp-section lp-section-white" id="features">
        <div className="lp-container">
          <div className="lp-section-header lp-fade">
            <div className="lp-section-label">Platform Modules</div>
            <h2 className="lp-section-title">Everything your pharma ops team needs</h2>
            <p className="lp-section-desc">16 integrated modules covering every aspect of laboratory quality management, partner relations, and regulatory compliance.</p>
          </div>
          <div className="lp-features-grid">
            {FEATURES.map((f, i) => (
              <div className={`lp-feature-card lp-fade lp-delay-${(i % 3) as 0|1|2}`} key={f.tag}>
                <div className="lp-feature-icon">{f.icon}</div>
                <h3>{f.name}</h3>
                <p>{f.desc}</p>
                <span className="lp-feature-tag">{f.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────── */}
      <section className="lp-section lp-section-dark" id="how-it-works">
        <div className="lp-container">
          <div className="lp-section-header lp-fade">
            <div className="lp-section-label">How it works</div>
            <h2 className="lp-section-title">Intelligent operations in 4 steps</h2>
            <p className="lp-section-desc">From onboarding to audit-ready compliance — Quantum Kairoz guides your team at every step.</p>
          </div>
          <div className="lp-steps-grid">
            {[
              ['1','Onboard & Configure','Register labs, onboard partners through the guided wizard, and configure role-based access for your team.'],
              ['2','Monitor & Track','Track equipment, certifications, SOPs, and batch records in real time with automated expiry and review alerts.'],
              ['3','Detect & Respond','CAPA auto-triggers when deviations are detected. Approval workflows route to the right people instantly.'],
              ['4','Audit & Improve','Generate audit-ready reports, analyze trends, and continuously improve quality scores across all labs.'],
            ].map(([num, title, desc], i) => (
              <div className={`lp-step-card lp-fade lp-delay-${i as 0|1|2|3}`} key={num}>
                <div className="lp-step-num">{num}</div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROLES ─────────────────────────────────────────── */}
      <section className="lp-section lp-section-white" id="roles">
        <div className="lp-container">
          <div className="lp-section-header lp-fade" style={{ textAlign: 'center' }}>
            <div className="lp-section-label">User Roles</div>
            <h2 className="lp-section-title">Built for every stakeholder</h2>
            <p className="lp-section-desc" style={{ margin: '0 auto' }}>Five purpose-built roles ensure the right information reaches the right people.</p>
          </div>
          <div className="lp-roles-grid lp-fade">
            {[['🛡️','Admin'],['🎯','QA Director'],['🔬','Lab Head'],['🧪','QC Analyst'],['🤝','Partner']].map(([icon, role]) => (
              <div className="lp-role-pill" key={role}>
                <span className="icon">{icon}</span>
                <span>{role}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPLIANCE ────────────────────────────────────── */}
      <section className="lp-section lp-section-bg" id="compliance">
        <div className="lp-container">
          <div className="lp-section-header lp-fade">
            <div className="lp-section-label">Regulatory Standards</div>
            <h2 className="lp-section-title">Compliance-first by design</h2>
            <p className="lp-section-desc">Quantum Kairoz is architected to meet the most stringent pharmaceutical regulatory requirements out of the box.</p>
          </div>
          <div className="lp-badges-grid">
            {[['🏅','GMP'],['🏅','NABL'],['🏅','FDA'],['🏅','ISO 17025'],['🔒','21 CFR Part 11'],['📋','ICH Q10']].map(([icon, label]) => (
              <div className={`lp-badge-item lp-fade`} key={label}>
                <span className="badge-icon">{icon}</span>
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="lp-cta">
        <div className="lp-container">
          <h2 className="lp-fade">Ready to transform your lab operations?</h2>
          <p className="lp-fade lp-delay-1">Join pharmaceutical teams using Quantum Kairoz to stay audit-ready, reduce CAPA response time, and improve partner quality scores.</p>
          <button className="lp-cta-btn lp-fade lp-delay-2" onClick={openModal}>Sign in to platform →</button>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-footer-top">
            <div className="lp-footer-brand">
              <div className="lp-nav-logo" style={{ marginBottom: 4 }}>
                <div className="lp-logo-mark">Q</div>
                <div>
                  <div className="lp-logo-text">Quantum Kairoz</div>
                  <div className="lp-logo-sub">by Forge Quantum Solutions</div>
                </div>
              </div>
              <p>Pharmaceutical Quality, Lab & Partner Intelligence — purpose-built for modern pharma operations.</p>
            </div>
            <div className="lp-footer-col">
              <h5>Platform</h5>
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#how-it-works">How it works</a></li>
                <li><a href="#compliance">Compliance</a></li>
                <li><a href="#roles">Roles</a></li>
              </ul>
            </div>
            <div className="lp-footer-col">
              <h5>Modules</h5>
              <ul>
                <li><a href="#features">Lab Registry</a></li>
                <li><a href="#features">CAPA Management</a></li>
                <li><a href="#features">Audit Tracker</a></li>
                <li><a href="#features">Partner Onboarding</a></li>
                <li><a href="#features">Approval Workflows</a></li>
              </ul>
            </div>
            <div className="lp-footer-col">
              <h5>Company</h5>
              <ul>
                <li><a href="#">Forge Quantum Solutions</a></li>
                <li><a href="#">API Documentation</a></li>
                <li><a href="#">Support</a></li>
                <li><a href="#">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="lp-footer-bottom">
            <p>© 2026 Forge Quantum Solutions. All rights reserved.</p>
            <p>Built with <span style={{ color: '#DDB84A' }}>♥</span> for pharma excellence</p>
          </div>
        </div>
      </footer>

      {/* ── LOGIN MODAL ───────────────────────────────────── */}
      <div
        className={`lp-overlay${modalOpen ? ' active' : ''}`}
        onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        role="dialog"
        aria-modal="true"
        aria-label="Sign in"
      >
        <div className="lp-modal">
          <div className="lp-modal-header">
            <div className="logo-row">
              <div className="lp-logo-mark" style={{ width: 30, height: 30, fontSize: 15 }}>Q</div>
              <div>
                <div className="lp-logo-text" style={{ fontSize: 13 }}>Quantum Kairoz</div>
                <div className="lp-logo-sub">Forge Quantum Solutions</div>
              </div>
            </div>
            <h2>Welcome back</h2>
            <p>Sign in to your account to continue</p>
            <button className="lp-modal-close" onClick={closeModal} aria-label="Close">×</button>
          </div>

          <div className="lp-modal-body">
            {/* Demo accounts */}
            <div className="lp-demo-accounts">
              <div className="lp-demo-title">Demo accounts — click to fill</div>
              <div className="lp-demo-list">
                {DEMO_ACCOUNTS.map((acc) => (
                  <div className="lp-demo-row" key={acc.email} onClick={() => fillAccount(acc)}>
                    <span className="role-name">{acc.role}</span>
                    <span className="email">{acc.email}</span>
                    <button className="use-btn" tabIndex={-1} type="button">Use</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && <div className="lp-error">{error}</div>}

            {/* Form */}
            <form onSubmit={handleLogin} noValidate>
              <div className="lp-form-group">
                <label className="lp-form-label" htmlFor="lp-email">Email address</label>
                <input
                  ref={emailRef}
                  className="lp-form-input"
                  type="email"
                  id="lp-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="lp-form-group">
                <label className="lp-form-label" htmlFor="lp-password">Password</label>
                <input
                  className="lp-form-input"
                  type="password"
                  id="lp-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>

              <div className="lp-form-row">
                <label className="lp-check-label">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                  Remember me
                </label>
                <a href="#" className="lp-forgot">Forgot password?</a>
              </div>

              <button type="submit" className="lp-btn-login" disabled={loading}>
                {loading ? <><div className="lp-spinner" />Signing in…</> : 'Sign in'}
              </button>
            </form>

            <div className="lp-divider">or continue with</div>

            <button
              className="lp-sso-btn"
              type="button"
              onClick={() => alert('SSO login would redirect to your identity provider.\n\nFor demo: use the credential shortcuts above.')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              Single Sign-On (SSO)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
