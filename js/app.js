// ===== TAB SYSTEM =====
function switchTab(name) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  const idx = { kinematics: 0, newton: 1, energy: 2, circular: 3, wave: 4, thermo: 5 }[name];
  document.querySelectorAll('.tab-btn')[idx]?.classList.add('active');
}

// ===== SCROLL REVEAL =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ===== SIM 1: KINEMATICS (Canvas car) =====
let s1Running = false, s1T = 0, s1Pos = 0, s1Vel = 0, s1Anim = null;
function sim1Update() {
  const a = parseFloat(document.getElementById('sim1-acc').value);
  document.getElementById('sim1-info').textContent = `a = ${a.toFixed(1)} m/s²`;
  if (!s1Running) sim1DrawStatic();
}
function sim1DrawStatic() {
  const cv = document.getElementById('cvKine'); if (!cv) return;
  const c = cv.getContext('2d'); c.clearRect(0, 0, cv.width, cv.height);
  // Road
  c.fillStyle = '#cbd5e1'; c.fillRect(0, 85, cv.width, 35);
  c.strokeStyle = '#94a3b8'; c.setLineDash([12,8]);
  c.beginPath(); c.moveTo(0, 102); c.lineTo(cv.width, 102); c.stroke(); c.setLineDash([]);
  // Car at start
  drawCar(c, 40, 72, '#1d4ed8');
  c.fillStyle = '#475569'; c.font = '12px Kanit'; c.fillText('กดเริ่มเพื่อดูรถวิ่ง →', 100, 50);
}
function drawCar(c, x, y, color) {
  c.fillStyle = color;
  c.beginPath(); c.roundRect(x, y, 50, 20, 4); c.fill();
  c.beginPath(); c.roundRect(x+10, y-12, 30, 14, 3); c.fill();
  c.fillStyle = '#334155';
  c.beginPath(); c.arc(x+12, y+20, 6, 0, Math.PI*2); c.fill();
  c.beginPath(); c.arc(x+38, y+20, 6, 0, Math.PI*2); c.fill();
}
function sim1Start() {
  if (s1Running) return; s1Running = true; s1T = 0; s1Pos = 40; s1Vel = 0;
  const a = parseFloat(document.getElementById('sim1-acc').value);
  function anim() {
    const cv = document.getElementById('cvKine'); if (!cv) return;
    const c = cv.getContext('2d'); c.clearRect(0, 0, cv.width, cv.height);
    c.fillStyle = '#cbd5e1'; c.fillRect(0, 85, cv.width, 35);
    c.strokeStyle = '#94a3b8'; c.setLineDash([12,8]);
    c.beginPath(); c.moveTo(0, 102); c.lineTo(cv.width, 102); c.stroke(); c.setLineDash([]);
    // Markers
    for (let i = 0; i <= 6; i++) {
      const mx = 40 + i * 100; c.fillStyle = '#94a3b8'; c.font = '10px Space Mono';
      c.fillText((i*10)+'m', mx, 82);
      c.beginPath(); c.moveTo(mx, 85); c.lineTo(mx, 88); c.strokeStyle='#94a3b8'; c.stroke();
    }
    s1Vel += a * 0.05; s1Pos += s1Vel * 2; s1T += 0.05;
    drawCar(c, s1Pos, 72, '#1d4ed8');
    // Velocity arrow
    if (s1Vel > 0.5) {
      c.strokeStyle = '#ef4444'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(s1Pos+50, 60); c.lineTo(s1Pos+50+s1Vel*3, 60); c.stroke();
      c.fillStyle = '#ef4444'; c.font = '10px Space Mono';
      c.fillText('v='+s1Vel.toFixed(1), s1Pos+55+s1Vel*3, 58);
    }
    document.getElementById('sim1-result').textContent =
      `t = ${s1T.toFixed(1)}s | v = ${s1Vel.toFixed(1)} m/s | s = ${(0.5*a*s1T*s1T).toFixed(1)} m`;
    if (s1Pos < cv.width - 60) { s1Anim = requestAnimationFrame(anim); }
    else { s1Running = false; document.getElementById('sim1-result').textContent += ' ✓ จบ'; }
  }
  anim();
}
function sim1Reset() { s1Running = false; if (s1Anim) cancelAnimationFrame(s1Anim); s1T=0; s1Pos=0; s1Vel=0; document.getElementById('sim1-result').textContent=''; sim1DrawStatic(); }

