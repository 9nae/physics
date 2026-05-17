"use strict";

const MAIN_SCALE_MM = 1;
const MIN_MM = 0;
const SOURCE_WORLD_WIDTH = 1500;
const SOURCE_X_OFFSET = 30;
const SOURCE_Y_OFFSET = 40;
const SOURCE_SCALE_ORIGIN_X = 67;
const SOURCE_SCALE_ORIGIN_Y = 162;
const SOURCE_OFFSET_ORIGIN_X = 12;
const SOURCE_RULER_WIDTH = 915;
const SOURCE_RULER_MID_Y = 135;
const SOURCE_MAIN_SCALE_LENGTH = 600;
const SOURCE_GAUGE_HEIGHT = 357;
const SOURCE_VERNIER_SCALE_HEIGHT = 354;
const DEFAULT_MAIN_SCALE_MM = 150;
const DEFAULT_VERNIER_DIVISIONS = 50;
const VERNIER_NUMBER_LABELS = 10;
const SLIDER_DRAG_SENSITIVITY = 0.58;
const MICROMETER_WORLD_WIDTH = 1500;
const MICROMETER_SCALE_ORIGIN_X = 539;
const MICROMETER_SCALE_ORIGIN_Y = 100;
const MICROMETER_SPINDLE_ORIGIN_X = 200;
const MICROMETER_SPINDLE_ORIGIN_Y = 79;
const MICROMETER_THIMBLE_Y1 = 49;
const MICROMETER_THIMBLE_Y3 = 31;
const MICROMETER_THIMBLE_X2 = 40;
const MICROMETER_THIMBLE_X3 = 440;
const MICROMETER_MAIN_SCALE_LENGTH = 200;
const MICROMETER_MSD_VALUE = 0.5;
const MICROMETER_DEFAULT_CSD = 50;
const MICROMETER_DEFAULT_MSD_COUNT = 30;

const canvas = document.querySelector("#caliperCanvas");
const ctx = canvas.getContext("2d");
const range = document.querySelector("#measurementRange");
const decreaseBtn = document.querySelector("#decreaseBtn");
const increaseBtn = document.querySelector("#increaseBtn");
const openingOutput = document.querySelector("#openingOutput");
const mainScaleRange = document.querySelector("#mainScaleRange");
const mainScaleCountValue = document.querySelector("#mainScaleCountValue");
const vernierDivisionRange = document.querySelector("#vernierDivisionRange");
const vernierDivisionValue = document.querySelector("#vernierDivisionValue");
const secondaryScaleLabel = document.querySelector("#secondaryScaleLabel");
const leastCountValue = document.querySelector("#leastCountValue");
const zeroErrorRange = document.querySelector("#zeroErrorRange");
const zeroErrorValue = document.querySelector("#zeroErrorValue");
const correctedValue = document.querySelector("#correctedValue");
const readingValue = document.querySelector("#readingValue");
const readingCmValue = document.querySelector("#readingCmValue");
const mainScaleValue = document.querySelector("#mainScaleValue");
const vernierLineValue = document.querySelector("#vernierLineValue");
const vernierAddValue = document.querySelector("#vernierAddValue");
const formulaText = document.querySelector("#formulaText");
const drawSubDivisionsInput = document.querySelector("#drawSubDivisionsInput");
const newProblemBtn = document.querySelector("#newProblemBtn");
const revealBtn = document.querySelector("#revealBtn");
const problemValue = document.querySelector("#problemValue");
const problemStatus = document.querySelector("#problemStatus");
const valuesToggleBtn = document.querySelector("#valuesToggleBtn");
const settingsToggleBtn = document.querySelector("#settingsToggleBtn");
const guiPanel = document.querySelector(".gui-panel");
const guiTitle = document.querySelector(".gui-header h1");
const instrumentTabs = [...document.querySelectorAll(".instrument-tab")];
const infoButton = document.querySelector("#infoButton");
const closeInfoButton = document.querySelector("#closeInfoButton");
const infoOverlay = document.querySelector("#infoOverlay");

const sourceImagePaths = {
  blade: "assets/source/blade.png",
  base: "assets/source/vernier_base.png",
  vernier1: "assets/source/vernier1.png",
  vernier2: "assets/source/vernier2.png",
  vernier3: "assets/source/vernier3.png"
};

const sourceImages = Object.fromEntries(
  Object.entries(sourceImagePaths).map(([name, src]) => {
    const image = new Image();
    image.src = src;
    image.addEventListener("load", draw);
    return [name, image];
  })
);

const micrometerImagePaths = {
  base: "assets/source/micrometer_base.png",
  spindle: "assets/source/spindle.png",
  thimble: "assets/source/thimble.png",
  texture: "assets/source/texture9.png"
};

const micrometerImages = Object.fromEntries(
  Object.entries(micrometerImagePaths).map(([name, src]) => {
    const image = new Image();
    image.src = src;
    image.addEventListener("load", draw);
    return [name, image];
  })
);

const state = {
  instrument: "vernier",
  mode: "free",
  mainScaleDivisions: DEFAULT_MAIN_SCALE_MM,
  vernierDivisions: DEFAULT_VERNIER_DIVISIONS,
  zeroErrorDivisions: 0,
  drawSubDivisions: false,
  opening: 12.34,
  dragging: null,
  lastPointerWorld: null,
  lastPointerScreen: null,
  sliderStartOpening: 0,
  sliderStartWorldX: 0,
  sourceWorldX: SOURCE_X_OFFSET,
  sourceWorldY: SOURCE_Y_OFFSET,
  problem: null,
  revealed: false,
  valuesVisible: false,
  metrics: null
};

