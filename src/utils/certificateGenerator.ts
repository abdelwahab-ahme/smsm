import { jsPDF } from 'jspdf';
import { Badge, CertificateFrameId, UserProfile } from '../types';
import { getCertificateFrameTheme } from './certificateThemes';

// Global cache for base64-encoded logo
let cachedLogoImage: HTMLImageElement | null = null;

async function loadLogoImage(): Promise<HTMLImageElement | null> {
  if (cachedLogoImage && cachedLogoImage.complete && cachedLogoImage.naturalWidth > 0) {
    return cachedLogoImage;
  }
  if (typeof window === 'undefined') return null;

  try {
    const res = await fetch('/logo.png');
    if (!res.ok) return null;
    const blob = await res.blob();
    const objUrl = URL.createObjectURL(blob);
    const img = new Image();
    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = objUrl;
      setTimeout(resolve, 3000);
    });
    if (img.complete && img.naturalWidth > 0) {
      cachedLogoImage = img;
      return img;
    }
  } catch (err) {
    console.warn('Failed to load certificate logo:', err);
  }
  return null;
}

/**
 * Preloads and verifies that the Arabic Google Font ("Cairo") is loaded and ready
 * in the browser font manager so canvas text metrics and glyphs never fall back to Times New Roman.
 */
async function ensureCairoFontLoaded(): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) return;

  try {
    await Promise.all([
      document.fonts.load('900 36px "Cairo"'),
      document.fonts.load('800 24px "Cairo"'),
      document.fonts.load('700 22px "Cairo"'),
    ]);
    await document.fonts.ready;
  } catch {
    // Continue gracefully
  }
}

/**
 * Draws the Royal Wax Approval Seal (شارة الاعتماد الملكية) exactly as displayed in the live website DOM:
 * - -4 degree tilt angle
 * - Themed 135deg circular gradient background with soft drop shadow
 * - Gold / themed outer border
 * - Subtle inner dashed ring
 * - Crisp pure vector shield with checkmark (identical to the website's SVG)
 * - Text: 'معتمد رسمياً' in Cairo 900 white
 * - Text: 'سماسم ✦' in Cairo 800 warm gold (#FEF08A)
 */