// ===== SIM 2: NEWTON F=ma (Canvas) =====
function sim2Draw() {
  const cv = document.getElementById('cvNewton'); if (!cv) return;
  const c = cv.getContext('2d');
  const F = parseFloat(document.getElementById('sim2-f').value);
  const m = parseFloat(document.getElementById('sim2-m').value);
  const a = F / m;
  document.getElementById('sim2-f-val').textContent = F + ' N';
  document.getElementById('sim2-m-val').textContent = m + ' kg';
  document.getElementById('sim2-result').textContent = `a = F/m = ${F}/${m} = ${a.toFixed(1)} m/s²`;
  c.clearRect(0, 0, cv.width, cv.height);
  // Floor
  c.fillStyle = '#e2e8f0'; c.fillRect(0, 100, cv.width, 40);
  // Block
  const bw = 30 + m * 3, bh = 30 + m * 2;
  const bx = cv.width/2 - bw/2, by = 100 - bh;
  c.fillStyle = '#0d9488'; c.beginPath(); c.roundRect(bx, by, bw, bh, 4); c.fill();
  c.fillStyle = '#fff'; c.font = 'bold 13px Space Mono'; c.textAlign = 'center';
  c.fillText(m+'kg', bx+bw/2, by+bh/2+5); c.textAlign = 'start';
  // Force arrow
  const arrowLen = F * 1.5;
  c.strokeStyle = '#ef4444'; c.lineWidth = 3;
  c.beginPath(); c.moveTo(bx - 10, by + bh/2); c.lineTo(bx - 10 - arrowLen, by + bh/2); c.stroke();
  c.fillStyle = '#ef4444'; c.beginPath();
  c.moveTo(bx-10, by+bh/2-6); c.lineTo(bx-10, by+bh/2+6); c.lineTo(bx-2, by+bh/2); c.fill();
  c.font = 'bold 12px Space Mono'; c.fillText('F='+F+'N', bx-arrowLen-10, by+bh/2-10);
  // Acceleration arrow
  const aLen = a * 8;
  c.strokeStyle = '#1d4ed8'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(bx+bw+10, by+bh/2); c.lineTo(bx+bw+10+aLen, by+bh/2); c.stroke();
  c.fillStyle = '#1d4ed8'; c.beginPath();
  c.moveTo(bx+bw+10+aLen, by+bh/2-5); c.lineTo(bx+bw+10+aLen, by+bh/2+5); c.lineTo(bx+bw+18+aLen, by+bh/2); c.fill();
  c.font = '11px Space Mono'; c.fillText('a='+a.toFixed(1), bx+bw+15+aLen, by+bh/2-8);
}

// ===== SIM 3: ENERGY PE/KE (Canvas) =====
function sim3Draw() {
  const cv = document.getElementById('cvEnergy'); if (!cv) return;
  const c = cv.getContext('2d');
  const hPct = parseFloat(document.getElementById('sim3-h').value);
  const pe = hPct, ke = 100 - hPct;
  document.getElementById('sim3-info').textContent = `PE: ${pe}% | KE: ${ke}% | E_total = 100%`;
  c.clearRect(0, 0, cv.width, cv.height);
  // Ramp
  c.strokeStyle = '#94a3b8'; c.lineWidth = 3;
  c.beginPath(); c.moveTo(50, 30); c.quadraticCurveTo(200, 170, 350, 170);
  c.lineTo(cv.width-50, 170); c.stroke();
  // Ball position on ramp
  const t = 1 - hPct/100;
  const bx = 50 + t * (cv.width - 150);
  const by = t < 0.5 ? 30 + (t/0.43) * 140 : 170;
  c.fillStyle = '#d97706'; c.beginPath(); c.arc(bx, by - 12, 12, 0, Math.PI*2); c.fill();
  c.fillStyle = '#fff'; c.font = '8px Space Mono'; c.textAlign = 'center';
  c.fillText('m', bx, by - 9); c.textAlign = 'start';
  // Energy bars
  const barX = cv.width - 120, barW = 30, barH = 130;
  c.fillStyle = '#e2e8f0'; c.fillRect(barX, 20, barW, barH); c.fillRect(barX+45, 20, barW, barH);
  c.fillStyle = '#10b981'; c.fillRect(barX, 20 + barH*(1-pe/100), barW, barH*pe/100);
  c.fillStyle = '#1d4ed8'; c.fillRect(barX+45, 20 + barH*(1-ke/100), barW, barH*ke/100);
  c.fillStyle = '#475569'; c.font = '11px Kanit';
  c.fillText('PE', barX+5, 165); c.fillText('KE', barX+50, 165);
  // Height label
  c.fillStyle = '#d97706'; c.font = '11px Space Mono';
  c.fillText('h = '+hPct+'%', bx - 20, by - 28);
}

// ===== SIM 4: CIRCULAR MOTION (Canvas animated) =====
let s4Angle = 0, s4Anim = null;
function sim4Update() {
  const v = parseFloat(document.getElementById('sim4-v').value);
  const r = parseFloat(document.getElementById('sim4-r').value);
  document.getElementById('sim4-v-val').textContent = v + ' m/s';
  document.getElementById('sim4-r-val').textContent = r + ' m';
  const ac = (v*v)/r;
  document.getElementById('sim4-info').textContent = `a_c = v²/r = ${v*v}/${r} = ${ac.toFixed(1)} m/s²`;
}
function sim4Animate() {
  const cv = document.getElementById('cvCircle'); if (!cv) return;
  const c = cv.getContext('2d');
  const v = parseFloat(document.getElementById('sim4-v')?.value || 8);
  const r = parseFloat(document.getElementById('sim4-r')?.value || 5);
  const drawR = 40 + r * 5;
  const cx = cv.width/2, cy = cv.height/2;
  c.clearRect(0, 0, cv.width, cv.height);
  // Orbit circle
  c.strokeStyle = '#cbd5e1'; c.lineWidth = 2; c.setLineDash([6,4]);
  c.beginPath(); c.arc(cx, cy, drawR, 0, Math.PI*2); c.stroke(); c.setLineDash([]);
  // Center
  c.fillStyle = '#94a3b8'; c.beginPath(); c.arc(cx, cy, 4, 0, Math.PI*2); c.fill();
  // Object
  const ox = cx + drawR * Math.cos(s4Angle);
  const oy = cy + drawR * Math.sin(s4Angle);
  c.fillStyle = '#1d4ed8'; c.beginPath(); c.arc(ox, oy, 10, 0, Math.PI*2); c.fill();
  // Centripetal acceleration arrow (toward center)
  const ac = (v*v)/r;
  const aLen = Math.min(ac * 3, drawR - 15);
  const ax = cx - ox, ay = cy - oy;
  const dist = Math.sqrt(ax*ax+ay*ay);
  c.strokeStyle = '#ef4444'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(ox, oy);
  c.lineTo(ox + ax/dist*aLen, oy + ay/dist*aLen); c.stroke();
  c.fillStyle = '#ef4444'; c.font = '11px Space Mono';
  c.fillText('a_c', ox + ax/dist*aLen + 5, oy + ay/dist*aLen);
  // Velocity arrow (tangent)
  const vLen = Math.min(v * 4, 60);
  const vx = -Math.sin(s4Angle) * vLen, vy = Math.cos(s4Angle) * vLen;
  c.strokeStyle = '#10b981'; c.beginPath(); c.moveTo(ox, oy); c.lineTo(ox+vx, oy+vy); c.stroke();
  c.fillStyle = '#10b981'; c.fillText('v', ox+vx+5, oy+vy);
  // Labels
  c.fillStyle = '#94a3b8'; c.font = '10px Space Mono';
  c.fillText('r='+r+'m', cx+5, cy-5);

  s4Angle += v / (drawR) * 0.05;
  s4Anim = requestAnimationFrame(sim4Animate);
}

