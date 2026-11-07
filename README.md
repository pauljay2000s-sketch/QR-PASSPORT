 
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, viewport-fit=cover" />
  <title>QR Attendance Scanner</title>
  <meta name="theme-color" content="#0047CC" />
  <link rel="manifest" href="manifest.webmanifest" />
  <link rel="icon" type="image/png" href="icon-192.png" />
  <link rel="apple-touch-icon" href="icon-192.png" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="mobile-web-app-capable" content="yes" />
  <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
  <script src="https://cdn.jsdelivr.net/npm/html5-qrcode@2.3.8/html5-qrcode.min.js"></script>
  <style>
    :root {
      --blue:       #0047CC;
      --blue-dark:  #003399;
      --blue-light: #E8F0FF;
      --green:      #0A7C3E;
      --green-bg:   #E6F4ED;
      --red:        #C0392B;
      --red-bg:     #FDECEA;
      --yellow:     #92400E;
      --yellow-bg:  #FEF3C7;
      --ink:        #111827;
      --muted:      #6B7280;
      --border:     #E5E7EB;
      --surface:    #FFFFFF;
      --bg:         #F3F6FB;
      color-scheme: light;
    }
    @media (prefers-color-scheme: dark) {
      :root:not([data-theme="light"]) {
        --blue-light: #10233F;
        --green-bg:   #0F2A1B;
        --red-bg:     #3A1613;
        --yellow-bg:  #3A2A0B;
        --ink:        #F3F4F6;
        --muted:      #9CA3AF;
        --border:     #2A2F3A;
        --surface:    #171B24;
        --bg:         #0D0F14;
      }
    }
    :root[data-theme="dark"] {
      --blue-light: #10233F;
      --green-bg:   #0F2A1B;
      --red-bg:     #3A1613;
      --yellow-bg:  #3A2A0B;
      --ink:        #F3F4F6;
      --muted:      #9CA3AF;
      --border:     #2A2F3A;
      --surface:    #171B24;
      --bg:         #0D0F14;
    }
 
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
    html { scroll-padding-top: env(safe-area-inset-top, 0px); overscroll-behavior-y: none; }
    body {
      font-family: 'DM Sans', sans-serif;
      background: var(--bg);
      min-height: 100dvh;
      display: flex;
      flex-direction: column;
      align-items: center;
      color: var(--ink);
      overscroll-behavior-y: none;
    }
 
    /* ── Header ── */
    header {
      width: 100%;
      background: var(--blue);
      padding: calc(1rem + env(safe-area-inset-top, 0px)) 1.5rem 0.9rem;
      text-align: center;
      color: white;
      position: relative;
      overflow: hidden;
    }
    header::after {
      content: '';
      position: absolute;
      inset: 0;
      background: repeating-linear-gradient(45deg,rgba(255,255,255,0.03) 0px,rgba(255,255,255,0.03) 1px,transparent 1px,transparent 12px);
      pointer-events: none;
    }
    .header-title { font-size: 1.1rem; font-weight: 700; }
    .header-sub   { font-size: 0.75rem; opacity: 0.75; margin-top: 0.15rem; font-family: 'DM Mono', monospace; }
 
    /* ── Counter bar ── */
    .counter-bar {
      width: 100%;
      background: var(--blue-dark);
      display: flex;
      justify-content: center;
      gap: 2rem;
      padding: 0.5rem 1rem;
    }
    .counter-item { display: flex; flex-direction: column; align-items: center; color: white; }
    .counter-num  { font-size: 1.3rem; font-weight: 700; font-family: 'DM Mono', monospace; line-height: 1; transition: transform 0.15s; }
    .counter-num.bump { transform: scale(1.25); }
    .counter-lbl  { font-size: 0.65rem; opacity: 0.75; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 0.1rem; }
 
    /* ── Tabs ── */
    .tabs {
      width: 100%;
      max-width: 420px;
      display: flex;
      border-bottom: 2px solid var(--border);
      margin-top: 0.75rem;
      background: var(--surface);
      border-radius: 12px 12px 0 0;
      overflow: hidden;
    }
    .tab {
      flex: 1;
      padding: 0.85rem 0.7rem;
      text-align: center;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      color: var(--muted);
      border-bottom: 2px solid transparent;
      margin-bottom: -2px;
      transition: all 0.15s;
      user-select: none;
      min-height: 44px;
    }
    .tab.active { color: var(--blue); border-bottom-color: var(--blue); background: var(--blue-light); }
 
    /* ── Content panels ── */
    .content {
      width: 100%;
      max-width: 420px;
      padding: 0.75rem 1rem calc(2rem + env(safe-area-inset-bottom, 0px));
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }
    .panel { display: none; flex-direction: column; gap: 0.85rem; }
    .panel.active { display: flex; }
 
    /* ── Strand pills ── */
    .strand-row { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
    .strand-label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); font-family: 'DM Mono', monospace; }
    .strand-pills { display: flex; gap: 0.35rem; flex-wrap: wrap; }
    .pill { padding: 0.4rem 0.7rem; min-height: 32px; display: flex; align-items: center; border-radius: 999px; border: 1.5px solid var(--border); background: var(--surface); font-size: 0.75rem; font-weight: 700; font-family: 'DM Mono', monospace; cursor: pointer; color: var(--muted); transition: all 0.15s; user-select: none; }
    .pill:hover { border-color: var(--blue); color: var(--blue); }
    .pill.active { background: var(--blue); border-color: var(--blue); color: white; }
 
    /* ── Camera ── */
    .camera-card { position: relative; background: var(--surface); border-radius: 14px; overflow: hidden; border: 1.5px solid var(--border); box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
    .camera-label { padding: 0.6rem 1rem 0.4rem; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); font-family: 'DM Mono', monospace; display: flex; align-items: center; justify-content: space-between; gap: 0.4rem; }
    .camera-label-left { display: flex; align-items: center; gap: 0.4rem; }
    .cam-dot { width: 7px; height: 7px; border-radius: 50%; background: #ccc; transition: background 0.3s; flex-shrink: 0; }
    .cam-dot.active { background: #22c55e; box-shadow: 0 0 6px #22c55e; }
    .torch-btn {
      border: 1.5px solid var(--border); background: var(--surface); border-radius: 8px;
      width: 30px; height: 30px; display: none; align-items: center; justify-content: center;
      cursor: pointer; font-size: 0.9rem; color: var(--muted); transition: all 0.15s; flex-shrink: 0;
    }
    .torch-btn.show { display: flex; }
    .torch-btn.on { background: #FEF3C7; border-color: #F59E0B; color: #92400E; }
    #reader { width: 100%; min-height: 230px; position: relative; background: #000; }
    #reader video { border-radius: 0 !important; width: 100% !important; }
    #reader img   { display: none !important; }
    .camera-fallback {
      min-height: 230px; display: none; flex-direction: column; align-items: center; justify-content: center;
      gap: 0.75rem; padding: 1.5rem; text-align: center; color: white; background: #1a1a1a;
    }
    .camera-fallback.show { display: flex; }
    .camera-fallback-icon { font-size: 2rem; }
    .camera-fallback-msg { font-size: 0.85rem; opacity: 0.85; line-height: 1.4; }
    .btn-retry-camera {
      padding: 0.55rem 1.1rem; border-radius: 8px; border: 1.5px solid rgba(255,255,255,0.3);
      background: rgba(255,255,255,0.08); color: white; font-size: 0.8rem; font-weight: 700;
      font-family: 'DM Sans', sans-serif; cursor: pointer;
    }
 
    /* ── Info card ── */
    .info-card { background: var(--surface); border-radius: 14px; border: 1.5px solid var(--border); box-shadow: 0 2px 12px rgba(0,0,0,0.06); overflow: hidden; }
    .info-card-header { padding: 0.6rem 1rem 0.4rem; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); font-family: 'DM Mono', monospace; border-bottom: 1px solid var(--border); }
    .info-rows { padding: 0.2rem 0; }
    .info-row { display: flex; justify-content: space-between; align-items: center; padding: 0.55rem 1rem; border-bottom: 1px solid var(--border); }
    .info-row:last-child { border-bottom: none; }
    .info-key { font-size: 0.75rem; font-weight: 700; font-family: 'DM Mono', monospace; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; }
    .info-val { font-size: 0.9rem; font-weight: 600; color: var(--ink); text-align: right; }
    .info-val.empty { color: var(--muted); opacity: 0.5; font-weight: 400; }
    .info-val.big { font-size: 1.1rem; font-weight: 700; }
 
    /* ── Status banner ── */
    .status-banner { border-radius: 10px; padding: 0.65rem 1rem; font-size: 0.85rem; font-weight: 600; display: none; align-items: center; gap: 0.5rem; animation: slideIn 0.2s ease; }
    .status-banner.show  { display: flex; }
    .status-banner.error   { background: var(--red-bg);    color: var(--red);    }
    .status-banner.success { background: var(--green-bg);  color: var(--green);  }
    .status-banner.info    { background: var(--blue-light); color: var(--blue);  }
    .status-banner.warning { background: var(--yellow-bg); color: var(--yellow); }
 
    /* ── Buttons ── */
    .btn-primary {
      width: 100%; padding: 0.85rem; min-height: 48px; border: none; border-radius: 10px;
      background: var(--blue); color: white; font-size: 0.92rem; font-weight: 700;
      font-family: 'DM Sans', sans-serif; cursor: pointer; letter-spacing: 0.02em;
      transition: background 0.15s, transform 0.1s, opacity 0.15s;
      display: flex; align-items: center; justify-content: center; gap: 0.5rem;
    }
    .btn-primary:hover:not(:disabled) { background: var(--blue-dark); }
    .btn-primary:active:not(:disabled) { transform: scale(0.98); }
    .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
    .btn-secondary {
      width: 100%; padding: 0.75rem; min-height: 44px; border: 1.5px solid var(--blue); border-radius: 10px;
      background: transparent; color: var(--blue); font-size: 0.88rem; font-weight: 700;
      font-family: 'DM Sans', sans-serif; cursor: pointer; transition: background 0.15s; display: none;
    }
    .btn-secondary:hover { background: var(--blue-light); }
    .btn-secondary.show { display: block; }
    .btn-row { display: flex; flex-direction: column; gap: 0.5rem; }
 
    .spinner {
      width: 16px; height: 16px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.35);
      border-top-color: white; animation: spin 0.7s linear infinite; flex-shrink: 0;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
 
    /* ── Today's log (attendance tab) ── */
    .log-toolbar { display: flex; align-items: center; justify-content: space-between; }
    .log-date { font-size: 0.78rem; font-family: 'DM Mono', monospace; color: var(--muted); font-weight: 600; }
    .btn-refresh {
      padding: 0.45rem 0.85rem; min-height: 36px; border: 1.5px solid var(--border); border-radius: 8px;
      background: var(--surface); font-size: 0.78rem; font-weight: 700; color: var(--blue); cursor: pointer;
      font-family: 'DM Sans', sans-serif; transition: background 0.15s; display: flex; align-items: center; gap: 0.3rem;
    }
    .btn-refresh:hover { background: var(--blue-light); }
    .btn-refresh.spinning .refresh-icon { animation: spin 0.7s linear infinite; display: inline-block; }
    .log-loading { font-size: 0.85rem; color: var(--muted); text-align: center; padding: 1.5rem 0; font-style: italic; }
    .log-empty   { font-size: 0.85rem; color: var(--muted); text-align: center; padding: 1.5rem 0; font-style: italic; }
 
    /* filter row */
    .filter-row { display: flex; gap: 0.4rem; align-items: center; flex-wrap: wrap; }
    .filter-input {
      flex: 1; min-width: 120px; min-height: 40px; padding: 0.4rem 0.7rem; border: 1.5px solid var(--border);
      border-radius: 8px; font-size: 0.9rem; font-family: 'DM Sans', sans-serif; outline: none;
      transition: border-color 0.15s; background: var(--surface); color: var(--ink);
    }
    .filter-input:focus { border-color: var(--blue); }
 
    .log-list { display: flex; flex-direction: column; gap: 0.4rem; }
    .log-item { background: var(--surface); border: 1.5px solid var(--border); border-radius: 10px; padding: 0.6rem 0.9rem; display: flex; justify-content: space-between; align-items: center; animation: slideIn 0.2s ease; }
    .log-item.duplicate { border-color: #FCD34D; background: var(--yellow-bg); }
    @keyframes slideIn { from { opacity:0; transform:translateY(-5px); } to { opacity:1; transform:translateY(0); } }
    .log-left { display: flex; flex-direction: column; gap: 0.1rem; min-width: 0; }
    .log-name { font-size: 0.88rem; font-weight: 700; color: var(--ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .log-meta { font-size: 0.72rem; color: var(--muted); font-family: 'DM Mono', monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .log-right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.15rem; flex-shrink: 0; margin-left: 0.5rem; }
    .log-time { font-size: 0.72rem; font-family: 'DM Mono', monospace; color: var(--green); font-weight: 600; background: var(--green-bg); padding: 0.18rem 0.45rem; border-radius: 5px; }
    .log-dup-badge { font-size: 0.65rem; font-weight: 700; background: #FCD34D; color: #92400E; padding: 0.1rem 0.4rem; border-radius: 4px; text-align: center; }
 
    /* scan feedback flash over the camera */
    .scan-flash { position: absolute; inset: 0; pointer-events: none; opacity: 0; box-shadow: inset 0 0 0 6px currentColor; background: currentColor; background-clip: content-box; }
    .scan-flash.ok   { color: #22c55e; }
    .scan-flash.warn { color: #F59E0B; }
    .scan-flash.err  { color: #ef4444; }
    .scan-flash.go { animation: flash 0.7s ease-out; }
    @keyframes flash { 0% { opacity: 0.45; } 100% { opacity: 0; } }
 
    /* offline upload queue notice */
    .pending-bar { display: none; width: 100%; background: var(--yellow-bg); color: var(--yellow); font-size: 0.78rem; font-weight: 700; padding: 0.45rem 1rem; text-align: center; }
    .pending-bar.show { display: block; }
 
    /* focus visibility for keyboard users */
    a:focus-visible, button:focus-visible, .pill:focus-visible, .tab:focus-visible, input:focus-visible {
      outline: 2px solid var(--blue); outline-offset: 2px;
    }
    @media (prefers-reduced-motion: reduce) {
      * { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }
    }
  </style>
</head>
<body>
 
<header>
  <div class="header-title">QR Attendance Scanner</div>
  <div class="header-sub" id="headerSub">Point camera at student QR code</div>
</header>
 
<!-- Counter bar -->
<div class="counter-bar">
  <div class="counter-item">
    <span class="counter-num" id="cntTotal">—</span>
    <span class="counter-lbl">Today's Total</span>
  </div>
  <div class="counter-item">
    <span class="counter-num" id="cntSession">0</span>
    <span class="counter-lbl">This Session</span>
  </div>
  <div class="counter-item">
    <span class="counter-num" id="cntDup">0</span>
    <span class="counter-lbl">Duplicates</span>
  </div>
</div>
 
<div class="pending-bar" id="pendingBar" role="status"></div>
 
<!-- Tabs -->
<div class="tabs" role="tablist">
  <div class="tab active" data-tab="scan" role="tab" tabindex="0" aria-selected="true">📷 Scanner</div>
  <div class="tab" data-tab="log" role="tab" tabindex="0" aria-selected="false">📋 Today's Log</div>
</div>
 
<div class="content">
 
  <!-- ── SCAN PANEL ── -->
  <div class="panel active" id="panel-scan">
 
    <div class="strand-row">
      <span class="strand-label">Strand</span>
      <div class="strand-pills" id="strandPills">
        <div class="pill active" data-strand="">ALL</div>
        <div class="pill" data-strand="HUMSS">HUMSS</div>
        <div class="pill" data-strand="STEM">STEM</div>
        <div class="pill" data-strand="ABM">ABM</div>
        <div class="pill" data-strand="TVL">TVL</div>
      </div>
    </div>
 
    <div class="camera-card">
      <div class="camera-label">
        <span class="camera-label-left">
          <span class="cam-dot" id="camDot"></span>
          Camera
        </span>
        <button class="torch-btn" id="torchBtn" title="Toggle flashlight" aria-label="Toggle flashlight">💡</button>
      </div>
      <div id="reader"></div>
      <div class="scan-flash" id="scanFlash"></div>
      <div class="camera-fallback" id="cameraFallback">
        <div class="camera-fallback-icon">📵</div>
        <div class="camera-fallback-msg" id="cameraFallbackMsg">Couldn't access the camera. Check your browser's camera permission and try again.</div>
        <button class="btn-retry-camera" id="retryCameraBtn">Retry Camera</button>
      </div>
    </div>
 
    <div class="status-banner" id="statusBanner" role="status" aria-live="polite"></div>
 
    <div class="info-card">
      <div class="info-card-header">Student Info</div>
      <div class="info-rows">
        <div class="info-row"><span class="info-key">ID</span>      <span class="info-val empty" id="fId">—</span></div>
        <div class="info-row"><span class="info-key">Name</span>    <span class="info-val empty big" id="fName">—</span></div>
        <div class="info-row"><span class="info-key">Section</span> <span class="info-val empty" id="fSection">—</span></div>
        <div class="info-row"><span class="info-key">Strand</span>  <span class="info-val empty" id="fStrand">—</span></div>
      </div>
    </div>
 
    <div class="btn-row">
      <button class="btn-primary" id="submitBtn" disabled>Submit Attendance</button>
      <button class="btn-secondary" id="rescanBtn">↩ Scan Another Student</button>
    </div>
 
  </div>
 
  <!-- ── LOG PANEL ── -->
  <div class="panel" id="panel-log">
 
    <div class="log-toolbar">
      <span class="log-date" id="logDate">—</span>
      <button class="btn-refresh" id="refreshBtn"><span class="refresh-icon">⟳</span> Refresh</button>
    </div>
 
    <div class="filter-row">
      <input class="filter-input" id="filterInput" type="text" placeholder="Search name, ID, section…" inputmode="search" />
    </div>
 
    <div id="logContent">
      <div class="log-loading">Loading today's attendance…</div>
    </div>
 
  </div>
 
</div>
 
<script>
  const BACKEND_URL = "https://script.google.com/macros/s/AKfycbzM3xpCBQTqWn7nRqp49qhbLR3ZfuEViyRmB-8ubpNoJLoMyRGgHD7wvmmX2xzx5IuA/exec";
  const SCAN_COOLDOWN_MS = 1200; // ignore repeat triggers of the same/any code right after a successful read
 
  // ── State ────────────────────────────────────────────────────────
  let scannedData    = null;
  let selectedStrand = "";
  let html5QrCode    = null;
  let scannerRunning = false;   // camera stream is live
  let scannerPaused  = false;   // paused (e.g. while on Log tab), stream kept warm
  let torchOn        = false;
  let lastScanAt     = 0;
  let sessionCount   = 0;
  let dupCount       = 0;
  let todayLog       = [];   // [{id, name, section, strand, times:[...]}]
  let filterText     = "";
  let lastText       = "";   // same QR still in front of the camera? ignore it
  let lastTextAt     = 0;
  let logDay         = new Date().toDateString();
  const QUEUE_KEY    = "qr_pending";
  const STRAND_KEY   = "qr_strand";
 
  // ── DOM ──────────────────────────────────────────────────────────
  const submitBtn      = document.getElementById("submitBtn");
  const rescanBtn       = document.getElementById("rescanBtn");
  const statusEl        = document.getElementById("statusBanner");
  const camDot          = document.getElementById("camDot");
  const cntTotal        = document.getElementById("cntTotal");
  const cntSession      = document.getElementById("cntSession");
  const cntDup          = document.getElementById("cntDup");
  const torchBtn        = document.getElementById("torchBtn");
  const readerEl        = document.getElementById("reader");
  const cameraFallback  = document.getElementById("cameraFallback");
  const cameraFallbackMsg = document.getElementById("cameraFallbackMsg");
  const retryCameraBtn  = document.getElementById("retryCameraBtn");
 
  // ── Small helpers ────────────────────────────────────────────────
  function bump(el) {
    el.classList.remove("bump");
    void el.offsetWidth; // restart animation
    el.classList.add("bump");
  }
  function vibrate(pattern) {
    if (navigator.vibrate) { try { navigator.vibrate(pattern); } catch (e) {} }
  }
  // Short WebAudio beep — no network/asset needed, works offline.
  let audioCtx = null;
  function beep(freq = 880, ms = 110) {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.frequency.value = freq;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + ms / 1000);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + ms / 1000);
    } catch (e) {}
  }
 
  const scanFlashEl = document.getElementById("scanFlash");
  function flash(type) {
    scanFlashEl.className = "scan-flash " + type;
    void scanFlashEl.offsetWidth;
    scanFlashEl.classList.add("go");
  }
 
  // ── Offline queue (scans that failed to upload are kept and retried) ──
  function queueGet() { try { return JSON.parse(localStorage.getItem(QUEUE_KEY)) || []; } catch (e) { return []; } }
  function queueSet(q) { try { localStorage.setItem(QUEUE_KEY, JSON.stringify(q)); } catch (e) {} updatePendingBar(); }
  function queueAdd(d) { const q = queueGet(); q.push(d); queueSet(q); }
  function updatePendingBar() {
    const n = queueGet().length;
    const bar = document.getElementById("pendingBar");
    bar.textContent = n ? `📡 ${n} scan${n > 1 ? "s" : ""} waiting to upload — retrying automatically` : "";
    bar.classList.toggle("show", n > 0);
  }
  function sendAttendance(data) {
    const params = new URLSearchParams({ action: "attendance", payload: JSON.stringify(data) });
    // GET with URL params is more reliable than a no-cors POST against Apps Script web apps.
    return fetch(BACKEND_URL + "?" + params.toString(), { method: "GET", mode: "no-cors" });
  }
  let flushing = false;
  async function flushQueue() {
    if (flushing) return;
    flushing = true;
    try {
      let q = queueGet();
      while (q.length) {
        try { await sendAttendance(q[0]); q.shift(); queueSet(q); }
        catch (e) { break; }
      }
    } finally { flushing = false; }
  }
 
  // ── Tabs ─────────────────────────────────────────────────────────
  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => activateTab(tab.dataset.tab));
    tab.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activateTab(tab.dataset.tab); }
    });
  });
 
  function activateTab(name) {
    document.querySelectorAll(".tab").forEach(t => {
      t.classList.toggle("active", t.dataset.tab === name);
      t.setAttribute("aria-selected", t.dataset.tab === name);
    });
    document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
    document.getElementById("panel-" + name).classList.add("active");
 
    if (name === "log") {
      pauseScanner();     // save battery / camera light while browsing the log
      loadTodayLog();
    } else if (!scannedData) {
      resumeScanner();   // don't resume while a scanned student is waiting for Submit
    }
  }
 
  // ── Strand pills ─────────────────────────────────────────────────
  document.getElementById("strandPills").addEventListener("click", e => {
    const pill = e.target.closest(".pill");
    if (!pill) return;
    setStrand(pill.dataset.strand);
  });
  function setStrand(value) {
    const pill = [...document.querySelectorAll(".pill")].find(p => p.dataset.strand === value);
    if (!pill) return;
    document.querySelectorAll(".pill").forEach(p => p.classList.remove("active"));
    pill.classList.add("active");
    selectedStrand = value;
    try { localStorage.setItem(STRAND_KEY, value); } catch (e) {}
  }
 
  // ── Status helpers ───────────────────────────────────────────────
  function setStatus(msg, type = "error") {
    statusEl.textContent = msg;
    statusEl.className   = "status-banner show " + type;
  }
  function clearStatus() { statusEl.className = "status-banner"; }
 
  function fillCard(data) {
    const set = (id, val) => {
      const el = document.getElementById(id);
      el.textContent = val;
      el.classList.remove("empty");
    };
    set("fId", data.id); set("fName", data.name);
    set("fSection", data.section); set("fStrand", data.strand);
  }
  function clearCard() {
    ["fId","fName","fSection","fStrand"].forEach(id => {
      const el = document.getElementById(id);
      el.textContent = "—"; el.classList.add("empty");
    });
  }
 
  // ── Scanner ──────────────────────────────────────────────────────
  function showCameraError(msg) {
    cameraFallbackMsg.textContent = msg || "Couldn't access the camera. Check your browser's camera permission and try again.";
    cameraFallback.classList.add("show");
    readerEl.style.display = "none";
    camDot.classList.remove("active");
  }
  function hideCameraError() {
    cameraFallback.classList.remove("show");
    readerEl.style.display = "block";
  }
 
  async function startScanner() {
    hideCameraError();
    html5QrCode = new Html5Qrcode("reader");
    try {
      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: (w, h) => { const s = Math.floor(Math.min(w, h) * 0.7); return { width: s, height: s }; } },
        onScanSuccess,
        () => {} // ignore per-frame "not found" callbacks
      );
      scannerRunning = true;
      scannerPaused = false;
      camDot.classList.add("active");
      setupTorchButton();
    } catch (err) {
      scannerRunning = false;
      const msg = String(err).toLowerCase().includes("permission")
        ? "Camera permission was denied. Allow camera access in your browser settings, then retry."
        : "Couldn't start the camera: " + err;
      showCameraError(msg);
    }
  }
 
  function pauseScanner() {
    if (html5QrCode && scannerRunning && !scannerPaused) {
      try { html5QrCode.pause(true); scannerPaused = true; camDot.classList.remove("active"); } catch (e) {}
    }
  }
  function resumeScanner() {
    if (html5QrCode && scannerRunning && scannerPaused) {
      try { html5QrCode.resume(); scannerPaused = false; camDot.classList.add("active"); } catch (e) {}
    } else if (!html5QrCode) {
      startScanner();
    }
  }
  function stopScanner() {
    if (html5QrCode && scannerRunning) {
      html5QrCode.stop().then(() => {
        scannerRunning = false;
        scannerPaused = false;
        camDot.classList.remove("active");
      }).catch(() => {});
    }
  }
 
  function setupTorchButton() {
    torchBtn.classList.remove("show");
    try {
      const caps = html5QrCode.getRunningTrackCameraCapabilities();
      const torchFeature = caps.torchFeature ? caps.torchFeature() : null;
      if (torchFeature && torchFeature.isSupported && torchFeature.isSupported()) {
        torchBtn.classList.add("show");
      }
    } catch (e) { /* torch not supported on this device/browser */ }
  }
  torchBtn.addEventListener("click", async () => {
    if (!html5QrCode || !scannerRunning) return;
    try {
      const caps = html5QrCode.getRunningTrackCameraCapabilities();
      torchOn = !torchOn;
      await caps.torchFeature().apply(torchOn);
      torchBtn.classList.toggle("on", torchOn);
    } catch (e) {
      setStatus("⚠️ Flashlight isn't supported on this device.", "warning");
    }
  });
  retryCameraBtn.addEventListener("click", startScanner);
 
  function onScanSuccess(decodedText) {
    const now = performance.now();
    if (now - lastScanAt < SCAN_COOLDOWN_MS) return; // debounce rapid repeat reads
    if (decodedText === lastText && now - lastTextAt < 4000) return; // same QR still in view
    lastScanAt = now;
    lastText = decodedText; lastTextAt = now;
 
    let data;
    try { data = JSON.parse(decodedText); }
    catch { setStatus("❌ Invalid QR — expected JSON format.", "error"); vibrate(200); flash("err"); return; }
 
    if (!data.id || !data.name || !data.section || !data.strand) {
      setStatus("❌ QR is missing required fields.", "error"); vibrate(200); flash("err"); return;
    }
    if (selectedStrand && data.strand.toUpperCase() !== selectedStrand) {
      setStatus(`❌ QR is for ${data.strand}, scanner set to ${selectedStrand}.`, "error"); vibrate(200); flash("err"); return;
    }
 
    // Check duplicate in today's log
    const existing = todayLog.find(r => r.id === String(data.id));
    if (existing) {
      setStatus(`⚠️ ${data.name} already scanned today (${existing.times[0]}). Submit again to log re-entry.`, "warning");
      beep(520, 160); flash("warn");
    } else {
      setStatus("✅ QR scanned! Press Submit to record attendance.", "info");
      beep(880, 100); flash("ok");
    }
    vibrate(60);
 
    scannedData = data;
    pauseScanner();
    fillCard(data);
    submitBtn.disabled = false;
    rescanBtn.classList.add("show");
  }
 
  // ── Submit ───────────────────────────────────────────────────────
  submitBtn.addEventListener("click", async () => {
    if (!scannedData) return;
    const data = scannedData;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Submitting…';
    setStatus("⏳ Submitting…", "info");
 
    let queued = false;
    try { await sendAttendance(data); }
    catch (err) { queueAdd(data); queued = true; }
 
    const existing = todayLog.find(r => r.id === String(data.id));
    const now = new Date().toLocaleTimeString("en-PH", { hour:"2-digit", minute:"2-digit", second:"2-digit" });
 
    if (existing) {
      existing.times.unshift(now);
      dupCount++;
      cntDup.textContent = dupCount;
      bump(cntDup);
    } else {
      todayLog.unshift({ id: String(data.id), name: data.name, section: data.section, strand: data.strand, times: [now] });
    }
    if (queued)        setStatus(`📡 No connection — ${data.name} saved on this device and will upload automatically.`, "warning");
    else if (existing) setStatus(`⚠️ Duplicate logged — ${data.name} scanned again at ${now}.`, "warning");
    else               setStatus(`✅ Attendance recorded at ${now}!`, "success");
    vibrate([40, 60, 40]);
 
    sessionCount++;
    cntSession.textContent = sessionCount; bump(cntSession);
    cntTotal.textContent   = todayLog.length; bump(cntTotal);
    scannedData = null;
    submitBtn.innerHTML = "Submit Attendance";
    rescanBtn.classList.remove("show");
    setTimeout(() => { if (!scannedData) resumeScanner(); }, 800); // ready for the next student
  });
 
  // ── Rescan ───────────────────────────────────────────────────────
  rescanBtn.addEventListener("click", () => {
    scannedData = null;
    submitBtn.disabled = true;
    rescanBtn.classList.remove("show");
    clearCard(); clearStatus();
    resumeScanner();
  });
 
  // ── Load today's log from backend ─────────────────────────────────
  async function loadTodayLog() {
    const logContent = document.getElementById("logContent");
    const refreshBtn = document.getElementById("refreshBtn");
    refreshBtn.classList.add("spinning");
    const dayKey = new Date().toDateString();
    if (dayKey !== logDay) { logDay = dayKey; todayLog = []; dupCount = 0; cntDup.textContent = 0; cntTotal.textContent = "—"; }
    if (todayLog.length === 0) {
      logContent.innerHTML = '<div class="log-loading">Loading today\'s attendance…</div>';
    }
 
    const today = new Date().toLocaleDateString("en-PH", { weekday:"long", year:"numeric", month:"long", day:"numeric" });
    document.getElementById("logDate").textContent = today;
 
    try {
      const url = BACKEND_URL + "?action=getToday";
      const res = await fetch(url, { mode: "cors" });
      const json = await res.json();
 
      if (json.success && json.records) {
        json.records.forEach(r => {
          const have = todayLog.find(x => x.id === String(r.id));
          if (!have) todayLog.push({ id: String(r.id), name: r.name, section: r.section, strand: r.strand, times: r.times });
          else if ((r.times || []).length > have.times.length) have.times = r.times; // another device logged a re-entry
        });
        cntTotal.textContent = todayLog.length;
        renderLog();
      } else if (todayLog.length === 0) {
        logContent.innerHTML = '<div class="log-empty">No attendance recorded yet today.</div>';
      }
    } catch (err) {
      if (todayLog.length > 0) {
        renderLog();
      } else {
        logContent.innerHTML = '<div class="log-empty">Could not load from server. Scans from this session will appear here after submitting.</div>';
      }
    } finally {
      refreshBtn.classList.remove("spinning");
    }
  }
 
  function renderLog() {
    const logContent = document.getElementById("logContent");
    const query = filterText.toLowerCase();
    const filtered = todayLog.filter(r =>
      r.name.toLowerCase().includes(query) ||
      r.id.toLowerCase().includes(query) ||
      r.section.toLowerCase().includes(query) ||
      r.strand.toLowerCase().includes(query)
    );
 
    if (filtered.length === 0) {
      logContent.innerHTML = '<div class="log-empty">No records match your search.</div>';
      return;
    }
 
    const html = filtered.map(r => `
      <div class="log-item ${r.times.length > 1 ? "duplicate" : ""}">
        <div class="log-left">
          <span class="log-name">${esc(r.name)}</span>
          <span class="log-meta">${esc(r.id)} · ${esc(r.section)} · ${esc(r.strand)}</span>
        </div>
        <div class="log-right">
          <span class="log-time">${esc(r.times[0])}</span>
          ${r.times.length > 1 ? `<span class="log-dup-badge">+${r.times.length - 1} re-entry</span>` : ""}
        </div>
      </div>
    `).join("");
 
    logContent.innerHTML = `<div class="log-list">${html}</div>`;
  }
 
  // ── Filter ───────────────────────────────────────────────────────
  document.getElementById("filterInput").addEventListener("input", e => {
    filterText = e.target.value;
    renderLog();
  });
 
  document.getElementById("refreshBtn").addEventListener("click", loadTodayLog);
 
  // ── Escape HTML ──────────────────────────────────────────────────
  function esc(s) {
    return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }
 
  // ── Boot ─────────────────────────────────────────────────────────
  const todayStr = new Date().toLocaleDateString("en-PH",{month:"short",day:"numeric"});
  document.getElementById("headerSub").textContent = todayStr + " · Point camera at student QR code";
  try { const saved = localStorage.getItem(STRAND_KEY); if (saved !== null) setStrand(saved); } catch (e) {}
  updatePendingBar(); flushQueue();
  window.addEventListener("online", flushQueue);
  setInterval(flushQueue, 30000);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { pauseScanner(); return; }
    if (document.getElementById("panel-scan").classList.contains("active") && !scannedData) resumeScanner();
    flushQueue(); loadTodayLog();
  });
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
  startScanner();
  loadTodayLog().then(() => { /* keep Scanner tab active on boot; log is preloaded for the counter */ });
</script>
 
</body>
</html>
 
