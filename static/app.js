const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const gestureEl = document.getElementById('gesture');
const transcriptEl = document.getElementById('transcript');
const startBtn = document.getElementById('startBtn');
const clearBtn = document.getElementById('clearBtn');

let transcript = '';
let lastGesture = '';
let lastRequestAt = 0;

const hands = new Hands({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7,
});

hands.onResults(onResults);

async function startCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert('Camera access is not supported in this browser.');
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' },
      audio: false,
    });

    video.srcObject = stream;
    video.onloadedmetadata = () => {
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 480;
      canvas.width = width;
      canvas.height = height;
    };

    const camera = new Camera(video, {
      onFrame: async () => {
        await hands.send({ image: video });
      },
      width: 640,
      height: 480,
    });

    camera.start();
  } catch (error) {
    console.error('Camera error:', error);
    alert('Camera access failed. Please allow permission and try again.');
  }
}

function drawHandLandmarks(results) {
  const width = canvas.width || 640;
  const height = canvas.height || 480;

  ctx.clearRect(0, 0, width, height);

  if (!results.multiHandLandmarks) {
    return;
  }

  results.multiHandLandmarks.forEach((landmarks) => {
    drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
      color: '#22c55e',
      lineWidth: 3,
    });

    landmarks.forEach((point) => {
      ctx.beginPath();
      ctx.arc(point.x * width, point.y * height, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#facc15';
      ctx.fill();
    });
  });
}

async function onResults(results) {
  const width = canvas.width || 640;
  const height = canvas.height || 480;
  ctx.clearRect(0, 0, width, height);
  drawHandLandmarks(results);

  if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
    return;
  }

  const now = performance.now();
  if (now - lastRequestAt < 350) {
    return;
  }
  lastRequestAt = now;

  const landmarks = results.multiHandLandmarks[0].map((point) => ({
    x: point.x,
    y: point.y,
    z: point.z,
  }));

  try {
    const response = await fetch('/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ landmarks }),
    });

    const data = await response.json();
    const detected = data.letter || '?';
    gestureEl.textContent = detected;

    if (detected !== '?' && detected !== lastGesture) {
      lastGesture = detected;
      transcript += detected;
      transcriptEl.textContent = transcript;

      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(detected);
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      }
    }
  } catch (error) {
    console.error('Prediction error:', error);
  }
}

startBtn.addEventListener('click', startCamera);

clearBtn.addEventListener('click', () => {
  transcript = '';
  lastGesture = '';
  transcriptEl.textContent = 'Your words will appear here.';
  gestureEl.textContent = '--';
});