// ===== SIM 5: WAVE (Canvas animated sine) =====
let s5Phase = 0, s5Anim = null;
function sim5Update() {
  const f = parseFloat(document.getElementById('sim5-f').value);
  const A = parseFloat(document.getElementById('sim5-a').value);
  document.getElementById('sim5-f-val').textContent = f + ' Hz';
  document.getElementById('sim5-a-val').textContent = A;
  const wavLen = 700 / (f * 2);
  const v = f * wavLen / 10;
  document.getElementById('sim5-info').textContent = `λ = ${(wavLen/10).toFixed(1)} m | v = fλ = ${v.toFixed(1)} m/s | T = ${(1/f).toFixed(2)} s`;
}
function sim5Animate() {
  const cv = document.getElementById('cvWave'); if (!cv) return;
  const c = cv.getContext('2d');
  const f = parseFloat(document.getElementById('sim5-f')?.value || 3);
  const A = parseFloat(document.getElementById('sim5-a')?.value || 40);
  const cy = cv.height / 2;
  c.clearRect(0, 0, cv.width, cv.height);
  // Center line
  c.strokeStyle = '#cbd5e1'; c.lineWidth = 1; c.setLineDash([4,4]);
  c.beginPath(); c.moveTo(0, cy); c.lineTo(cv.width, cy); c.stroke(); c.setLineDash([]);
  // Sine wave
  c.strokeStyle = '#10b981'; c.lineWidth = 2.5; c.beginPath();
  for (let x = 0; x < cv.width; x++) {
    const y = cy + A * Math.sin((x * f * 0.02) + s5Phase);
    x === 0 ? c.moveTo(x, y) : c.lineTo(x, y);
  }
  c.stroke();
  // Labels
  const lambda = cv.width / (f * 2);
  c.strokeStyle = '#d97706'; c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(30, cy - A - 10); c.lineTo(30 + lambda, cy - A - 10); c.stroke();
  c.fillStyle = '#d97706'; c.font = '11px Space Mono'; c.fillText('λ', 30 + lambda/2 - 3, cy - A - 15);
  // Amplitude label
  c.strokeStyle = '#ef4444'; c.beginPath(); c.moveTo(15, cy); c.lineTo(15, cy - A); c.stroke();
  c.fillStyle = '#ef4444'; c.font = '10px Space Mono'; c.fillText('A', 3, cy - A/2);

  s5Phase -= f * 0.06;
  s5Anim = requestAnimationFrame(sim5Animate);
}

// ===== SIM 6: THERMO Q=mcΔT (Canvas) =====
function sim6Draw() {
  const cv = document.getElementById('cvThermo'); if (!cv) return;
  const c = cv.getContext('2d');
  const m = parseFloat(document.getElementById('sim6-m').value);
  const dt = parseFloat(document.getElementById('sim6-dt').value);
  const cWater = 4186;
  const Q = m * cWater * dt;
  document.getElementById('sim6-m-val').textContent = m + ' kg';
  document.getElementById('sim6-dt-val').textContent = dt + ' °C';
  document.getElementById('sim6-info').textContent = `Q = mcΔT = (${m})(4186)(${dt}) = ${(Q/1000).toFixed(1)} kJ`;
  c.clearRect(0, 0, cv.width, cv.height);
  // Beaker
  const bx = 80, by = 30, bw = 120, bh = 130;
  c.strokeStyle = '#64748b'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(bx, by); c.lineTo(bx, by+bh); c.lineTo(bx+bw, by+bh); c.lineTo(bx+bw, by); c.stroke();
  // Water level
  const wh = bh * Math.min(m/10 * 0.9 + 0.1, 1);
  const hue = Math.max(240 - dt * 2.4, 0);
  c.fillStyle = `hsla(${hue}, 70%, 60%, 0.5)`;
  c.fillRect(bx+2, by+bh-wh, bw-4, wh-2);
  // Temperature label
  c.fillStyle = '#ef4444'; c.font = 'bold 14px Space Mono'; c.textAlign = 'center';
  c.fillText(dt+'°C', bx+bw/2, by+bh-wh/2+5);
  c.fillStyle = '#475569'; c.font = '10px Kanit';
  c.fillText(m+'kg', bx+bw/2, by+bh+16); c.textAlign = 'start';
  // Thermometer
  const tx = 240, ty = 40, th = 110;
  c.strokeStyle = '#64748b'; c.lineWidth = 1.5;
  c.beginPath(); c.roundRect(tx, ty, 16, th, 8); c.stroke();
  const fill = (dt/100) * (th - 10);
  c.fillStyle = '#ef4444'; c.beginPath(); c.roundRect(tx+3, ty+th-fill-5, 10, fill, 5); c.fill();
  // Energy bar
  const ex = 300, ew = Math.min(Q/500000 * 300, 350);
  c.fillStyle = '#fef2f2'; c.fillRect(ex, 80, 350, 30);
  c.fillStyle = `hsl(${hue}, 70%, 50%)`; c.fillRect(ex, 80, ew, 30);
  c.fillStyle = '#475569'; c.font = '12px Kanit';
  c.fillText('พลังงานความร้อน Q', ex, 75);
  c.font = 'bold 12px Space Mono'; c.fillStyle = '#ef4444';
  c.fillText((Q/1000).toFixed(1) + ' kJ', ex + ew + 8, 100);
}


