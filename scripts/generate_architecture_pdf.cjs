const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function generatePDF() {
  const publicDir = path.resolve(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const outputPath = path.join(publicDir, 'System_Architecture_and_Engineering_Blueprint.pdf');
  const aliasPath = path.join(publicDir, 'system_architecture_report.pdf');

  const doc = new PDFDocument({
    margin: 45,
    size: 'A4',
    bufferPages: true,
    info: {
      Title: 'System Architecture & Engineering Blueprint - Next-Gen Clinical AI Nutrition Platform',
      Author: 'Technical Advisory & Engineering Leadership',
      Subject: 'Executive Architecture, Technical Topology, and System Design',
      Keywords: 'Architecture, Clinical AI, Nutrition, React, Node.js, Cloud Run, Gemini Vision',
    },
  });

  const writeStream = fs.createWriteStream(outputPath);
  doc.pipe(writeStream);

  // Palette
  const primaryColor = '#0F766E'; // Teal-700
  const primaryDark = '#115E59'; // Teal-800
  const slate900 = '#0F172A'; // Slate-900
  const slate600 = '#475569'; // Slate-600
  const slate400 = '#94A3B8'; // Slate-400
  const bgLight = '#F8FAFC'; // Slate-50
  const emeraldBg = '#ECFDF5'; // Emerald-50

  const drawHeader = (sectionTitle) => {
    doc.save();
    doc.fontSize(8).fillColor(slate400).font('Helvetica-Bold');
    doc.text('CLINICAL AI HEALTH PLATFORM  |  EXECUTIVE ARCHITECTURE & SYSTEM BLUEPRINT', 45, 25, {
      align: 'left',
    });
    if (sectionTitle) {
      doc.text(sectionTitle.toUpperCase(), 45, 25, { align: 'right' });
    }
    doc.moveTo(45, 36).lineTo(550, 36).strokeColor('#E2E8F0').lineWidth(0.75).stroke();
    doc.restore();
  };

  const drawSectionTitle = (title, tag) => {
    doc.moveDown(0.8);
    const y = doc.y;
    doc.save();
    if (tag) {
      doc.roundedRect(45, y, 70, 14, 3).fill(emeraldBg);
      doc.fontSize(7.5).font('Helvetica-Bold').fillColor(primaryDark).text(tag.toUpperCase(), 48, y + 3, {
        width: 64,
        align: 'center',
      });
      doc.fontSize(14).font('Helvetica-Bold').fillColor(slate900).text(title, 122, y);
    } else {
      doc.fontSize(14).font('Helvetica-Bold').fillColor(slate900).text(title, 45, y);
    }
    doc.restore();
    doc.moveDown(0.4);
    doc.moveTo(45, doc.y).lineTo(550, doc.y).strokeColor('#CBD5E1').lineWidth(0.5).stroke();
    doc.moveDown(0.5);
  };

  const drawSubTitle = (title) => {
    doc.fontSize(10.5).font('Helvetica-Bold').fillColor(primaryDark).text(title);
    doc.moveDown(0.3);
  };

  const drawParagraph = (text) => {
    doc.fontSize(9).font('Helvetica').fillColor(slate900).lineGap(2).text(text, {
      align: 'justify',
      width: 505,
    });
    doc.moveDown(0.4);
  };

  const drawBullet = (boldPrefix, text) => {
    doc.fontSize(8.5).font('Helvetica-Bold').fillColor(slate900).text('•  ' + boldPrefix, {
      continued: true,
      lineGap: 1.5,
    });
    doc.font('Helvetica').fillColor(slate600).text(' ' + text, {
      align: 'left',
      width: 490,
    });
    doc.moveDown(0.2);
  };

  // ==========================================
  // PAGE 1: EXECUTIVE COVER & TOPOLOGY
  // ==========================================
  drawHeader('Document Ref: ENG-ARCH-2026-V1');

  doc.moveDown(1.2);
  doc.roundedRect(45, 48, 160, 18, 4).fill(emeraldBg);
  doc.fontSize(8).font('Helvetica-Bold').fillColor(primaryColor).text('EXECUTIVE ENGINEERING REPORT', 52, 53);

  doc.moveDown(1.1);
  doc.fontSize(20).font('Helvetica-Bold').fillColor(slate900).text('System Architecture & Engineering Blueprint');
  doc.fontSize(12).font('Helvetica').fillColor(primaryColor).text('Next-Gen Clinical AI Nutrition Platform');

  // Metadata Box
  doc.moveDown(0.5);
  const metaY = doc.y;
  doc.roundedRect(45, metaY, 505, 48, 5).fill(bgLight);
  doc.rect(45, metaY, 505, 48).strokeColor('#E2E8F0').lineWidth(1).stroke();

  doc.fontSize(8).font('Helvetica-Bold').fillColor(slate900).text('Target Audience:', 55, metaY + 10);
  doc.font('Helvetica').fillColor(slate600).text('Co-Founders, Board, Lead Engineers, Clinical Advisory', 135, metaY + 10);

  doc.font('Helvetica-Bold').fillColor(slate900).text('Infrastructure:', 55, metaY + 26);
  doc.font('Helvetica').fillColor(slate600).text('Google Cloud Run Container (Single-Origin, Port 3000, asia-southeast1)', 135, metaY + 26);

  doc.font('Helvetica-Bold').fillColor(slate900).text('Capabilities:', 340, metaY + 10);
  doc.font('Helvetica').fillColor(slate600).text('Multimodal AI Vision, Atwater Factors, Clinical Deviation', 400, metaY + 10, { width: 140 });

  doc.font('Helvetica-Bold').fillColor(slate900).text('Status:', 340, metaY + 26);
  doc.font('Helvetica-Bold').fillColor(primaryColor).text('PRODUCTION-READY / LIVE VERIFIED', 380, metaY + 26);

  doc.y = metaY + 60;

  // 1. EXECUTIVE SUMMARY
  drawSectionTitle('1. Executive Summary & Product Vision', 'Section 1');
  drawParagraph(
    'Our platform is a clinical-grade dietary intelligence and nutrition tracking web application. Unlike standard consumer calorie counters that merely log generic estimates, this platform bridges the gap between multimodal computer vision, rigorous metabolic science (Mifflin-St. Jeor, Atwater 4-4-9 factor verification), and chronic disease dietary safeguards (Type 2 Diabetes, Hypertension, CKD, GERD, High Cholesterol, Gout, Celiac).'
  );
  drawParagraph(
    'When a user snaps a meal photo or inputs culinary descriptions, the system executes real-time vision parsing, macro/micro biomarker decomposition, and individual health profile deviation scoring to deliver actionable, clinically vetted nutritional interventions.'
  );

  // 2. HIGH-LEVEL ARCHITECTURAL TOPOLOGY
  drawSectionTitle('2. High-Level Architectural Topology', 'Section 2');
  drawParagraph(
    'The system is built on a Single-Origin Full-Stack Container Topology deployed on Google Cloud Run. This architecture consolidates the React 19 frontend and the Node.js/Express backend into a unified runtime container on port 3000.'
  );

  // Topology Diagram Box
  const archBoxY = doc.y;
  doc.roundedRect(45, archBoxY, 505, 110, 6).fill('#F1F5F9');
  doc.rect(45, archBoxY, 505, 110).strokeColor('#CBD5E1').lineWidth(1).stroke();

  doc.fontSize(8.5).font('Helvetica-Bold').fillColor(slate900).text('SYSTEM TOPOLOGY DIAGRAM', 55, archBoxY + 8);

  const blockW = 142;
  const blockH = 75;

  // Client Box
  doc.roundedRect(55, archBoxY + 24, blockW, blockH, 4).fill('#FFFFFF');
  doc.rect(55, archBoxY + 24, blockW, blockH).strokeColor('#0284C7').lineWidth(1.2).stroke();
  doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#0284C7').text('Client Browser (SPA)', 62, archBoxY + 32);
  doc.fontSize(7).font('Helvetica').fillColor(slate600)
    .text('• React 19 + TypeScript', 62, archBoxY + 44)
    .text('• Tailwind CSS v4 UI', 62, archBoxY + 54)
    .text('• Zustand Store (useFitnessStore)', 62, archBoxY + 64)
    .text('• Interactive SVG Pie & Rings', 62, archBoxY + 74)
    .text('• Zero-secret client boundary', 62, archBoxY + 84);

  // Connector
  doc.fontSize(14).font('Helvetica-Bold').fillColor(slate400).text('⇆', 203, archBoxY + 54);

  // Server Box
  doc.roundedRect(223, archBoxY + 24, blockW + 12, blockH, 4).fill('#FFFFFF');
  doc.rect(223, archBoxY + 24, blockW + 12, blockH).strokeColor(primaryColor).lineWidth(1.2).stroke();
  doc.fontSize(8.5).font('Helvetica-Bold').fillColor(primaryColor).text('Cloud Run Server (server.ts)', 230, archBoxY + 32);
  doc.fontSize(7).font('Helvetica').fillColor(slate600)
    .text('• Node.js + Express (Port 3000)', 230, archBoxY + 44)
    .text('• Vite Middleware / Static Host', 230, archBoxY + 54)
    .text('• Secure AI Proxy (/api/*)', 230, archBoxY + 64)
    .text('• In-Memory Clinical Cache', 230, archBoxY + 74)
    .text('• process.env.GEMINI_API_KEY', 230, archBoxY + 84);

  // Connector
  doc.fontSize(14).font('Helvetica-Bold').fillColor(slate400).text('⇆', 385, archBoxY + 54);

  // AI Upstream Box
  doc.roundedRect(405, archBoxY + 24, 135, blockH, 4).fill('#FFFFFF');
  doc.rect(405, archBoxY + 24, 135, blockH).strokeColor('#8B5CF6').lineWidth(1.2).stroke();
  doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#8B5CF6').text('Upstream AI Services', 412, archBoxY + 32);
  doc.fontSize(7).font('Helvetica').fillColor(slate600)
    .text('• Google Gen AI SDK', 412, archBoxY + 44)
    .text('• Gemini 3.5/3.8 Flash Vision', 412, archBoxY + 54)
    .text('• Strict JSON Schema Guard', 412, archBoxY + 64)
    .text('• Curated Heuristic Fallback', 412, archBoxY + 74)
    .text('• Multi-model Auto-Cascade', 412, archBoxY + 84);

  doc.y = archBoxY + 120;

  drawBullet('Single Origin, Zero CORS Friction:', 'Frontend and backend run under the same origin. Eliminates pre-flight OPTIONS latency and cross-domain configuration vulnerabilities.');
  drawBullet('Zero-Trust Client Boundary:', 'API credentials live strictly in server environment variables. No secrets are bundled into client-side JavaScript.');
  drawBullet('Stateless Scalability:', 'Engineered for horizontal scale-to-zero container instances on Cloud Run with near-instant spin-up.');

  // ==========================================
  // PAGE 2: TECH STACK & EXECUTION PIPELINE
  // ==========================================
  doc.addPage();
  drawHeader('Technology Stack & Execution Pipeline');

  // 3. TECHNOLOGY STACK BREAKDOWN
  drawSectionTitle('3. Technology Stack Breakdown', 'Section 3');

  const tableY = doc.y;
  const tableHeaders = ['Layer', 'Technologies', 'Architectural Role & Key Benefit'];

  doc.rect(45, tableY, 505, 18).fill(primaryDark);
  doc.fontSize(8).font('Helvetica-Bold').fillColor('#FFFFFF');
  doc.text(tableHeaders[0], 52, tableY + 5);
  doc.text(tableHeaders[1], 155, tableY + 5);
  doc.text(tableHeaders[2], 335, tableY + 5);

  const tableRows = [
    ['Frontend Framework', 'React 19, TypeScript, Vite', 'Fast SPA re-renders, strict static typing, and modular component hierarchy.'],
    ['Design & Styling', 'Tailwind CSS v4, Lucide React', 'Modern medical-grade UI, zero runtime CSS footprint, and WCAG-compliant contrasts.'],
    ['Client State Management', 'Zustand (useFitnessStore.ts)', 'Predictable reactive state for daily nutrition logs, water, profile & date reel.'],
    ['Backend Server', 'Node.js, Express, tsx / esbuild', 'RESTful API gateway, server-side AI proxy, and static file server.'],
    ['AI Vision Pipeline', '@google/genai (Gemini Flash)', 'Multimodal image recognition, ingredient decomposition, and portion estimation.'],
    ['Clinical Rule Engine', 'TypeScript (healthConditions.ts)', 'Mifflin-St. Jeor TDEE, Atwater caloric factors, and clinical condition risk deviation.'],
    ['Deployment / Host', 'Google Cloud Run (asia-southeast1)', 'Containerized, horizontally scalable infrastructure with automated TLS and CDN.'],
  ];

  let currentY = tableY + 18;
  tableRows.forEach((row, i) => {
    const isEven = i % 2 === 0;
    doc.rect(45, currentY, 505, 20).fill(isEven ? '#F8FAFC' : '#FFFFFF');
    doc.rect(45, currentY, 505, 20).strokeColor('#E2E8F0').lineWidth(0.5).stroke();

    doc.fontSize(7.5).font('Helvetica-Bold').fillColor(slate900).text(row[0], 52, currentY + 5);
    doc.font('Helvetica').fillColor(primaryDark).text(row[1], 155, currentY + 5);
    doc.font('Helvetica').fillColor(slate600).text(row[2], 335, currentY + 5, { width: 210 });
    currentY += 20;
  });

  doc.y = currentY + 10;

  // 4. END-TO-END DATA & EXECUTION PIPELINE
  drawSectionTitle('4. End-to-End Data & Execution Pipeline', 'Section 4');
  drawParagraph(
    'When a user captures or uploads a meal photo via AIVisionFABModal, the following synchronous and asynchronous processing chain executes across the client-server boundary:'
  );

  const steps = [
    {
      num: 'STEP 1',
      title: 'Client Ingestion & Image Compression',
      desc: 'The user snaps or uploads a meal. The client reads the image into an HTML5 Canvas or File buffer, normalizes the aspect ratio, and formats an optimized base64 payload.',
    },
    {
      num: 'STEP 2',
      title: 'Secure Express Gateway Transport',
      desc: 'The payload is sent via POST to /api/ai/vision on the local server origin. The backend injects the secure GEMINI_API_KEY from process.env with zero credential leakage.',
    },
    {
      num: 'STEP 3',
      title: 'Multimodal Vision Inference & Schema Validation',
      desc: 'Gemini Multimodal Vision (with fallback across 3.5, 3.8, and 3.1 Flash) decomposes the meal into food name, macro grams (P, C, F), calories, and 8 key micronutrients.',
    },
    {
      num: 'STEP 4',
      title: 'Clinical Deviation & Metabolic Assessment',
      desc: 'The backend evaluates the meal against active user health conditions (e.g. Type 2 Diabetes, Hypertension). It computes the Atwater 4-4-9 factor check, sodium-to-potassium ratios, and flags risk factors.',
    },
    {
      num: 'STEP 5',
      title: 'Client State Ingestion & 5-Pillar Visual Rendering',
      desc: 'The client receives the enriched JSON payload, updates the Zustand global store, updates circular calorie rings, and immediately opens the dual-mode Food Nutrition Report view.',
    },
  ];

  steps.forEach((s) => {
    const yPos = doc.y;
    doc.roundedRect(45, yPos, 42, 13, 2).fill(primaryColor);
    doc.fontSize(7).font('Helvetica-Bold').fillColor('#FFFFFF').text(s.num, 47, yPos + 3, { width: 38, align: 'center' });
    doc.fontSize(9).font('Helvetica-Bold').fillColor(slate900).text(s.title, 95, yPos + 2);
    doc.y = yPos + 16;
    doc.fontSize(8).font('Helvetica').fillColor(slate600).lineGap(1.5).text(s.desc, 95, doc.y, { width: 450 });
    doc.moveDown(0.4);
  });

  // ==========================================
  // PAGE 3: FRONTEND ARCHITECTURE & 5-PILLAR REPORT
  // ==========================================
  doc.addPage();
  drawHeader('Frontend Architecture & Clinical Reporting System');

  // 5. CORE FRONTEND MODULAR ARCHITECTURE
  drawSectionTitle('5. Core Frontend Modular Architecture', 'Section 5');
  drawParagraph(
    'The frontend codebase in src/components/dashboard/ is engineered as a decoupled, component-driven hierarchy. Each module owns a specific physiological or metabolic tracking concern.'
  );

  drawSubTitle('The 5 Pillars of the Summarised Nutrition Report:');

  const pillars = [
    {
      title: '1. Executive Clinical & Caloric Compatibility Summary',
      detail:
        'A 10-second glance card rendering an instant clinical verdict (e.g., "Safe & Compatible" or "Moderate Deviation Flagged"), active condition tags, single-meal caloric budget contribution, Holt satiety rating, and Sodium-to-Potassium balance ratio.',
    },
    {
      title: '2. Interactive Macro Nutrition Distribution Pie Chart',
      detail:
        'A bespoke SVG donut chart validating the Atwater 4-4-9 factor standard (Calories = 4×P + 4×C + 9×F). Features interactive slice hovering, center kcal transitions, and detailed gram/energy breakdown cards for protein, carbs, and fats.',
    },
    {
      title: '3. Health Condition Deviation Graph',
      detail:
        'Visual threshold meters plotting the meal’s key biomarkers (Sodium, Net Glycemic Carbs, Saturated Fat, Purines) against safe vs. elevated clinical thresholds, color-coded with physiological impact explanations.',
    },
    {
      title: '4. Condition-Specific "What to Avoid Adding" Box',
      detail:
        'Targeted clinical safeguards providing 2-3 specific additions, seasonings, or condiments to avoid for that specific meal (e.g., avoiding soy sauce/MSG for Hypertensive patients, or high-fructose glazes for Diabetics).',
    },
    {
      title: '5. Smart Nutritional Swaps & Substitutions',
      detail:
        'Clinically vetted substitution pairs (e.g., noodles swapped for cauliflower/quinoa, heavy cream swapped for Greek yogurt) accompanied by quantified Clinical ROI badges (e.g. -45% Glycemic Load, +6g Fiber).',
    },
  ];

  pillars.forEach((p) => {
    doc.fontSize(9).font('Helvetica-Bold').fillColor(primaryDark).text(p.title);
    doc.fontSize(8).font('Helvetica').fillColor(slate600).lineGap(1.5).text(p.detail, { width: 505 });
    doc.moveDown(0.35);
  });

  // 6. BACKEND API SERVICES & ENDPOINTS
  drawSectionTitle('6. Backend API Micro-Services & Endpoints (server.ts)', 'Section 6');

  const apiEndpoints = [
    { method: 'GET', path: '/api/health', desc: 'System health check, server uptime, and atomic clock date synchronization.' },
    { method: 'GET', path: '/api/ai/status', desc: 'Secure capability check; returns boolean flags (gemini_available: true) with zero key leakage.' },
    { method: 'POST', path: '/api/ai/vision', desc: 'Multimodal image analysis; outputs structured nutrition and biomarker data via Gemini Flash.' },
    { method: 'POST', path: '/api/ai/nutrition-analysis', desc: 'Natural language text breakdown for manual culinary inputs.' },
    { method: 'POST', path: '/api/ai/scan-medicine', desc: 'Medication label OCR and drug-nutrient interaction verification.' },
    { method: 'GET', path: '/api/nutrition/day?date=YYYY-MM-DD', desc: 'Aggregated macro and micronutrient logs for the specified calendar day.' },
    { method: 'POST/DEL', path: '/api/nutrition/food-log', desc: 'Create, update, or remove meal entries with automatic rolling recalculation.' },
    { method: 'POST', path: '/api/profile', desc: 'Stores user biometrics, chronic condition flags, and Mifflin-St. Jeor caloric goals.' },
  ];

  apiEndpoints.forEach((ep) => {
    const epY = doc.y;
    const badgeColor = ep.method === 'GET' ? '#0284C7' : ep.method === 'POST' ? primaryColor : '#D97706';
    doc.roundedRect(45, epY, 44, 12, 2).fill(badgeColor);
    doc.fontSize(6.5).font('Helvetica-Bold').fillColor('#FFFFFF').text(ep.method, 46, epY + 3, { width: 42, align: 'center' });
    doc.fontSize(8).font('Helvetica-Bold').fillColor(slate900).text(ep.path, 95, epY + 2);
    doc.fontSize(7.5).font('Helvetica').fillColor(slate600).text(ep.desc, 275, epY + 2, { width: 275 });
    doc.y = epY + 16;
  });

  // ==========================================
  // PAGE 4: SECURITY, PRIVACY & ROADMAP
  // ==========================================
  doc.addPage();
  drawHeader('Security, Privacy & Strategic Roadmap');

  // 7. SECURITY & CLINICAL VERIFICATION
  drawSectionTitle('7. Security, Privacy & Reliability Guarantees', 'Section 7');

  drawBullet('Zero Secret Leakage to Client:', 'Upstream AI keys are kept strictly in process.env.GEMINI_API_KEY. The frontend bundles zero API keys and speaks exclusively to authenticated internal proxy endpoints.');
  drawBullet('In-Memory Ephemeral Vision Processing:', 'Images uploaded for nutrition analysis are processed in transient server buffers and are not permanently written to unencrypted disks, protecting personal visual privacy.');
  drawBullet('Deterministic Fallback System:', 'If upstream cloud AI APIs face transient rate limits or outages, the platform gracefully switches to a curated database of 200+ culinary items and clinical heuristic rules without crashing.');
  drawBullet('Strict Type Safety & Schema Validation:', 'End-to-end TypeScript interfaces ensure that every piece of data rendered in the UI conforms to strict nutritional and medical schemas.');

  // 8. STRATEGIC ROADMAP FOR FOUNDERS
  drawSectionTitle('8. Strategic Co-Founder Roadmap & Milestones', 'Section 8');

  const roadmapItems = [
    {
      quarter: 'PHASE 1 (Completed)',
      title: 'Core Engine & 5-Pillar Clinical Reporting',
      points: 'Mifflin-St. Jeor engine, Atwater verification, Gemini Multimodal Vision, and Summarised vs. Detailed Nutrition Report views.',
    },
    {
      quarter: 'PHASE 2 (Current)',
      title: 'Enterprise Clinical Hardening & Cloud SQL Integration',
      points: 'Relational database schema for multi-tenant clinical accounts, doctor-patient report exports, and continuous CGM (Dexcom/Abbott) sync.',
    },
    {
      quarter: 'PHASE 3 (Q3-Q4 2026)',
      title: 'Mobile PWA & Real-Time Wearable Telemetry',
      points: 'Offline PWA service worker caching, Apple HealthKit / Google Health Connect bi-directional sync, and personalized weekly biomarker audits.',
    },
  ];

  roadmapItems.forEach((item) => {
    const rmY = doc.y;
    doc.roundedRect(45, rmY, 110, 14, 3).fill(emeraldBg);
    doc.fontSize(7).font('Helvetica-Bold').fillColor(primaryDark).text(item.quarter, 48, rmY + 3, { width: 104, align: 'center' });
    doc.fontSize(9.5).font('Helvetica-Bold').fillColor(slate900).text(item.title, 165, rmY + 2);
    doc.y = rmY + 18;
    doc.fontSize(8).font('Helvetica').fillColor(slate600).lineGap(1.5).text(item.points, 165, doc.y, { width: 380 });
    doc.moveDown(0.55);
  });

  // Sign-off Box
  doc.moveDown(0.8);
  const signY = doc.y;
  doc.roundedRect(45, signY, 505, 45, 4).fill(bgLight);
  doc.rect(45, signY, 505, 45).strokeColor('#E2E8F0').lineWidth(1).stroke();

  doc.fontSize(8).font('Helvetica-Bold').fillColor(slate900).text('Report Prepared For:', 58, signY + 9);
  doc.font('Helvetica').fillColor(slate600).text('Co-Founder & Executive Board Review', 155, signY + 9);

  doc.fontSize(8).font('Helvetica-Bold').fillColor(slate900).text('Engineering Contact:', 58, signY + 24);
  doc.font('Helvetica').fillColor(slate600).text('Technical Advisory & Lead Systems Architect', 155, signY + 24);

  doc.fontSize(7.5).font('Helvetica-Bold').fillColor(primaryColor).text('SYSTEM ARCHITECTURE VERIFIED & LIVE', 370, signY + 16);

  // Add Page Numbers
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    doc.save();
    doc.fontSize(7.5).font('Helvetica').fillColor(slate400);
    doc.text(`Page ${i + 1} of ${range.count}`, 45, 800, { align: 'center', width: 505 });
    doc.text('CONFIDENTIAL - FOR INTERNAL FOUNDING TEAM USE ONLY', 45, 800, { align: 'right', width: 505 });
    doc.restore();
  }

  doc.end();

  return new Promise((resolve, reject) => {
    writeStream.on('finish', () => {
      fs.copyFileSync(outputPath, aliasPath);
      console.log('SUCCESS: Generated PDF at ' + outputPath + ' and copied to ' + aliasPath);
      resolve(outputPath);
    });
    writeStream.on('error', reject);
  });
}

generatePDF().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
