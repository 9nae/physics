"use strict";

const TAU = Math.PI * 2;
const SOUND_SPEED = 343;

const $ = (selector) => document.querySelector(selector);

function number(id) {
  return Number($(id).value);
}

function setText(id, text) {
  const node = $(id);
  if (node) node.textContent = text;
}

function fmt(value, digits = 1) {
  return Number(value).toLocaleString("th-TH", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}

function fitCanvas(canvas) {
  if (!canvas) return null;
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  }
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, width, height };
}

function clear(ctx, width, height, fill = "#ffffff") {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = fill;
  ctx.fillRect(0, 0, width, height);
}

function line(ctx, points, color, width = 2, dash = []) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.setLineDash(dash);
  ctx.beginPath();
  points.forEach(([x, y], index) => {
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  ctx.restore();
}

function label(ctx, text, x, y, color = "#17212b", align = "center") {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = "700 13px Segoe UI, Tahoma, Arial, sans-serif";
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
  ctx.restore();
}

function roundedRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function pill(ctx, text, x, y, color) {
  ctx.save();
  ctx.font = "800 12px Segoe UI, Tahoma, Arial, sans-serif";
  const metrics = ctx.measureText(text);
  const w = metrics.width + 18;
  const h = 26;
  ctx.fillStyle = color;
  roundedRect(ctx, x - w / 2, y - h / 2, w, h, 8);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y + 0.5);
  ctx.restore();
}