// ===== PROJECTILE SIMULATION =====
const canvas = document.getElementById('simCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;
let animId = null;
let simRunning = false;

function drawGrid() {
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = 'rgba(0,0,0,0.06)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= canvas.width; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
  for (let y = 0; y <= canvas.height; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }
  ctx.strokeStyle = '#1e40af';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(0, canvas.height - 20); ctx.lineTo(canvas.width, canvas.height - 20); ctx.stroke();
}

function getParams() {
  const v0 = parseFloat(document.getElementById('velSlider').value);
  const angleDeg = parseFloat(document.getElementById('angleSlider').value);
  return { v0, angle: angleDeg * Math.PI / 180, angleDeg };
}

function updateSim() {
  document.getElementById('velVal').textContent = document.getElementById('velSlider').value + ' m/s';
  document.getElementById('angleVal').textContent = document.getElementById('angleSlider').value + '°';
  if (!simRunning) drawTrajectoryPreview();
}

function drawTrajectoryPreview() {
  drawGrid();
  if (!ctx) return;
  const { v0, angle } = getParams();
  const g = 9.8, vx = v0 * Math.cos(angle), vy = v0 * Math.sin(angle);
  const tFlight = 2 * vy / g, range = vx * tFlight, hMax = (vy * vy) / (2 * g);
  const scaleX = (canvas.width - 60) / Math.max(range, 1);
  const scaleY = (canvas.height - 50) / Math.max(hMax * 2, 1);
  const scale = Math.min(scaleX, scaleY) * 0.8;
  ctx.strokeStyle = 'rgba(30,64,175,0.25)'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]); ctx.beginPath();
  for (let t = 0; t <= tFlight; t += 0.05) {
    const x = 30 + vx * t * scale, y = canvas.height - 20 - vy * t * scale + 0.5 * g * t * t * scale;
    t === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = '#64748b'; ctx.beginPath(); ctx.arc(30, canvas.height - 20, 8, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#1e40af'; ctx.lineWidth = 2; ctx.beginPath();
  ctx.moveTo(30, canvas.height - 20);
  ctx.lineTo(30 + Math.cos(angle) * 40, canvas.height - 20 - Math.sin(angle) * 40); ctx.stroke();
  document.getElementById('simInfo').textContent = `ระยะพิสัย: ${range.toFixed(1)} m  |  ความสูงสูงสุด: ${hMax.toFixed(1)} m  |  เวลาบิน: ${tFlight.toFixed(2)} s`;
}

function launchProjectile() {
  if (simRunning || !ctx) return;
  simRunning = true;
  if (animId) cancelAnimationFrame(animId);
  const { v0, angle } = getParams();
  const g = 9.8, vx = v0 * Math.cos(angle), vy = v0 * Math.sin(angle);
  const tFlight = 2 * vy / g, range = vx * tFlight, hMax = (vy * vy) / (2 * g);
  const scaleX = (canvas.width - 60) / Math.max(range, 1);
  const scaleY = (canvas.height - 50) / Math.max(hMax * 2, 1);
  const scale = Math.min(scaleX, scaleY) * 0.8;
  const trail = []; let t = 0;
  function animate() {
    drawGrid(); t += 0.04;
    const cx = 30 + vx * t * scale, cy = canvas.height - 20 - vy * t * scale + 0.5 * g * t * t * scale;
    trail.push({ x: cx, y: cy }); if (trail.length > 60) trail.shift();
    for (let i = 1; i < trail.length; i++) {
      ctx.strokeStyle = `rgba(30,64,175,${(i / trail.length) * 0.6})`; ctx.lineWidth = 2; ctx.beginPath();
      ctx.moveTo(trail[i - 1].x, trail[i - 1].y); ctx.lineTo(trail[i].x, trail[i].y); ctx.stroke();
    }
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 12);
    grad.addColorStop(0, 'rgba(30,64,175,0.8)'); grad.addColorStop(1, 'rgba(30,64,175,0)');
    ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(cx, cy, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1e40af'; ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();
    const yCur = vy * t - 0.5 * g * t * t;
    if (t < tFlight && yCur >= -0.5) { animId = requestAnimationFrame(animate); }
    else { simRunning = false; document.getElementById('simInfo').textContent = `✓ ระยะพิสัย: ${range.toFixed(1)} m  |  ความสูงสูงสุด: ${hMax.toFixed(1)} m  |  เวลาบิน: ${tFlight.toFixed(2)} s`; }
  }
  animate();
}

function resetSim() { simRunning = false; if (animId) cancelAnimationFrame(animId); drawTrajectoryPreview(); }

// ===== QUIZ =====
const allQuestions = [
  { q: "ปริมาณใดต่อไปนี้เป็นปริมาณเวกเตอร์ทั้งหมด?", opts: ["ระยะทาง, อัตราเร็ว", "การกระจัด, ความเร็ว", "มวล, น้ำหนัก", "แรง, เวลา"], ans: 1, explain: "การกระจัดและความเร็ว ต้องบอกทั้งขนาดและทิศทางจึงจะสมบูรณ์ ✓" },
  { q: "รถเคลื่อนที่จากหยุดนิ่งด้วยความเร่ง 4 m/s² เป็นเวลา 6 วินาที รถจะได้ระยะทางเท่าใด?", opts: ["72 m", "144 m", "24 m", "48 m"], ans: 0, explain: "s = ut + ½at² = 0 + ½(4)(6²) = 72 m ✓" },
  { q: "โยนวัตถุขึ้นตรงๆ ในแนวดิ่ง ที่จุดสูงสุดวัตถุมีความเร็วเท่าใด?", opts: ["9.8 m/s", "0 m/s", "10 m/s", "ไม่สามารถระบุได้"], ans: 1, explain: "ที่จุดสูงสุด วัตถุจะหยุดนิ่งชั่วขณะ ความเร็วเป็น 0 ✓" },
  { q: "ความชันของกราฟความเร็ว-เวลา (v-t) คือปริมาณใด?", opts: ["ระยะทาง", "การกระจัด", "ความเร่ง", "แรง"], ans: 2, explain: "ความชัน (Δv/Δt) คืออัตราการเปลี่ยนแปลงความเร็ว = ความเร่ง ✓" },
  { q: "แรงขนาด 20 N กระทำกับมวล 4 kg บนพื้นลื่น จะได้ความเร่งเท่าใด?", opts: ["80 m/s²", "0.2 m/s²", "5 m/s²", "16 m/s²"], ans: 2, explain: "a = F/m = 20/4 = 5 m/s² ✓" },
  { q: "ถ้าเราออกแรงผลักกำแพง 50 N กำแพงจะออกแรงกระทำต่อเราเท่าใด?", opts: ["0 N", "25 N", "50 N", "100 N"], ans: 2, explain: "ตามกฎข้อ 3 Action = Reaction ขนาดเท่ากัน 50 N ✓" },
  { q: "ข้อใดคือแรงเสียดทานจลน์?", opts: ["แรงที่ทำให้ล้อรถหมุน", "แรงต้านตอนวัตถุกำลังไถล", "แรงต้านตอนวัตถุหยุดนิ่ง", "แรงสู่ศูนย์กลาง"], ans: 1, explain: "แรงเสียดทานจลน์เกิดเมื่อวัตถุกำลังไถลบนพื้นผิว ✓" },
  { q: "น้ำหนัก (Weight) ของวัตถุคืออะไร?", opts: ["ปริมาณเนื้อสาร", "แรงต้านการเคลื่อนที่", "แรงโน้มถ่วงที่โลกดึงดูดวัตถุ", "แรงปฏิกิริยาตั้งฉาก"], ans: 2, explain: "W = mg คือแรงดึงดูดของโลก ✓" },
  { q: "วัตถุมวล 2 kg วางบนที่สูง 10 m มีพลังงานศักย์เท่าใด? (g=10)", opts: ["20 J", "100 J", "200 J", "1000 J"], ans: 2, explain: "PE = mgh = 2×10×10 = 200 J ✓" },
  { q: "รถมวล 1000 kg วิ่ง 10 m/s มีพลังงานจลน์เท่าใด?", opts: ["10,000 J", "50,000 J", "100,000 J", "500,000 J"], ans: 1, explain: "KE = ½mv² = ½(1000)(100) = 50,000 J ✓" },
  { q: "งานในทางฟิสิกส์มีค่าเป็นศูนย์เมื่อใด?", opts: ["แรงไปทางเดียวกับการเคลื่อนที่", "แรงตั้งฉากกับการเคลื่อนที่", "ออกแรงมากแต่ไม่ได้เคลื่อนที่", "ถูกทั้งข้อ ข และ ค"], ans: 3, explain: "W = Fs·cos(θ) เป็น 0 เมื่อ s=0 หรือ cos90°=0 ✓" },
  { q: "กฎการอนุรักษ์พลังงานกล่าวว่าอย่างไร?", opts: ["พลังงานสูญหายได้", "พลังงานสร้างขึ้นใหม่ได้", "เปลี่ยนรูปได้แต่รวมเท่าเดิม", "KE ต้องเท่ากับ PE เสมอ"], ans: 2, explain: "พลังงานรวมในระบบปิดเปลี่ยนรูปได้แต่ไม่สูญหาย ✓" },
  { q: "วัตถุเคลื่อนที่วงกลมรัศมี 2 m ความเร็ว 4 m/s ความเร่งสู่ศูนย์กลางคือ?", opts: ["2 m/s²", "4 m/s²", "8 m/s²", "16 m/s²"], ans: 2, explain: "ac = v²/r = 16/2 = 8 m/s² ✓" },
  { q: "รถเลี้ยวโค้งบนถนนราบ แรงอะไรเป็นแรงสู่ศูนย์กลาง?", opts: ["แรงโน้มถ่วง", "แรงปฏิกิริยา", "แรงเสียดทานสถิต", "แรงตึงเชือก"], ans: 2, explain: "แรงเสียดทานระหว่างยางกับถนนดึงรถไม่ให้หลุดโค้ง ✓" },
  { q: "ข้อใดกล่าวถึง 'แรงหนีศูนย์กลาง' ถูกต้อง?", opts: ["เป็นแรงดึงดูดของโลก", "เหวี่ยงวัตถุให้หมุน", "ไม่มีจริง เป็นเพียงความเฉื่อย", "ดึงวัตถุเข้าหาศูนย์กลาง"], ans: 2, explain: "ในกรอบอ้างอิงเฉื่อย แรงหนีศูนย์กลางไม่มีจริง ✓" },
  { q: "คลื่นน้ำ 50 Hz ความยาวคลื่น 2 m อัตราเร็วคือ?", opts: ["25 m/s", "50 m/s", "100 m/s", "200 m/s"], ans: 2, explain: "v = fλ = 50×2 = 100 m/s ✓" },
  { q: "คลื่นเสียงจัดเป็นคลื่นประเภทใด?", opts: ["แม่เหล็กไฟฟ้า", "ตามขวาง", "ตามยาว", "คลื่นนิ่ง"], ans: 2, explain: "คลื่นเสียงสั่นในทิศเดียวกับการเคลื่อนที่ (ตามยาว) ✓" },
  { q: "ลูกตุ้มแกว่งครบ 1 รอบใน 2 วินาที ความถี่คือ?", opts: ["0.5 Hz", "1 Hz", "2 Hz", "4 Hz"], ans: 0, explain: "f = 1/T = 1/2 = 0.5 Hz ✓" },
  { q: "คลื่นสองขบวนซ้อนทับกันเรียกว่า?", opts: ["การสะท้อน", "การหักเห", "การเลี้ยวเบน", "การแทรกสอด"], ans: 3, explain: "การแทรกสอด (Interference) = Superposition ✓" },
  { q: "ข้อใดคือสมการกฎแก๊สอุดมคติ?", opts: ["v = u + at", "F = ma", "PV = nRT", "Q = mcΔT"], ans: 2, explain: "PV = nRT เชื่อมโยง P, V, T และ n ✓" },
  { q: "ความร้อนจำเพาะ (Specific Heat) คืออะไร?", opts: ["ความร้อนเปลี่ยนสถานะ", "ทำอุณหภูมิสูงขึ้น 1 K", "ทำวัตถุ 1 หน่วยมวล เปลี่ยนอุณหภูมิ 1 หน่วย", "อุณหภูมิที่น้ำเดือด"], ans: 2, explain: "นิยามค่า c ในสมการ Q = mcΔT ✓" },
  { q: "ละลายน้ำแข็ง อุณหภูมิคงที่ ความร้อนนำไปใช้ทำอะไร?", opts: ["เพิ่ม KE", "เปลี่ยนสถานะ", "เพิ่มความดัน", "ลดความหนาแน่น"], ans: 1, explain: "ความร้อนแฝงทำลายพันธะโมเลกุลเปลี่ยนสถานะ ✓" },
  { q: "0 เคลวิน เท่ากับกี่องศาเซลเซียส?", opts: ["0 °C", "-100 °C", "-273.15 °C", "-373.15 °C"], ans: 2, explain: "ศูนย์สัมบูรณ์ = -273.15 °C ✓" },
  { q: "รถไฟเหาะจุดสูงสุดต้องมีความเร็วอย่างน้อยเท่าใด?", opts: ["v = √(rg)", "v = rg", "v = √(2rg)", "v = 0"], ans: 0, explain: "ที่จุดสูงสุด mg = mv²/r → v = √(rg) ✓" }
];

let questions = [], currentQ = 0, score = 0, answered = false;

function initQuiz() {
  questions = [...allQuestions].sort(() => 0.5 - Math.random()).slice(0, 10);
  currentQ = 0; score = 0; renderQuiz();
}

function renderQuestion() {
  const q = questions[currentQ];
  document.getElementById('qText').textContent = `ข้อที่ ${currentQ + 1}: ${q.q}`;
  document.getElementById('qProgress').textContent = `ข้อ ${currentQ + 1} / ${questions.length} (คะแนน: ${score})`;
  const optDiv = document.getElementById('qOptions');
  optDiv.innerHTML = '';
  ['ก', 'ข', 'ค', 'ง'].forEach((letter, i) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option';
    btn.innerHTML = `<span class="option-letter">${letter}</span>${q.opts[i]}`;
    btn.onclick = () => checkAnswer(i);
    optDiv.appendChild(btn);
  });
  document.getElementById('qFeedback').style.display = 'none';
  document.getElementById('nextBtn').style.display = 'none';
  answered = false;
}

