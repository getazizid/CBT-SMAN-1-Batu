import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';

const width = 600;
const height = 700;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Enable high quality antialiasing
ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = 'high';

// Define the hexagon shield path
function drawShieldPath(c, inset = 0) {
  const w = width;
  const h = height;
  const p1 = { x: w * 0.28 + inset * 0.3, y: h * 0.02 + inset };
  const p2 = { x: w * 0.72 - inset * 0.3, y: h * 0.02 + inset };
  const p3 = { x: w * 0.98 - inset, y: h * 0.42 };
  const p4 = { x: w * 0.78 - inset * 0.5, y: h * 0.98 - inset };
  const p5 = { x: w * 0.22 + inset * 0.5, y: h * 0.98 - inset };
  const p6 = { x: w * 0.02 + inset, y: h * 0.42 };

  c.beginPath();
  c.moveTo(p1.x, p1.y);
  c.lineTo(p2.x, p2.y);
  c.lineTo(p3.x, p3.y);
  c.lineTo(p4.x, p4.y);
  c.lineTo(p5.x, p5.y);
  c.lineTo(p6.x, p6.y);
  c.closePath();
}

// 1. Outer navy border
drawShieldPath(ctx, 0);
ctx.fillStyle = '#101c65';
ctx.fill();

// 2. White middle border
drawShieldPath(ctx, 10);
ctx.fillStyle = '#ffffff';
ctx.fill();

// 3. Inner thin navy frame
drawShieldPath(ctx, 22);
ctx.fillStyle = '#101c65';
ctx.fill();

// 4. Main Cyan-Blue background
drawShieldPath(ctx, 28);
ctx.fillStyle = '#22b6d8';
ctx.fill();

// Clip inside the shield for inner elements
ctx.save();
drawShieldPath(ctx, 28);
ctx.clip();

// 5. Curved Top Text: "SMA NEGERI 1"
ctx.save();
ctx.fillStyle = '#0a1020';
ctx.font = 'bold 36px "Plus Jakarta Sans", "Arial Black", "Arial", sans-serif';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';

// Draw arched text
const text = "SMA NEGERI 1";
const centerX = width / 2;
const centerY = height * 0.52;
const radius = 240;
const totalAngle = Math.PI * 0.46;
const startAngle = -Math.PI / 2 - totalAngle / 2;
const angleStep = totalAngle / (text.length - 1);

for (let i = 0; i < text.length; i++) {
  const char = text[i];
  const angle = startAngle + i * angleStep;
  ctx.save();
  ctx.translate(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle));
  ctx.rotate(angle + Math.PI / 2);
  ctx.fillText(char, 0, 0);
  ctx.restore();
}
ctx.restore();

// 6. Central Emblem: Red Sun Disc
const sunCenterX = width / 2;
const sunCenterY = height * 0.35;
const sunRadius = 52;

ctx.beginPath();
ctx.arc(sunCenterX, sunCenterY, sunRadius, 0, Math.PI * 2);
ctx.fillStyle = '#dc2626';
ctx.fill();
ctx.lineWidth = 3;
ctx.strokeStyle = '#ffffff';
ctx.stroke();

// 7. Yellow Open Hands Flanking the Sun
ctx.save();
ctx.fillStyle = '#fde047';
ctx.strokeStyle = '#ca8a04';
ctx.lineWidth = 2;

// Left Hand
ctx.beginPath();
ctx.moveTo(sunCenterX - 68, sunCenterY - 45);
ctx.bezierCurveTo(sunCenterX - 78, sunCenterY - 10, sunCenterX - 75, sunCenterY + 30, sunCenterX - 55, sunCenterY + 65);
ctx.lineTo(sunCenterX - 35, sunCenterY + 120);
ctx.lineTo(sunCenterX - 85, sunCenterY + 120);
ctx.lineTo(sunCenterX - 95, sunCenterY + 60);
ctx.bezierCurveTo(sunCenterX - 110, sunCenterY + 10, sunCenterX - 105, sunCenterY - 30, sunCenterX - 85, sunCenterY - 60);
ctx.bezierCurveTo(sunCenterX - 75, sunCenterY - 50, sunCenterX - 70, sunCenterY - 48, sunCenterX - 68, sunCenterY - 45);
ctx.closePath();
ctx.fill();
ctx.stroke();