const micrometer = {
  mainScaleDivisions: MICROMETER_DEFAULT_MSD_COUNT,
  circularDivisions: MICROMETER_DEFAULT_CSD,
  zeroErrorDivisions: 0,
  opening: 5,
  worldX: 0,
  worldY: 0,
  dragging: null,
  lastPointerWorld: null,
  lastPointerScreen: null,
  dragRemainder: 0,
  object: null,
  revealed: false,
  texturePattern: null,
  gradient: null,
  metrics: null
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getLeastCount() {
  return MAIN_SCALE_MM / state.vernierDivisions;
}

function getMaxOpening() {
  return state.mainScaleDivisions * MAIN_SCALE_MM;
}

function getMsdPixels() {
  return SOURCE_MAIN_SCALE_LENGTH / state.mainScaleDivisions;
}

function getVsdPixels() {
  return getMsdPixels() * (1 - 1 / state.vernierDivisions);
}

function getVernierScaleLengthPixels() {
  if (!sourceImagesReady()) return 0;

  return Math.max(
    sourceImages.vernier1.naturalWidth + sourceImages.vernier3.naturalWidth,
    50 + getVsdPixels() * state.vernierDivisions + 50
  );
}

function getZeroErrorMm() {
  return (state.zeroErrorDivisions / state.vernierDivisions) * MAIN_SCALE_MM;
}

function snap(value) {
  const leastCount = getLeastCount();
  return Number((Math.round(value / leastCount) * leastCount).toFixed(4));
}

function formatMm(value) {
  const precision = state.vernierDivisions % 3 === 0 || state.vernierDivisions % 7 === 0 ? 3 : 2;
  return `${value.toFixed(precision)} mm`;
}

function formatCm(valueMm) {
  return `${(valueMm / 10).toFixed(2)} cm`;
}

function getVernierLabelStep() {
  return Math.max(1, state.vernierDivisions / VERNIER_NUMBER_LABELS);
}

function sourceImagesReady() {
  return Object.values(sourceImages).every((image) => image.complete && image.naturalWidth > 0);
}

function micrometerImagesReady() {
  return Object.values(micrometerImages).every((image) => image.complete && image.naturalWidth > 0);
}

function drawLine(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function getMicrometerLeastCount() {
  return MICROMETER_MSD_VALUE / micrometer.circularDivisions;
}

function getMicrometerMsdPixels() {
  return MICROMETER_MAIN_SCALE_LENGTH / micrometer.mainScaleDivisions;
}

function getMicrometerMaxOpening() {
  return micrometer.mainScaleDivisions * MICROMETER_MSD_VALUE;
}

function getMicrometerZeroErrorMm() {
  return (micrometer.zeroErrorDivisions / micrometer.circularDivisions) * MICROMETER_MSD_VALUE;
}

function snapMicrometer(value) {
  const leastCount = getMicrometerLeastCount();
  return Number((Math.round(value / leastCount) * leastCount).toFixed(4));
}

function formatMicrometer(value) {
  return `${value.toFixed(2)} mm`;
}

function getMicrometerParts(value) {
  const rounded = snapMicrometer(clamp(value, 0, getMicrometerMaxOpening()));
  let main = Math.floor(rounded / MICROMETER_MSD_VALUE) * MICROMETER_MSD_VALUE;
  let circularLine = Math.round((rounded - main) / getMicrometerLeastCount());

  if (circularLine >= micrometer.circularDivisions) {
    main += MICROMETER_MSD_VALUE;
    circularLine = 0;
  }

  const circularAdd = Number((circularLine * getMicrometerLeastCount()).toFixed(4));
  const total = Number((main + circularAdd).toFixed(4));
  return { rounded, main, circularLine, circularAdd, total };
}

function constrainMicrometerOpening(value) {
  if (micrometer.object?.state === 2 && value < micrometer.object.value) {
    return micrometer.object.value;
  }

  return value;
}

function setMicrometerOpening(value) {
  const next = constrainMicrometerOpening(value);
  micrometer.opening = snapMicrometer(clamp(next, 0, getMicrometerMaxOpening()));
  range.value = micrometer.opening.toFixed(4);
  update();
}

function rotateMicrometer(divisions) {
  setMicrometerOpening(micrometer.opening + divisions * getMicrometerLeastCount());
}

function getMicrometerShift() {
  return (micrometer.opening / MICROMETER_MSD_VALUE) * getMicrometerMsdPixels();
}

function createMicrometerProblem() {
  const msdPixels = getMicrometerMsdPixels();
  const width = MICROMETER_MAIN_SCALE_LENGTH * (1 + 5 * Math.random()) / 10;
  micrometer.object = {
    x: 20,
    y: 20,
    w: width,
    h: 100,
    state: 1,
    value: snapMicrometer((width / msdPixels) * MICROMETER_MSD_VALUE)
  };
  micrometer.revealed = false;
  update();
}

function snapMicrometerObject() {
  const object = micrometer.object;
  if (!object) return;

  if (
    Math.abs(object.x - MICROMETER_SPINDLE_ORIGIN_X) < 200 &&
    Math.abs(object.y - MICROMETER_SCALE_ORIGIN_Y + object.h / 2) < object.h / 2 + 50
  ) {
    object.x = MICROMETER_SPINDLE_ORIGIN_X;
    object.y = MICROMETER_SCALE_ORIGIN_Y - object.h / 2;
    object.state = 2;
    object.value = snapMicrometer((object.w / getMicrometerMsdPixels()) * MICROMETER_MSD_VALUE);
    setMicrometerOpening(Math.max(micrometer.opening, object.value));
    return;
  }

  object.state = 1;
  update();
}

function getMicrometerMetrics(width) {
  const scale = width / MICROMETER_WORLD_WIDTH;
  return {
    scale,
    sourceX: micrometer.worldX * scale,
    sourceY: micrometer.worldY * scale,
    msdPixels: getMicrometerMsdPixels(),
    shift: getMicrometerShift()
  };
}

function pointerToMicrometerWorld(event) {
  const rect = canvas.getBoundingClientRect();
  const metrics = micrometer.metrics;
  return {
    x: (event.clientX - rect.left - metrics.sourceX) / metrics.scale,
    y: (event.clientY - rect.top - metrics.sourceY) / metrics.scale
  };
}

function isOverMicrometerObject(event) {
  const object = micrometer.object;
  if (!object || !micrometer.metrics) return false;

  const point = pointerToMicrometerWorld(event);
  return (
    point.x > object.x &&
    point.x < object.x + object.w &&
    point.y > object.y &&
    point.y < object.y + object.h
  );
}

function isNearMicrometerThimble(event) {
  if (!micrometer.metrics) return false;

  const point = pointerToMicrometerWorld(event);
  const shift = getMicrometerShift();
  return (
    point.x > MICROMETER_SCALE_ORIGIN_X + shift + MICROMETER_THIMBLE_X2 &&
    point.x < MICROMETER_SCALE_ORIGIN_X + shift + MICROMETER_THIMBLE_X3 &&
    point.y > MICROMETER_THIMBLE_Y3 &&
    point.y < MICROMETER_THIMBLE_Y3 + 2 * (MICROMETER_SCALE_ORIGIN_Y - MICROMETER_THIMBLE_Y3)
  );
}

function micrometerPointerDown(event) {
  if (!micrometer.metrics) return;

  canvas.setPointerCapture(event.pointerId);

  if (isOverMicrometerObject(event)) {
    micrometer.dragging = "object";
    if (micrometer.object) micrometer.object.state = 1;
    micrometer.lastPointerWorld = pointerToMicrometerWorld(event);
    return;
  }

  if (isNearMicrometerThimble(event)) {
    micrometer.dragging = "thimble";
    micrometer.lastPointerWorld = pointerToMicrometerWorld(event);
    micrometer.dragRemainder = 0;
    return;
  }

  micrometer.dragging = "world";
  micrometer.lastPointerScreen = pointerToScreen(event);
}

function micrometerPointerMove(event) {
  if (!micrometer.dragging) return;

  if (micrometer.dragging === "object") {
    const point = pointerToMicrometerWorld(event);
    const object = micrometer.object;

    if (object && micrometer.lastPointerWorld) {
      object.x += point.x - micrometer.lastPointerWorld.x;
      object.y += point.y - micrometer.lastPointerWorld.y;
      micrometer.lastPointerWorld = point;
      draw();
    }
    return;
  }

  if (micrometer.dragging === "world") {
    const point = pointerToScreen(event);

    if (micrometer.lastPointerScreen && micrometer.metrics?.scale) {
      micrometer.worldX += (point.x - micrometer.lastPointerScreen.x) / micrometer.metrics.scale;
      micrometer.worldY += (point.y - micrometer.lastPointerScreen.y) / micrometer.metrics.scale;
      micrometer.lastPointerScreen = point;
      draw();
    }
    return;
  }

  if (micrometer.dragging === "thimble") {
    const point = pointerToMicrometerWorld(event);

    if (micrometer.lastPointerWorld) {
      micrometer.dragRemainder += (point.y - micrometer.lastPointerWorld.y) * 0.45;
      const divisions = Math.trunc(micrometer.dragRemainder);

      if (divisions !== 0) {
        rotateMicrometer(divisions);
        micrometer.dragRemainder -= divisions;
      }
      micrometer.lastPointerWorld = point;
    }
  }
}

function micrometerPointerUp(event) {
  if (micrometer.dragging === "object") {
    snapMicrometerObject();
  }

  micrometer.dragging = null;
  micrometer.lastPointerWorld = null;
  micrometer.lastPointerScreen = null;
  micrometer.dragRemainder = 0;

  if (canvas.hasPointerCapture(event.pointerId)) {
    canvas.releasePointerCapture(event.pointerId);
  }
}

function buildSourceObjectPath(object) {
  const path = new Path2D();
  path.moveTo(0, 0);
  path.lineTo(2 * object.R2, 0);
  path.lineTo(2 * object.R2, object.h2);
  path.lineTo(object.R1 + object.R2, object.h2);
  path.lineTo(object.R2 + object.R1, object.h2 - object.h1);
  path.lineTo(object.R2 - object.R1, object.h2 - object.h1);
  path.lineTo(object.R2 - object.R1, object.h2);
  path.lineTo(0, object.h2);
  path.closePath();
  return path;
}

function createSourceObject() {
  const object = {
    R2: (0.3 + 0.7 * Math.random()) * SOURCE_MAIN_SCALE_LENGTH / 4,
    R1: 0,
    h2: (0.4 + 0.6 * Math.random()) * SOURCE_MAIN_SCALE_LENGTH / 5,
    h1: 0,
    w: 0,
    h: 0,
    length: 0,
    th: 0,
    x: 0,
    y: 0,
    path: null
  };

  object.R1 = (0.7 + 0.2 * Math.random()) * object.R2;
  object.h1 = (0.7 + 0.2 * Math.random()) * object.h2;
  object.w = 2 * object.R2;
  object.h = object.h2;
  object.length = 2 * object.R2;
  object.path = buildSourceObjectPath(object);
  return object;
}

function snapSourceObjectToMode(object, mode) {
  if (mode === "internal") {
    object.w = 2 * object.R2;
    object.h = object.h2;
    object.th = 0;
    object.x = 32 - object.R2 + object.R1;
    object.y = 3 - object.h2 + object.h1;
    object.length = 2 * object.R1;
    return object;
  }

  if (mode === "depth") {
    object.th = Math.PI / 2;
    object.w = -object.h2;
    object.h = 2 * object.R2;
    object.x = SOURCE_RULER_WIDTH - object.w;
    object.y = SOURCE_RULER_MID_Y - object.R2;
    object.length = object.h1;
    return object;
  }

  object.w = 2 * object.R2;
  object.h = object.h2;
  object.th = 0;
  object.x = SOURCE_SCALE_ORIGIN_X;
  object.y = SOURCE_GAUGE_HEIGHT - 50 - object.h / 2;
  object.length = 2 * object.R2;
  return object;
}

function applySourceProblemMode(mode) {
  if (!state.problem?.object) return;

  state.mode = mode;
  snapSourceObjectToMode(state.problem.object, mode);
  state.problem.mode = mode;
  state.problem.snapped = true;
  state.problem.value = snap(state.problem.object.length / getMsdPixels());
  setOpening(constrainOpeningForObject(state.opening));
}

function getReadingParts(value) {
  const leastCount = getLeastCount();
  const rounded = snap(clamp(value, MIN_MM, getMaxOpening()));
  let main = Math.floor(rounded / MAIN_SCALE_MM) * MAIN_SCALE_MM;
  let vernierLine = Math.round((rounded - main) / leastCount);

  if (vernierLine >= state.vernierDivisions) {
    main += MAIN_SCALE_MM;
    vernierLine = 0;
  }

  const vernierAdd = Number((vernierLine * leastCount).toFixed(4));
  const total = Number((main + vernierAdd).toFixed(4));

  return { rounded, main, vernierLine, vernierAdd, total };
}

function constrainOpeningForObject(value) {
  const snappedObject = state.problem?.snapped ? state.problem : null;
  if (!snappedObject) return value;

  if (snappedObject.mode === "external" && value < snappedObject.value) {
    return snappedObject.value;
  }

  if (snappedObject.mode !== "external" && value > snappedObject.value) {
    return snappedObject.value;
  }

  return value;
}

function setOpening(value) {
  const constrained = constrainOpeningForObject(value);
  state.opening = snap(clamp(constrained, MIN_MM, getMaxOpening()));
  range.value = state.opening.toFixed(4);
  update();
}

function translateVernier(divisions) {
  setOpening(state.opening + divisions * getLeastCount());
}

function showInfo() {
  infoOverlay.hidden = false;
}

function hideInfo() {
  infoOverlay.hidden = true;
}

function switchInstrument(instrument) {
  state.instrument = instrument;
  instrumentTabs.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.instrument === instrument);
  });
  state.dragging = null;
  micrometer.dragging = null;
  update();
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  draw();
}