function checkAnswer(selected) {
  if (answered) return; answered = true;
  const q = questions[currentQ];
  const opts = document.querySelectorAll('.quiz-option');
  opts.forEach(o => o.classList.add('disabled'));
  const fb = document.getElementById('qFeedback');
  fb.style.display = 'block';
  if (selected === q.ans) {
    opts[selected].classList.add('correct');
    fb.className = 'quiz-feedback show success'; fb.textContent = `✓ ถูกต้อง! ${q.explain}`; score++;
  } else {
    opts[selected].classList.add('wrong'); opts[q.ans].classList.add('correct');
    fb.className = 'quiz-feedback show error'; fb.textContent = `✗ ไม่ถูก — ${q.explain}`;
  }
  const nextBtn = document.getElementById('nextBtn');
  nextBtn.style.display = 'inline-block';
  nextBtn.textContent = currentQ < questions.length - 1 ? 'ข้อต่อไป →' : 'ดูผลลัพธ์';
}

function nextQuestion() { currentQ++; currentQ < questions.length ? renderQuestion() : showResult(); }

function showResult() {
  const pct = (score / questions.length) * 100;
  let msg, icon, color;
  if (pct >= 80) { msg = "ยอดเยี่ยม! คุณคืออัจฉริยะฟิสิกส์"; icon = "fa-trophy"; color = "var(--accent)"; }
  else if (pct >= 50) { msg = "เก่งมาก! ผ่านเกณฑ์แล้ว"; icon = "fa-thumbs-up"; color = "#10b981"; }
  else { msg = "พยายามต่อไป! ลองกลับไปอ่านเนื้อหาอีกรอบ"; icon = "fa-book-open"; color = "#b45309"; }
  document.getElementById('quizBox').innerHTML = `
    <div style="text-align:center;padding:40px">
      <div style="font-size:4rem;margin-bottom:16px;color:${color}"><i class="fa-solid ${icon}"></i></div>
      <h3 style="font-size:1.8rem;margin-bottom:8px">คุณได้คะแนน ${score} / ${questions.length}</h3>
      <h4 style="color:${color};font-size:1.2rem;margin-bottom:24px">${msg}</h4>
      <button class="sim-btn primary" onclick="initQuiz()"><i class="fa-solid fa-rotate-right"></i> เริ่มทำข้อสอบใหม่</button>
    </div>`;
}

