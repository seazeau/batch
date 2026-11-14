import os

with open('/home/antigravity/scripts/build_grand_public_apps.py', 'r', encoding='utf-8') as f:
    c = f.read()

# Add simulator CSS styles
css_insertion_point = "  </style>\n</head>"
sim_css = """
    /* ==============================================================
       MOBILE DEVICE SIMULATOR & HARDWARE FRAME STYLES
       ============================================================== */
    .sim-bar {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      margin: 0 auto 16px auto;
      background: #FFFFFF;
      border: 1px solid var(--border);
      border-radius: 99px;
      box-shadow: 0 4px 14px rgba(15, 23, 42, 0.04);
      width: fit-content;
      user-select: none;
    }
    .sim-btn {
      padding: 6px 13px;
      border-radius: 99px;
      font-size: 11.5px;
      font-weight: 800;
      background: transparent;
      border: 1px solid transparent;
      color: var(--ink-500);
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .sim-btn:hover {
      color: var(--ink-900);
    }
    .sim-btn.active {
      background: var(--ink-900);
      color: #FFFFFF;
      box-shadow: 0 2px 8px rgba(15,23,42,0.18);
    }
    .device-stage {
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 0 0 30px 0;
      width: 100%;
    }
    .device-chassis {
      width: 393px;
      height: 852px;
      background: #0B0F17;
      border-radius: 54px;
      padding: 11px;
      box-shadow: 0 30px 80px -15px rgba(15, 23, 42, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.12), inset 0 0 0 2px #1E293B;
      position: relative;
      display: flex;
      flex-direction: column;
      transition: width 0.25s ease, height 0.25s ease, border-radius 0.25s ease;
      user-select: text;
    }
    .device-chassis.device-compact {
      width: 375px;
      height: 760px;
      border-radius: 46px;
    }
    .device-chassis.device-pixel {
      width: 412px;
      height: 880px;
      border-radius: 44px;
    }
    .device-chassis.device-fluid {
      width: 100%;
      max-width: 640px;
      height: auto;
      background: transparent;
      border-radius: 0;
      padding: 0;
      box-shadow: none;
      border: none;
    }
    .device-screen {
      flex: 1;
      background: var(--bg-page);
      border-radius: 44px;
      overflow-y: auto;
      overflow-x: hidden;
      position: relative;
      display: flex;
      flex-direction: column;
      padding: 12px 14px 120px 14px;
      -webkit-overflow-scrolling: touch;
      scroll-behavior: smooth;
    }
    .device-chassis.device-fluid .device-screen {
      border-radius: 0;
      background: transparent;
      overflow: visible;
      padding: 12px 0 120px 0;
    }
    .device-status-bar {
      position: sticky;
      top: 0;
      left: 0;
      right: 0;
      height: 44px;
      background: rgba(246, 248, 250, 0.88);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 20px;
      font-size: 13px;
      font-weight: 800;
      color: #0F172A;
      z-index: 60;
      user-select: none;
      border-top-left-radius: 44px;
      border-top-right-radius: 44px;
    }
    .device-island {
      position: absolute;
      top: 9px;
      left: 50%;
      transform: translateX(-50%);
      width: 114px;
      height: 28px;
      background: #000000;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 10px;
      z-index: 70;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      pointer-events: none;
    }
    .device-island-lens {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #111827;
      border: 1px solid #1F2937;
    }
    .device-home-bar {
      position: sticky;
      bottom: 8px;
      left: 50%;
      transform: translateX(-50%);
      width: 135px;
      height: 4.5px;
      background: #0F172A;
      border-radius: 99px;
      opacity: 0.35;
      z-index: 60;
      pointer-events: none;
      margin-top: 10px;
    }
    .device-chassis.device-fluid .device-status-bar,
    .device-chassis.device-fluid .device-island,
    .device-chassis.device-fluid .device-home-bar {
      display: none !important;
    }
    .device-chassis:not(.device-fluid) .bottom-dock {
      position: sticky;
      bottom: 16px;
      margin-top: auto;
      z-index: 55;
    }
    @media (max-width: 480px) {
      .sim-bar {
        display: none !important;
      }
      .device-stage {
        padding: 0 !important;
      }
      .device-chassis {
        width: 100% !important;
        height: auto !important;
        background: transparent !important;
        border-radius: 0 !important;
        padding: 0 !important;
        box-shadow: none !important;
        border: none !important;
      }
      .device-screen {
        border-radius: 0 !important;
        overflow: visible !important;
        padding: 8px 8px 120px 8px !important;
      }
      .device-status-bar, .device-island, .device-home-bar {
        display: none !important;
      }
    }
  </style>
</head>"""

