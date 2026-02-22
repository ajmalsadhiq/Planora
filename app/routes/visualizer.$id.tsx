import { useNavigate, useParams, useOutletContext } from "react-router";
import { useRef, useState, useEffect } from "react";
import { generate3DView } from "../../lib/ai.action";
import { jsPDF } from "jspdf";
import { Download, Share2, RefreshCcw, Trash2, Database, ArrowLeft, Layers, LayoutGrid, ChevronDown, Sun, Moon } from "lucide-react";
import { getProjectById, createProject, deleteProject } from "../../lib/puter.action";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";

export const PUTER_WORKER_URL = import.meta.env.VITE_PUTER_WORKER_URL || "";

const VisualizerId = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userId } = useOutletContext<{ userId: string }>();

  const hasInitialGenerated = useRef(false);
  const [project, setProject] = useState<DesignItem | null>(null);
  const [isProjectLoading, setIsProjectLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  const compareRef = useRef<HTMLDivElement>(null);
  const handleBack = () => navigate('/');

  const runGeneration = async (item: DesignItem) => {
    if (!id || !item.sourceImage) return;
    try {
      setIsProcessing(true);
      const result = await generate3DView({ sourceImage: item.sourceImage });
      if (result.renderedImage) {
        setCurrentImage(result.renderedImage);
        const updatedItem = {
          ...item,
          renderedImage: result.renderedImage,
          renderedPath: result.renderedPath,
          timestamp: Date.now(),
          ownerId: item.ownerId ?? userId ?? null,
        };
        const saved = await createProject({ item: updatedItem, visibility: "private" });
        if (saved) {
          setProject(saved);
          setCurrentImage(saved.renderedImage || result.renderedImage);
        }
      }
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadProject = async () => {
      if (!id) { setIsProjectLoading(false); return; }
      setIsProjectLoading(true);
      const fetchedProject = await getProjectById({ id });
      if (!isMounted) return;
      setProject(fetchedProject);
      setCurrentImage(fetchedProject?.renderedImage || null);
      setIsProjectLoading(false);
      hasInitialGenerated.current = false;
    };
    loadProject();
    return () => { isMounted = false; };
  }, [id]);

  useEffect(() => {
    if (isProjectLoading || hasInitialGenerated.current || !project?.sourceImage) return;
    if (project.renderedImage) {
      setCurrentImage(project.renderedImage);
      hasInitialGenerated.current = true;
      return;
    }
    hasInitialGenerated.current = true;
    void runGeneration(project);
  }, [project, isProjectLoading]);

  const handleExportImage = async () => {
    if (!currentImage) return;
    try {
      const response = await fetch(currentImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `planora-${id}.png`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) { console.error("Export failed", err); }
  };

  const handleDownloadPDF = () => {
    if (!currentImage) return;
    const doc = new jsPDF('l', 'px', [800, 600]);
    doc.addImage(currentImage, 'PNG', 0, 0, 800, 600);
    doc.save(`planora-${id}.pdf`);
  };

  const handleDelete = async () => {
    if (!id || !window.confirm("Delete project?")) return;
    const ok = await deleteProject(id);
    if (ok) navigate("/");
  };

  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem('planora-theme') !== 'light'; } catch { return true; }
  });

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    try { localStorage.setItem('planora-theme', next ? 'dark' : 'light'); } catch {}
  };

  useEffect(() => {
    const handler = () => setIsDark(localStorage.getItem('planora-theme') !== 'light');
    window.addEventListener('planora-theme-change', handler);
    return () => window.removeEventListener('planora-theme-change', handler);
  }, []);

  const dark = {
    pageBg:      '#1a1a1d',
    gridLine:    '#2c2c31',
    cardBg:      '#18181c',
    cardBorder:  '#2a2a30',
    cardInner:   '#1f1f24',
    accent:      '#ff2d55',
    accentHover: '#ff1744',
    text:        '#ffffff',
    subtext:     '#71717a',
    navBorder:   '#1a1a20',
  };

  const light = {
    pageBg:      '#e8e8ed',
    gridLine:    '#d0d0d8',
    cardBg:      '#d4d4dc',
    cardBorder:  '#bbbbc8',
    cardInner:   '#cbcbd6',
    accent:      '#1a3a8f',
    accentHover: '#152e75',
    text:        '#12121a',
    subtext:     '#5a5a72',
    navBorder:   '#babac8',
  };

  const c = isDark ? dark : light;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: c.pageBg, color: c.text }}>
      <style>{`
        .viz-grid-bg {
          background-image:
            radial-gradient(circle at 0% 0%, ${isDark ? 'rgba(255,45,85,0.18)' : 'rgba(37,99,235,0.18)'}, transparent 10%),
            linear-gradient(to right, ${c.gridLine} 1px, transparent 1px),
            linear-gradient(to bottom, ${c.gridLine} 1px, transparent 1px);
          background-size: auto, 60px 60px, 60px 60px;
        }
        .viz-navbar {
          position: fixed;
          inset: 0 auto auto 0;
          width: 100%;
          z-index: 9999;
          pointer-events: none;
        }
        .viz-navbar-inner {
          pointer-events: auto;
          background: ${isDark ? 'rgba(14,14,18,0.82)' : 'rgba(255,255,255,0.75)'};
          backdrop-filter: blur(22px) saturate(150%);
          -webkit-backdrop-filter: blur(22px) saturate(150%);
          border: 1px solid ${c.navBorder};
          border-radius: 28px;
          max-width: 1200px;
          width: calc(100% - 48px);
          margin: 20px auto 0;
          padding: 20px 36px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .pulse-core {
          background: ${c.accent};
          box-shadow: 0 0 12px ${c.accent}, 0 0 24px ${c.accent}66;
          animation: blink 2s infinite ease-in-out;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.6; transform: scale(1.2); }
        }
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 8px 20px;
          border-radius: 4px;
          border: 1px solid ${c.cardBorder};
          background: ${isDark ? 'rgba(25,25,30,0.8)' : 'rgba(200,200,210,0.8)'};
        }
        .status-text {
          font-size: 11px;
          font-family: monospace;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: ${c.subtext};
        }
        .glass-card {
          background: ${c.cardBg};
          border: 1px solid ${c.cardBorder};
          border-radius: 16px;
          box-shadow: 0 0 0 1px ${c.cardBorder}44, 0 24px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04);
        }
        .action-tab {
          background: ${isDark ? '#26262c' : c.cardBg};
          border: 1px solid ${isDark ? '#48484f' : c.cardBorder};
          color: ${isDark ? '#c4c4cc' : c.subtext};
          font-family: monospace;
          font-size: 11px;
          letter-spacing: 0.1em;
          padding: 12px 22px;
          border-radius: 2px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
        }
        .action-tab:hover:not(:disabled) { border-color: ${c.accent}; color: ${c.accent}; background: ${c.cardInner}; }
        .action-tab:disabled { opacity: 0.35; cursor: not-allowed; }
        .action-tab-danger {
          background: ${isDark ? '#26262c' : c.cardBg};
          border: 1px solid ${isDark ? '#48484f' : c.cardBorder};
          color: ${isDark ? '#c4c4cc' : c.subtext};
          padding: 12px;
          border-radius: 2px;
          display: inline-flex;
          align-items: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .action-tab-danger:hover { border-color: #ef4444; color: #ef4444; background: ${c.cardInner}; }
        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: monospace;
          font-size: 12px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: ${c.subtext};
          cursor: pointer;
          border: none;
          background: none;
          padding: 0;
          transition: color 0.2s;
        }
        .back-btn:hover { color: ${c.accent}; }
        .render-overlay {
          position: absolute;
          inset: 0;
          border-radius: 14px;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          background: ${isDark ? 'rgba(10,10,13,0.60)' : 'rgba(220,220,230,0.65)'};
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
          z-index: 10;
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1.2s linear infinite; }
        @keyframes pulse-text { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        .pulse-text { animation: pulse-text 1.6s ease-in-out infinite; }
        .meta-card {
          background: ${c.cardBg};
          border: 1px solid ${c.cardBorder};
          border-radius: 10px;
          padding: 24px;
        }
        .meta-label {
          font-size: 10px;
          font-family: monospace;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: ${c.subtext};
          margin-bottom: 8px;
        }
        .meta-value { font-size: 13px; font-family: monospace; color: ${c.text}; letter-spacing: 0.05em; }
        .status-tag {
          background: ${c.accent};
          color: white;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          display: inline-block;
          padding: 3px 8px;
        }
        .section-divider { border: none; border-top: 1px solid ${c.cardBorder}; margin: 64px 0 48px; }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(6px); } }
        .bounce { animation: bounce 1.8s ease-in-out infinite; }
      `}</style>

      {/* FLOATING NAVBAR */}
      <header className="viz-navbar">
        <div className="viz-navbar-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Layers size={22} style={{ color: c.accent }} />
            <span style={{ fontWeight: 800, fontSize: '15px', letterSpacing: '-0.02em', textTransform: 'uppercase', color: c.text }}>Planora</span>
            <span style={{ fontSize: '11px', fontFamily: 'monospace', color: c.subtext, letterSpacing: '0.1em', marginLeft: '4px' }}>/ Studio</span>
          </div>
          <div className="status-badge">
            <div className="pulse-core" style={{ width: '9px', height: '9px', borderRadius: '50%', flexShrink: 0 }} />
            <span className="status-text">{isProcessing ? 'Synthesizing…' : 'Session Active'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={toggleTheme}
              style={{
                background: 'none',
                border: `1px solid ${c.cardBorder}`,
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: c.subtext,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = c.accent)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = c.cardBorder)}
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button className="back-btn" onClick={handleBack}>
              <ArrowLeft size={13} /> Exit_Buffer
            </button>
          </div>
        </div>
      </header>

      {/* PAGE BODY */}
      <div className="viz-grid-bg" style={{ minHeight: '100vh', paddingTop: '110px' }}>
        <main style={{ maxWidth: '1152px', margin: '0 auto', padding: '48px 24px 120px' }}>

          {/* HEADER ROW */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '32px', marginBottom: '48px' }}>
            <div>
              <p style={{ fontSize: '10px', fontFamily: 'monospace', color: c.accent, letterSpacing: '0.3em', marginBottom: '10px', textTransform: 'uppercase' }}>NODE_SESSION_ACTIVE</p>
              <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 0.9, margin: 0, color: c.text }}>
                {project?.name || `Residence_${id?.slice(-4)}`}
              </h1>
              <p style={{ fontFamily: 'monospace', fontSize: '10px', letterSpacing: '0.2em', color: c.subtext, marginTop: '12px', textTransform: 'uppercase' }}>
                {new Date(project?.timestamp || Date.now()).toLocaleDateString()} — {new Date(project?.timestamp || Date.now()).toLocaleTimeString()}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button onClick={handleExportImage} disabled={!currentImage} className="action-tab"><Download size={13} /> Export_Raw</button>
              <button onClick={handleDownloadPDF} disabled={!currentImage} className="action-tab"><Share2 size={13} /> PDF_Gen</button>
              <button onClick={handleDelete} className="action-tab-danger"><Trash2 size={17} /></button>
            </div>
          </div>

          {/* MAIN STAGE — shows source image, with translucent overlay while processing */}
          <div className="glass-card" style={{ position: 'relative', overflow: 'hidden', padding: '12px' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, padding: '24px', opacity: 0.03, pointerEvents: 'none', userSelect: 'none' }}><LayoutGrid size={220} /></div>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }} />

            {/* Always show the best available image underneath */}
            {project?.sourceImage ? (
              <img
                src={currentImage || project.sourceImage}
                alt="render"
                style={{
                  display: 'block',
                  width: '100%',
                  maxHeight: '780px',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  filter: isProcessing ? 'grayscale(0.3) brightness(0.65)' : 'none',
                  transition: 'filter 0.8s ease',
                }}
              />
            ) : (
              <div style={{ minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontFamily: 'monospace', fontSize: '10px', color: c.subtext, letterSpacing: '0.2em' }}>AWAITING_RENDER_DATA...</p>
              </div>
            )}

            {/* Translucent overlay while rendering */}
            {isProcessing && (
              <div className="render-overlay">
                <RefreshCcw className="spin" size={44} style={{ color: c.accent }} />
                <div style={{ textAlign: 'center' }}>
                  <p className="pulse-text" style={{ fontFamily: 'monospace', fontSize: '12px', letterSpacing: '0.4em', color: c.accent, textTransform: 'uppercase' }}>SYNTHESIZING_3D_MODEL</p>
                  <p style={{ fontFamily: 'monospace', fontSize: '10px', letterSpacing: '0.2em', color: c.subtext, marginTop: '10px' }}>Neural_Core v2.0 — Est. 30s</p>
                </div>
              </div>
            )}

            {/* Stage tags */}
            <div style={{ position: 'absolute', bottom: '20px', left: '20px', display: 'flex', gap: '10px', pointerEvents: 'none' }}>
              <div style={{ padding: '4px 10px', background: 'rgba(0,0,0,0.7)', border: `1px solid ${c.cardBorder}`, fontFamily: 'monospace', fontSize: '9px', letterSpacing: '0.15em', color: c.subtext, borderRadius: '2px' }}>
                {isProcessing ? 'RENDER: ACTIVE' : 'STG: OUTPUT'}
              </div>
              <span className="status-tag">Neural_Core: v2.0</span>
            </div>
          </div>

          {/* SCROLL CTA after render completes */}
          {currentImage && !isProcessing && (
            <div
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginTop: '32px', cursor: 'pointer', opacity: 0.55 }}
              onClick={() => compareRef.current?.scrollIntoView({ behavior: 'smooth' })}
            >
              <span style={{ fontFamily: 'monospace', fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: c.subtext }}>Compare Before / After</span>
              <ChevronDown size={18} className="bounce" style={{ color: c.subtext }} />
            </div>
          )}

          {/* COMPARE SLIDER SECTION */}
          {currentImage && project?.sourceImage && (
            <div ref={compareRef} style={{ scrollMarginTop: '120px', marginTop: '80px' }}>
              <hr className="section-divider" />
              <div style={{ marginBottom: '40px' }}>
                <p style={{ fontSize: '10px', fontFamily: 'monospace', color: c.accent, letterSpacing: '0.3em', marginBottom: '10px', textTransform: 'uppercase' }}>BEFORE / AFTER</p>
                <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 0.95, textTransform: 'uppercase', color: c.text, margin: 0 }}>Compare</h2>
                <p style={{ fontFamily: 'monospace', fontSize: '10px', letterSpacing: '0.2em', color: c.subtext, marginTop: '10px' }}>DRAG_SLIDER — SOURCE vs RENDERED</p>
              </div>
              <div className="glass-card" style={{ overflow: 'hidden', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)', zIndex: 1 }} />
                <ReactCompareSlider
                  defaultValue={50}
                  style={{ width: '100%', height: '780px' }}
                  itemOne={<ReactCompareSliderImage src={project.sourceImage} alt="Original floor plan" style={{ objectFit: 'contain', background: c.cardInner }} />}
                  itemTwo={<ReactCompareSliderImage src={currentImage} alt="3D render" style={{ objectFit: 'contain', background: c.cardInner }} />}
                />
                <div style={{ position: 'absolute', bottom: '16px', left: '16px', pointerEvents: 'none', zIndex: 5 }}>
                  <div style={{ padding: '4px 10px', background: 'rgba(0,0,0,0.75)', border: `1px solid ${c.cardBorder}`, fontFamily: 'monospace', fontSize: '9px', letterSpacing: '0.15em', color: c.subtext, borderRadius: '2px' }}>ORIGINAL</div>
                </div>
                <div style={{ position: 'absolute', bottom: '16px', right: '16px', pointerEvents: 'none', zIndex: 5 }}>
                  <span className="status-tag">RENDERED</span>
                </div>
              </div>
            </div>
          )}

          {/* META FOOTER */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginTop: '32px' }}>
            <div className="meta-card" style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <Database size={18} style={{ color: c.subtext, flexShrink: 0, marginTop: '2px' }} />
              <div>
                <p className="meta-label">Internal_Registry</p>
                <p className="meta-value">ID_{id?.slice(0, 12)}</p>
              </div>
            </div>
            <div className="meta-card">
              <p className="meta-label">Last_Synced</p>
              <p className="meta-value">{new Date(project?.timestamp || Date.now()).toLocaleTimeString()}</p>
            </div>
            <div className="meta-card" style={{ borderColor: `${c.accent}44` }}>
              <p className="meta-label" style={{ color: c.accent }}>Render_Status</p>
              <p className="meta-value">{isProcessing ? 'Processing…' : project?.renderedImage ? 'PROCESS_COMPLETE' : 'PENDING_RENDER'}</p>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default VisualizerId;