function renderQuiz() {
  document.getElementById('quizBox').innerHTML = `
    <div class="quiz-question" id="qText"></div>
    <div class="quiz-options" id="qOptions"></div>
    <div class="quiz-feedback" id="qFeedback" style="display:none"></div>
    <div class="quiz-nav">
      <button class="sim-btn primary" id="nextBtn" onclick="nextQuestion()" style="display:none">ข้อต่อไป →</button>
      <span class="quiz-progress" id="qProgress"></span>
    </div>`;
  renderQuestion();
}

// ===== INCLINED PLANE SIM =====
function updateIncline() {
  const cv = document.getElementById('simIncline');
  if (!cv) return;
  const c = cv.getContext('2d');
  const m = parseFloat(document.getElementById('incMass').value);
  const aDeg = parseFloat(document.getElementById('incAngle').value);
  const mu = parseFloat(document.getElementById('incMu').value) / 100;
  const aRad = aDeg * Math.PI / 180;
  const g = 9.8;
  document.getElementById('incMassVal').textContent = m + ' kg';
  document.getElementById('incAngleVal').textContent = aDeg + '°';
  document.getElementById('incMuVal').textContent = mu.toFixed(2);

  const gParallel = g * Math.sin(aRad);
  const gPerp = g * Math.cos(aRad);
  const friction = mu * m * gPerp;
  const netF = m * gParallel - friction;
  const acc = Math.max(netF / m, 0);

  c.clearRect(0, 0, cv.width, cv.height);
  // Draw incline
  const bx = 80, by = cv.height - 30;
  const tx = cv.width - 80, ty = by - Math.tan(aRad) * (tx - bx);
  c.fillStyle = '#e2e8f0'; c.beginPath(); c.moveTo(bx, by); c.lineTo(tx, ty); c.lineTo(tx, by); c.closePath(); c.fill();
  c.strokeStyle = '#94a3b8'; c.lineWidth = 2; c.stroke();

  // Box on incline
  const midX = (bx + tx) / 2, midY = by - Math.tan(aRad) * (midX - bx);
  const boxSize = 20 + m;
  c.save(); c.translate(midX, midY); c.rotate(-aRad);
  c.fillStyle = '#1d4ed8'; c.fillRect(-boxSize/2, -boxSize, boxSize, boxSize);
  c.fillStyle = '#fff'; c.font = '11px Space Mono'; c.textAlign = 'center';
  c.fillText(m + 'kg', 0, -boxSize/2 + 4);
  // Force arrows
  const arrowScale = 3;
  // mg sin θ (down the slope)
  c.strokeStyle = '#ef4444'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 0); c.lineTo(gParallel * arrowScale, 0); c.stroke();
  c.fillStyle = '#ef4444'; c.font = '10px Kanit'; c.fillText('mg sinθ', gParallel * arrowScale + 15, 4);
  // Normal
  c.strokeStyle = '#10b981'; c.beginPath(); c.moveTo(0, -boxSize); c.lineTo(0, -boxSize - gPerp * arrowScale); c.stroke();
  c.fillStyle = '#10b981'; c.fillText('N', 10, -boxSize - gPerp * arrowScale);
  // Friction
  if (mu > 0) {
    c.strokeStyle = '#d97706'; c.beginPath(); c.moveTo(0, 0); c.lineTo(-friction/m * arrowScale, 0); c.stroke();
    c.fillStyle = '#d97706'; c.fillText('f', -friction/m * arrowScale - 12, 4);
  }
  c.restore();
  // Angle label
  c.fillStyle = '#475569'; c.font = '13px Space Mono'; c.fillText(aDeg + '°', bx + 30, by - 8);

  const status = acc < 0.01 ? 'วัตถุไม่ไถล (แรงเสียดทานยึดอยู่)' : `ความเร่ง: ${acc.toFixed(2)} m/s²`;
  document.getElementById('incInfo').textContent = status + ` | mg sinθ = ${(m*gParallel).toFixed(1)} N | f = ${friction.toFixed(1)} N`;
}