assert css_insertion_point in c, "css_insertion_point not found"
c = c.replace(css_insertion_point, sim_css)

# Update HTML markup around body
old_body_start = """<body>

  <!-- Toast -->
  <div id="app-toast" class="toast">Action effectuée</div>"""

new_body_start = """<body>

  <!-- MOBILE DEVICE SIMULATOR CONTROLS -->
  <div class="sim-bar">
    <span style="font-size:11px; font-weight:800; color:var(--ink-400); text-transform:uppercase; letter-spacing:0.5px; margin-right:4px;">Aperçu :</span>
    <button class="sim-btn active" id="sim-btn-iphone" onclick="setDeviceMode('iphone')">iPhone 16 Pro (393px)</button>
    <button class="sim-btn" id="sim-btn-compact" onclick="setDeviceMode('compact')">iPhone SE (375px)</button>
    <button class="sim-btn" id="sim-btn-pixel" onclick="setDeviceMode('pixel')">Pixel 8 (412px)</button>
    <button class="sim-btn" id="sim-btn-fluid" onclick="setDeviceMode('fluid')">Plein Écran</button>
  </div>

  <div class="device-stage">
    <div id="device-chassis" class="device-chassis">
      <!-- Hardware elements -->
      <div class="device-island">
        <div class="device-island-lens"></div>
      </div>
      <div class="device-status-bar">
        <span id="device-time">9:41</span>
        <div style="display:flex; align-items:center; gap:6px;">
          <!-- Cellular 4 bars SVG -->
          <svg width="14" height="11" viewBox="0 0 14 11" fill="currentColor"><rect x="0" y="8" width="2.5" height="3" rx="0.5"/><rect x="3.5" y="5.5" width="2.5" height="5.5" rx="0.5"/><rect x="7" y="3" width="2.5" height="8" rx="0.5"/><rect x="10.5" y="0" width="2.5" height="11" rx="0.5"/></svg>
          <!-- Wifi SVG -->
          <svg width="13" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h.01"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M5 12.859a10 10 0 0 1 14 0"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/></svg>
          <!-- Battery 100% SVG -->
          <svg width="22" height="11" viewBox="0 0 24 12" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="1" y="1" width="19" height="10" rx="3"/><rect x="3" y="3" width="14" height="6" rx="1.5" fill="#10B981" stroke="none"/><path d="M22 4.5v3" stroke-linecap="round"/></svg>
        </div>
      </div>

      <div id="device-screen" class="device-screen">
        <!-- Toast -->
        <div id="app-toast" class="toast">Action effectuée</div>"""

assert old_body_start in c, "old_body_start not found"
c = c.replace(old_body_start, new_body_start)

# Close device-screen and device-chassis before script
old_body_close = """  </div> <!-- Fin app-main-content -->

  <script>"""

new_body_close = """  </div> <!-- Fin app-main-content -->

        <div class="device-home-bar"></div>
      </div> <!-- Fin device-screen -->
    </div> <!-- Fin device-chassis -->
  </div> <!-- Fin device-stage -->

  <script>"""

assert old_body_close in c, "old_body_close not found"
c = c.replace(old_body_close, new_body_close)

# Add setDeviceMode function in JS
js_func = """    function setDeviceMode(mode) {
      var chassis = document.getElementById('device-chassis');
      var btns = ['iphone', 'compact', 'pixel', 'fluid'];
      btns.forEach(function(b) {
        var el = document.getElementById('sim-btn-' + b);
        if (el) el.classList.toggle('active', b === mode);
      });
      if (chassis) {
        chassis.className = 'device-chassis' + (mode === 'fluid' ? ' device-fluid' : (mode === 'compact' ? ' device-compact' : (mode === 'pixel' ? ' device-pixel' : '')));
      }
    }

    // Live clock in status bar
    function updateDeviceClock() {
      var timeEl = document.getElementById('device-time');
      if (timeEl) {
        var now = new Date();
        var h = String(now.getHours()).padStart(2, '0');
        var m = String(now.getMinutes()).padStart(2, '0');
        timeEl.textContent = h + ':' + m;
      }
    }
    setInterval(updateDeviceClock, 30000);
    updateDeviceClock();
"""

c = c.replace("    var ALL_RECIPES = {recipes_json_str};", js_func + "\n    var ALL_RECIPES = {recipes_json_str};")

with open('/home/antigravity/scripts/build_grand_public_apps.py', 'w', encoding='utf-8') as f:
    f.write(c)

print('Updated build_grand_public_apps.py with Mobile Simulator!')
