// ===========================
// 🔹 Utility Functions
// ===========================
function getRandomCol() {
  const randomColor = Math.floor(Math.random() * 16777215).toString(16);
  return '#' + randomColor.padStart(6, '0');
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})` : null;
}

/**
 * Changes the background color of a given cell based on the current drawing mode.
 * @param {HTMLElement} element The grid cell element to color.
 */
function changecolor(element) {
  if (!element) return; // Guard against null elements

  if (eraseMode) {
    element.style.backgroundColor = bgSelectedColor;
  } else if (rainbow) {
    element.style.backgroundColor = getRandomCol();
  } else {
    element.style.backgroundColor = selectedColor;
  }
}

/**
 * Resets the color of all grid cells to the background color.
 * @param {HTMLElement} container The grid container element.
 */
function resetcol(container) {
  const cells = container.querySelectorAll(".grid-cell");
  cells.forEach(cell => {
    cell.style.backgroundColor = bgSelectedColor;
  });
}

// ===========================
// 🔹 Global Variables
// ===========================
let rainbow = true;
let eraseMode = false;
let selectedColor = "#000000";
let selectedColor1 = "#000000"; // Grid color
let bgSelectedColor = "#FFFFFF";
let isDrawing = false;
let gridLinesOn = true; // To track grid visibility

// Store the last grid cell coordinates for line drawing
let lastX = -1;
let lastY = -1;


// DOM references
const slider = document.getElementById("gridSlider");
const display = document.getElementById("gridSizeDisplay");
const dabba = document.querySelector("#container");
dabba.style.display = "grid";

const colorPicker = document.getElementById("colorPicker");
const bgColorPicker = document.getElementById("bgColorPicker");

const colorPicker1 = document.getElementById("colorPicker1");
const gridToggle = document.getElementById("grd");


// ===========================
// 🔹 Event Listeners
// ===========================

// Handle mode changes
document.querySelectorAll('input[name="mode"]').forEach((radio) => {
  radio.addEventListener("change", (e) => {
    const mode = e.target.value;
    if (mode === "custom") {
      rainbow = false;
      eraseMode = false;
    } else if (mode === "rainbow") {
      rainbow = true;
      eraseMode = false;
    } else if (mode === "erase") {
      eraseMode = true;
      rainbow = false;
    }
  });
});

// Handle color picker updates
colorPicker.addEventListener("input", (e) => {
  selectedColor = e.target.value;
});

bgColorPicker.addEventListener("input", (e) => {
  const newBgColor = e.target.value;
  const oldBgColorRgb = hexToRgb(bgSelectedColor);

  bgSelectedColor = newBgColor;
  dabba.style.backgroundColor = newBgColor;

  const cells = dabba.querySelectorAll('.grid-cell');
  cells.forEach(cell => {
    if (cell.style.backgroundColor === oldBgColorRgb) {
      cell.style.backgroundColor = newBgColor;
    }
  });
});

colorPicker1.addEventListener("input", (e) => {
  selectedColor1 = e.target.value;
  updateGridLines();
});

gridToggle.addEventListener('change', (e) => {
  gridLinesOn = e.target.checked;
  updateGridLines();
});

// ===========================
// 🔹 Advanced Drawing Logic
// ===========================

function getGridCoordsFromEvent(e) {
  const rect = dabba.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const gridSize = parseInt(slider.value);
  const cellWidth = dabba.clientWidth / gridSize;
  const cellHeight = dabba.clientHeight / gridSize;
  const gridX = Math.floor(x / cellWidth);
  const gridY = Math.floor(y / cellHeight);
  return { gridX, gridY };
}

function handleDrawingStart(e) {
  e.preventDefault();
  isDrawing = true;
  const { gridX, gridY } = getGridCoordsFromEvent(e);
  drawBresenhamLine(gridX, gridY, gridX, gridY);
  lastX = gridX;
  lastY = gridY;
}

function handleDrawingMove(e) {
  if (!isDrawing) return;
  const { gridX, gridY } = getGridCoordsFromEvent(e);
  if (gridX !== lastX || gridY !== lastY) {
    drawBresenhamLine(lastX, lastY, gridX, gridY);
    lastX = gridX;
    lastY = gridY;
  }
}

function handleDrawingEnd() {
  isDrawing = false;
  lastX = -1;
  lastY = -1;
}

function drawBresenhamLine(x0, y0, x1, y1) {
  const gridSize = parseInt(slider.value);
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  while (true) {
    if (x0 >= 0 && x0 < gridSize && y0 >= 0 && y0 < gridSize) {
      const index = y0 * gridSize + x0;
      changecolor(dabba.children[index]);
    }
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }
}

// Assign the drawing event listeners to the container and window
dabba.addEventListener('mousedown', handleDrawingStart);
dabba.addEventListener('mousemove', handleDrawingMove);
window.addEventListener('mouseup', handleDrawingEnd);
dabba.addEventListener('contextmenu', e => e.preventDefault());

// ===========================
// 🔹 Grid Creation & Update Functions
// ===========================

function updateGridLines() {
  const cells = dabba.querySelectorAll('.grid-cell');
  const borderStyle = gridLinesOn ? `1px solid ${selectedColor1}` : 'none';
  cells.forEach(cell => {
    cell.style.border = borderStyle;
  });
}

function createGrid(size) {
  dabba.innerHTML = "";
  dabba.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  dabba.style.gridTemplateRows = `repeat(${size}, 1fr)`;
  for (let i = 0; i < size * size; i++) {
    const cell = document.createElement("div");
    cell.classList.add("grid-cell");
    cell.style.backgroundColor = bgSelectedColor;
    const borderStyle = gridLinesOn ? `1px solid ${selectedColor1}` : 'none';
    cell.style.border = borderStyle;
    dabba.appendChild(cell);
  }
}

// ===========================
// 🔹 Slider Control
// ===========================
slider.addEventListener("input", function () {
  let size = parseInt(slider.value);
  display.textContent = `${size} * ${size}`;
  createGrid(size);
});

// ===========================
// 🔹 Button Actions & Export
// ===========================

/**
 * Exports the current grid drawing as a PNG image by drawing it to a temporary canvas.
 */
function exportDrawing() {
  const gridSize = parseInt(slider.value);
  const gridContainer = dabba;
  const cells = gridContainer.children;

  // Use the container's display size for the canvas to maintain aspect ratio.
  const canvasWidth = gridContainer.clientWidth;
  const canvasHeight = gridContainer.clientHeight;

  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = canvasWidth;
  exportCanvas.height = canvasHeight;
  const ctx = exportCanvas.getContext('2d');

  const cellWidth = canvasWidth / gridSize;
  const cellHeight = canvasHeight / gridSize;

  // 1. Fill the entire canvas with the background color.
  ctx.fillStyle = bgSelectedColor;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // 2. Draw each cell's color onto the canvas.
  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];
    const x = (i % gridSize) * cellWidth;
    const y = Math.floor(i / gridSize) * cellHeight;
    ctx.fillStyle = cell.style.backgroundColor;
    ctx.fillRect(x, y, cellWidth, cellHeight);
  }

  // 3. If grid lines are enabled, draw them on top for a complete look.
  if (gridLinesOn) {
    ctx.strokeStyle = selectedColor1;
    ctx.lineWidth = 1;
    for (let i = 0; i < cells.length; i++) {
      const x = (i % gridSize) * cellWidth;
      const y = Math.floor(i / gridSize) * cellHeight;
      ctx.strokeRect(x, y, cellWidth, cellHeight);
    }
  }

  // 4. Create a temporary link to trigger the download.
  const link = document.createElement('a');
  link.download = 'etch-a-sketch.png';
  link.href = exportCanvas.toDataURL('image/png');
  document.body.appendChild(link); // Required for some browsers like Firefox.
  link.click();
  document.body.removeChild(link); // Clean up the temporary link.
}

// Clear button action
document.getElementById("btn1").addEventListener("click", function () {
  resetcol(dabba);

  this.style.backgroundColor = "rgba(255, 128, 0, 0.61)";
  setTimeout(() => {
    this.style.backgroundColor = "";
  }, 100);
});

// Export button action
document.getElementById("exportBtn").addEventListener("click", exportDrawing);


// ===========================
// 🔹 Initial Setup
// ===========================
gridToggle.checked = gridLinesOn;
selectedColor = colorPicker.value;
selectedColor1 = colorPicker1.value;
bgSelectedColor = bgColorPicker.value;
dabba.style.backgroundColor = bgSelectedColor;
createGrid(parseInt(slider.value));