// ===== SPRING SHM SIM =====
let shmTime = 0;
let shmAnimId = null;
function updateSHM() {
  const k = parseFloat(document.getElementById('shmK').value);
  const m = parseFloat(document.getElementById('shmM').value);
  const A = parseFloat(document.getElementById('shmA').value);
  document.getElementById('shmKVal').textContent = k + ' N/m';
  document.getElementById('shmMVal').textContent = m + ' kg';
  document.getElementById('shmAVal').textContent = A + ' cm';
  const omega = Math.sqrt(k / m);
  const T = 2 * Math.PI / omega;
  const f = 1 / T;
  document.getElementById('shmInfo').textContent = `คาบ T: ${T.toFixed(2)} s | ความถี่ f: ${f.toFixed(2)} Hz | ω: ${omega.toFixed(2)} rad/s`;
}
function animateSHM() {
  const cv = document.getElementById('simSpring');
  if (!cv) return;
  const c = cv.getContext('2d');
  const k = parseFloat(document.getElementById('shmK')?.value || 20);
  const m = parseFloat(document.getElementById('shmM')?.value || 5);
  const A = parseFloat(document.getElementById('shmA')?.value || 60);
  const omega = Math.sqrt(k / m);
  const cx = cv.width / 2;
  const cy = cv.height / 2;
  const displacement = A * Math.sin(omega * shmTime);

  c.clearRect(0, 0, cv.width, cv.height);
  // Equilibrium line
  c.setLineDash([4, 4]); c.strokeStyle = '#94a3b8'; c.lineWidth = 1;
  c.beginPath(); c.moveTo(cx, 10); c.lineTo(cx, cv.height - 10); c.stroke(); c.setLineDash([]);
  // Wall
  c.fillStyle = '#64748b'; c.fillRect(30, cy - 30, 10, 60);
  // Spring (zigzag)
  const endX = cx + displacement;
  c.strokeStyle = '#1d4ed8'; c.lineWidth = 2; c.beginPath();
  const segments = 16; const springStart = 40; const segLen = (endX - springStart) / segments;
  c.moveTo(springStart, cy);
  for (let i = 0; i < segments; i++) {
    const x = springStart + segLen * (i + 0.5);
    const y = cy + (i % 2 === 0 ? 12 : -12);
    c.lineTo(x, y);
  }
  c.lineTo(endX, cy); c.stroke();
  // Mass block
  const bw = 30 + m;
  c.fillStyle = '#d97706'; c.fillRect(endX, cy - bw/2, bw, bw);
  c.fillStyle = '#fff'; c.font = '10px Space Mono'; c.textAlign = 'center';
  c.fillText(m + 'kg', endX + bw/2, cy + 4);
  // Labels
  c.fillStyle = '#475569'; c.font = '11px Kanit';
  c.fillText('x = ' + displacement.toFixed(0) + ' cm', endX + bw/2, cy + bw/2 + 16);

  shmTime += 0.03;
  shmAnimId = requestAnimationFrame(animateSHM);
}