// Right Hand (Mirrored)
ctx.beginPath();
ctx.moveTo(sunCenterX + 68, sunCenterY - 45);
ctx.bezierCurveTo(sunCenterX + 78, sunCenterY - 10, sunCenterX + 75, sunCenterY + 30, sunCenterX + 55, sunCenterY + 65);
ctx.lineTo(sunCenterX + 35, sunCenterY + 120);
ctx.lineTo(sunCenterX + 85, sunCenterY + 120);
ctx.lineTo(sunCenterX + 95, sunCenterY + 60);
ctx.bezierCurveTo(sunCenterX + 110, sunCenterY + 10, sunCenterX + 105, sunCenterY - 30, sunCenterX + 85, sunCenterY - 60);
ctx.bezierCurveTo(sunCenterX + 75, sunCenterY - 50, sunCenterX + 70, sunCenterY - 48, sunCenterX + 68, sunCenterY - 45);
ctx.closePath();
ctx.fill();
ctx.stroke();

ctx.restore();

// 8. Text: "BATU"
ctx.save();
ctx.fillStyle = '#dc2626';
ctx.strokeStyle = '#0284c7';
ctx.lineWidth = 2;
ctx.font = '900 56px "Plus Jakarta Sans", "Impact", "Arial Black", sans-serif';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.strokeText('BATU', width / 2, height * 0.61);
ctx.fillText('BATU', width / 2, height * 0.61);
ctx.restore();

// 9. Open Book
ctx.save();
const bookY = height * 0.69;
const bCenter = width / 2;
ctx.fillStyle = '#ffffff';
ctx.strokeStyle = '#0f172a';
ctx.lineWidth = 3.5;

ctx.beginPath();
// Left page
ctx.moveTo(bCenter, bookY + 10);
ctx.quadraticCurveTo(bCenter - 65, bookY - 15, bCenter - 130, bookY + 5);
ctx.lineTo(bCenter - 130, bookY + 28);
ctx.quadraticCurveTo(bCenter - 65, bookY + 8, bCenter, bookY + 35);
// Right page
ctx.quadraticCurveTo(bCenter + 65, bookY + 8, bCenter + 130, bookY + 28);
ctx.lineTo(bCenter + 130, bookY + 5);
ctx.quadraticCurveTo(bCenter + 65, bookY - 15, bCenter, bookY + 10);
ctx.closePath();
ctx.fill();
ctx.stroke();

// Book center spine line
ctx.beginPath();
ctx.moveTo(bCenter, bookY + 10);
ctx.lineTo(bCenter, bookY + 35);
ctx.stroke();
ctx.restore();

// 10. Yellow Banner Bar at Bottom
const bannerY = height * 0.82;
const bannerH = 75;
ctx.fillStyle = '#fde047';
ctx.fillRect(0, bannerY, width, bannerH);

// Thin red divider line on top of banner
ctx.fillStyle = '#dc2626';
ctx.fillRect(0, bannerY, width, 5);

// Motto Text in Banner: "STUDIUM ET VIRTUS"
ctx.fillStyle = '#b91c1c';
ctx.font = 'bold 24px "Times New Roman", "Georgia", "Plus Jakarta Sans", serif';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.letterSpacing = '2px';
ctx.fillText('STUDIUM ET VIRTUS', width / 2, bannerY + bannerH / 2 + 2);

ctx.restore(); // Restore clip

// Ensure output directories exist
fs.mkdirSync(path.join(process.cwd(), 'public'), { recursive: true });
fs.mkdirSync(path.join(process.cwd(), 'src/assets'), { recursive: true });

// Export to PNG buffers
const buffer = canvas.toBuffer('image/png');

fs.writeFileSync(path.join(process.cwd(), 'public/logo-sman1-batu.png'), buffer);
fs.writeFileSync(path.join(process.cwd(), 'public/logo.png'), buffer);
fs.writeFileSync(path.join(process.cwd(), 'src/assets/logo.png'), buffer);

console.log('Successfully generated SMAN 1 Batu PNG logo in public/ and src/assets/');