function clearCanvas(width, height) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "rgb(0,64,84)";
  ctx.fillRect(0, 0, width, height);
}

function roundedRect(x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function drawLabel(text, x, y, options = {}) {
  ctx.save();
  ctx.fillStyle = options.color || "#15202b";
  ctx.font = options.font || "700 14px Tahoma, Arial, sans-serif";
  ctx.textAlign = options.align || "center";
  ctx.textBaseline = options.baseline || "middle";
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawSourceImage(image, metrics, x, y, sw = image.naturalWidth, sh = image.naturalHeight, sx = 0, sy = 0) {
  const scale = metrics.sourceScale;
  ctx.drawImage(
    image,
    sx,
    sy,
    sw,
    sh,
    metrics.sourceX + x * scale,
    metrics.sourceY + y * scale,
    sw * scale,
    sh * scale
  );
}

function drawSourceCaliper(metrics) {
  if (!sourceImagesReady()) return false;

  const shift = state.opening * metrics.msdPixels;
  const vernierScaleLengthPixels = getVernierScaleLengthPixels();
  const vernierMiddleWidth =
    vernierScaleLengthPixels -
    sourceImages.vernier1.naturalWidth -
    sourceImages.vernier3.naturalWidth;

  ctx.save();
  drawSourceImage(sourceImages.blade, metrics, 915 + shift - sourceImages.blade.naturalWidth, 124);
  drawSourceImage(sourceImages.base, metrics, 0, 0);
  drawSourceImage(sourceImages.vernier1, metrics, shift, 1);

  ctx.drawImage(
    sourceImages.vernier2,
    0,
    0,
    sourceImages.vernier2.naturalWidth,
    sourceImages.vernier2.naturalHeight,
    metrics.sourceX + (shift + sourceImages.vernier1.naturalWidth) * metrics.sourceScale,
    metrics.sourceY + metrics.sourceScale,
    vernierMiddleWidth * metrics.sourceScale,
    sourceImages.vernier2.naturalHeight * metrics.sourceScale
  );

  drawSourceImage(
    sourceImages.vernier3,
    metrics,
    shift + sourceImages.vernier1.naturalWidth + vernierMiddleWidth,
    1
  );

  ctx.drawImage(
    sourceImages.base,
    0,
    0,
    64,
    102,
    metrics.sourceX,
    metrics.sourceY,
    64 * metrics.sourceScale,
    102 * metrics.sourceScale
  );
  ctx.restore();
  return true;
}

function drawMainScale(metrics) {
  const { originX, scaleY, scaleWidth, pxPerMm } = metrics;
  const top = scaleY;
  const height = 74;
  const labelEvery = pxPerMm < 3.2 ? 20 : 10;

  ctx.save();

  if (metrics.usesSourceImages) {
    const tickBaseY = scaleY;
    const sourceLabelEvery = 10;
    const zeroOffset = -(state.zeroErrorDivisions / state.vernierDivisions) * pxPerMm;

    ctx.strokeStyle = "#000";
    ctx.fillStyle = "#000";
    ctx.lineWidth = Math.max(1, 1.5 * metrics.sourceScale);

    for (let mm = 0; mm <= state.mainScaleDivisions; mm += 1) {
      const x = originX + zeroOffset + mm * pxPerMm;
      const isCm = mm % 10 === 0;
      const isHalfCm = mm % 5 === 0;
      const tick = (isCm ? 22 : isHalfCm ? 18 : 13) * metrics.sourceScale;

      ctx.beginPath();
      ctx.moveTo(x, tickBaseY);
      ctx.lineTo(x, tickBaseY - tick);
      ctx.stroke();

      if (mm % sourceLabelEvery === 0) {
        drawLabel(String(mm / 10), x, tickBaseY - tick - 8 * metrics.sourceScale, {
          color: "#000",
          font: `${metrics.sourceScale < 0.46 ? "700 9px" : "700 11px"} Arial, Tahoma, sans-serif`
        });
      }
    }

    drawLabel("cm", originX + state.mainScaleDivisions * pxPerMm + 12 * metrics.sourceScale, tickBaseY - 32 * metrics.sourceScale, {
      align: "left",
      color: "#000",
      font: `${metrics.sourceScale < 0.46 ? "700 9px" : "700 11px"} Arial, Tahoma, sans-serif`
    });

    if (state.drawSubDivisions) {
      const parts = getReadingParts(state.opening + getZeroErrorMm());
      const dx = pxPerMm / state.vernierDivisions;
      let x = originX + zeroOffset + parts.main * pxPerMm;
      const tick = 9 * metrics.sourceScale;

      ctx.lineWidth = Math.max(0.5, metrics.sourceScale);
      for (let i = 0; i <= state.vernierDivisions; i += 1) {
        ctx.beginPath();
        ctx.moveTo(x, tickBaseY);
        ctx.lineTo(x, tickBaseY - tick);
        ctx.stroke();
        x += dx;
      }
    }

    ctx.restore();
    return;
  }

  ctx.fillStyle = "#f5f8f9";
  ctx.strokeStyle = "#8fa2ad";
  ctx.lineWidth = 1.4;
  roundedRect(originX - 12, top, scaleWidth + 28, height, 5);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "#263747";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(originX, top + 44);
  ctx.lineTo(originX + scaleWidth, top + 44);
  ctx.stroke();

  for (let mm = 0; mm <= getMaxOpening() + state.vernierDivisions; mm += 1) {
    const x = originX + mm * pxPerMm;
    const isTen = mm % 10 === 0;
    const isFive = mm % 5 === 0;
    const tick = isTen ? 34 : isFive ? 25 : 15;

    ctx.strokeStyle = isTen ? "#15202b" : "#617080";
    ctx.lineWidth = isTen ? 1.5 : 1;
    ctx.beginPath();
    ctx.moveTo(x, top + 44);
    ctx.lineTo(x, top + 44 - tick);
    ctx.stroke();

    if (mm % labelEvery === 0) {
      drawLabel(String(mm), x, top + 14, {
        color: "#15202b",
        font: `${pxPerMm < 3.2 ? "700 11px" : "700 13px"} Tahoma, Arial, sans-serif`
      });
    }
  }

  drawLabel("สเกลหลัก (mm)", originX + 80, top + 62, {
    align: "left",
    color: "#617080",
    font: "700 13px Tahoma, Arial, sans-serif"
  });
  ctx.restore();
}

function drawFixedJaw(metrics) {
  const { originX, scaleY } = metrics;

  ctx.save();
  ctx.fillStyle = "#d7e1e6";
  ctx.strokeStyle = "#263747";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(originX - 12, scaleY + 16);
  ctx.lineTo(originX - 46, scaleY + 16);
  ctx.lineTo(originX - 46, scaleY - 60);
  ctx.lineTo(originX - 20, scaleY - 60);
  ctx.lineTo(originX - 3, scaleY + 16);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(originX - 8, scaleY + 72);
  ctx.lineTo(originX - 58, scaleY + 198);
  ctx.lineTo(originX - 24, scaleY + 198);
  ctx.lineTo(originX + 12, scaleY + 72);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

function drawSlidingJaw(metrics, parts) {
  const { sliderX, scaleY, pxPerMm } = metrics;
  const vernierY = metrics.usesSourceImages ? scaleY - 2 * metrics.sourceScale : scaleY + 78;
  const vernierWidth = metrics.usesSourceImages
    ? metrics.vsdPixels * state.vernierDivisions
    : (state.vernierDivisions - 1) * pxPerMm;

  ctx.save();

  if (metrics.usesSourceImages) {
    const labelStep = getVernierLabelStep();

    ctx.strokeStyle = "#8fa2ad";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sliderX, vernierY);
    ctx.lineTo(sliderX + vernierWidth, vernierY);
    ctx.stroke();

    for (let i = 0; i <= state.vernierDivisions; i += 1) {
      const x = sliderX + i * metrics.vsdPixels;
      const isTen = i % labelStep === 0;
      const isFive = i % 5 === 0;
      const tick = (isTen ? 18 : isFive ? 14 : 9) * metrics.sourceScale;
      const active = i === parts.vernierLine;

      ctx.strokeStyle = active ? "#d99400" : isTen ? "#15202b" : "#617080";
      ctx.lineWidth = active ? 2.2 : isTen ? 1.4 : 1;
      ctx.beginPath();
      ctx.moveTo(x, vernierY);
      ctx.lineTo(x, vernierY + tick);
      ctx.stroke();

      if (active && state.valuesVisible) {
        ctx.fillStyle = "rgba(217, 148, 0, 0.18)";
        ctx.fillRect(x - 3, vernierY - 4, 6, 28 * metrics.sourceScale);
      }

      if (isTen && metrics.sourceScale > 0.35) {
        drawLabel(String(Math.round(i / labelStep)), x, vernierY + tick + 10, {
          color: active ? "#9a6700" : "#15202b",
          font: "700 11px Tahoma, Arial, sans-serif"
        });
      }
    }

    ctx.restore();
    return;
  }

  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#263747";
  ctx.lineWidth = 2;

  roundedRect(sliderX - 7, scaleY + 8, vernierWidth + 18, 76, 5);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#bfd5df";
  ctx.beginPath();
  ctx.moveTo(sliderX + 4, scaleY + 16);
  ctx.lineTo(sliderX + 40, scaleY - 60);
  ctx.lineTo(sliderX + 66, scaleY - 60);
  ctx.lineTo(sliderX + 30, scaleY + 16);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(sliderX + 4, scaleY + 72);
  ctx.lineTo(sliderX + 48, scaleY + 198);
  ctx.lineTo(sliderX + 82, scaleY + 198);
  ctx.lineTo(sliderX + 30, scaleY + 72);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "#0f766e";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(sliderX, scaleY + 2);
  ctx.lineTo(sliderX, scaleY + 208);
  ctx.stroke();

  ctx.strokeStyle = "#8fa2ad";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(sliderX, vernierY + 34);
  ctx.lineTo(sliderX + vernierWidth, vernierY + 34);
  ctx.stroke();

  const labelStep = getVernierLabelStep();

  for (let i = 0; i <= state.vernierDivisions; i += 1) {
    const x = sliderX + (i / state.vernierDivisions) * vernierWidth;
    const isTen = i % labelStep === 0;
    const isFive = i % 5 === 0;
    const tick = isTen ? 32 : isFive ? 24 : 14;
    const active = i === parts.vernierLine;

    ctx.strokeStyle = active ? "#d99400" : isTen ? "#15202b" : "#617080";
    ctx.lineWidth = active ? 3 : isTen ? 1.5 : 1;
    ctx.beginPath();
    ctx.moveTo(x, vernierY + 34);
    ctx.lineTo(x, vernierY + 34 + tick);
    ctx.stroke();

    if (active) {
      ctx.fillStyle = "rgba(217, 148, 0, 0.16)";
      ctx.fillRect(x - 3, vernierY + 2, 6, 68);
    }

    if (isTen) {
      drawLabel(String(Math.round(i / labelStep)), x, vernierY + 74, {
        color: active ? "#9a6700" : "#15202b",
        font: "700 12px Tahoma, Arial, sans-serif"
      });
    }
  }

  drawLabel("สเกลเวอร์เนียร์", sliderX + 82, vernierY + 14, {
    align: "left",
    color: "#617080",
    font: "700 13px Tahoma, Arial, sans-serif"
  });

  ctx.restore();
}

function drawDepthBlade(metrics) {
  if (metrics.usesSourceImages) return;

  const { sliderX, scaleY, pxPerMm } = metrics;
  const bladeLength = Math.max(22, state.opening * pxPerMm);

  ctx.save();
  ctx.fillStyle = "#c6d4dc";
  ctx.strokeStyle = "#263747";
  ctx.lineWidth = 1.4;
  roundedRect(sliderX - bladeLength, scaleY + 160, bladeLength, 12, 3);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawSourceObject(metrics) {
  const object = state.problem?.object;
  if (!object) return;

  ctx.save();
  ctx.translate(metrics.sourceX, metrics.sourceY);
  ctx.scale(metrics.sourceScale, metrics.sourceScale);
  ctx.fillStyle = "rgb(130,190,140)";
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 1.5;
  ctx.translate(object.x, object.y);
  ctx.rotate(object.th);
  ctx.fill(object.path);
  ctx.stroke(object.path);
  ctx.restore();
}

function drawObject(metrics) {
  if (metrics.usesSourceImages) {
    drawSourceObject(metrics);
    return;
  }

  if (!state.problem) {
    drawNeutralObject(metrics);
    return;
  }

  const { originX, scaleY, pxPerMm } = metrics;
  const targetPx = state.problem.value * pxPerMm;

  ctx.save();
  if (state.mode === "external") {
    const h = 54;
    const y = scaleY + 178;
    const x = originX;
    ctx.fillStyle = "#f5c56b";
    ctx.strokeStyle = "#805c12";
    ctx.lineWidth = 2;
    roundedRect(x, y - h, targetPx, h, 5);
    ctx.fill();
    ctx.stroke();
    if (targetPx > 84) {
      drawLabel("ชิ้นงาน", x + targetPx / 2, y - h / 2, {
        color: "#5a3e04",
        font: "700 14px Tahoma, Arial, sans-serif"
      });
    }
  }

  if (state.mode === "internal") {
    const y = scaleY - 88;
    const wall = 15;
    const h = 64;
    const outer = targetPx + wall * 2;
    const x = originX - wall;
    ctx.fillStyle = "#cce6ef";
    ctx.strokeStyle = "#246a82";
    ctx.lineWidth = 2;
    roundedRect(x, y, outer, h, 5);
    ctx.fill();
    ctx.stroke();
    ctx.clearRect(x + wall, y + 10, targetPx, h - 20);
    ctx.strokeRect(x + wall, y + 10, targetPx, h - 20);
    if (targetPx > 84) {
      drawLabel("ช่องใน", x + outer / 2, y + h / 2, {
        color: "#246a82",
        font: "700 14px Tahoma, Arial, sans-serif"
      });
    }
  }

  if (state.mode === "depth") {
    const x = originX - 22;
    const y = scaleY + 166;
    const w = 64;
    const h = Math.max(targetPx, 34);
    const insetY = Math.min(10, h * 0.22);
    const innerH = Math.max(6, h - insetY * 2);
    ctx.fillStyle = "#dce8ed";
    ctx.strokeStyle = "#31566b";
    ctx.lineWidth = 2;
    roundedRect(x, y, w, h, 5);
    ctx.fill();
    ctx.stroke();
    ctx.clearRect(x + 12, y + insetY, w - 24, innerH);
    ctx.strokeRect(x + 12, y + insetY, w - 24, innerH);
    drawLabel("หลุม", x + w / 2, y + 26, {
      color: "#31566b",
      font: "700 14px Tahoma, Arial, sans-serif"
    });
  }
  ctx.restore();
}

function drawNeutralObject(metrics) {
  const { originX, scaleY } = metrics;

  ctx.save();
  ctx.fillStyle = "rgba(20, 108, 148, 0.08)";
  ctx.strokeStyle = "rgba(20, 108, 148, 0.32)";
  ctx.lineWidth = 1.5;

  if (state.mode === "external") {
    roundedRect(originX + 18, scaleY + 124, 150, 42, 5);
  } else if (state.mode === "internal") {
    roundedRect(originX - 16, scaleY - 78, 190, 52, 5);
  } else {
    roundedRect(originX - 26, scaleY + 166, 68, 118, 5);
  }

  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawGuides(metrics, parts) {
  const { originX, sliderX, scaleY, pxPerMm } = metrics;
  const mainX = originX + parts.main * pxPerMm;
  const alignedX = metrics.usesSourceImages
    ? sliderX + parts.vernierLine * metrics.vsdPixels
    : sliderX + (parts.vernierLine / state.vernierDivisions) * (state.vernierDivisions - 1) * pxPerMm;

  ctx.save();
  ctx.setLineDash([6, 6]);
  ctx.strokeStyle = "rgba(217, 148, 0, 0.72)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(mainX, scaleY - 72);
  ctx.lineTo(mainX, scaleY + 168);
  ctx.stroke();

  ctx.strokeStyle = "rgba(15, 118, 110, 0.6)";
  ctx.beginPath();
  ctx.moveTo(alignedX, scaleY - 72);
  ctx.lineTo(alignedX, scaleY + 176);
  ctx.stroke();
  ctx.restore();
}

function drawModeNote(width, metrics, parts) {
  const { scaleY } = metrics;
  const names = {
    external: "วัดนอก",
    internal: "วัดใน",
    depth: "วัดลึก"
  };

  ctx.save();

  if (metrics.usesSourceImages) {
    const x = metrics.sourceX + 844 * metrics.sourceScale;
    const y = metrics.sourceY + 137 * metrics.sourceScale;

    drawLabel(`${getLeastCount().toFixed(2)} mm`, x, y, {
      color: "#000",
      font: `${Math.max(11, 18 * metrics.sourceScale)}px Arial, Tahoma, sans-serif`
    });

    if (state.valuesVisible) {
      const modeName = names[state.mode];
      const displayText = modeName ? `${modeName}: ${formatMm(parts.total)}` : formatMm(parts.total);

      drawLabel(displayText, x, y + 22 * metrics.sourceScale, {
        color: "#000",
        font: `${Math.max(10, 15 * metrics.sourceScale)}px Arial, Tahoma, sans-serif`
      });
    }

    ctx.restore();
    return;
  }

  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#d7e1e6";
  ctx.lineWidth = 1;
  roundedRect(width - 236, 22, 210, 74, 7);
  ctx.fill();
  ctx.stroke();

  drawLabel(names[state.mode] || "พร้อมวัด", width - 216, 45, {
    align: "left",
    color: "#146c94",
    font: "800 17px Tahoma, Arial, sans-serif"
  });
  drawLabel(state.valuesVisible ? `${parts.total.toFixed(2)} mm` : "ซ่อนค่า", width - 216, 74, {
    align: "left",
    color: "#0f766e",
    font: "800 22px Tahoma, Arial, sans-serif"
  });

  drawLabel(`${getLeastCount().toFixed(2)} mm`, width / 2, scaleY + 236, {
    color: "#617080",
    font: "700 13px Tahoma, Arial, sans-serif"
  });
  ctx.restore();
}

function mod(value, divisor) {
  return ((value % divisor) + divisor) % divisor;
}

function drawMicrometer(width, height) {
  clearCanvas(width, height);

  if (!micrometerImagesReady()) {
    drawLabel("Loading micrometer ...", width / 2, height / 2, {
      color: "orange",
      font: "700 30px Arial, sans-serif"
    });
    return;
  }

  const metrics = getMicrometerMetrics(width);
  micrometer.metrics = metrics;
  const shift = metrics.shift;
  const msdPixels = metrics.msdPixels;
  const parts = getMicrometerParts(micrometer.opening);
  const circularWithZero = mod(parts.circularLine + micrometer.zeroErrorDivisions, micrometer.circularDivisions);

  ctx.save();
  ctx.translate(metrics.sourceX, metrics.sourceY);
  ctx.scale(metrics.scale, metrics.scale);
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "#000";
  ctx.fillStyle = "#000";

  ctx.drawImage(micrometerImages.spindle, MICROMETER_SPINDLE_ORIGIN_X + shift, MICROMETER_SPINDLE_ORIGIN_Y);
  ctx.drawImage(micrometerImages.base, 0, 0);

  ctx.save();
  ctx.translate(MICROMETER_SCALE_ORIGIN_X, MICROMETER_SCALE_ORIGIN_Y);
  ctx.font = "12pt Arial, sans-serif";
  let x = -msdPixels * micrometer.zeroErrorDivisions / micrometer.circularDivisions;
  const drawLowerTicks = micrometer.mainScaleDivisions > 20;

  for (let i = 0; i <= micrometer.mainScaleDivisions; i += 1) {
    let tick = i % 5 === 0 ? 20 : 10;
    if (drawLowerTicks && i % 2 === 1) tick = -10;
    drawLine(x, 0, x, -tick);
    if (i % 10 === 0) {
      drawLabel(String(i * MICROMETER_MSD_VALUE), x, -tick - 8, {
        color: "#000",
        font: "700 12px Arial, sans-serif"
      });
    }
    x += msdPixels;
  }
  ctx.restore();

  drawLabel(`${getMicrometerLeastCount().toFixed(2)} mm`, 300, 478, {
    color: "#000",
    font: "700 18px Arial, sans-serif"
  });

  ctx.drawImage(micrometerImages.thimble, MICROMETER_SCALE_ORIGIN_X + shift, MICROMETER_THIMBLE_Y3);

  if (!micrometer.texturePattern) {
    micrometer.texturePattern = ctx.createPattern(micrometerImages.texture, "repeat");
  }

  const n = micrometer.circularDivisions / 4;
  let radius = MICROMETER_SCALE_ORIGIN_Y - MICROMETER_THIMBLE_Y1;
  const offsetY =
    (Math.round(micrometer.opening / getMicrometerLeastCount()) * radius * Math.PI) / n / 2;

  ctx.save();
  ctx.fillStyle = micrometer.texturePattern;
  ctx.translate(
    MICROMETER_SCALE_ORIGIN_X + shift + MICROMETER_THIMBLE_X2 + 49,
    MICROMETER_SCALE_ORIGIN_Y + offsetY
  );
  radius = MICROMETER_SCALE_ORIGIN_Y - MICROMETER_THIMBLE_Y3;
  ctx.fillRect(0, -(radius + offsetY), MICROMETER_THIMBLE_X3 - MICROMETER_THIMBLE_X2 - 153, 2 * radius);
  ctx.restore();

  const gradient = ctx.createLinearGradient(
    MICROMETER_THIMBLE_X2,
    MICROMETER_THIMBLE_Y3,
    MICROMETER_THIMBLE_X2,
    MICROMETER_THIMBLE_Y3 + 2 * radius
  );
  gradient.addColorStop(0, "black");
  gradient.addColorStop(0.5, "rgb(184,203,184)");
  gradient.addColorStop(1, "black");

  ctx.globalAlpha = 0.6;
  ctx.fillStyle = gradient;
  ctx.fillRect(
    MICROMETER_SCALE_ORIGIN_X + shift + MICROMETER_THIMBLE_X2 + 49,
    MICROMETER_THIMBLE_Y3,
    MICROMETER_THIMBLE_X3 - MICROMETER_THIMBLE_X2 - 153,
    2 * radius
  );
  ctx.globalAlpha = 1;

  ctx.fillStyle = "#000";
  ctx.strokeStyle = "#000";
  ctx.font = "10pt Arial, sans-serif";

  x = MICROMETER_SCALE_ORIGIN_X + shift;
  const y = MICROMETER_SCALE_ORIGIN_Y;
  radius = MICROMETER_SCALE_ORIGIN_Y - MICROMETER_THIMBLE_Y1;
  const angleStep = Math.PI / 2 / n;
  drawLine(x, MICROMETER_THIMBLE_Y1 - 1, x, MICROMETER_THIMBLE_Y1 + 2 * radius + 1);

  for (let i = 0; i < n; i += 1) {
    const sin = Math.sin(i * angleStep);
    const dy = radius * sin;
    let dy2 = dy * (radius + 4) / radius;
    let divPos = mod(circularWithZero + i, micrometer.circularDivisions);
    let tick = 18;

    if (divPos % 5 === 0) {
      tick = 30;
      dy2 = dy * (radius + 8) / radius;
      if (i < n - 2) {
        drawLabel(String(divPos), x + MICROMETER_THIMBLE_X2 + 14, y - dy2, {
          align: "left",
          color: "#000",
          font: "700 12px Arial, sans-serif"
        });
      }
    }
    drawLine(x, y - dy, x + tick, y - dy2);

    if (i === 0) continue;

    dy2 = dy * (radius + 4) / radius;
    divPos = mod(circularWithZero - i, micrometer.circularDivisions);
    tick = 18;
    if (divPos % 5 === 0) {
      tick = 30;
      dy2 = dy * (radius + 8) / radius;
      if (i < n - 2) {
        drawLabel(String(divPos), x + MICROMETER_THIMBLE_X2 + 14, y + dy2, {
          align: "left",
          color: "#000",
          font: "700 12px Arial, sans-serif"
        });
      }
    }
    drawLine(x, y + dy, x + tick, y + dy2);
  }

  if (micrometer.object?.state > 0) {
    const object = micrometer.object;
    const objectGradient = ctx.createLinearGradient(object.x, object.y, object.x + object.w, object.y);
    objectGradient.addColorStop(0, "rgb(120,120,120)");
    objectGradient.addColorStop(0.5, "rgb(220,230,210)");
    objectGradient.addColorStop(1, "rgb(120,120,120)");
    ctx.fillStyle = objectGradient;
    ctx.fillRect(object.x + 1, object.y, object.w, object.h);
    ctx.strokeStyle = "#000";
    ctx.strokeRect(object.x + 1, object.y, object.w, object.h);
  }

  if (state.valuesVisible) {
    drawLabel(formatMicrometer(parts.total), MICROMETER_SPINDLE_ORIGIN_X + shift / 2, MICROMETER_SPINDLE_ORIGIN_Y - 42, {
      color: "orange",
      font: "700 16px Arial, sans-serif"
    });
  }

  ctx.restore();
}

function draw() {
  if (!ctx) return;

  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  if (state.instrument === "micrometer") {
    drawMicrometer(width, height);
    return;
  }

  clearCanvas(width, height);

  const usesSourceImages = sourceImagesReady();
  const sourceScale = usesSourceImages ? width / SOURCE_WORLD_WIDTH : 0;
  const sourceX = usesSourceImages ? state.sourceWorldX * sourceScale : 0;
  const sourceY = usesSourceImages ? state.sourceWorldY * sourceScale : 0;
  const msdPixels = getMsdPixels();
  const vsdPixels = getVsdPixels();
  const pxPerMm = usesSourceImages
    ? msdPixels * sourceScale
    : clamp((width - 132) / (getMaxOpening() + state.vernierDivisions + 4), 2.2, 9.5);
  const originX = usesSourceImages
    ? sourceX + (SOURCE_SCALE_ORIGIN_X + SOURCE_OFFSET_ORIGIN_X) * sourceScale
    : 72;
  const scaleY = usesSourceImages
    ? sourceY + SOURCE_SCALE_ORIGIN_Y * sourceScale
    : clamp(height * 0.28, 120, 190);
  const scaleWidth = (getMaxOpening() + state.vernierDivisions + 4) * pxPerMm;
  const sliderX = originX + state.opening * pxPerMm;
  const parts = getReadingParts(state.opening + getZeroErrorMm());
  const metrics = {
    originX,
    scaleY,
    scaleWidth,
    sliderX,
    pxPerMm,
    sourceScale,
    msdPixels,
    vsdPixels: vsdPixels * sourceScale,
    sourceX,
    sourceY,
    usesSourceImages
  };

  state.metrics = metrics;

  if (usesSourceImages) {
    drawSourceCaliper(metrics);
    drawMainScale(metrics);
    drawSlidingJaw(metrics, parts);
    if (state.valuesVisible) drawGuides(metrics, parts);
    drawObject(metrics);
    drawModeNote(width, metrics, parts);
    return;
  }

  drawObject(metrics);
  drawMainScale(metrics);
  drawFixedJaw(metrics);
  drawSlidingJaw(metrics, parts);
  drawDepthBlade(metrics);
  if (state.valuesVisible) drawGuides(metrics, parts);
  drawModeNote(width, metrics, parts);
}

function updateProblemPanel() {
  if (state.instrument === "micrometer") {
    revealBtn.textContent = micrometer.revealed ? "ซ่อน" : "เฉลย";

    if (!micrometer.object) {
      problemValue.textContent = "ยังไม่มีโจทย์";
      problemStatus.textContent = "กดสร้างโจทย์ แล้วลากวัตถุไปที่ปากไมโครมิเตอร์";
      problemStatus.className = "status-strip";
      return;
    }

    problemValue.textContent = micrometer.revealed ? formatMicrometer(micrometer.object.value) : "ซ่อนค่าไว้";
    problemValue.classList.toggle("is-revealed", micrometer.revealed);
    problemStatus.textContent = micrometer.object.state === 2 ? "วัตถุถูกจับตำแหน่งแล้ว" : "ลากวัตถุได้อิสระ";
    problemStatus.className = micrometer.object.state === 2 ? "status-strip is-close" : "status-strip";
    return;
  }

  revealBtn.textContent = state.revealed ? "ซ่อน" : "เฉลย";
  problemValue.classList.toggle("is-revealed", state.revealed);

  if (!state.problem) {
    problemValue.textContent = "ยังไม่มีโจทย์";
    problemStatus.textContent = "กดสร้างโจทย์ แล้วลากวัตถุไปชนปากวัด";
    problemStatus.className = "status-strip";
    return;
  }

  if (state.revealed) {
    problemValue.textContent = formatMm(state.problem.value);
  } else {
    problemValue.textContent = "ซ่อนค่าไว้";
  }

  const diff = Math.abs(state.opening - state.problem.value);
  if (!state.valuesVisible) {
    problemStatus.textContent = state.problem.snapped ? "วัตถุถูกจับตำแหน่งแล้ว" : "ลากวัตถุได้อิสระ";
    problemStatus.className = "status-strip";
    return;
  }

  if (!state.problem.snapped) {
    problemStatus.textContent = "ยังไม่ชนปากวัด";
    problemStatus.className = "status-strip";
    return;
  }

  if (diff <= getLeastCount()) {
    problemStatus.textContent = `ใกล้มาก ต่าง ${diff.toFixed(2)} mm`;
    problemStatus.className = "status-strip is-close";
  } else {
    problemStatus.textContent = `ต่าง ${diff.toFixed(2)} mm`;
    problemStatus.className = "status-strip is-far";
  }
}

function updateReadout() {
  if (state.instrument === "micrometer") {
    const displayed = micrometer.opening + getMicrometerZeroErrorMm();
    const parts = getMicrometerParts(displayed);
    const corrected = snapMicrometer(parts.total - getMicrometerZeroErrorMm());

    guiTitle.textContent = "Micrometer Settings";
    secondaryScaleLabel.textContent = "CSD Count";
    mainScaleRange.min = "10";
    mainScaleRange.max = "50";
    mainScaleRange.step = "10";
    mainScaleRange.value = String(micrometer.mainScaleDivisions);
    vernierDivisionRange.min = "25";
    vernierDivisionRange.max = "100";
    vernierDivisionRange.step = "25";
    vernierDivisionRange.value = String(micrometer.circularDivisions);
    zeroErrorRange.min = String(-micrometer.circularDivisions + 1);
    zeroErrorRange.max = String(micrometer.circularDivisions - 1);
    zeroErrorRange.value = String(micrometer.zeroErrorDivisions);
    range.max = String(getMicrometerMaxOpening());
    range.step = String(getMicrometerLeastCount());
    range.value = micrometer.opening.toFixed(4);
    openingOutput.textContent = state.valuesVisible ? formatMicrometer(micrometer.opening) : "ซ่อนอยู่";
    mainScaleCountValue.textContent = String(micrometer.mainScaleDivisions);
    vernierDivisionValue.textContent = String(micrometer.circularDivisions);
    leastCountValue.textContent = formatMicrometer(getMicrometerLeastCount());
    valuesToggleBtn.textContent = state.valuesVisible ? "ซ่อนค่า" : "แสดงค่า";
    valuesToggleBtn.setAttribute("aria-pressed", String(state.valuesVisible));

    if (!state.valuesVisible) {
      readingValue.textContent = "----";
      readingCmValue.textContent = "ซ่อนอยู่";
      mainScaleValue.textContent = "ซ่อนอยู่";
      vernierLineValue.textContent = "ซ่อนอยู่";
      vernierAddValue.textContent = "ซ่อนอยู่";
      formulaText.textContent = "ซ่อนสูตรไว้";
      zeroErrorValue.textContent = "ซ่อนอยู่";
      correctedValue.textContent = "ซ่อนอยู่";
      return;
    }

    readingValue.textContent = formatMicrometer(parts.total).replace(" mm", "");
    readingCmValue.textContent = formatCm(parts.total);
    mainScaleValue.textContent = formatMicrometer(parts.main);
    vernierLineValue.textContent = String(parts.circularLine);
    vernierAddValue.textContent = formatMicrometer(parts.circularAdd);
    formulaText.textContent = `${parts.main.toFixed(2)} + (${parts.circularLine} × ${getMicrometerLeastCount().toFixed(2)}) = ${formatMicrometer(parts.total)}`;
    zeroErrorValue.textContent = formatMicrometer(getMicrometerZeroErrorMm());
    correctedValue.textContent = formatMicrometer(corrected);
    return;
  }

  guiTitle.textContent = "Vernier Settings";
  secondaryScaleLabel.textContent = "VSD Count";
  mainScaleRange.min = "50";
  mainScaleRange.max = "150";
  mainScaleRange.step = "10";
  mainScaleRange.value = String(state.mainScaleDivisions);
  vernierDivisionRange.min = "10";
  vernierDivisionRange.max = "50";
  vernierDivisionRange.step = "10";
  vernierDivisionRange.value = String(state.vernierDivisions);

  const displayed = state.opening + getZeroErrorMm();
  const parts = getReadingParts(displayed);
  const corrected = snap(parts.total - getZeroErrorMm());

  openingOutput.textContent = state.valuesVisible ? formatMm(state.opening) : "ซ่อนอยู่";
  mainScaleCountValue.textContent = `${state.mainScaleDivisions} mm / ${(state.mainScaleDivisions / 10).toFixed(0)} cm`;
  vernierDivisionValue.textContent = `${state.vernierDivisions} ช่อง / 0-${VERNIER_NUMBER_LABELS}`;
  leastCountValue.textContent = formatMm(getLeastCount());
  range.max = String(getMaxOpening());
  range.step = String(getLeastCount());
  zeroErrorRange.min = String(-state.vernierDivisions + 1);
  zeroErrorRange.max = String(state.vernierDivisions - 1);
  valuesToggleBtn.textContent = state.valuesVisible ? "ซ่อนค่า" : "แสดงค่า";
  valuesToggleBtn.setAttribute("aria-pressed", String(state.valuesVisible));

  if (!state.valuesVisible) {
    readingValue.textContent = "----";
    readingCmValue.textContent = "ซ่อนอยู่";
    mainScaleValue.textContent = "ซ่อนอยู่";
    vernierLineValue.textContent = "ซ่อนอยู่";
    vernierAddValue.textContent = "ซ่อนอยู่";
    formulaText.textContent = "ซ่อนสูตรไว้";
    zeroErrorValue.textContent = "ซ่อนอยู่";
    correctedValue.textContent = "ซ่อนอยู่";
    return;
  }

  readingValue.textContent = formatMm(parts.total).replace(" mm", "");
  readingCmValue.textContent = formatCm(parts.total);
  mainScaleValue.textContent = formatMm(parts.main);
  vernierLineValue.textContent = String(parts.vernierLine);
  vernierAddValue.textContent = formatMm(parts.vernierAdd);
  formulaText.textContent = `${parts.main.toFixed(2)} + (${parts.vernierLine} × ${getLeastCount().toFixed(2)}) = ${formatMm(parts.total)}`;
  zeroErrorValue.textContent = formatMm(getZeroErrorMm());
  correctedValue.textContent = formatMm(corrected);
}

function update() {
  updateReadout();
  updateProblemPanel();
  draw();
}

function createProblem() {
  const object = createSourceObject();
  const value = snap(object.length / getMsdPixels());
  state.problem = {
    mode: "free",
    value,
    object,
    snapped: false
  };
  state.mode = "free";
  state.revealed = false;
  updateProblemPanel();
  draw();
}

function pointerToOpening(event) {
  if (!state.metrics) return state.opening;
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;

  if (state.metrics.usesSourceImages) {
    const point = pointerToSourceWorld(event);
    return snap(point.x / getMsdPixels());
  }

  return snap((x - state.metrics.originX) / state.metrics.pxPerMm);
}

function pointerToSourceWorld(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left - state.metrics.sourceX) / state.metrics.sourceScale,
    y: (event.clientY - rect.top - state.metrics.sourceY) / state.metrics.sourceScale
  };
}

function pointerToScreen(event) {
  return {
    x: event.clientX,
    y: event.clientY
  };
}

function getSliderDragOpening(event) {
  if (state.metrics?.usesSourceImages) {
    const point = pointerToSourceWorld(event);
    const deltaMm = (point.x - state.sliderStartWorldX) / getMsdPixels();
    return state.sliderStartOpening + deltaMm * SLIDER_DRAG_SENSITIVITY;
  }

  return pointerToOpening(event);
}

function isOverSourceObject(event) {
  if (!state.metrics?.usesSourceImages || !state.problem?.object) return false;

  const object = state.problem.object;
  const point = pointerToSourceWorld(event);
  const centerX = object.x + object.w / 2;
  const centerY = object.y + Math.abs(object.h / 2);

  return (
    Math.abs(point.x - centerX) < Math.abs(object.w / 2) &&
    Math.abs(point.y - centerY) < Math.abs(object.h / 2)
  );
}

function snapDraggedSourceObject() {
  const object = state.problem?.object;
  if (!object) return;

  let x = object.x + Math.abs(object.w) / 2;
  let y = object.y + Math.abs(object.h) / 2;
  let snappedMode = null;

  if (Math.abs(x - SOURCE_SCALE_ORIGIN_X) < Math.abs(object.w) + 20) {
    if (Math.abs(y - 30) < Math.abs(object.h) + 50) {
      snappedMode = "internal";
    } else if (Math.abs(y - SOURCE_SCALE_ORIGIN_Y - 100) < Math.abs(object.h) + 50) {
      snappedMode = "external";
    }
  } else if (
    Math.abs(x - SOURCE_RULER_WIDTH) < Math.abs(object.w) + 20 &&
    Math.abs(y - SOURCE_RULER_MID_Y) < Math.abs(object.h) + 20
  ) {
    snappedMode = "depth";
  }

  if (snappedMode) {
    applySourceProblemMode(snappedMode);
  } else {
    state.problem.snapped = false;
    state.problem.mode = "free";
    state.mode = "free";
    update();
  }
}

function isNearSlider(event) {
  if (!state.metrics) return false;

  if (state.metrics.usesSourceImages) {
    const point = pointerToSourceWorld(event);
    const shift = state.opening * getMsdPixels();
    const vernierLength = getVernierScaleLengthPixels();

    return (
      (
        point.x > shift &&
        point.x < shift + sourceImages.vernier1.naturalWidth - 60 &&
        point.y > SOURCE_SCALE_ORIGIN_Y - 100 &&
        point.y < SOURCE_VERNIER_SCALE_HEIGHT
      ) ||
      (
        point.x > shift + sourceImages.vernier1.naturalWidth - 60 &&
        point.x < shift + vernierLength - sourceImages.vernier3.naturalWidth &&
        point.y > SOURCE_SCALE_ORIGIN_Y - 100 &&
        point.y < SOURCE_SCALE_ORIGIN_Y + 35
      )
    );
  }

  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const { sliderX, scaleY } = state.metrics;
  const nearX = Math.abs(x - sliderX) < 64;
  const inY = y > scaleY - 80 && y < scaleY + 235;
  return nearX && inY;
}

range.addEventListener("input", (event) => {
  if (state.instrument === "micrometer") {
    setMicrometerOpening(Number(event.target.value));
    return;
  }

  setOpening(Number(event.target.value));
});

increaseBtn.addEventListener("click", () => {
  if (state.instrument === "micrometer") {
    setMicrometerOpening(micrometer.opening + getMicrometerLeastCount());
    return;
  }

  setOpening(state.opening + getLeastCount());
});

decreaseBtn.addEventListener("click", () => {
  if (state.instrument === "micrometer") {
    setMicrometerOpening(micrometer.opening - getMicrometerLeastCount());
    return;
  }

  setOpening(state.opening - getLeastCount());
});

mainScaleRange.addEventListener("input", (event) => {
  if (state.instrument === "micrometer") {
    micrometer.mainScaleDivisions = Number(event.target.value);
    micrometer.opening = clamp(micrometer.opening, 0, getMicrometerMaxOpening());
    if (micrometer.object) {
      micrometer.object.value = snapMicrometer((micrometer.object.w / getMicrometerMsdPixels()) * MICROMETER_MSD_VALUE);
    }
    setMicrometerOpening(micrometer.opening);
    return;
  }

  state.mainScaleDivisions = Number(event.target.value);
  state.opening = clamp(state.opening, MIN_MM, getMaxOpening());
  if (state.problem?.object) {
    state.problem.value = snap(state.problem.object.length / getMsdPixels());
  }
  setOpening(state.opening);
});

vernierDivisionRange.addEventListener("input", (event) => {
  if (state.instrument === "micrometer") {
    micrometer.circularDivisions = Number(event.target.value);
    micrometer.zeroErrorDivisions = clamp(
      micrometer.zeroErrorDivisions,
      -micrometer.circularDivisions + 1,
      micrometer.circularDivisions - 1
    );
    setMicrometerOpening(micrometer.opening);
    return;
  }

  state.vernierDivisions = Number(event.target.value);
  state.zeroErrorDivisions = clamp(state.zeroErrorDivisions, -state.vernierDivisions + 1, state.vernierDivisions - 1);
  zeroErrorRange.value = String(state.zeroErrorDivisions);
  if (state.problem?.object) {
    state.problem.value = snap(state.problem.object.length / getMsdPixels());
  }
  setOpening(state.opening);
});

zeroErrorRange.addEventListener("input", (event) => {
  if (state.instrument === "micrometer") {
    micrometer.zeroErrorDivisions = Number(event.target.value);
    update();
    return;
  }

  state.zeroErrorDivisions = Number(event.target.value);
  update();
});

drawSubDivisionsInput.addEventListener("change", (event) => {
  state.drawSubDivisions = event.target.checked;
  draw();
});

newProblemBtn.addEventListener("click", () => {
  if (state.instrument === "micrometer") {
    createMicrometerProblem();
    return;
  }

  createProblem();
});

valuesToggleBtn.addEventListener("click", () => {
  state.valuesVisible = !state.valuesVisible;
  update();
});

settingsToggleBtn.addEventListener("click", () => {
  const collapsed = guiPanel.classList.toggle("is-collapsed");
  settingsToggleBtn.textContent = collapsed ? "แสดงแผง" : "ซ่อนแผง";
  settingsToggleBtn.setAttribute("aria-expanded", String(!collapsed));
});

instrumentTabs.forEach((button) => {
  button.addEventListener("click", () => switchInstrument(button.dataset.instrument));
});

infoButton.addEventListener("click", showInfo);
closeInfoButton.addEventListener("click", hideInfo);
infoOverlay.addEventListener("click", (event) => {
  if (event.target === infoOverlay) hideInfo();
});

revealBtn.addEventListener("click", () => {
  if (state.instrument === "micrometer") {
    if (!micrometer.object) return;
    micrometer.revealed = !micrometer.revealed;
    updateProblemPanel();
    return;
  }

  if (!state.problem) return;
  state.revealed = !state.revealed;
  revealBtn.textContent = state.revealed ? "ซ่อน" : "เฉลย";
  updateProblemPanel();
});

canvas.addEventListener("pointerdown", (event) => {
  if (state.instrument === "micrometer") {
    micrometerPointerDown(event);
    return;
  }

  if (isOverSourceObject(event)) {
    canvas.setPointerCapture(event.pointerId);
    state.dragging = "object";
    state.problem.snapped = false;
    state.problem.mode = "free";
    state.mode = "free";
    state.lastPointerWorld = pointerToSourceWorld(event);
    updateProblemPanel();
    return;
  }

  canvas.setPointerCapture(event.pointerId);

  if (isNearSlider(event)) {
    state.dragging = "slider";
    state.sliderStartOpening = state.opening;
    state.sliderStartWorldX = pointerToSourceWorld(event).x;
    return;
  }

  if (state.metrics?.usesSourceImages) {
    state.dragging = "world";
    state.lastPointerScreen = pointerToScreen(event);
  }
});

canvas.addEventListener("pointermove", (event) => {
  if (state.instrument === "micrometer") {
    micrometerPointerMove(event);
    return;
  }

  if (!state.dragging) return;

  if (state.dragging === "object") {
    const point = pointerToSourceWorld(event);
    const object = state.problem?.object;

    if (object && state.lastPointerWorld) {
      object.x += point.x - state.lastPointerWorld.x;
      object.y += point.y - state.lastPointerWorld.y;
      state.lastPointerWorld = point;
      draw();
    }
    return;
  }

  if (state.dragging === "world") {
    const point = pointerToScreen(event);

    if (state.lastPointerScreen && state.metrics?.sourceScale) {
      state.sourceWorldX += (point.x - state.lastPointerScreen.x) / state.metrics.sourceScale;
      state.sourceWorldY += (point.y - state.lastPointerScreen.y) / state.metrics.sourceScale;
      state.lastPointerScreen = point;
      draw();
    }
    return;
  }

  setOpening(getSliderDragOpening(event));
});

canvas.addEventListener("pointerup", (event) => {
  if (state.instrument === "micrometer") {
    micrometerPointerUp(event);
    return;
  }

  if (state.dragging === "object") {
    snapDraggedSourceObject();
  }

  state.dragging = null;
  state.lastPointerWorld = null;
  state.lastPointerScreen = null;
  state.sliderStartOpening = state.opening;
  state.sliderStartWorldX = 0;
  if (canvas.hasPointerCapture(event.pointerId)) {
    canvas.releasePointerCapture(event.pointerId);
  }
});

canvas.addEventListener("pointercancel", () => {
  if (state.instrument === "micrometer") {
    micrometer.dragging = null;
    micrometer.lastPointerWorld = null;
    micrometer.lastPointerScreen = null;
    micrometer.dragRemainder = 0;
    return;
  }

  state.dragging = null;
  state.lastPointerWorld = null;
  state.lastPointerScreen = null;
  state.sliderStartOpening = state.opening;
  state.sliderStartWorldX = 0;
});

canvas.addEventListener("wheel", (event) => {
  if (state.instrument === "micrometer") {
    rotateMicrometer(event.deltaY > 0 ? -1 : 1);
    event.preventDefault();
    return;
  }

  translateVernier(event.deltaY > 0 ? -1 : 1);
  event.preventDefault();
}, { passive: false });

window.addEventListener("keydown", (event) => {
  if (state.instrument === "micrometer") {
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      rotateMicrometer(-1);
      event.preventDefault();
    }

    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      rotateMicrometer(1);
      event.preventDefault();
    }
    return;
  }

  if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
    translateVernier(-1);
    event.preventDefault();
  }

  if (event.key === "ArrowRight" || event.key === "ArrowUp") {
    translateVernier(1);
    event.preventDefault();
  }
});

window.addEventListener("resize", resizeCanvas);

resizeCanvas();
update();