// ===== GAS LAW SIM =====
let gasParticles = [];
function initGasParticles() {
  gasParticles = [];
  for (let i = 0; i < 40; i++) {
    gasParticles.push({ x: 100 + Math.random() * 400, y: 40 + Math.random() * 200, vx: (Math.random()-0.5)*3, vy: (Math.random()-0.5)*3 });
  }
}
function updateGas() {
  const T = parseFloat(document.getElementById('gasT').value);
  const V = parseFloat(document.getElementById('gasV').value);
  const n = parseFloat(document.getElementById('gasN').value);
  document.getElementById('gasTVal').textContent = T + ' K';
  document.getElementById('gasVVal').textContent = V + ' L';
  document.getElementById('gasNVal').textContent = n + ' mol';
  const R = 0.0821; // L·atm/(mol·K)
  const P = (n * R * T) / V;
  document.getElementById('gasInfo').textContent = `ความดัน P: ${P.toFixed(2)} atm | PV = nRT → (${P.toFixed(1)})(${V}) = (${n})(0.0821)(${T})`;
}
let gasAnimId = null;
function animateGas() {
  const cv = document.getElementById('simGas');
  if (!cv) return;
  const c = cv.getContext('2d');
  const T = parseFloat(document.getElementById('gasT')?.value || 300);
  const V = parseFloat(document.getElementById('gasV')?.value || 20);
  const speed = T / 150;
  const containerW = V * 10 + 100;

  c.clearRect(0, 0, cv.width, cv.height);
  // Container
  const cx = cv.width / 2 - containerW / 2;
  const cy = 30; const ch = 220;
  c.strokeStyle = '#64748b'; c.lineWidth = 3;
  c.strokeRect(cx, cy, containerW, ch);
  // Piston top
  c.fillStyle = '#94a3b8'; c.fillRect(cx, cy - 8, containerW, 10);

  // Particles
  gasParticles.forEach(p => {
    p.vx += (Math.random() - 0.5) * speed * 0.3;
    p.vy += (Math.random() - 0.5) * speed * 0.3;
    const maxSpd = speed * 3;
    p.vx = Math.max(-maxSpd, Math.min(maxSpd, p.vx));
    p.vy = Math.max(-maxSpd, Math.min(maxSpd, p.vy));
    p.x += p.vx; p.y += p.vy;
    if (p.x < cx + 5 || p.x > cx + containerW - 5) p.vx *= -1;
    if (p.y < cy + 5 || p.y > cy + ch - 5) p.vy *= -1;
    p.x = Math.max(cx + 5, Math.min(cx + containerW - 5, p.x));
    p.y = Math.max(cy + 5, Math.min(cy + ch - 5, p.y));

    const hue = Math.min(T / 600 * 60, 60);
    c.fillStyle = `hsl(${hue}, 80%, 50%)`;
    c.beginPath(); c.arc(p.x, p.y, 4, 0, Math.PI * 2); c.fill();
  });

  gasAnimId = requestAnimationFrame(animateGas);
}

// ===== INIT =====
window.onload = () => {
  updateSim();
  initQuiz();
  // In-tab sims
  sim1DrawStatic(); sim1Update();
  sim2Draw();
  sim3Draw();
  sim4Update(); sim4Animate();
  sim5Update(); sim5Animate();
  sim6Draw();
  // Big sims
  updateIncline();
  updateSHM();
  animateSHM();
  initGasParticles();
  updateGas();
  animateGas();
};

