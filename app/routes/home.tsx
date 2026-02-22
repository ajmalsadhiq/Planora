
import type { Route } from "./+types/home";
import Navbar from "components/Navbar";
import Upload from "components/upload";
import Button from "components/ui/Button";
import { ArrowRight, Layers, ArrowUpRight, Sun, Moon, LayoutGrid } from "lucide-react";
import { useNavigate } from "react-router";
import { useState, useEffect, useRef } from "react";
import { createProject, getProjects } from "../../lib/puter.action";
import puter from "@heyputer/puter.js";
import { getOrCreateHostingConfig } from "../../lib/puter.hosting";

export default function Home() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<DesignItem[]>([]);
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem('planora-theme') !== 'light'; } catch { return true; }
  });
  const isCreatingProjectRef = useRef(false);

  useEffect(() => {
    const setup = async () => {
      try {
        await puter.auth.getUser();
        await getOrCreateHostingConfig();
      } catch (e) {
        console.error("Auth setup failed", e);
      }
    };
    setup();
  }, []);

  useEffect(() => {
    getProjects().then(setProjects);
  }, []);

  const handleUploadComplete = async (base64Image: string) => {
    if (isCreatingProjectRef.current) return false;
    isCreatingProjectRef.current = true;
    try {
      const newId = Date.now().toString();
      const newItem = {
        id: newId,
        name: `Project_${newId.slice(-4)}`,
        sourceImage: base64Image,
        renderedImage: undefined,
        timestamp: Date.now()
      };
      const saved = await createProject({ item: newItem, visibility: 'private' });
      if (saved) navigate(`/visualizer/${newId}`);
      return true;
    } finally {
      isCreatingProjectRef.current = false;
    }
  };

  // ── colour tokens ──────────────────────────────────────────────
  const dark = {
    pageBg:      '#1a1a1d',
    gridLine:    '#2c2c31',
    cardBg:      '#18181c',
    cardBorder:  '#2a2a30',
    cardInner:   '#1f1f24',
    innerBorder: '#2f2f38',
    accent:      '#ff2d55',
    accentHover: '#ff1744',
    text:        '#ffffff',
    subtext:     '#71717a',
    muted:       '#3f3f46',
    badgeBg:     '#1f1f26',
    badgeBorder: '#2e2e3a',
    badgeText:   '#9090a8',
    navBg:       '#09090c',
    navBorder:   '#1a1a20',
  };

  const light = {
    pageBg:      '#e8e8ed',
    gridLine:    '#d0d0d8',
    cardBg:      '#d4d4dc',
    cardBorder:  '#bbbbc8',
    cardInner:   '#cbcbd6',
    innerBorder: '#b8b8c8',
    accent:      '#1a3a8f',
    accentHover: '#152e75',
    text:        '#12121a',
    subtext:     '#5a5a72',
    muted:       '#8888a0',
    badgeBg:     '#dcdce6',
    badgeBorder: '#c0c0d0',
    badgeText:   '#4a4a62',
    navBg:       '#d0d0d8',
    navBorder:   '#babac8',
  };

  const c = isDark ? dark : light;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: c.pageBg,
      color: c.text,
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>

      <style>{`
      .navbar button,
.navbar .cta {
  cursor: pointer;
  transition: all 0.2s ease;
}

.navbar button:hover,
.navbar .cta:hover {
  transform: translateY(-1px);
  opacity: 0.9;
}
      .username-text {
  color: ${c.text};
}
      .navbar {
      z-index: 9999;
      box-shadow:
    ;
        pointer-events: auto;

  background: ${isDark
    ? 'rgba(20,20,24,0.75)'
    : 'rgba(255,255,255,0.75)'};

  backdrop-filter: blur(18px) saturate(140%);
  -webkit-backdrop-filter: blur(18px) saturate(140%);

  border: 1px solid ${c.navBorder};
  border-radius: 24px;

  max-width: 1100px;
  width: calc(100% - 48px); /* keeps margins on both sides */

  margin-left: auto;
  margin-right: auto;
  margin-top: 16px;

  padding: 14px 24px;

  position: relative; /* important for floating */

  box-shadow:
    0 10px 30px rgba(0,0,0,0.25),

  transition: all 0.3s ease;
}
      .upload-instruction {
          color: ${c.text};
        }
        /* ── NAVBAR ────────────────────────── */
        
        
        .nav-custom {
        z-index: 9999;
  position: fixed;
  inset: 0 auto auto 0;
  width: 100%;

  background: transparent !important;
  border: none !important;
  box-shadow: none !important;

  pointer-events: none; /* important */
}
        .nav-custom .brand .name {
          color: ${c.text};
        }

        .nav-custom .greetings {
          color: ${c.text};
        }

        .nav-custom .actions button,
        .nav-custom .actions span {
          color: ${c.subtext};
        }
        .nav-custom button.logout-btn,
        .nav-custom [class*="orange"],
        .nav-custom button:last-child {
          background-color: ${c.accent} !important;
          color: white !important;
          border-radius: 6px;
          padding: 8px 16px;
          font-weight: bold;
        }
        
        /* ── TICKER ────────────────────────── */
        .ticker-wrap {
          display: inline-block;
          overflow: hidden;
          vertical-align: bottom;
          height: 1em;
          line-height: 1;
        }
        .ticker-inner {
          display: block;
          animation: ticker-slide 4.5s steps(1) infinite;
        }
        @keyframes ticker-slide {
          0%   { transform: translateY(0%); }
          33%  { transform: translateY(-33.33%); }
          66%  { transform: translateY(-66.66%); }
        }
        .ticker-word {
          display: block;
          color: ${c.accent};
          line-height: 1;
          transition: color 0.4s;
        }

        /* ── GRID BACKGROUND ───────────────── */
        .grid-bg {
          background-image:
    radial-gradient(
      circle at top left,
        ${isDark ? 'rgba(255,45,85,0.18)' : 'rgba(37,99,235,0.18)'},
      transparent 10%
    ),
    linear-gradient(to right, ${c.gridLine} 1px, transparent 1px),
    linear-gradient(to bottom, ${c.gridLine} 1px, transparent 1px);

  background-size:
    auto,
    60px 60px,
    60px 60px;
        }

        /* ── PULSING DOT ───────────────────── */
        .pulse-core {
          background: ${c.accent};
          box-shadow: 0 0 12px ${c.accent}, 0 0 24px ${c.accent}66;
          animation: blink 2s infinite ease-in-out;
          transition: background 0.4s, box-shadow 0.4s;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.6; transform: scale(1.15); }
        }

        /* ── ANIMATED BARS ─────────────────── */
        .monitor-line {
          height: 100%;
          width: 13px;
          background: ${c.accent};
          margin-right: 10px;
          animation: wave 5s infinite ease-in-out;
          transition: background 0.4s;
        }
        @keyframes wave {
          0%, 100% { height: 15%; opacity: 0.1; }
          50%       { height: 100%; opacity: 1; filter: blur(1px); }
        }

        /* ── UPLOAD CARD ──────────────────────
           Dark card that sits naturally on the
           dark page — deep charcoal, not grey
        ──────────────────────────────────────── */
        .upload-card-lux {
          background: ${c.cardBg} !important;
          border: 1px solid ${c.cardBorder} !important;
          box-shadow:
            0 0 0 1px ${c.cardBorder}44,
            0 24px 60px rgba(0,0,0,0.5),
            inset 0 1px 0 ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.6)'};
          transition: background 0.4s, border-color 0.4s, box-shadow 0.4s;
        }

        .upload-icon-box {
          border: 1px solid ${c.innerBorder} !important;
          background: ${c.cardInner} !important;
          transition: background 0.4s, border-color 0.4s;
        }

        .upload-card-title {
          color: ${c.text} !important;
          transition: color 0.4s;
        }
        .upload-card-sub {
          color: ${c.subtext} !important;
          transition: color 0.4s;
        }

        /* inner drag-drop box */
        .upload-inner-dark,
        .upload-inner-dark > div,
        .upload-inner-dark label,
        .upload-inner-dark [class*="upload"],
        .upload-inner-dark [class*="drop"],
        .upload-inner-dark [class*="drag"] {
          background: ${c.cardInner} !important;
          border: 1.5px dashed ${c.innerBorder} !important;
          color: ${isDark ? '#e4e4ea' : '#5a5a72'} !important;
          border-radius: 10px !important;
          transition: all 0.2s !important;
        }
        .upload-inner-dark label:hover,
        .upload-inner-dark [class*="upload"]:hover,
        .upload-inner-dark [class*="drop"]:hover,
        .upload-inner-dark > div:hover {
          background: ${isDark ? '#222228' : '#c4c4d0'} !important;
          border-color: ${c.accent} !important;
        }

        /* ── ARCHIVE SECTION ───────────────── */
        .archive-heading {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 0.95;
          text-transform: uppercase;
          color: ${c.text};
          transition: color 0.4s;
        }
        .archive-subheading {
          font-family: monospace;
          font-size: 10px;
          letter-spacing: 0.3em;
          color: ${c.subtext};
          margin-top: 8px;
          transition: color 0.4s;
        }

        /* ── PROJECT COUNT BADGE ───────────── */
        .project-count-badge {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: flex-end;
          gap: 2px;
        }
        .project-count-badge-num {
          font-size: 3rem;
          font-weight: 800;
          letter-spacing: -0.05em;
          line-height: 1;
          color: ${c.text};
          opacity: 0.7;
          font-family: monospace;
          transition: color 0.4s, opacity 0.4s;
        }
        .project-count-badge-label {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: ${c.subtext};
          font-family: monospace;
          transition: color 0.4s;
        }

        /* ── PROJECT CARD ──────────────────── */
        .proj-card {
          border: 1px solid ${c.cardBorder};
          background: ${isDark ? '#111113' : '#d0d0d8'};
          border-radius: 10px;
          overflow: hidden;
          cursor: pointer;
          transition: border-color 0.3s, box-shadow 0.3s, background 0.4s;
        }
        .proj-card:hover {
          border-color: ${c.accent};
          box-shadow: 0 8px 32px ${c.accent}22;
        }
        .proj-card-footer {
          border-top: 1px solid ${c.cardBorder};
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: background 0.2s, border-color 0.4s;
        }
        .proj-card:hover .proj-card-footer {
          background: ${c.accent}0d;
        }

        /* ── THEME TOGGLE BUTTON ───────────── */
        .theme-btn {
          position: fixed;
          bottom: 32px;
          right: 32px;
          z-index: 50;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 1px solid ${c.cardBorder};
          background: ${c.cardBg};
          color: ${c.text};
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          transition: all 0.3s;
        }
        .theme-btn:hover {
          border-color: ${c.accent};
          box-shadow: 0 4px 20px ${c.accent}33;
        }

        /* ── BUTTONS ───────────────────────── */
        .btn-primary {
          background: ${c.accent};
          color: white;
          padding: 16px 40px;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 0.1em;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          border-radius: 2px;
          transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 8px 20px ${c.accent}44;
          text-decoration: none;
        }
        .btn-primary:hover {
          background: ${c.accentHover};
          transform: translateY(-2px);
          box-shadow: 0 12px 28px ${c.accent}55;
        }
        .btn-secondary {
          border: 1px solid ${c.cardBorder};
          color: ${c.text}; /* was ${c.subtext} */
          padding: 16px 40px;
          font-family: monospace;
          font-size: 12px;
          letter-spacing: 0.05em;
          display: inline-flex;
          align-items: center;
          border-radius: 2px;
          text-decoration: none;
          transition: color 0.2s, background 0.2s, border-color 0.2s;
        }

        .btn-secondary:hover {
          color: ${c.accent}; /* pink on hover */
          background: ${c.cardInner};
          border-color: ${c.accent};
        }
        /* ── STATUS BADGE ──────────────────── */
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 6px 16px;
          border-radius: 4px;
          border: 1px solid ${c.cardBorder};
          background: ${isDark ? 'rgba(25,25,30,0.8)' : 'rgba(200,200,210,0.8)'};
          margin-bottom: 32px;
          transition: all 0.4s;
        }
        .status-text {
          font-size: 11px;
          font-family: monospace;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: ${c.subtext};
          transition: color 0.4s;
        }

        /* ── HERO BODY TEXT ────────────────── */
        .hero-body {
          font-size: 1.125rem;
          line-height: 1.7;
          color: ${c.subtext};
          max-width: 480px;
          transition: color 0.4s;
        }

        /* ── ARCHIVE DIVIDER ───────────────── */
        .archive-divider {
          border-color: ${c.cardBorder};
          transition: border-color 0.4s;
        }

        /* ── EMPTY STATE ───────────────────── */
        .empty-state {
          border: 1px dashed ${c.cardBorder};
          color: ${c.muted};
          font-family: monospace;
          font-size: 13px;
          text-align: center;
          padding: 80px 20px;
          border-radius: 10px;
          transition: all 0.4s;
        }

        /* ── MONITOR META TEXT ─────────────── */
        .monitor-meta {
          color: ${c.accent};
          transition: color 0.4s;
        }
        .monitor-meta-dim {
          color: ${c.subtext};
          transition: color 0.4s;
        }

        /* ── STATUS TAG ON IMG ─────────────── */
        .status-tag {
          background: ${c.accent};
          color: white;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          display: inline-block;
          padding: 3px 8px;
          transition: background 0.4s;
        }
      `}</style>

      {/* NAVBAR */}
      <header className="nav-custom">
        <Navbar isDark={isDark} toggleTheme={() => {
  const next = !isDark;
  setIsDark(next);
  localStorage.setItem('planora-theme', next ? 'dark' : 'light');
  window.dispatchEvent(new Event('planora-theme-change'));
}} />
      </header>

      <div className="grid-bg min-h-screen" style={{ paddingTop: '65px' }}>
      
        

        <section style={{ paddingTop: '96px', paddingBottom: '40px', paddingLeft: '24px', paddingRight: '24px', maxWidth: '1152px', margin: '0 auto' }}>

          {/* Status badge */}
          <div className="status-badge">
            <div className="w-2.5 h-2.5 rounded-full pulse-core" style={{ width: '10px', height: '10px', borderRadius: '50%' }} />
            <span className="status-text">Planora v2.0 — Online</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: '40px', flexWrap: 'wrap' }}>

            {/* Headline */}
            <h1 style={{ fontSize: 'clamp(3.5rem, 7vw, 6rem)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 0.9, margin: 0 }}>
              Build spaces<br />
              <span style={{ color: c.accent, transition: 'color 0.4s' }}>faster,</span>{" "}
              <span className="ticker-wrap">
                <span className="ticker-inner">
                  <span className="ticker-word">smarter.</span>
                  <span className="ticker-word">bolder.</span>
                  <span className="ticker-word">better.</span>
                </span>
              </span>
            </h1>

            {/* Animated data bars */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '160px', borderLeft: `2px solid ${c.cardBorder}`, paddingLeft: '48px', flexShrink: 0 }}>
              {[...Array(10)].map((_, i) => (
                <div key={i} className="monitor-line" style={{ animationDelay: `${i * 0.25}s` }} />
              ))}
              <div style={{ marginLeft: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', padding: '8px 0' }}>
                <span className="monitor-meta" style={{ fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.15em' }}>SYSTEM_FLOW_ACTIVE</span>
                <span className="monitor-meta-dim" style={{ fontSize: '10px', fontFamily: 'monospace', opacity: 0.4 }}>ENCRYPT: SECURE_NODE</span>
                <span className="monitor-meta-dim" style={{ fontSize: '10px', fontFamily: 'monospace', opacity: 0.4 }}>FREQ: 2.44Hz</span>
              </div>
            </div>
          </div>

          <p className="hero-body" style={{ marginTop: '48px', marginBottom: '48px' }}>
            Planora turns your architectural floor plans into stunning 3D visualizations in seconds.
            Simply upload a floor plan image below — our AI handles the rest.
            No design experience needed.
          </p>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '80px' }}>
            <a href="#upload" className="btn-primary">
              START BUILDING <ArrowRight size={18} />
            </a>
            <a href="#archive" className="btn-secondary">
              VIEW ARCHIVE
            </a>
          </div>

          {/* Upload card */}
          <div id="upload" className="upload-card-lux" style={{ borderRadius: '16px', padding: '48px', position: 'relative', overflow: 'hidden' }}>
            {/* Watermark icon */}
            <div style={{ position: 'absolute', top: 0, right: 0, padding: '24px', opacity: 0.04, pointerEvents: 'none', userSelect: 'none' }}>
              <LayoutGrid size={220} />
            </div>

            {/* Subtle top gradient line */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
              background: isDark
                ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)'
                : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)'
            }} />

            <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '24px', paddingBottom: '24px' }}>
              <div className="upload-icon-box" style={{ width: '80px', height: '80px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <Layers size={32} style={{ color: c.text }} />
              </div>
              <h3 className="upload-card-title" style={{ fontSize: '1.5rem', fontWeight: 500, marginBottom: '10px', letterSpacing: '-0.02em' }}>
                Upload Your Floor Plan
              </h3>
              <p className="upload-card-sub" style={{ fontFamily: 'monospace', fontSize: '11px', marginBottom: '40px', letterSpacing: '0.25em', textTransform: 'uppercase' }}>
                JPG · PNG · up to 10 MB — AI renders in under 30s
              </p>

              <div className="upload-inner-dark" style={{ width: '100%', maxWidth: '576px' }}>
                <Upload onComplete={handleUploadComplete} />
              </div>
            </div>
          </div>
        </section>

        {/* ARCHIVE SECTION */}
        <section id="archive" style={{ padding: '0 24px 160px', maxWidth: '1152px', margin: '0 auto', scrollMarginTop: '96px' }}>

          <div className="archive-divider" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px', borderBottom: `1px solid ${c.cardBorder}`, paddingBottom: '24px' }}>
            <div>
              <h2 className="archive-heading">Archive</h2>
              <p className="archive-subheading">LOCAL_STORAGE_INDEX</p>
            </div>

            {/* Elegant, low-key project count */}
            <div className="project-count-badge">
              <span className="project-count-badge-num">{String(projects.length).padStart(2, '0')}</span>
              <span className="project-count-badge-label">Projects</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '32px' }}>
            {projects.length > 0 ? projects.map((proj) => (
              <div
                key={proj.id}
                className="proj-card"
                onClick={() => navigate(`/visualizer/${proj.id}`)}
              >
                <div style={{ aspectRatio: '4/3', position: 'relative', overflow: 'hidden', background: '#0a0a0d' }}>
                  <img
                    src={proj.renderedImage || proj.sourceImage}
                    style={{ objectFit: 'cover', width: '100%', height: '100%', opacity: 0.8, transition: 'opacity 0.7s, transform 0.7s' }}
                    onMouseEnter={e => { (e.target as HTMLImageElement).style.opacity = '1'; (e.target as HTMLImageElement).style.transform = 'scale(1.05)'; }}
                    onMouseLeave={e => { (e.target as HTMLImageElement).style.opacity = '0.8'; (e.target as HTMLImageElement).style.transform = 'scale(1)'; }}
                    alt="preview"
                  />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                    <span className="status-tag">
                      {proj.renderedImage ? 'Status: 100%' : 'Status: Pending'}
                    </span>
                  </div>
                </div>
                <div className="proj-card-footer">
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: '13px', letterSpacing: '0.15em', textTransform: 'uppercase', color: c.text, transition: 'color 0.4s' }}>{proj.name}</h3>
                    <span style={{ fontSize: '10px', fontFamily: 'monospace', color: c.subtext, marginTop: '6px', display: 'block', transition: 'color 0.4s' }}>
                      {new Date(proj.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <ArrowUpRight size={18} style={{ color: c.subtext, transition: 'color 0.3s' }} />
                </div>
              </div>
            )) : (
              <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                NO_PROJECTS_FOUND_IN_BUFFER
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}