/* eslint-disable */
const sharp = require('sharp');
const _fs = require('fs');
const path = require('path');

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="glow" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="#18E299" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#18E299" stop-opacity="0"/>
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="1200" height="630" fill="#0d0d0d"/>
  
  <!-- Subtle radial glow behind text -->
  <ellipse cx="600" cy="315" rx="400" ry="200" fill="url(#glow)"/>
  
  <!-- Grid pattern -->
  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1a1a1a" stroke-width="1"/>
  </pattern>
  <rect width="1200" height="630" fill="url(#grid)"/>
  
  <!-- Top accent line -->
  <rect x="0" y="0" width="1200" height="2" fill="#18E299" opacity="0.3"/>
  
  <!-- Logo mark -->
  <g transform="translate(600, 230)">
    <rect x="-12" y="-12" width="24" height="24" rx="4" fill="#18E299" opacity="0.2"/>
    <rect x="-8" y="-8" width="16" height="16" rx="3" fill="none" stroke="#18E299" stroke-width="2"/>
    <polyline points="-4,0 -1,3 4,-3" fill="none" stroke="#18E299" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  
  <!-- Brand name -->
  <text x="600" y="320" font-family="system-ui, -apple-system, sans-serif" font-size="72" font-weight="900" fill="#ededed" text-anchor="middle" letter-spacing="-0.02em">TaskFlow</text>
  
  <!-- Tagline -->
  <text x="600" y="380" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="400" fill="#a0a0a0" text-anchor="middle" letter-spacing="0.01em">Task management that gets out of your way.</text>
  
  <!-- Bottom accent bar -->
  <rect x="500" y="420" width="200" height="3" rx="1.5" fill="#18E299"/>
</svg>
`;

const outPath = path.join(__dirname, '..', 'public', 'og-image.png');

sharp(Buffer.from(svg))
  .png()
  .toFile(outPath)
  .then(() => console.log('OG image generated at', outPath))
  .catch((err) => {
    console.error('Failed to generate OG image:', err);
    process.exit(1);
  });
