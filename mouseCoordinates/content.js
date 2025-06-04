
let gestureEnabled = true; 
const toggleBtn = document.createElement('button');
toggleBtn.textContent = '🟢 Gesture: ON';
toggleBtn.style.position = 'fixed';
toggleBtn.style.bottom = '60px'; // so it doesn't overlap coordDiv
toggleBtn.style.right = '10px';
toggleBtn.style.padding = '8px 12px';
toggleBtn.style.backgroundColor = '#333';
toggleBtn.style.color = 'white';
toggleBtn.style.border = 'none';
toggleBtn.style.borderRadius = '6px';
toggleBtn.style.cursor = 'pointer';
toggleBtn.style.zIndex = '9999';
toggleBtn.style.fontSize = '14px';
document.body.appendChild(toggleBtn);

toggleBtn.onclick = () => {
  gestureEnabled = !gestureEnabled;
  toggleBtn.textContent = gestureEnabled ? '🟢 Gesture: ON' : '🔴 Gesture: OFF';
  coordDiv.innerHTML = gestureEnabled ? 'Gesture detection is ON' : 'Gesture detection is OFF';
};

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
  if (!gestureEnabled || event.button !== 0) return;
  isDrawing = true;
  gesturePath = [[event.clientX, event.clientY]];
  coordDiv.innerHTML = `Start Drawing...`;
});

document.addEventListener('mousemove', (event) => {
  if (!isDrawing) return;
  if (!gestureEnabled) return;

  const x = event.clientX;
  const y = event.clientY;
  gesturePath.push([x, y]);

  coordDiv.innerHTML = `Recording (${gesturePath.length} pts)...<br>X: ${x}, Y: ${y}`;
});

// document.addEventListener('mouseup', () => {
//   if (!isDrawing) return;
//   isDrawing = false;

//   coordDiv.innerHTML = `Gesture recorded with ${gesturePath.length} points.`;
//   console.log("🖊️ Gesture path:", gesturePath);

//   // Optional: send gesturePath to background script or model
// });
document.addEventListener('mouseup', () => {
  if (!isDrawing) return;
  if (!gestureEnabled) return;
  isDrawing = false;

  coordDiv.innerHTML = `Gesture recorded with ${gesturePath.length} points.`;
  console.log("Gesture path:", gesturePath);

  // === Send gesture to Flask server ===
fetch("http://localhost:5050/predict", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ gesture: gesturePath }),
})
  .then((res) => res.json())
  .then((data) => {
    if (data.error) {
      coordDiv.innerHTML = `${data.error}`;
      alert(`${data.error}`);
    } else {
      const msg = `Prediction: ${data.majority_vote}`;
      coordDiv.innerHTML = msg;
      const action = data.majority_vote;

      if (action === "line-left-right") {
        history.forward();
      } else if (action === "line-right-left") {
        history.back();
      } else if (action === "circle") {
        location.reload();
      }
      // alert(msg);
    }
  })
  .catch((err) => {
    console.error("Prediction failed:", err);
    coordDiv.innerHTML = "Could not connect to server.";
    alert("Could not connect to server.");
  });

});



// // Create a simple floating control panel
// const controlPanel = document.createElement('div');
// controlPanel.style.position = 'fixed';
// controlPanel.style.top = '10px';
// controlPanel.style.left = '10px';
// controlPanel.style.backgroundColor = '#222';
// controlPanel.style.color = 'white';
// controlPanel.style.padding = '10px';
// controlPanel.style.borderRadius = '8px';
// controlPanel.style.zIndex = '9999';
// controlPanel.style.display = 'flex';
// controlPanel.style.gap = '8px';
// controlPanel.style.fontSize = '14px';
// controlPanel.style.boxShadow = '0 0 8px rgba(0,0,0,0.4)';
// controlPanel.innerHTML = `
//   <button id="btn-back">← Back</button>
//   <button id="btn-forward">→ Forward</button>
//   <button id="btn-reload">🔄 Reload</button>
// `;

// document.body.appendChild(controlPanel);

// // Button actions
// document.getElementById('btn-back').onclick = () => history.back();
// document.getElementById('btn-forward').onclick = () => history.forward();
// document.getElementById('btn-reload').onclick = () => location.reload();