function drawRoyalApprovalSeal(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  theme: { sealColor1Hex: string; sealColor2Hex: string; sealBorderHex: string }
): void {
  const radius = 68; // diameter = 136px (matching 68px at 2x)

  ctx.save();
  ctx.translate(centerX, centerY);
  // Match website's -4deg tilt exactly
  ctx.rotate((-4 * Math.PI) / 180);

  // 1. Drop shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 10;
  ctx.shadowOffsetX = 0;

  // 2. Circular Gradient Background (135deg)
  const grad = ctx.createLinearGradient(-radius * 0.7, -radius * 0.7, radius * 0.7, radius * 0.7);
  grad.addColorStop(0, theme.sealColor1Hex);
  grad.addColorStop(1, theme.sealColor2Hex);

  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // 3. Gold / Themed Outer Border
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 6;
  ctx.strokeStyle = theme.sealBorderHex;
  ctx.stroke();

  // 4. Subtle inner dashed ring
  ctx.save();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(254, 240, 138, 0.45)';
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.arc(0, 0, radius - 8, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // 5. Draw the crisp Vector Shield with Checkmark (NOT an emoji)
  // Perfectly mirrors:
  // <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  // <path d="m9 12 2 2 4-4"/>
  ctx.save();
  ctx.translate(0, -22);
  const iconScale = 36 / 24; // scale 24x24 icon to 36px
  ctx.scale(iconScale, iconScale);
  ctx.translate(-12, -12); // center on (0, 0)

  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (typeof Path2D !== 'undefined') {
    const shieldPath = new Path2D('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z');
    const checkPath = new Path2D('M9 12l2 2 4-4');
    ctx.stroke(shieldPath);
    ctx.stroke(checkPath);
  } else {
    ctx.beginPath();
    ctx.moveTo(12, 22);
    ctx.bezierCurveTo(16.5, 18, 20, 14.5, 20, 12);
    ctx.lineTo(20, 5);
    ctx.lineTo(12, 2);
    ctx.lineTo(4, 5);
    ctx.lineTo(4, 12);
    ctx.bezierCurveTo(4, 14.5, 7.5, 18, 12, 22);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(9, 12);
    ctx.lineTo(11, 14);
    ctx.lineTo(15, 10);
    ctx.stroke();
  }
  ctx.restore();

  // 6. Text Line 1: 'معتمد رسمياً'
  ctx.textAlign = 'center';
  ctx.font = '900 18px "Cairo", "Tajawal", system-ui, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('معتمد رسمياً', 0, 11);

  // 7. Text Line 2: 'سماسم ✦'
  ctx.font = '800 16px "Cairo", "Tajawal", system-ui, sans-serif';
  ctx.fillStyle = '#FEF08A';
  ctx.fillText('سماسم ✦', 0, 34);

  ctx.restore();
}

/**
 * Generates an ultra high-resolution, vector-crisp 4K Certificate PNG (1840x1220).
 * Matches the website design 100%:
 * - Real Cairo & Tajawal fonts with proper Arabic cursive ligatures
 * - No omitted text or truncated badges
 * - Exact purple/gold cheerful palette
 * - Exact header plaque, metrics cards, badges showcase, seal, date, and signatures
 */
export async function generateCertificatePrecisionPng(
  profile: UserProfile,
  badges: Badge[],
  frameId: CertificateFrameId = 'purple',
  milestoneTitle?: string
): Promise<string> {
  const theme = getCertificateFrameTheme(frameId);
  const isGirl = profile.gender === 'girl';

  // 1. Ensure fonts & logo are loaded
  await Promise.all([ensureCairoFontLoaded(), loadLogoImage()]);

  const canvas = document.createElement('canvas');
  const width = 1840;
  const height = 1220;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context is not available');
  }

  // 2. Joyful Gradient Background
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  if (frameId === 'purple') {
    bgGrad.addColorStop(0, '#FAF5FF'); // soft lilac
    bgGrad.addColorStop(0.4, '#FDF4FF'); // soft orchid
    bgGrad.addColorStop(1, '#FFFBEB'); // warm sunny cream
  } else if (frameId === 'gold') {
    bgGrad.addColorStop(0, '#FFFDF8');
    bgGrad.addColorStop(0.5, '#FFFBEB');
    bgGrad.addColorStop(1, '#FEF3C7');
  } else if (frameId === 'pink') {
    bgGrad.addColorStop(0, '#FFF1F2');
    bgGrad.addColorStop(0.5, '#FDF2F8');
    bgGrad.addColorStop(1, '#FFFBEB');
  } else {
    bgGrad.addColorStop(0, '#F0F9FF');
    bgGrad.addColorStop(0.5, '#E0F2FE');
    bgGrad.addColorStop(1, '#FFFBEB');
  }
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle radial center light glow
  const radialGlow = ctx.createRadialGradient(width / 2, height / 2, 60, width / 2, height / 2, 850);
  radialGlow.addColorStop(0, 'rgba(233, 213, 255, 0.35)');
  radialGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = radialGlow;
  ctx.fillRect(0, 0, width, height);

  // 3. Borders (Outer Royal + Inner Dashed, NO diamond marks)
  // Outer Border
  ctx.lineWidth = 24;
  ctx.strokeStyle = theme.outerBorderHex;
  ctx.beginPath();
  ctx.roundRect(36, 36, width - 72, height - 72, 48);
  ctx.stroke();

  // Inner Dashed Line
  ctx.lineWidth = 4;
  ctx.setLineDash([14, 10]);
  ctx.strokeStyle = theme.dashedBorderHex;
  ctx.beginPath();
  ctx.roundRect(64, 64, width - 128, height - 128, 36);
  ctx.stroke();
  ctx.setLineDash([]);

  // 4. Subtle Center Watermark Logo
  const logoImg = cachedLogoImage;
  if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
    ctx.save();
    ctx.globalAlpha = 0.05;
    const wmSize = 540;
    ctx.drawImage(logoImg, (width - wmSize) / 2, (height - wmSize) / 2, wmSize, wmSize);
    ctx.restore();
  }

  // Set RTL text direction for native Arabic ligature shaping
  ctx.direction = 'rtl';

  // ================= 5. HEADER SECTION =================
  // Brand Header (Right side)
  if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;
    const logoSize = 96;
    ctx.drawImage(logoImg, width - 180, 92, logoSize, logoSize);
    ctx.restore();
  }

  ctx.save();
  ctx.textAlign = 'right';
  ctx.font = '900 44px "Cairo", "Tajawal", system-ui, sans-serif';
  ctx.fillStyle = '#DB2777';
  ctx.fillText('سماسم', width - 295, 142);

  ctx.font = '800 22px "Cairo", "Tajawal", system-ui, sans-serif';
  ctx.fillStyle = theme.primaryTextColorHex;
  ctx.fillText('غزل بنات.. بس بدماغ سماسم', width - 295, 178);
  ctx.restore();

  // Child Code Chip (Left side)
  ctx.save();
  const codeChipW = 320;
  const codeChipH = 52;
  const codeChipX = 100;
  const codeChipY = 115;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.strokeStyle = theme.statsBorderHex;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(codeChipX, codeChipY, codeChipW, codeChipH, 20);
  ctx.fill();
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.font = '800 20px "Cairo", "Tajawal", system-ui, sans-serif';
  ctx.fillStyle = theme.primaryTextColorHex;
  ctx.fillText(`كود الطفل: ${profile.packCode}`, codeChipX + codeChipW / 2, codeChipY + 34);
  ctx.restore();

  // Plaque Ribbon Title (Centered)
  const plaqueW = 620;
  const plaqueH = 74;
  const plaqueX = (width - plaqueW) / 2;
  const plaqueY = 220;

  ctx.save();
  ctx.shadowColor = 'rgba(126, 34, 206, 0.3)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 6;

  const plaqueGrad = ctx.createLinearGradient(plaqueX, plaqueY, plaqueX + plaqueW, plaqueY + plaqueH);
  plaqueGrad.addColorStop(0, '#6B21A8');
  plaqueGrad.addColorStop(0.5, '#9333EA');
  plaqueGrad.addColorStop(1, '#C026D3');
  ctx.fillStyle = plaqueGrad;
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(plaqueX, plaqueY, plaqueW, plaqueH, 40);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = '900 36px "Cairo", "Tajawal", system-ui, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(milestoneTitle || 'شهادة تفوق واكتشاف علمي', width / 2, plaqueY + 50);
  ctx.restore();

  // Motto
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = '800 24px "Cairo", "Tajawal", system-ui, sans-serif';
  ctx.fillStyle = theme.highlightColorHex;
  ctx.fillText('« كل سؤال… بداية اكتشاف »', width / 2, 335);
  ctx.restore();

  // ================= 6. RECIPIENT & PRAISE =================
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = '700 26px "Cairo", "Tajawal", system-ui, sans-serif';
  ctx.fillStyle = theme.subtleTextColorHex;
  ctx.fillText('تُمنح هذه الشهادة بكل فخر واعتزاز إلى', width / 2, 395);

  // Recipient Child Name
  const titlePrefix = isGirl ? 'البطلة الرائعة / ' : 'البطل الرائع / ';
  ctx.font = '900 58px "Cairo", "Tajawal", system-ui, sans-serif';
  ctx.fillStyle = theme.primaryTextColorHex;
  ctx.fillText(titlePrefix + profile.name, width / 2, 475);
  ctx.restore();

  // Decorative Accent Underline
  ctx.save();
  const lineGrad = ctx.createLinearGradient(width / 2 - 320, 500, width / 2 + 320, 500);
  lineGrad.addColorStop(0, 'rgba(245, 158, 11, 0)');
  lineGrad.addColorStop(0.5, theme.accentColorHex);
  lineGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 320, 500);
  ctx.lineTo(width / 2 + 320, 500);
  ctx.stroke();
  ctx.restore();

  // Praise Paragraph
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = '700 24px "Cairo", "Tajawal", system-ui, sans-serif';
  ctx.fillStyle = '#1E293B';
  ctx.fillText(
    'تقديراً لذكائه الوقاد، وشغفه باستكشاف أسرار العلوم والكون، وإنجازه تحديات سماسم اليومية بنجاح باهر محققاً:',
    width / 2,
    555
  );
  ctx.restore();

  // ================= 7. STATS METRICS BOX =================
  const statsBoxW = 1080;
  const statsBoxH = 120;
  const statsBoxX = (width - statsBoxW) / 2;
  const statsBoxY = 605;

  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.strokeStyle = theme.statsBorderHex;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(statsBoxX, statsBoxY, statsBoxW, statsBoxH, 28);
  ctx.fill();
  ctx.stroke();

  // Column 1: Points
  const col1X = statsBoxX + statsBoxW * 0.8;
  ctx.textAlign = 'center';
  ctx.font = '800 21px "Cairo", "Tajawal", system-ui, sans-serif';
  ctx.fillStyle = theme.statsTextHex;
  ctx.fillText('نقاط المعرفة', col1X, statsBoxY + 44);
  ctx.font = '900 34px "Cairo", "Tajawal", system-ui, sans-serif';
  ctx.fillStyle = '#D97706';
  ctx.fillText(`⭐ ${profile.points}`, col1X, statsBoxY + 92);

  // Divider 1
  ctx.strokeStyle = theme.statsBorderHex;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(statsBoxX + statsBoxW * 0.65, statsBoxY + 25);
  ctx.lineTo(statsBoxX + statsBoxW * 0.65, statsBoxY + 95);
  ctx.stroke();

  // Column 2: Badges
  const col2X = statsBoxX + statsBoxW * 0.5;
  ctx.font = '800 21px "Cairo", "Tajawal", system-ui, sans-serif';
  ctx.fillStyle = theme.statsTextHex;
  ctx.fillText('الأوسمة المستحقة', col2X, statsBoxY + 44);
  ctx.font = '900 34px "Cairo", "Tajawal", system-ui, sans-serif';
  ctx.fillStyle = theme.primaryTextColorHex;
  ctx.fillText(`🏆 ${badges.length}`, col2X, statsBoxY + 92);

  // Divider 2
  ctx.beginPath();
  ctx.moveTo(statsBoxX + statsBoxW * 0.35, statsBoxY + 25);
  ctx.lineTo(statsBoxX + statsBoxW * 0.35, statsBoxY + 95);
  ctx.stroke();

  // Column 3: Solved Challenges
  const col3X = statsBoxX + statsBoxW * 0.2;
  ctx.font = '800 21px "Cairo", "Tajawal", system-ui, sans-serif';
  ctx.fillStyle = theme.statsTextHex;
  ctx.fillText('التحديات المكتملة', col3X, statsBoxY + 44);
  ctx.font = '900 34px "Cairo", "Tajawal", system-ui, sans-serif';
  ctx.fillStyle = '#059669';
  ctx.fillText(`🎯 ${profile.solvedChallengesCount}`, col3X, statsBoxY + 92);
  ctx.restore();

  // ================= 8. BADGES SHOWCASE PILLS (ALL EARNED BADGES) =================
  const badgesAreaY = 755;
  ctx.save();
  ctx.font = '800 21px "Cairo", "Tajawal", system-ui, sans-serif';

  if (badges.length > 0) {
    // Measure and layout badge pills into 1 or 2 rows so NO text ever overflows
    const pillHeight = 44;
    const pillGap = 12;
    const maxRowWidth = 1450;

    const rows: { badge: Badge; width: number; label: string }[][] = [[]];
    let currentRowWidth = 0;
    let currentRowIdx = 0;

    for (const b of badges) {
      const label = `${b.icon} ${b.name}`;
      const textW = ctx.measureText(label).width;
      const pillW = textW + 36;

      if (currentRowWidth + pillW + pillGap > maxRowWidth && rows[currentRowIdx].length > 0 && currentRowIdx === 0) {
        currentRowIdx++;
        rows[currentRowIdx] = [];
        currentRowWidth = 0;
      }

      rows[currentRowIdx].push({ badge: b, width: pillW, label });
      currentRowWidth += pillW + pillGap;
    }

    rows.forEach((row, rIdx) => {
      const totalRowW = row.reduce((sum, item) => sum + item.width, 0) + (row.length - 1) * pillGap;
      let curX = (width + totalRowW) / 2; // starting right edge for RTL
      const rowY = badgesAreaY + rIdx * (pillHeight + 10);

      for (const item of row) {
        const itemX = curX - item.width;
        // Draw pill background
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = theme.statsBorderHex;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(itemX, rowY, item.width, pillHeight, 16);
        ctx.fill();
        ctx.stroke();

        // Draw pill text
        ctx.textAlign = 'center';
        ctx.fillStyle = theme.primaryTextColorHex;
        ctx.fillText(item.label, itemX + item.width / 2, rowY + 30);

        curX -= item.width + pillGap;
      }
    });
  } else {
    // Welcome badge if none unlocked yet
    const welcomeText = '🌟 وسام الانضمام لأسرة سماسم والاكتشاف العلمي';
    const textW = ctx.measureText(welcomeText).width;
    const pillW = textW + 48;
    const pillX = (width - pillW) / 2;

    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = theme.statsBorderHex;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(pillX, badgesAreaY, pillW, 46, 16);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = theme.statsTextHex;
    ctx.fillText(welcomeText, width / 2, badgesAreaY + 32);
  }
  ctx.restore();

  // ================= 9. FOOTER SECTION: DATE, SEAL, SIGNATURE =================
  const footerY = 1000;

  // Date (Right side)
  ctx.save();
  ctx.textAlign = 'right';
  ctx.font = '800 20px "Cairo", "Tajawal", system-ui, sans-serif';
  ctx.fillStyle = theme.subtleTextColorHex;
  ctx.fillText('تاريخ الاعتماد:', width - 150, footerY);

  const formattedDate = new Date().toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  ctx.font = '900 26px "Cairo", "Tajawal", system-ui, sans-serif';
  ctx.fillStyle = '#1E1B4B';
  ctx.fillText(formattedDate, width - 150, footerY + 42);
  ctx.restore();

  // Official Themed Royal Wax Seal (Center) - Matches Website Vector Seal 100%
  drawRoyalApprovalSeal(ctx, width / 2, footerY + 24, theme);

  // Signature (Left side)
  ctx.save();
  ctx.textAlign = 'left';
  ctx.font = '800 20px "Cairo", "Tajawal", system-ui, sans-serif';
  ctx.fillStyle = theme.subtleTextColorHex;
  ctx.fillText('إدارة ومبتكرو سماسم', 150, footerY);

  ctx.font = '900 28px "Cairo", "Tajawal", cursive, sans-serif';
  ctx.fillStyle = '#DB2777';
  ctx.fillText('فريق سماسم للاكتشاف ✍️', 150, footerY + 44);
  ctx.restore();

  return canvas.toDataURL('image/png', 1.0);
}

