// Register Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("sw.js")
      .then(() => console.log("SW Registered"))
      .catch((err) => console.log("SW Failure:", err));
  });
}

// Elements
const form = document.getElementById("uploadForm");
const resultBox = document.getElementById("result");
const themeToggle = document.getElementById("themeToggle");
const useFileBtn = document.getElementById("useFileBtn");
const useCameraBtn = document.getElementById("useCameraBtn");
const fileSection = document.getElementById("fileSection");
const cameraSection = document.getElementById("cameraSection");
const imageInput = document.getElementById("imageInput");
const cameraPreview = document.getElementById("cameraPreview");
const cameraCanvas = document.getElementById("cameraCanvas");
const captureBtn = document.getElementById("captureBtn");
const previewContainer = document.getElementById("previewContainer");
const finalImage = document.getElementById("finalImage");
const retakeBtn = document.getElementById("retakeBtn");
const verifyBtn = document.getElementById("verifyBtn");

let stream = null;
let mode = "file"; // 'file' or 'camera'
let capturedBlob = null;

// Theme Toggle SVG icons
const sunIcon = `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
const moonIcon = `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;

themeToggle.onclick = () => {
  const isDark = document.body.dataset.theme === "dark";
  document.body.dataset.theme = isDark ? "light" : "dark";
  themeToggle.innerHTML = isDark ? moonIcon : sunIcon;
};

// Mode Switching
function switchMode(newMode) {
  mode = newMode;
  resultBox.style.display = "none";

  if (mode === "file") {
    useFileBtn.classList.add("active");
    useCameraBtn.classList.remove("active");
    fileSection.style.display = "block";
    cameraSection.style.display = "none";
    stopCamera();

    if (imageInput.files.length > 0) {
      previewContainer.style.display = "block";
      fileSection.style.display = "none";
    } else {
      previewContainer.style.display = "none";
      fileSection.style.display = "block";
    }
  } else {
    useCameraBtn.classList.add("active");
    useFileBtn.classList.remove("active");
    fileSection.style.display = "none";
    cameraSection.style.display = "block";

    if (capturedBlob) {
      cameraSection.style.display = "none";
      previewContainer.style.display = "block";
    } else {
      previewContainer.style.display = "none";
      startCamera();
    }
  }
}

useFileBtn.onclick = () => switchMode("file");
useCameraBtn.onclick = () => switchMode("camera");

// Camera Logic
async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });
    cameraPreview.srcObject = stream;
  } catch (err) {
    console.error("Camera Error:", err);
    alert("Camera access denied or unavailable.");
  }
}

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach((t) => t.stop());
    stream = null;
  }
}

captureBtn.onclick = () => {
  if (!stream) return;
  const ctx = cameraCanvas.getContext("2d");
  cameraCanvas.width = cameraPreview.videoWidth;
  cameraCanvas.height = cameraPreview.videoHeight;
  ctx.drawImage(cameraPreview, 0, 0);

  cameraCanvas.toBlob((blob) => {
    capturedBlob = blob;
    finalImage.src = URL.createObjectURL(blob);

    stopCamera();
    cameraSection.style.display = "none";
    previewContainer.style.display = "block";
  }, "image/jpeg", 0.9);
};

// File Input Logic
imageInput.onchange = (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      finalImage.src = ev.target.result;
      previewContainer.style.display = "block";
      fileSection.style.display = "none";
      capturedBlob = null;
    };
    reader.readAsDataURL(file);
  }
};

// Retake Logic
retakeBtn.onclick = () => {
  previewContainer.style.display = "none";
  resultBox.style.display = "none";

  if (mode === "file") {
    imageInput.value = "";
    fileSection.style.display = "block";
  } else {
    capturedBlob = null;
    cameraSection.style.display = "block";
    startCamera();
  }
};

// Geolocation
const getPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) reject(new Error("Geolocation not supported"));

    navigator.geolocation.getCurrentPosition(
      resolve,
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
};

// Form Submit
form.onsubmit = async (e) => {
  e.preventDefault();
  verifyBtn.disabled = true;
  verifyBtn.textContent = "Verifying...";
  resultBox.style.display = "none";

  try {
    let imageToSend;
    if (mode === "file") {
      if (!imageInput.files[0]) throw new Error("No image selected");
      imageToSend = imageInput.files[0];
    } else {
      if (!capturedBlob) throw new Error("No image captured");
      imageToSend = capturedBlob;
    }

    const pos = await getPosition().catch(() => ({ coords: { latitude: 0, longitude: 0 } }));

    const formData = new FormData();
    formData.append("image", imageToSend, "upload.jpg");
    formData.append("latitude", pos.coords.latitude);
    formData.append("longitude", pos.coords.longitude);
    formData.append("source", mode);

    const res = await fetch("/api/upload/", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.detail || "Server Error");

    // Display Result
    resultBox.style.display = "block";
    resultBox.className = data.result.status === "APPROVED" ? "success" : "error";

    const statusText = data.result.status === "APPROVED" ? "APPROVED" : "REJECTED";

    resultBox.innerHTML = `
      <div style="font-size: 1.1rem; font-weight: bold; margin-bottom: 10px; color: ${data.result.status === 'APPROVED' ? 'var(--success)' : 'var(--error)'}">
        ${statusText}
      </div>
      <div>Confidence: ${(data.result.confidence * 100).toFixed(1)}%</div>
      <div>Bio-mass: ${data.result.tree_detected ? "Detected" : "Not Detected"}</div>
      <div>Location: ${data.result.geo_valid ? "Valid" : "Invalid"}</div>
      <div>Unique: ${!data.result.duplicate ? "Yes" : "Duplicate"}</div>
      <div style="margin-top: 10px; font-size: 0.8rem; opacity: 0.7; word-break: break-all;">
        Hash: ${data.hash ? data.hash.substring(0, 8) + "..." : "N/A"}
      </div>
    `;

  } catch (err) {
    resultBox.style.display = "block";
    resultBox.className = "error";
    resultBox.textContent = err.message;
  } finally {
    verifyBtn.disabled = false;
    verifyBtn.textContent = "Verify Integrity";
  }
};
