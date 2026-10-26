const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function generateSvg() {
  // Width: 1240, Height: 840. Total canvas with 20px padding
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1240 840" width="1240" height="840">
  <defs>
    <!-- Arrow Markers -->
    <marker id="arr-blue" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="#0078D4"/>
    </marker>
    <marker id="arr-green" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="#16A34A"/>
    </marker>
    <marker id="arr-purple" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="#7C3AED"/>
    </marker>
    <marker id="arr-dark" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="#0F172A"/>
    </marker>

    <!-- Subtle Drop Shadow -->
    <filter id="card-shadow" x="-3%" y="-3%" width="106%" height="106%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#0F172A" flood-opacity="0.04"/>
    </filter>
  </defs>

  <style>
    .font-base { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    .title-main { font-weight: 800; font-size: 25px; fill: #0B2545; letter-spacing: 1.2px; text-anchor: middle; }
    .card-title { font-weight: 800; font-size: 18px; }
    .section-title { font-weight: 700; font-size: 14px; fill: #0F172A; }
    .log-item { font-weight: 500; font-size: 13px; fill: #334155; }
    .btn-text { font-weight: 700; font-size: 13px; text-anchor: middle; }
    .port-label { font-weight: 700; font-size: 12px; }
    .srv-title { font-weight: 800; font-size: 17px; fill: #0F172A; text-anchor: middle; letter-spacing: 0.5px; }
    .node-title { font-weight: 700; font-size: 14px; fill: #0F172A; text-anchor: middle; }
    .node-sub { font-weight: 500; font-size: 12px; fill: #475569; text-anchor: middle; }
    .step-title { font-weight: 800; font-size: 14px; }
    .step-sub { font-weight: 600; font-size: 12px; fill: #334155; text-anchor: middle; }
  </style>

  <!-- Outer canvas frame fully contained within bounds -->
  <rect x="18" y="18" width="1204" height="804" rx="14" fill="#FFFFFF" stroke="#6366F1" stroke-width="2.5"/>

  <!-- Top Title Bar -->
  <g class="font-base">
    <text x="620" y="52" class="title-main">WAZUH HOME LAB – SIMPLE WORKFLOW</text>
    <line x1="340" y1="64" x2="900" y2="64" stroke="#0B2545" stroke-width="2.5" stroke-linecap="round"/>
  </g>

  <!-- ==================== TOP ENDPOINT CARDS ==================== -->

  <!-- CARD 1: WINDOWS 10 VM -->
  <g class="font-base" filter="url(#card-shadow)">
    <!-- Card Boundary -->
    <rect x="52" y="88" width="348" height="260" rx="14" fill="#FFFFFF" stroke="#0078D4" stroke-width="1.8"/>

    <!-- Windows 10 Logo -->
    <g transform="translate(74, 106)">
      <rect x="0" y="0" width="13" height="13" fill="#0078D4" rx="1"/>
      <rect x="15" y="0" width="13" height="13" fill="#0078D4" rx="1"/>
      <rect x="0" y="15" width="13" height="13" fill="#0078D4" rx="1"/>
      <rect x="15" y="15" width="13" height="13" fill="#0078D4" rx="1"/>
    </g>

    <!-- Header Text -->
    <text x="114" y="127" fill="#0078D4" class="card-title">WINDOWS 10 VM</text>

    <!-- Logs Collected Header -->
    <g transform="translate(74, 149)">
      <rect x="0" y="0" width="22" height="18" rx="2" fill="none" stroke="#0F172A" stroke-width="1.5"/>
      <line x1="0" y1="6" x2="22" y2="6" stroke="#0F172A" stroke-width="1.5"/>
      <line x1="0" y1="12" x2="22" y2="12" stroke="#0F172A" stroke-width="1.5"/>
      <circle cx="17" cy="3" r="1" fill="#0F172A"/>
      <circle cx="17" cy="9" r="1" fill="#0F172A"/>
      <circle cx="17" cy="15" r="1" fill="#0F172A"/>
    </g>
    <text x="106" y="163" class="section-title">Logs Collected</text>

    <!-- Bullet items -->
    <text x="86" y="186" class="log-item">&#8226; Security Logs</text>
    <text x="86" y="205" class="log-item">&#8226; System Logs</text>
    <text x="86" y="224" class="log-item">&#8226; Application Logs</text>
    <text x="86" y="243" class="log-item">&#8226; PowerShell Logs</text>
    <text x="86" y="262" class="log-item">&#8226; Defender &amp; Sysmon Logs</text>

    <!-- Pill Button -->
    <rect x="74" y="288" width="304" height="38" rx="8" fill="#F0F7FF" stroke="#0078D4" stroke-width="1.5"/>
    <text x="226" y="312" fill="#0078D4" class="btn-text">Wazuh Agent (Sysmon)</text>
  </g>

  <!-- CARD 2: KALI LINUX VM -->
  <g class="font-base" filter="url(#card-shadow)">
    <!-- Card Boundary -->
    <rect x="446" y="88" width="348" height="260" rx="14" fill="#FFFFFF" stroke="#16A34A" stroke-width="1.8"/>

    <!-- Tux / Linux Logo -->
    <g transform="translate(468, 105)">
      <path d="M 12 1 C 8 1 5 4 5 10 C 5 14 3 17 1 19 C 0 20 0 22 2 22 C 5 22 7 21 8 20 C 10 22 13 23 16 23 C 19 23 22 22 24 20 C 25 21 27 22 30 22 C 32 22 32 20 31 19 C 29 17 27 14 27 10 C 27 4 24 1 20 1 Z" fill="#0F172A"/>
      <ellipse cx="12" cy="14" rx="7" ry="8" fill="#FFFFFF"/>
      <ellipse cx="10" cy="8" rx="2" ry="3" fill="#FFFFFF"/>
      <ellipse cx="16" cy="8" rx="2" ry="3" fill="#FFFFFF"/>
      <circle cx="10" cy="8" r="1.2" fill="#0F172A"/>
      <circle cx="16" cy="8" r="1.2" fill="#0F172A"/>
      <polygon points="11,11 15,11 13,14" fill="#F59E0B"/>
    </g>

    <!-- Header Text -->
    <text x="508" y="127" fill="#16A34A" class="card-title">KALI LINUX VM</text>

    <!-- Logs Collected Header -->
    <g transform="translate(468, 149)">
      <rect x="0" y="0" width="22" height="18" rx="2" fill="none" stroke="#0F172A" stroke-width="1.5"/>
      <line x1="0" y1="6" x2="22" y2="6" stroke="#0F172A" stroke-width="1.5"/>
      <line x1="0" y1="12" x2="22" y2="12" stroke="#0F172A" stroke-width="1.5"/>
      <circle cx="17" cy="3" r="1" fill="#0F172A"/>
      <circle cx="17" cy="9" r="1" fill="#0F172A"/>
      <circle cx="17" cy="15" r="1" fill="#0F172A"/>
    </g>
    <text x="500" y="163" class="section-title">Logs Collected</text>

    <!-- Bullet items -->
    <text x="480" y="186" class="log-item">&#8226; auth.log</text>
    <text x="480" y="205" class="log-item">&#8226; syslog &amp; kern.log</text>
    <text x="480" y="224" class="log-item">&#8226; audit.log</text>
    <text x="480" y="243" class="log-item">&#8226; apt/dpkg logs</text>
    <text x="480" y="262" class="log-item">&#8226; sudo / su Activity</text>

    <!-- Pill Button -->
    <rect x="468" y="288" width="304" height="38" rx="8" fill="#F0FDF4" stroke="#16A34A" stroke-width="1.5"/>
    <text x="620" y="312" fill="#16A34A" class="btn-text">Wazuh Agent (Linux)</text>
  </g>

  <!-- CARD 3: WINDOWS 11 HOST -->
  <g class="font-base" filter="url(#card-shadow)">
    <!-- Card Boundary -->
    <rect x="840" y="88" width="348" height="260" rx="14" fill="#FFFFFF" stroke="#7C3AED" stroke-width="1.8"/>

    <!-- Windows 11 Logo (Purple 4 flat squares) -->
    <g transform="translate(862, 106)">
      <rect x="0" y="0" width="13" height="13" fill="#7C3AED" rx="1"/>
      <rect x="15" y="0" width="13" height="13" fill="#7C3AED" rx="1"/>
      <rect x="0" y="15" width="13" height="13" fill="#7C3AED" rx="1"/>
      <rect x="15" y="15" width="13" height="13" fill="#7C3AED" rx="1"/>
    </g>

    <!-- Header Text -->
    <text x="902" y="127" fill="#7C3AED" class="card-title">WINDOWS 11 HOST</text>

    <!-- Logs Collected Header -->
    <g transform="translate(862, 149)">
      <path d="M2 0 L14 0 L20 6 L20 20 L2 20 Z" fill="none" stroke="#0F172A" stroke-width="1.5"/>
      <path d="M14 0 L14 6 L20 6" fill="none" stroke="#0F172A" stroke-width="1.5"/>
      <line x1="6" y1="10" x2="16" y2="10" stroke="#0F172A" stroke-width="1.5"/>
      <line x1="6" y1="14" x2="16" y2="14" stroke="#0F172A" stroke-width="1.5"/>
    </g>
    <text x="894" y="163" class="section-title">Local Logs Collected</text>

    <!-- Bullet items -->
    <text x="874" y="186" class="log-item">&#8226; Security Logs</text>
    <text x="874" y="205" class="log-item">&#8226; System Logs</text>
    <text x="874" y="224" class="log-item">&#8226; Application Logs</text>
    <text x="874" y="243" class="log-item">&#8226; PowerShell Logs</text>
    <text x="874" y="262" class="log-item">&#8226; VMware &amp; Hypervisor</text>

    <!-- Pill Button -->
    <rect x="862" y="288" width="304" height="38" rx="8" fill="#F5F3FF" stroke="#7C3AED" stroke-width="1.5"/>
    <text x="1014" y="312" fill="#7C3AED" class="btn-text">Wazuh Agent (Host)</text>
  </g>

  <!-- ==================== CONNECTING ARROWS TO SERVER ==================== -->
  <g class="font-base">
    <!-- Arrow 1: Win 10 (Blue) -->
    <path d="M 226 348 V 382 H 375 V 416" fill="none" stroke="#0078D4" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" marker-end="url(#arr-blue)"/>
    <text x="262" y="374" fill="#0078D4" class="port-label">TCP 1514</text>

    <!-- Arrow 2: Kali (Green) -->
    <path d="M 620 348 V 416" fill="none" stroke="#16A34A" stroke-width="2.2" stroke-linecap="round" marker-end="url(#arr-green)"/>
    <text x="632" y="382" fill="#16A34A" class="port-label">TCP 1514</text>

    <!-- Arrow 3: Win 11 (Purple) -->
    <path d="M 1014 348 V 382 H 865 V 416" fill="none" stroke="#7C3AED" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" marker-end="url(#arr-purple)"/>
    <text x="888" y="374" fill="#7C3AED" class="port-label">TCP 1514</text>
  </g>

  <!-- ==================== WAZUH SERVER CONTAINER ==================== -->
  <g class="font-base" filter="url(#card-shadow)">
    <!-- Container Box -->
    <rect x="260" y="424" width="720" height="148" rx="14" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.8"/>

    <!-- Header Text -->
    <text x="620" y="454" class="srv-title">WAZUH SERVER ON UBUNTU 24.04 LTS</text>

    <!-- Step 1: Receiving Layer / Manager -->
    <g transform="translate(345, 474)">
      <path d="M 5 0 L 15 0 L 15 12 L 20 12 L 10 22 L 0 12 L 5 12 Z" fill="#0F172A"/>
      <path d="M -3 16 L -3 25 L 23 25 L 23 16" fill="none" stroke="#0F172A" stroke-width="2"/>
    </g>
    <text x="355" y="515" class="node-title">Receiving Layer</text>
    <text x="355" y="534" class="node-sub">(Port 1514 / Manager)</text>

    <!-- Arrow 1 -> 2 -->
    <line x1="442" y1="508" x2="520" y2="508" stroke="#0F172A" stroke-width="2.2" stroke-linecap="round" marker-end="url(#arr-dark)"/>

    <!-- Step 2: Indexer -->
    <g transform="translate(608, 472)">
      <ellipse cx="12" cy="6" rx="12" ry="5" fill="#16A34A"/>
      <path d="M 0 6 V 20 A 12 5 0 0 0 24 20 V 6" fill="#16A34A"/>
      <ellipse cx="12" cy="13" rx="12" ry="4" fill="none" stroke="#FFFFFF" stroke-width="1.2"/>
      <ellipse cx="12" cy="20" rx="12" ry="4" fill="none" stroke="#FFFFFF" stroke-width="1.2"/>
    </g>
    <text x="620" y="515" class="node-title">Indexer</text>
    <text x="620" y="534" class="node-sub">(Store &amp; Index - Port 9200)</text>

    <!-- Arrow 2 -> 3 -->
    <line x1="720" y1="508" x2="798" y2="508" stroke="#0F172A" stroke-width="2.2" stroke-linecap="round" marker-end="url(#arr-dark)"/>

    <!-- Step 3: Search Head / Dashboard -->
    <g transform="translate(872, 472)">
      <circle cx="11" cy="11" r="9" fill="none" stroke="#7C3AED" stroke-width="3"/>
      <line x1="18" y1="18" x2="28" y2="28" stroke="#7C3AED" stroke-width="3.5" stroke-linecap="round"/>
    </g>
    <text x="884" y="515" class="node-title">Search Head</text>
    <text x="884" y="534" class="node-sub">(Search &amp; Analyze - Port 443)</text>
  </g>

  <!-- ==================== FLOW TO SOC OPERATIONS ==================== -->
  <g class="font-base">
    <!-- Connector line from Server down to SOC Search -->
    <path d="M 260 500 H 130 V 674 H 168" fill="none" stroke="#0F172A" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" marker-end="url(#arr-dark)"/>
  </g>

  <!-- ==================== BOTTOM SOC ANALYST ROW ==================== -->

  <!-- CARD 1: SEARCH (Amber/Yellow) -->
  <g class="font-base" filter="url(#card-shadow)">
    <rect x="178" y="632" width="195" height="84" rx="10" fill="#FFFFFF" stroke="#F59E0B" stroke-width="1.8"/>
    <!-- Search glass icon -->
    <g transform="translate(196, 648)">
      <circle cx="10" cy="10" r="7" fill="none" stroke="#0F172A" stroke-width="2.2"/>
      <line x1="15" y1="15" x2="23" y2="23" stroke="#0F172A" stroke-width="2.5" stroke-linecap="round"/>
    </g>
    <text x="234" y="662" fill="#B45309" class="step-title">SEARCH</text>
    <text x="275" y="694" class="step-sub">Run DQL Queries</text>
  </g>

  <!-- Arrow: Search -> Detection -->
  <line x1="373" y1="674" x2="411" y2="674" stroke="#0F172A" stroke-width="2.2" stroke-linecap="round" marker-end="url(#arr-dark)"/>

  <!-- CARD 2: DETECTION (Orange) -->
  <g class="font-base" filter="url(#card-shadow)">
    <rect x="420" y="632" width="195" height="84" rx="10" fill="#FFFFFF" stroke="#F97316" stroke-width="1.8"/>
    <!-- Shield icon -->
    <g transform="translate(438, 648)">
      <path d="M 11 0 L 22 4 V 12 C 22 18 11 23 11 23 C 11 23 0 18 0 12 V 4 Z" fill="#0F172A"/>
    </g>
    <text x="474" y="662" fill="#EA580C" class="step-title">DETECTION</text>
    <text x="517" y="694" class="step-sub">Correlation &amp; Rules</text>
  </g>

  <!-- Arrow: Detection -> Alert -->
  <line x1="615" y1="674" x2="653" y2="674" stroke="#0F172A" stroke-width="2.2" stroke-linecap="round" marker-end="url(#arr-dark)"/>

  <!-- CARD 3: ALERT (Red) -->
  <g class="font-base" filter="url(#card-shadow)">
    <rect x="662" y="632" width="195" height="84" rx="10" fill="#FFFFFF" stroke="#EF4444" stroke-width="1.8"/>
    <!-- Bell icon -->
    <g transform="translate(680, 648)">
      <path d="M 11 1 A 2 2 0 0 1 13 3 V 4 A 8 8 0 0 1 19 12 V 17 L 21 19 H 3 L 5 17 V 12 A 8 8 0 0 1 11 4 V 3 A 2 2 0 0 1 11 1 Z" fill="#0F172A"/>
      <path d="M 9 20 A 3 3 0 0 0 15 20 Z" fill="#0F172A"/>
    </g>
    <text x="716" y="662" fill="#DC2626" class="step-title">ALERT</text>
    <text x="759" y="694" class="step-sub">Trigger Alerts</text>
  </g>

  <!-- Arrow: Alert -> SOC Analyst -->
  <line x1="857" y1="674" x2="895" y2="674" stroke="#0F172A" stroke-width="2.2" stroke-linecap="round" marker-end="url(#arr-dark)"/>

  <!-- CARD 4: SOC ANALYST (Pink/Magenta) -->
  <g class="font-base" filter="url(#card-shadow)">
    <rect x="904" y="632" width="205" height="84" rx="10" fill="#FFFFFF" stroke="#EC4899" stroke-width="1.8"/>
    <!-- User Avatar icon -->
    <g transform="translate(922, 648)">
      <circle cx="11" cy="6" r="5" fill="#0F172A"/>
      <path d="M 2 20 C 2 15 6 13 11 13 C 16 13 20 15 20 20 Z" fill="#0F172A"/>
    </g>
    <text x="958" y="662" fill="#DB2777" class="step-title">SOC ANALYST</text>
    <text x="1006" y="694" class="step-sub">Investigate &amp; Respond</text>
  </g>
</svg>
`;
}

function build() {
  const svgContent = generateSvg();
  const imagesDir = path.join(__dirname, '..', 'images');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  const svgPath = path.join(imagesDir, 'workflow_diagram.svg');
  fs.writeFileSync(svgPath, svgContent, 'utf-8');
  console.log('Saved SVG diagram to:', svgPath);

  // HTML wrapper with 0 margin
  const htmlPath = path.join(imagesDir, 'render_temp.html');
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      background: #FFFFFF;
      width: 1240px;
      height: 840px;
      overflow: hidden;
    }
    svg {
      width: 1240px;
      height: 840px;
      display: block;
    }
  </style>
</head>
<body>
  ${svgContent}
</body>
</html>`;

  fs.writeFileSync(htmlPath, htmlContent, 'utf-8');

  const pngPath = path.join(imagesDir, 'workflow_diagram.png');
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

  const args = [
    '--headless',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-device-scale-factor=2',
    '--window-size=1240,840',
    '--screenshot=' + pngPath,
    htmlPath
  ];

  console.log('Rendering high-resolution PNG using Edge headless...');
  const res = spawnSync(edgePath, args, { encoding: 'utf-8' });
  if (res.status === 0 && fs.existsSync(pngPath)) {
    console.log('Successfully generated workflow_diagram.png! Size:', fs.statSync(pngPath).size, 'bytes');
  } else {
    console.error('Edge screenshot failed:', res.stderr, res.stdout);
  }

  // Also update wazuh-soc-architecture.svg with this updated clean design
  const archSvgPath = path.join(imagesDir, 'wazuh-soc-architecture.svg');
  fs.writeFileSync(archSvgPath, svgContent, 'utf-8');
  console.log('Updated wazuh-soc-architecture.svg as well');

  if (fs.existsSync(htmlPath)) {
    fs.unlinkSync(htmlPath);
  }
}

build();