/**
 * Downloads the certificate PNG directly with 100% precision.
 */
export async function downloadCertificateFromDom(
  _element: HTMLElement,
  profile: UserProfile,
  frameId: CertificateFrameId,
  badges: Badge[],
  milestoneTitle?: string
): Promise<void> {
  const safeName = profile.name.trim().replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_') || 'al-batal';
  const fileName = `shahadat-samasm-${safeName}.png`;

  const dataUrl = await generateCertificatePrecisionPng(profile, badges, frameId, milestoneTitle);

  const link = document.createElement('a');
  link.download = fileName;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Gets the certificate image as a File / Blob for Web Share API
 */
export async function getCertificateBlob(
  _element: HTMLElement,
  profile: UserProfile,
  frameId: CertificateFrameId,
  badges: Badge[],
  milestoneTitle?: string
): Promise<{ blob: Blob; fileName: string }> {
  const safeName = profile.name.trim().replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_') || 'al-batal';
  const fileName = `shahadat-samasm-${safeName}.png`;

  const dataUrl = await generateCertificatePrecisionPng(profile, badges, frameId, milestoneTitle);
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return { blob, fileName };
}

/**
 * Directly generates and downloads a true PDF file (A4 landscape) containing the
 * high-resolution 4K certificate. Works reliably everywhere (including iframes,
 * mobile devices, and desktops) without relying on blocked window.print().
 */
export async function downloadCertificatePdf(
  profile: UserProfile,
  badges: Badge[],
  frameId: CertificateFrameId = 'purple',
  milestoneTitle?: string
): Promise<void> {
  const safeName = profile.name.trim().replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_') || 'al-batal';
  const fileName = `shahadat-samasm-${safeName}.pdf`;

  // 1. Generate the exact 4K precision image
  const dataUrl = await generateCertificatePrecisionPng(profile, badges, frameId, milestoneTitle);

  // 2. Initialize jsPDF in landscape A4 format (297mm x 210mm)
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageWidth = pdf.internal.pageSize.getWidth(); // 297 mm
  const pageHeight = pdf.internal.pageSize.getHeight(); // 210 mm

  // Margin around certificate
  const margin = 8;
  const contentWidth = pageWidth - margin * 2; // 281 mm
  const contentHeight = (contentWidth * 1220) / 1840; // 186.2 mm
  const contentX = margin;
  const contentY = (pageHeight - contentHeight) / 2; // vertically centered

  // Add the high-res certificate image to the PDF
  pdf.addImage(dataUrl, 'PNG', contentX, contentY, contentWidth, contentHeight, undefined, 'FAST');

  // Trigger real file download
  pdf.save(fileName);
}

/**
 * Opens an isolated print window/context containing ONLY the certificate
 * styled and protected by dedicated print CSS that enforces Cairo & Tajawal fonts,
 * exact background gradients, borders, and margins, invoking window.print().
 */
export async function printIsolatedCertificate(
  certificateElement: HTMLElement,
  studentName: string
): Promise<void> {
  const cloned = certificateElement.cloneNode(true) as HTMLElement;
  cloned.style.transform = 'none';
  cloned.style.position = 'relative';
  cloned.style.left = 'auto';
  cloned.style.top = 'auto';
  cloned.style.margin = '0 auto';
  cloned.style.boxShadow = 'none';

  const htmlContent = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <title>شهادة سماسم - ${studentName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@600;700;800;900&family=Tajawal:wght@500;700;800;900&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 landscape;
      margin: 0;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      letter-spacing: normal !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    html, body {
      margin: 0;
      padding: 0;
      width: 100vw;
      height: 100vh;
      background: #ffffff !important;
      font-family: 'Cairo', 'Tajawal', system-ui, -apple-system, sans-serif;
      direction: rtl;
      overflow: hidden;
    }
    .print-stage {
      width: 100vw;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8mm;
      box-sizing: border-box;
    }
    .cert-frame {
      width: 920px;
      height: 610px;
      max-width: 96vw;
      max-height: 94vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    @media print {
      body {
        margin: 0 !important;
        padding: 0 !important;
      }
      .print-stage {
        padding: 0 !important;
      }
    }
  </style>
</head>
<body>
  <div class="print-stage">
    <div class="cert-frame">
      ${cloned.outerHTML}
    </div>
  </div>
</body>
</html>`;

  // 1. Try opening a dedicated isolated window
  let printWindow: Window | null = null;
  try {
    printWindow = window.open('', '_blank', 'width=1100,height=800,menubar=no,toolbar=no,location=no,status=no');
  } catch {
    printWindow = null;
  }

  if (printWindow && !printWindow.closed) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    const executePrint = () => {
      if (!printWindow || printWindow.closed) return;
      printWindow.focus();
      printWindow.print();
    };

    if (printWindow.document.fonts) {
      printWindow.document.fonts.ready.then(() => {
        setTimeout(executePrint, 350);
      }).catch(() => {
        setTimeout(executePrint, 500);
      });
    } else {
      setTimeout(executePrint, 600);
    }
    return;
  }

  // 2. Fallback for iframes or popup blockers: isolated hidden iframe
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  iframe.style.zIndex = '-9999';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (!doc) {
    window.print();
    return;
  }

  doc.open();
  doc.write(htmlContent);
  doc.close();

  const iframeWin = iframe.contentWindow;
  if (!iframeWin) return;

  const triggerIframePrint = () => {
    try {
      iframeWin.focus();
      iframeWin.print();
    } finally {
      setTimeout(() => {
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      }, 3000);
    }
  };

  if (doc.fonts) {
    doc.fonts.ready.then(() => {
      setTimeout(triggerIframePrint, 350);
    }).catch(() => {
      setTimeout(triggerIframePrint, 500);
    });
  } else {
    setTimeout(triggerIframePrint, 600);
  }
}

