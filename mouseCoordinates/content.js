// Create a floating div to display live coordinates
const coordDiv = document.createElement('div');
coordDiv.style.position = 'fixed';
coordDiv.style.bottom = '0';
coordDiv.style.right = '0';
coordDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
coordDiv.style.color = 'white';
coordDiv.style.padding = '10px';
coordDiv.style.zIndex = '9999';
document.body.appendChild(coordDiv);

// Variables to track drawing state
let isDrawing = false;
let gesturePath = [];

document.addEventListener('mousedown', (event) => {
  // Only respond to left click (button === 0)
  if (event.button !== 0) return;
  isDrawing = true;
  gesturePath = [[event.clientX, event.clientY]];
  coordDiv.innerHTML = `Start Drawing...`;
});

document.addEventListener('mousemove', (event) => {
  if (!isDrawing) return;

  const x = event.clientX;
  const y = event.clientY;
  gesturePath.push([x, y]);

  coordDiv.innerHTML = `Recording (${gesturePath.length} pts)...<br>X: ${x}, Y: ${y}`;
});

document.addEventListener('mouseup', () => {
  if (!isDrawing) return;
  isDrawing = false;

  coordDiv.innerHTML = `Gesture recorded with ${gesturePath.length} points.`;
  console.log("🖊️ Gesture path:", gesturePath);

  // Optional: send gesturePath to background script or model
});


// Create a simple floating control panel
const controlPanel = document.createElement('div');
controlPanel.style.position = 'fixed';
controlPanel.style.top = '10px';
controlPanel.style.left = '10px';
controlPanel.style.backgroundColor = '#222';
controlPanel.style.color = 'white';
controlPanel.style.padding = '10px';
controlPanel.style.borderRadius = '8px';
controlPanel.style.zIndex = '9999';
controlPanel.style.display = 'flex';
controlPanel.style.gap = '8px';
controlPanel.style.fontSize = '14px';
controlPanel.style.boxShadow = '0 0 8px rgba(0,0,0,0.4)';
controlPanel.innerHTML = `
  <button id="btn-back">← Back</button>
  <button id="btn-forward">→ Forward</button>
  <button id="btn-reload">🔄 Reload</button>
`;

document.body.appendChild(controlPanel);

// Button actions
document.getElementById('btn-back').onclick = () => history.back();
document.getElementById('btn-forward').onclick = () => history.forward();
document.getElementById('btn-reload').onclick = () => location.reload();