function drawHero(now) {
  const canvas = $("#heroCanvas");
  const fitted = fitCanvas(canvas);
  if (!fitted) return;
  const { ctx, width: w, height: h } = fitted;
  clear(ctx, w, h, "#ffffff");

  ctx.save();
  for (let x = 0; x < w; x += 34) {
    ctx.strokeStyle = "rgba(23,33,43,0.06)";
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += 34) {
    ctx.strokeStyle = "rgba(23,33,43,0.06)";
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.restore();

  const centerY = h * 0.33;
  const wave = [];
  for (let x = 24; x <= w - 24; x += 4) {
    const y =
      centerY +
      Math.sin(x * 0.045 + now * 2.2) * 30 +
      Math.sin(x * 0.091 - now * 1.1) * 10;
    wave.push([x, y]);
  }
  line(ctx, wave, "#0f766e", 4);
  line(
    ctx,
    wave.map(([x, y]) => [x, y + 34]),
    "#e4572e",
    2,
    [8, 7],
  );
  label(ctx, "คลื่นนิ่ง • บีต • ดอปเพลอร์ • คลื่นกระแทก", w / 2, 44, "#17212b");

  const sourceX = w * 0.33;
  const sourceY = h * 0.68;
  for (let i = 0; i < 8; i += 1) {
    const r = ((now * 48 + i * 46) % 330) + 16;
    ctx.strokeStyle = `rgba(37,99,235,${Math.max(0.04, 0.32 - r / 780)})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(sourceX, sourceY, r, 0, TAU);
    ctx.stroke();
  }
  ctx.fillStyle = "#f2c94c";
  ctx.beginPath();
  ctx.arc(sourceX, sourceY, 18, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#17212b";
  ctx.fillRect(sourceX + 18, sourceY - 7, 52, 14);
  ctx.beginPath();
  ctx.moveTo(sourceX + 75, sourceY);
  ctx.lineTo(sourceX + 56, sourceY - 18);
  ctx.lineTo(sourceX + 56, sourceY + 18);
  ctx.closePath();
  ctx.fill();

  const coneX = w * 0.78;
  const coneY = h * 0.68;
  const theta = Math.asin(1 / 1.55);
  const dx = w * 0.28;
  const dy = Math.tan(theta) * dx;
  line(ctx, [[coneX, coneY], [coneX - dx, coneY - dy]], "#e4572e", 3);
  line(ctx, [[coneX, coneY], [coneX - dx, coneY + dy]], "#e4572e", 3);
  ctx.fillStyle = "#17212b";
  ctx.beginPath();
  ctx.moveTo(coneX + 28, coneY);
  ctx.lineTo(coneX - 18, coneY - 16);
  ctx.lineTo(coneX - 10, coneY);
  ctx.lineTo(coneX - 18, coneY + 16);
  ctx.closePath();
  ctx.fill();
  pill(ctx, "M > 1", coneX - 68, coneY + 72, "#e4572e");
}

function drawStanding(now) {
  const canvas = $("#standingCanvas");
  const fitted = fitCanvas(canvas);
  if (!fitted) return;
  const { ctx, width: w, height: h } = fitted;
  clear(ctx, w, h, "#ffffff");

  const f = number("#swFreq");
  const v = number("#swSpeed");
  const L = number("#swLength") / 100;
  const lambda = v / f;
  const quarter = lambda / 4;
  const half = lambda / 2;

  setText("#swFreqOut", `${fmt(f, 0)} Hz`);
  setText("#swSpeedOut", `${fmt(v, 0)} m/s`);
  setText("#swLengthOut", `${fmt(L * 100, 0)} cm`);
  setText(
    "#standingReadout",
    `λ = ${fmt(lambda * 100, 1)} cm | λ/4 = ${fmt(quarter * 100, 1)} cm | ดัง-ดังถัดกัน = ${fmt(half * 100, 1)} cm`,
  );

  const pad = 46;
  const plotW = w - pad * 2;
  const baseY = h * 0.56;
  const scale = plotW / L;
  const wallX = pad + plotW;
  const speakerX = pad;
  const amp = Math.min(68, h * 0.17);
  const visualPhase = Math.cos(now * TAU * 0.7);

  ctx.fillStyle = "#eef6f3";
  ctx.fillRect(pad, baseY - 105, plotW, 210);
  line(ctx, [[speakerX, baseY], [wallX, baseY]], "#9aa8b5", 2);

  ctx.fillStyle = "#17212b";
  ctx.fillRect(wallX - 8, baseY - 112, 16, 224);
  label(ctx, "พื้น/ผนังแข็ง", wallX - 4, baseY - 130, "#17212b");

  ctx.fillStyle = "#f2c94c";
  ctx.beginPath();
  ctx.moveTo(speakerX - 28, baseY - 34);
  ctx.lineTo(speakerX, baseY - 16);
  ctx.lineTo(speakerX, baseY + 16);
  ctx.lineTo(speakerX - 28, baseY + 34);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#17212b";
  ctx.fillRect(speakerX - 34, baseY - 44, 8, 88);
  label(ctx, "ลำโพง", speakerX + 10, baseY + 130, "#17212b", "left");

  const pressure = [];
  const envTop = [];
  const envBottom = [];
  for (let px = pad; px <= wallX; px += 2) {
    const x = (px - pad) / scale;
    const d = L - x;
    const env = Math.abs(Math.cos(TAU * d / lambda));
    const y = baseY - amp * Math.cos(TAU * d / lambda) * visualPhase;
    pressure.push([px, y]);
    envTop.push([px, baseY - amp * env]);
    envBottom.push([px, baseY + amp * env]);
  }
  line(ctx, envTop, "rgba(228,87,46,0.34)", 1, [5, 5]);
  line(ctx, envBottom, "rgba(228,87,46,0.34)", 1, [5, 5]);
  line(ctx, pressure, "#e4572e", 3);

  let loudIndex = 0;
  for (let d = 0; d <= L + 0.001; d += half) {
    const x = wallX - d * scale;
    if (x < pad - 1 || x > wallX + 1) continue;
    line(ctx, [[x, baseY - 105], [x, baseY + 105]], "rgba(228,87,46,0.26)", 2);
    if (loudIndex % 2 === 0 || half * scale > 58) pill(ctx, "ดัง", x, baseY - 88, "#e4572e");
    loudIndex += 1;
  }
  let quietIndex = 0;
  for (let d = quarter; d <= L + 0.001; d += half) {
    const x = wallX - d * scale;
    if (x < pad - 1 || x > wallX + 1) continue;
    line(ctx, [[x, baseY - 92], [x, baseY + 92]], "rgba(37,99,235,0.2)", 2, [4, 4]);
    if (quietIndex % 2 === 0 || half * scale > 58) pill(ctx, "ค่อย", x, baseY + 88, "#2563eb");
    quietIndex += 1;
  }

  label(ctx, "กราฟสีส้ม: ความดันเสียงลัพธ์จากเสียงตกกระทบ + เสียงสะท้อน", w / 2, 30, "#5b6775");
}

function resonanceLengths(lambda, maxL) {
  const lengths = [];
  for (let n = 1; ; n += 2) {
    const L = (n * lambda) / 4;
    if (L > maxL + 0.2) break;
    lengths.push({ n, L });
  }
  return lengths;
}

function drawTube(now) {
  const canvas = $("#tubeCanvas");
  const fitted = fitCanvas(canvas);
  if (!fitted) return;
  const { ctx, width: w, height: h } = fitted;
  clear(ctx, w, h, "#ffffff");

  const temp = number("#tubeTemp");
  const f = number("#tubeFreq");
  const L = number("#tubeLength") / 100;
  const v = 331 + 0.6 * temp;
  const lambda = v / f;
  const maxL = 1.2;
  const resonances = resonanceLengths(lambda, maxL);
  const closest = resonances.reduce((best, item) => {
    if (!best) return item;
    return Math.abs(item.L - L) < Math.abs(best.L - L) ? item : best;
  }, null);
  const detune = closest ? Math.abs(closest.L - L) : Infinity;
  const intensity = closest ? 1 / (1 + (detune / Math.max(0.006, lambda * 0.035)) ** 2) : 0;

  setText("#tubeTempOut", `${fmt(temp, 0)} °C`);
  setText("#tubeFreqOut", `${fmt(f, 0)} Hz`);
  setText("#tubeLengthOut", `${fmt(L * 100, 1)} cm`);
  setText(
    "#tubeReadout",
    `v = ${fmt(v, 1)} m/s | λ = ${fmt(lambda * 100, 1)} cm | λ/2 = ${fmt((lambda / 2) * 100, 1)} cm | ใกล้ n=${closest ? closest.n : "-"} ที่ L=${closest ? fmt(closest.L * 100, 1) : "-"} cm`,
  );

  const pad = 54;
  const tubeY = h * 0.55;
  const tubeH = 106;
  const plotW = w - pad * 2;
  const pxPerM = plotW / maxL;
  const openX = pad;
  const pistonX = openX + L * pxPerM;
  const endX = openX + maxL * pxPerM;

  ctx.fillStyle = "#eef6f3";
  ctx.fillRect(openX, tubeY - tubeH / 2, endX - openX, tubeH);
  line(ctx, [[openX, tubeY - tubeH / 2], [endX, tubeY - tubeH / 2]], "#2563eb", 2);
  line(ctx, [[openX, tubeY + tubeH / 2], [endX, tubeY + tubeH / 2]], "#2563eb", 2);
  label(ctx, "ปากท่อเปิด", openX + 28, tubeY - 78, "#17212b", "left");

  ctx.fillStyle = "#17212b";
  ctx.fillRect(pistonX - 5, tubeY - tubeH / 2 - 10, 10, tubeH + 20);
  label(ctx, "ลูกสูบ/ปลายปิด", pistonX, tubeY + 82, "#17212b");

  const speakerX = openX - 30;
  ctx.fillStyle = "#f2c94c";
  ctx.beginPath();
  ctx.moveTo(speakerX - 28, tubeY - 30);
  ctx.lineTo(speakerX, tubeY - 12);
  ctx.lineTo(speakerX, tubeY + 12);
  ctx.lineTo(speakerX - 28, tubeY + 30);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#17212b";
  ctx.fillRect(speakerX - 34, tubeY - 38, 8, 76);

  resonances.forEach((item) => {
    const x = openX + item.L * pxPerM;
    if (x <= endX) {
      line(ctx, [[x, tubeY - tubeH / 2 - 32], [x, tubeY + tubeH / 2 + 32]], "rgba(228,87,46,0.32)", 2);
      pill(ctx, `n=${item.n}`, x, tubeY - tubeH / 2 - 48, "#e4572e");
    }
  });

  if (L > 0.03 && closest) {
    const n = closest.n;
    const points = [];
    for (let px = openX; px <= pistonX; px += 2) {
      const x = (px - openX) / Math.max(1, pistonX - openX);
      const standing = Math.cos((n * Math.PI * x) / 2);
      const y = tubeY - standing * Math.sin(now * TAU * 0.85) * (tubeH * 0.34) * (0.25 + intensity * 0.75);
      points.push([px, y]);
    }
    line(ctx, points, "#0f766e", 4);
  }

  const glow = Math.round(30 + intensity * 180);
  ctx.fillStyle = `rgba(242,201,76,${0.14 + intensity * 0.35})`;
  ctx.fillRect(openX, tubeY - tubeH / 2, pistonX - openX, tubeH);
  pill(ctx, intensity > 0.72 ? "เสียงดังมาก" : intensity > 0.28 ? "ใกล้สั่นพ้อง" : "ยังไม่สั่นพ้อง", Math.min(w - 90, Math.max(110, pistonX)), tubeY - 4, `rgb(15, ${Math.max(94, glow)}, 110)`);
}

let audioState = {
  playing: false,
  ctx: null,
  osc1: null,
  osc2: null,
  gain: null,
};

function stopBeatAudio() {
  if (!audioState.playing) return;
  const { ctx, osc1, osc2, gain } = audioState;
  const t = ctx.currentTime;
  gain.gain.cancelScheduledValues(t);
  gain.gain.setTargetAtTime(0.0001, t, 0.03);
  setTimeout(() => {
    try {
      osc1.stop();
      osc2.stop();
      osc1.disconnect();
      osc2.disconnect();
      gain.disconnect();
    } catch {
      // Audio nodes may already be stopped if the browser suspends the context.
    }
  }, 120);
  audioState.playing = false;
  setText("#beatAudio", "เปิดเสียงตัวอย่าง");
}

async function startBeatAudio() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  if (!audioState.ctx) audioState.ctx = new AudioContext();
  if (audioState.ctx.state === "suspended") await audioState.ctx.resume();
  const ctx = audioState.ctx;
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();
  osc1.type = "sine";
  osc2.type = "sine";
  osc1.frequency.value = number("#beatF1");
  osc2.frequency.value = number("#beatF2");
  gain.gain.value = 0.0001;
  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);
  osc1.start();
  osc2.start();
  gain.gain.setTargetAtTime(0.035, ctx.currentTime, 0.04);
  audioState = { playing: true, ctx, osc1, osc2, gain };
  setText("#beatAudio", "ปิดเสียงตัวอย่าง");
}

function updateBeatAudio() {
  if (!audioState.playing) return;
  const t = audioState.ctx.currentTime;
  audioState.osc1.frequency.setTargetAtTime(number("#beatF1"), t, 0.02);
  audioState.osc2.frequency.setTargetAtTime(number("#beatF2"), t, 0.02);
}

function drawBeats(now) {
  const canvas = $("#beatCanvas");
  const fitted = fitCanvas(canvas);
  if (!fitted) return;
  const { ctx, width: w, height: h } = fitted;
  clear(ctx, w, h, "#ffffff");

  const f1 = number("#beatF1");
  const f2 = number("#beatF2");
  const fb = Math.abs(f1 - f2);
  const period = fb > 0 ? 1 / fb : Infinity;
  setText("#beatF1Out", `${fmt(f1, 0)} Hz`);
  setText("#beatF2Out", `${fmt(f2, 0)} Hz`);
  setText(
    "#beatReadout",
    fb === 0
      ? "f₁ = f₂ จึงไม่มีบีต เสียงดังสม่ำเสมอ"
      : `fᵦ = |${fmt(f1, 0)} - ${fmt(f2, 0)}| = ${fmt(fb, 0)} Hz | คาบบีต ≈ ${fmt(period, 2)} s | ${fb <= 7 ? "หูมนุษย์แยกจังหวะได้" : "จังหวะเร็วเกินกว่าจะแยกเป็นบีตชัด"}`,
  );
  updateBeatAudio();

  const padX = 42;
  const plotW = w - padX * 2;
  const midY = h * 0.56;
  const topY = h * 0.25;
  const amp = h * 0.18;
  const tWindow = 2.2;
  const carrierCycles = 22;

  label(ctx, "คลื่นสองแหล่งความถี่ใกล้กัน", w / 2, 28, "#5b6775");

  const wave1 = [];
  const wave2 = [];
  for (let px = padX; px <= padX + plotW; px += 2) {
    const x = (px - padX) / plotW;
    wave1.push([px, topY - 26 * Math.sin(TAU * (carrierCycles * x - now * 0.75))]);
    wave2.push([px, topY + 58 - 26 * Math.sin(TAU * ((carrierCycles + fb * 0.45) * x - now * 0.75))]);
  }
  line(ctx, wave1, "#2563eb", 2);
  line(ctx, wave2, "#e4572e", 2);
  label(ctx, `f₁ ${fmt(f1, 0)} Hz`, padX, topY - 48, "#2563eb", "left");
  label(ctx, `f₂ ${fmt(f2, 0)} Hz`, padX, topY + 28, "#e4572e", "left");

  const combined = [];
  const envTop = [];
  const envBottom = [];
  for (let px = padX; px <= padX + plotW; px += 2) {
    const x = (px - padX) / plotW;
    const t = x * tWindow + now * 0.2;
    const envelope = fb === 0 ? 1 : Math.cos(Math.PI * fb * t);
    const y = midY - amp * envelope * Math.sin(TAU * (carrierCycles * x - now * 1.35));
    const envAbs = Math.abs(envelope);
    combined.push([px, y]);
    envTop.push([px, midY - amp * envAbs]);
    envBottom.push([px, midY + amp * envAbs]);
  }
  ctx.fillStyle = "rgba(15,118,110,0.08)";
  ctx.beginPath();
  envTop.forEach(([x, y], index) => (index === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
  [...envBottom].reverse().forEach(([x, y]) => ctx.lineTo(x, y));
  ctx.closePath();
  ctx.fill();
  line(ctx, envTop, "rgba(15,118,110,0.45)", 2, [7, 5]);
  line(ctx, envBottom, "rgba(15,118,110,0.45)", 2, [7, 5]);
  line(ctx, combined, "#17212b", 2.5);
  label(ctx, "คลื่นรวม: ซองคลื่นทำให้ดัง-ค่อยเป็นจังหวะ", w / 2, h - 36, "#5b6775");
}

function drawDoppler(now) {
  const canvas = $("#dopplerCanvas");
  const fitted = fitCanvas(canvas);
  if (!fitted) return;
  const { ctx, width: w, height: h } = fitted;
  clear(ctx, w, h, "#ffffff");

  const f = number("#dopplerFreq");
  const vs = number("#sourceSpeed");
  const vl = number("#listenerSpeed");
  const rightFreq = f * ((SOUND_SPEED - vl) / (SOUND_SPEED - vs));
  const leftFreq = f * ((SOUND_SPEED + vl) / (SOUND_SPEED + vs));
  setText("#dopplerFreqOut", `${fmt(f, 0)} Hz`);
  setText("#sourceSpeedOut", `${fmt(vs, 0)} m/s`);
  setText("#listenerSpeedOut", `${fmt(vl, 0)} m/s`);
  setText(
    "#dopplerReadout",
    `ผู้ฟังขวา ≈ ${fmt(rightFreq, 0)} Hz | ผู้ฟังซ้าย ≈ ${fmt(leftFreq, 0)} Hz | v เสียง = ${SOUND_SPEED} m/s`,
  );

  const cx = w * 0.5;
  const cy = h * 0.52;
  const cScale = Math.min(w, h) * 0.18;
  const ratio = vs / SOUND_SPEED;
  const phase = (now * 0.8) % 1;

  ctx.fillStyle = "#f7f8fb";
  ctx.fillRect(0, 0, w, h);
  label(ctx, "ด้านซ้าย", 58, 32, "#5b6775", "left");
  label(ctx, "ด้านขวา", w - 58, 32, "#5b6775", "right");

  for (let i = 0; i < 12; i += 1) {
    const age = i * 0.42 + phase;
    const r = cScale * age;
    const x = cx - ratio * cScale * age;
    ctx.strokeStyle = `rgba(37,99,235,${Math.max(0.05, 0.42 - age * 0.045)})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, cy, r, 0, TAU);
    ctx.stroke();
  }

  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#d9e1ea";
  ctx.lineWidth = 2;
  [70, w - 70].forEach((x) => {
    ctx.beginPath();
    ctx.arc(x, cy, 19, 0, TAU);
    ctx.fill();
    ctx.stroke();
  });
  label(ctx, `${fmt(leftFreq, 0)} Hz`, 70, cy + 43, "#0f766e");
  label(ctx, `${fmt(rightFreq, 0)} Hz`, w - 70, cy + 43, "#e4572e");

  ctx.save();
  ctx.translate(cx, cy);
  if (vs < 0) ctx.scale(-1, 1);
  ctx.fillStyle = "#f2c94c";
  ctx.fillRect(-32, -16, 52, 32);
  ctx.fillStyle = "#17212b";
  ctx.beginPath();
  ctx.moveTo(34, 0);
  ctx.lineTo(14, -24);
  ctx.lineTo(14, 24);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  const arrowLength = Math.max(28, Math.abs(vs) * 0.7);
  const dir = vs >= 0 ? 1 : -1;
  line(ctx, [[cx - dir * 18, cy - 58], [cx + dir * arrowLength, cy - 58]], "#e4572e", 3);
  ctx.fillStyle = "#e4572e";
  ctx.beginPath();
  ctx.moveTo(cx + dir * (arrowLength + 12), cy - 58);
  ctx.lineTo(cx + dir * arrowLength, cy - 66);
  ctx.lineTo(cx + dir * arrowLength, cy - 50);
  ctx.closePath();
  ctx.fill();
  label(ctx, vs >= 0 ? "แหล่งกำเนิดเคลื่อนที่ไปทางขวา" : "แหล่งกำเนิดเคลื่อนที่ไปทางซ้าย", cx, h - 32, "#5b6775");
}

