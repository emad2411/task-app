const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const WIDTH = 1440;
const HEIGHT = 900;

const BG = "#0d0d0d";
const SIDEBAR_BG = "#0d0d0d";
const CARD_BG = "#141414";
const BORDER = "rgba(255,255,255,0.06)";
const TEXT_PRIMARY = "#ededed";
const TEXT_SECONDARY = "#a0a0a0";
const TEXT_MUTED = "#666666";
const BRAND = "#18E299";
const BRAND_SOFT = "rgba(24,226,153,0.15)";
const SURFACE = "#1a1a1a";
const GREEN_DOT = "#28c840";
const YELLOW_DOT = "#febc2e";
const RED_DOT = "#ff5f57";

function svg() {
  const tasks = [
    { title: "Review quarterly roadmap", due: "Today", priority: "High", cat: "Work", catColor: "#60a5fa" },
    { title: "Schedule dentist appointment", due: "Tomorrow", priority: "Medium", cat: "Personal", catColor: "#f472b6" },
    { title: "Update landing page copy", due: "May 12", priority: "High", cat: "Work", catColor: "#60a5fa" },
    { title: "Buy groceries for the week", due: "May 13", priority: "Low", cat: "Personal", catColor: "#f472b6" },
    { title: "Prepare presentation slides", due: "May 15", priority: "Medium", cat: "Work", catColor: "#60a5fa" },
    { title: "Call mom", due: "May 16", priority: "Low", cat: "Personal", catColor: "#f472b6" },
  ];

  const stats = [
    { label: "Overdue", value: "3", accent: "#ff5f57" },
    { label: "Due Today", value: "7", accent: BRAND },
    { label: "High Priority", value: "12", accent: "#f59e0b" },
    { label: "Completed", value: "48", accent: "#60a5fa" },
  ];

  const sidebarItems = [
    { label: "Dashboard", active: true },
    { label: "Tasks", active: false },
    { label: "Categories", active: false },
    { label: "Settings", active: false },
  ];

  const sidebarW = 220;
  const headerH = 64;
  const contentX = sidebarW + 32;
  const contentW = WIDTH - sidebarW - 64;

  let svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <clipPath id="round"><rect width="100%" height="100%" rx="8" ry="8"/></clipPath>
  </defs>

  <!-- Background -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${BG}"/>

  <!-- Sidebar -->
  <rect width="${sidebarW}" height="${HEIGHT}" fill="${SIDEBAR_BG}"/>
  <rect x="${sidebarW - 1}" y="0" width="1" height="${HEIGHT}" fill="${BORDER}"/>

  <!-- Logo area -->
  <g transform="translate(20, 20)">
    <rect x="0" y="0" width="18" height="18" rx="4" fill="none" stroke="${BRAND}" stroke-width="2"/>
    <polyline points="4,9 8,13 14,5" fill="none" stroke="${BRAND}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="28" y="14" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="700" fill="${TEXT_PRIMARY}">TaskFlow</text>
  </g>

  <!-- Sidebar nav -->
  <g transform="translate(12, 64)">
    ${sidebarItems.map((item, i) => {
      const y = i * 40;
      const bg = item.active ? `fill="${SURFACE}"` : '';
      const textColor = item.active ? TEXT_PRIMARY : TEXT_SECONDARY;
      const dot = item.active ? `<circle cx="12" cy="12" r="3" fill="${BRAND}"/>` : `<circle cx="12" cy="12" r="3" fill="${TEXT_MUTED}"/>`;
      return `
    <rect x="0" y="${y}" width="${sidebarW - 24}" height="32" rx="6" ${bg}/>
    ${dot}
    <text x="28" y="17" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="${item.active ? '600' : '400'}" fill="${textColor}">${item.label}</text>`;
    }).join('')}
  </g>

  <!-- Header -->
  <g transform="translate(${contentX}, 20)">
    <text font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="700" fill="${TEXT_PRIMARY}">Dashboard</text>
    <rect x="${contentW - 120}" y="-4" width="120" height="36" rx="6" fill="${BRAND}"/>
    <text x="${contentW - 60}" y="18" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600" fill="#0d0d0d">New Task</text>
  </g>

  <!-- Stats row -->
  <g transform="translate(${contentX}, 80)">
    ${stats.map((stat, i) => {
      const x = i * ((contentW - 48) / 4 + 16);
      const cardW = (contentW - 48) / 4;
      return `
    <rect x="${x}" y="0" width="${cardW}" height="88" rx="8" fill="${CARD_BG}" stroke="${BORDER}" stroke-width="1"/>
    <text x="${x + 16}" y="28" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="500" fill="${TEXT_SECONDARY}">${stat.label}</text>
    <text x="${x + 16}" y="62" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="800" fill="${TEXT_PRIMARY}">${stat.value}</text>
    <rect x="${x + 16}" y="72" width="32" height="3" rx="1.5" fill="${stat.accent}"/>`;
    }).join('')}
  </g>

  <!-- Task list header -->
  <g transform="translate(${contentX}, 196)">
    <text font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="700" fill="${TEXT_PRIMARY}">Tasks</text>
    <rect x="${contentW - 200}" y="-2" width="96" height="28" rx="6" fill="${SURFACE}" stroke="${BORDER}" stroke-width="1"/>
    <text x="${contentW - 152}" y="15" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="${TEXT_SECONDARY}">All Status</text>
    <rect x="${contentW - 96}" y="-2" width="96" height="28" rx="6" fill="${SURFACE}" stroke="${BORDER}" stroke-width="1"/>
    <text x="${contentW - 48}" y="15" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="${TEXT_SECONDARY}">Priority</text>
  </g>

  <!-- Task list -->
  <g transform="translate(${contentX}, 248)">
    ${tasks.map((task, i) => {
      const y = i * 68;
      const priorityColors = {
        High: "#f59e0b",
        Medium: "#60a5fa",
        Low: "#a0a0a0",
      };
      const pColor = priorityColors[task.priority] || TEXT_MUTED;
      return `
    <rect x="0" y="${y}" width="${contentW}" height="60" rx="8" fill="${CARD_BG}" stroke="${BORDER}" stroke-width="1"/>
    <rect x="16" y="${y + 22}" width="16" height="16" rx="4" fill="none" stroke="${TEXT_MUTED}" stroke-width="1.5"/>
    <text x="48" y="${y + 28}" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="500" fill="${TEXT_PRIMARY}">${task.title}</text>
    <text x="48" y="${y + 46}" font-family="system-ui, -apple-system, sans-serif" font-size="11" fill="${TEXT_SECONDARY}">${task.due}</text>
    <rect x="${contentW - 220}" y="${y + 16}" width="64" height="28" rx="14" fill="${BRAND_SOFT}" stroke="${BORDER}" stroke-width="1"/>
    <text x="${contentW - 188}" y="${y + 34}" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="600" fill="${BRAND}">${task.priority}</text>
    <rect x="${contentW - 144}" y="${y + 16}" width="72" height="28" rx="14" fill="${task.catColor}15" stroke="${BORDER}" stroke-width="1"/>
    <text x="${contentW - 108}" y="${y + 34}" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="500" fill="${task.catColor}">${task.cat}</text>
    <rect x="${contentW - 60}" y="${y + 18}" width="44" height="24" rx="6" fill="none" stroke="${BORDER}" stroke-width="1"/>
    <text x="${contentW - 38}" y="${y + 34}" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="11" fill="${TEXT_SECONDARY}">Edit</text>`;
    }).join('')}
  </g>
</svg>`;

  return svgContent;
}

async function main() {
  const outPath = path.join(__dirname, "..", "public", "app-screenshot.png");
  const svgBuffer = Buffer.from(svg());

  await sharp(svgBuffer)
    .resize(WIDTH, HEIGHT)
    .png({ compressionLevel: 9 })
    .toFile(outPath);

  console.log(`Screenshot saved to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