function drawShock(now) {
  const canvas = $("#shockCanvas");
  const fitted = fitCanvas(canvas);
  if (!fitted) return;
  const { ctx, width: w, height: h } = fitted;
  clear(ctx, w, h, "#ffffff");

  const mach = number("#machNumber");
  const v = number("#shockSoundSpeed");
  const vs = mach * v;
  const theta = Math.asin(1 / mach);
  const thetaDeg = (theta * 180) / Math.PI;
  setText("#machNumberOut", `M = ${fmt(mach, 2)}`);
  setText("#shockSoundSpeedOut", `${fmt(v, 0)} m/s`);
  setText(
    "#shockReadout",
    `vₛ = ${fmt(vs, 1)} m/s | θ = ${fmt(thetaDeg, 1)}° | sinθ = 1/M`,
  );

  const sx = w * 0.76;
  const sy = h * 0.52;
  const cScale = Math.min(w, h) * 0.12;
  const phase = (now * 0.45) % 1;

  ctx.fillStyle = "#f7f8fb";
  ctx.fillRect(0, 0, w, h);

  for (let i = 1; i <= 9; i += 1) {
    const age = i * 0.55 + phase;
    const x = sx - mach * cScale * age;
    const r = cScale * age;
    ctx.strokeStyle = `rgba(37,99,235,${Math.max(0.06, 0.38 - i * 0.025)})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, sy, r, 0, TAU);
    ctx.stroke();
  }

  const dx = w * 0.72;
  const dy = Math.min(h * 0.46, Math.tan(theta) * dx);
  line(ctx, [[sx, sy], [sx - dx, sy - dy]], "#e4572e", 4);
  line(ctx, [[sx, sy], [sx - dx, sy + dy]], "#e4572e", 4);
  ctx.fillStyle = "rgba(228,87,46,0.08)";
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(sx - dx, sy - dy);
  ctx.lineTo(sx - dx, sy + dy);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#17212b";
  ctx.beginPath();
  ctx.moveTo(sx + 36, sy);
  ctx.lineTo(sx - 24, sy - 19);
  ctx.lineTo(sx - 12, sy);
  ctx.lineTo(sx - 24, sy + 19);
  ctx.closePath();
  ctx.fill();
  label(ctx, "แนวการเคลื่อนที่ของแหล่งกำเนิด", sx - 170, sy - 28, "#5b6775");
  line(ctx, [[sx - 250, sy], [sx - 52, sy]], "#9aa8b5", 2, [8, 6]);
  pill(ctx, `θ ${fmt(thetaDeg, 1)}°`, sx - 95, sy + 32, "#e4572e");
  pill(ctx, "หน้าคลื่นกระแทก", sx - 210, sy - Math.min(115, dy * 0.55), "#0f766e");
}

const lessonState = {
  index: 0,
  started: false,
  sceneListReady: false,
  speaking: false,
  utterance: null,
};

const demoLabels = {
  tone: "โทนเสียงพื้นฐาน",
  standing: "เสียงคลื่นนิ่ง: ดัง-ค่อยตามตำแหน่ง",
  resonance: "เสียงสั่นพ้อง: ดังขึ้นเมื่อเข้าเงื่อนไข",
  beat: "เสียงบีต: ดัง-ค่อยตามเวลา",
  doppler: "ไซเรนดอปเพลอร์: สูงขึ้นแล้วต่ำลง",
  shock: "ซอนิกบูมจำลองแบบสั้น",
};

const demoTargets = {
  standing: "#standing",
  resonance: "#resonance",
  beat: "#beats",
  doppler: "#doppler",
  shock: "#shock",
};

const demoAudio = {
  ctx: null,
  nodes: [],
  timers: [],
};

function getLessonScenes() {
  return Array.isArray(window.lessonScenes) ? window.lessonScenes : [];
}

function clearElement(node) {
  if (node) node.innerHTML = "";
}

function setVisible(node, visible) {
  if (!node) return;
  node.classList.toggle("visible", Boolean(visible));
}

function setLessonStatus(message) {
  setText("#lessonStatus", message || "");
}

function initSceneList() {
  const list = $("#lessonSceneList");
  const scenes = getLessonScenes();
  if (!list || lessonState.sceneListReady || scenes.length === 0) return;

  scenes.forEach((scene, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.sceneIndex = String(index);
    button.innerHTML = `<strong>ช่วงที่ ${scene.slideNumber}</strong><span>${scene.title}</span>`;
    button.addEventListener("click", () => {
      lessonState.index = index;
      lessonState.started = true;
      renderGuidedLesson();
      if ($("#lessonAutoNarrate")?.checked) speakCurrentScene(true);
    });
    list.appendChild(button);
  });
  lessonState.sceneListReady = true;
}

function updateSceneListActive() {
  document.querySelectorAll("#lessonSceneList button").forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.sceneIndex) === lessonState.index);
  });
}

function renderFormula(scene) {
  const node = $("#lessonFormula");
  if (!node) return;
  if (!scene.formula || scene.formula.length === 0) {
    setVisible(node, false);
    node.innerHTML = "";
    return;
  }
  node.innerHTML = `<div class="formula-strip">${scene.formula.map((item) => `<span>${item}</span>`).join("")}</div>`;
  setVisible(node, true);
}

function renderVisual(scene) {
  const node = $("#lessonVisual");
  if (!node) return;
  const media = scene.media?.length ? scene.media : [];
  if (!scene.visual && media.length === 0) {
    setVisible(node, false);
    node.innerHTML = "";
    return;
  }
  if (scene.visual?.type === "image") {
    node.innerHTML = `
      <figure>
        <img src="${scene.visual.src}" alt="${scene.visual.caption || scene.title}" />
        <figcaption>${scene.visual.caption || ""}</figcaption>
      </figure>
    `;
    setVisible(node, true);
  } else if (media.length) {
    node.innerHTML = `
      <div class="guided-media-grid">
        ${media.slice(0, 3).map((src) => `<img src="${src}" alt="สื่อประกอบเรื่อง ${scene.title}" />`).join("")}
      </div>
    `;
    setVisible(node, true);
  }
}

function renderSoundDemo(scene) {
  const node = $("#lessonSoundDemo");
  if (!node) return;
  if (!scene.soundDemo) {
    setVisible(node, false);
    node.innerHTML = "";
    return;
  }
  const target = demoTargets[scene.soundDemo];
  node.innerHTML = `
    <p><strong>เสียงทดลอง:</strong> ${demoLabels[scene.soundDemo] || "เสียงทดลองประกอบฉาก"}</p>
    <button class="button primary" type="button" data-demo="${scene.soundDemo}">เล่นเสียงทดลอง</button>
    ${target ? `<a class="button ghost" href="${target}">เปิด simulator ที่เกี่ยวข้อง</a>` : ""}
  `;
  setVisible(node, true);
  node.querySelector("[data-demo]")?.addEventListener("click", () => playLessonDemo(scene.soundDemo));
}

function renderQuiz(scene) {
  const node = $("#lessonQuiz");
  if (!node) return;
  if (!scene.quiz) {
    setVisible(node, false);
    node.innerHTML = "";
    return;
  }
  node.innerHTML = `
    <strong>ลองตอบก่อนเลื่อนไปต่อ</strong>
    <p>${scene.quiz.prompt}</p>
    <div class="quiz-options">
      ${scene.quiz.options.map((option, index) => `<button type="button" data-answer="${index}">${option}</button>`).join("")}
    </div>
    <div class="quiz-feedback" aria-live="polite"></div>
  `;
  setVisible(node, true);
  const feedback = node.querySelector(".quiz-feedback");
  node.querySelectorAll("[data-answer]").forEach((button) => {
    button.addEventListener("click", () => {
      const picked = Number(button.dataset.answer);
      const correct = picked === scene.quiz.answer;
      node.querySelectorAll("[data-answer]").forEach((item) => {
        const answerIndex = Number(item.dataset.answer);
        item.classList.toggle("correct", answerIndex === scene.quiz.answer);
        item.classList.toggle("wrong", answerIndex === picked && !correct);
      });
      feedback.textContent = `${correct ? "ถูกต้อง" : "ยังไม่ถูก"}: ${scene.quiz.explanation}`;
    });
  });
}

function renderGuidedLesson() {
  const scenes = getLessonScenes();
  if (scenes.length === 0 || !$("#lessonSceneTitle")) return;
  initSceneList();

  lessonState.index = Math.min(Math.max(lessonState.index, 0), scenes.length - 1);
  const scene = scenes[lessonState.index];
  const progress = ((lessonState.index + 1) / scenes.length) * 100;

  setText("#lessonProgressText", `ช่วงที่ ${scene.slideNumber}/${scenes.length}`);
  const fill = $("#lessonProgressFill");
  if (fill) fill.style.width = `${progress}%`;
  setText("#lessonChapterPill", scene.chapterTitle);
  setText("#lessonPptxRef", `หัวข้อที่ ${scene.slideNumber}`);
  setText("#lessonSceneTitle", scene.title);
  setText("#lessonTeacherScript", scene.teacherScript);

  const keyIdea = $("#lessonKeyIdea");
  if (scene.keyIdea) {
    keyIdea.innerHTML = `<strong>ใจความสำคัญ</strong>${scene.keyIdea}`;
    setVisible(keyIdea, true);
  } else {
    setVisible(keyIdea, false);
    clearElement(keyIdea);
  }

  const example = $("#lessonExample");
  if (scene.example) {
    example.innerHTML = `<strong>ตัวอย่างคิดตาม</strong>${scene.example}`;
    setVisible(example, true);
  } else {
    setVisible(example, false);
    clearElement(example);
  }

  const experiment = $("#lessonExperiment");
  if (scene.experiment) {
    experiment.innerHTML = `<strong>กิจกรรมสั้น ๆ</strong>${scene.experiment}`;
    setVisible(experiment, true);
  } else {
    setVisible(experiment, false);
    clearElement(experiment);
  }

  renderFormula(scene);
  renderVisual(scene);
  renderSoundDemo(scene);
  renderQuiz(scene);
  updateSceneListActive();

  const prev = $("#lessonPrev");
  const next = $("#lessonNext");
  if (prev) prev.disabled = lessonState.index === 0;
  if (next) next.disabled = lessonState.index === scenes.length - 1;
}

function getThaiVoice() {
  if (!("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  return voices.find((voice) => voice.lang?.toLowerCase().startsWith("th")) || null;
}

function stopNarration() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  lessonState.speaking = false;
  lessonState.utterance = null;
}

function speakCurrentScene(auto = false) {
  const scenes = getLessonScenes();
  const scene = scenes[lessonState.index];
  if (!scene) return;
  if (!("speechSynthesis" in window)) {
    setLessonStatus("browser นี้ไม่รองรับเสียงบรรยาย Web Speech API แต่ยังอ่านสคริปต์บนหน้าได้");
    return;
  }
  if (auto && !lessonState.started) return;

  stopNarration();
  const text = `${scene.chapterTitle}. หัวข้อที่ ${scene.slideNumber}. ${scene.title}. ${scene.teacherScript}`;
  const utterance = new SpeechSynthesisUtterance(text);
  const thaiVoice = getThaiVoice();
  utterance.lang = "th-TH";
  utterance.rate = 0.92;
  utterance.pitch = 1;
  if (thaiVoice) utterance.voice = thaiVoice;
  utterance.onstart = () => {
    lessonState.speaking = true;
    setLessonStatus(thaiVoice ? "กำลังอ่านคำบรรยายภาษาไทย..." : "กำลังอ่านคำบรรยาย ถ้าเสียงไม่เป็นภาษาไทย ให้ติดตั้งเสียงไทยในระบบปฏิบัติการ");
  };
  utterance.onend = () => {
    lessonState.speaking = false;
    const autoNarrate = $("#lessonAutoNarrate")?.checked;
    const scenes = getLessonScenes();
    if (autoNarrate && lessonState.started && lessonState.index < scenes.length - 1) {
      goLesson(1);
    } else {
      setLessonStatus("");
    }
  };
  utterance.onerror = () => {
    lessonState.speaking = false;
    setLessonStatus("อ่านคำบรรยายไม่สำเร็จ ลองกดฟังอีกครั้งหลังเลือกเสียงไทยในระบบ");
  };
  lessonState.utterance = utterance;
  window.speechSynthesis.speak(utterance);
}

function ensureDemoContext() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  if (!demoAudio.ctx) demoAudio.ctx = new AudioContext();
  if (demoAudio.ctx.state === "suspended") demoAudio.ctx.resume();
  return demoAudio.ctx;
}

function stopDemoSound() {
  demoAudio.timers.forEach((timer) => clearTimeout(timer));
  demoAudio.timers = [];
  demoAudio.nodes.forEach((node) => {
    try {
      if (typeof node.stop === "function") node.stop();
      node.disconnect();
    } catch {
      // Some nodes may already be stopped; this is harmless.
    }
  });
  demoAudio.nodes = [];
}

function scheduleDemoStop(durationMs) {
  demoAudio.timers.push(setTimeout(stopDemoSound, durationMs));
}

function playOscDemo({ frequencies, duration = 1.2, type = "sine", gain = 0.035, ramp }) {
  const ctx = ensureDemoContext();
  if (!ctx) {
    setLessonStatus("browser นี้ไม่รองรับ Web Audio สำหรับเสียงทดลอง");
    return;
  }
  stopDemoSound();
  const output = ctx.createGain();
  output._demoRole = "output";
  output.gain.setValueAtTime(0.0001, ctx.currentTime);
  output.gain.linearRampToValueAtTime(gain, ctx.currentTime + 0.05);
  output.gain.setTargetAtTime(0.0001, ctx.currentTime + duration - 0.12, 0.04);
  output.connect(ctx.destination);
  demoAudio.nodes.push(output);

  frequencies.forEach((frequency) => {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    if (ramp) ramp(osc, ctx);
    osc.connect(output);
    osc.start();
    osc.stop(ctx.currentTime + duration);
    demoAudio.nodes.push(osc);
  });
  scheduleDemoStop(duration * 1000 + 180);
}

function playShockDemo() {
  const ctx = ensureDemoContext();
  if (!ctx) return;
  stopDemoSound();
  const duration = 0.32;
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    const decay = 1 - i / data.length;
    data[i] = (Math.random() * 2 - 1) * decay * decay;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
  noise.connect(gain);
  gain.connect(ctx.destination);
  noise.start();
  noise.stop(ctx.currentTime + duration);
  demoAudio.nodes.push(noise, gain);
  scheduleDemoStop(520);
}

function playLessonDemo(kind) {
  setLessonStatus(`กำลังเล่น${demoLabels[kind] || "เสียงทดลอง"}...`);
  if (kind === "beat") {
    playOscDemo({ frequencies: [392, 395], duration: 3.2, gain: 0.026 });
  } else if (kind === "doppler") {
    playOscDemo({
      frequencies: [520],
      duration: 3.0,
      type: "sawtooth",
      gain: 0.022,
      ramp: (osc, ctx) => {
        osc.frequency.linearRampToValueAtTime(760, ctx.currentTime + 1.15);
        osc.frequency.linearRampToValueAtTime(420, ctx.currentTime + 2.7);
      },
    });
  } else if (kind === "resonance") {
    playOscDemo({
      frequencies: [523],
      duration: 2.4,
      gain: 0.02,
      ramp: (osc, ctx) => {
        osc.frequency.setValueAtTime(523, ctx.currentTime);
      },
    });
    const ctx = demoAudio.ctx;
    const output = demoAudio.nodes.find((node) => node._demoRole === "output");
    if (ctx && output) {
      output.gain.linearRampToValueAtTime(0.075, ctx.currentTime + 0.9);
      output.gain.linearRampToValueAtTime(0.018, ctx.currentTime + 1.7);
    }
  } else if (kind === "shock") {
    playShockDemo();
  } else if (kind === "standing") {
    playOscDemo({ frequencies: [680], duration: 2.8, gain: 0.018 });
    const ctx = demoAudio.ctx;
    const output = demoAudio.nodes.find((node) => node._demoRole === "output");
    if (ctx && output) {
      [0.35, 0.75, 1.15, 1.55, 1.95, 2.35].forEach((time, index) => {
        output.gain.linearRampToValueAtTime(index % 2 === 0 ? 0.06 : 0.012, ctx.currentTime + time);
      });
    }
  } else {
    playOscDemo({ frequencies: [440], duration: 1.0, gain: 0.028 });
  }
}

function goLesson(delta) {
  const scenes = getLessonScenes();
  lessonState.index = Math.min(Math.max(lessonState.index + delta, 0), scenes.length - 1);
  lessonState.started = true;
  renderGuidedLesson();
  if ($("#lessonAutoNarrate")?.checked) speakCurrentScene(true);
}

function bindLessonPlayer() {
  if (!$("#lessonSceneTitle")) return;
  renderGuidedLesson();
  if ("speechSynthesis" in window) {
    window.speechSynthesis.onvoiceschanged = () => renderGuidedLesson();
  }
  $("#lessonStart")?.addEventListener("click", () => {
    lessonState.started = true;
    setLessonStatus("เริ่มบทเรียนแล้ว กดถัดไปเพื่อเรียนตามลำดับ หรือกดฟังคำบรรยายได้เลย");
    $("#guided-lesson")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  $("#lessonPrev")?.addEventListener("click", () => goLesson(-1));
  $("#lessonNext")?.addEventListener("click", () => goLesson(1));
  $("#lessonNarrate")?.addEventListener("click", () => {
    lessonState.started = true;
    speakCurrentScene(false);
  });
  $("#lessonStopNarration")?.addEventListener("click", () => {
    stopNarration();
    stopDemoSound();
    setLessonStatus("หยุดเสียงแล้ว");
  });
  $("#lessonAutoNarrate")?.addEventListener("change", (event) => {
    if (event.target.checked && !lessonState.started) {
      event.target.checked = false;
      setLessonStatus("กดเริ่มเรียนหรือฟังคำบรรยายหนึ่งครั้งก่อน เพื่อเปิดการอ่านต่ออัตโนมัติ");
    }
  });
}

function bindControls() {
  [
    "#swFreq",
    "#swSpeed",
    "#swLength",
    "#tubeTemp",
    "#tubeFreq",
    "#tubeLength",
    "#beatF1",
    "#beatF2",
    "#dopplerFreq",
    "#sourceSpeed",
    "#listenerSpeed",
    "#machNumber",
    "#shockSoundSpeed",
  ].forEach((id) => {
    const input = $(id);
    if (input) input.addEventListener("input", updateBeatAudio);
  });

  const beatButton = $("#beatAudio");
  if (beatButton) {
    beatButton.addEventListener("click", () => {
      if (audioState.playing) stopBeatAudio();
      else startBeatAudio();
    });
  }

  bindLessonPlayer();
}

function tick(nowMs) {
  const now = nowMs / 1000;
  drawHero(now);
  drawStanding(now);
  drawTube(now);
  drawBeats(now);
  drawDoppler(now);
  drawShock(now);
  requestAnimationFrame(tick);
}

bindControls();
requestAnimationFrame(tick);
