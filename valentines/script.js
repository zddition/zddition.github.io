// ===============================
// Customize these 👇
// ===============================
const PASSPHRASE = "orange"; // e.g. "ourfirstdate" (leave "" to disable)
const stops = [
  { time: "12:00 AM", title: "Cuddle!", details: "We start with an 8-hour cuddle session through the night" },
  { time: "8:00 AM", title: "Wake! + Breakfast!", details: "We can sleep in if we want, but we might miss these delicious pastries! https://saltedbutter.co/" },
  { time: "10:30 AM", title: "Board Games!", details: "Bring your rummikub set. I'm getting my revenge :)" },
  { time: "1:00 PM", title: "Lunch!", details: "Delicious sushi at https://sugarfishsushi.com/. There is no reservation available so it might be a wait. But from what I've heard, definitely worth it. Or if you would prefer a more concrete plan, I can make a reservation at a specific place." },
  { time: "3:00 PM", title: "Museum!", details: "Gauri's choice! We can visit the Norton Simon Museum or watch a movie at home!" },
  { time: "7:00 PM", title: "Dinner!", details: "Tea / playlist / talk about our favorite moment of the day." },
  { time: "9:00 PM", title: "Unwind", details: "Tea / playlist / talk about our favorite moment of the day." }
];

const defaultPromises = [
  "100 kisses :* Each.",
  '100 "I love yous"',
  "100 jumping jacks",
  "100 minutes of me staring into your eyes",
  "100 butt-touches",
  "100 sips of water",
  "100 
];

// ===============================
// UI wiring
// ===============================
const gate = document.getElementById("gate");
const content = document.getElementById("content");
const enterBtn = document.getElementById("enterBtn");
const passInput = document.getElementById("pass");
const timeline = document.getElementById("timeline");
const promisesEl = document.getElementById("promises");
const addPromiseBtn = document.getElementById("addPromiseBtn");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const noText = document.getElementById("noText");
const replayBtn = document.getElementById("replayBtn");
const confettiToggle = document.getElementById("confettiToggle");

// Gate behavior
enterBtn.addEventListener("click", () => {
  const ok = !PASSPHRASE || passInput.value.trim() === PASSPHRASE;
  if (!ok) {
    wiggle(gate);
    passInput.focus();
    return;
  }
  gate.classList.add("hidden");
  content.classList.remove("hidden");
  if (confettiToggle.checked) startConfettiBurst();
});

passInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") enterBtn.click();
});

// Build timeline
function renderStops() {
  timeline.innerHTML = "";
  stops.forEach((s, idx) => {
    const li = document.createElement("li");
    li.className = "stop";
    li.innerHTML = `
      <button type="button" aria-expanded="false">
        <div class="title">
          <span class="badge">${escapeHtml(s.time)}</span>
          <span>${escapeHtml(s.title)}</span>
          <span class="badge">${escapeHtml(s.badge)}</span>
        </div>
        <span class="chev">›</span>
      </button>
      <div class="details">${escapeHtml(s.details)}</div>
    `;
    const btn = li.querySelector("button");
    btn.addEventListener("click", () => {
      const open = li.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      if (open && confettiToggle.checked) startConfettiBurst(18);
    });
    timeline.appendChild(li);

    // Slight entrance animation
    li.animate(
      [{ transform: "translateY(8px)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 }],
      { duration: 280 + idx * 40, easing: "cubic-bezier(.2,.8,.2,1)", fill: "both" }
    );
  });
}
renderStops();

// Promises
let promises = load("promises") ?? defaultPromises.slice();
function renderPromises() {
  promisesEl.innerHTML = "";
  promises.forEach((p, i) => {
    const li = document.createElement("li");
    li.textContent = p;
    li.title = "Tap to remove";
    li.style.cursor = "pointer";
    li.addEventListener("click", () => {
      promises.splice(i, 1);
      save("promises", promises);
      renderPromises();
    });
    promisesEl.appendChild(li);
  });
}
renderPromises();

addPromiseBtn.addEventListener("click", () => {
  const p = prompt("Add a new promise 💞 (tap an existing one to remove)");
  if (!p) return;
  promises.unshift(p.trim());
  save("promises", promises);
  renderPromises();
  if (confettiToggle.checked) startConfettiBurst(24);
});

// Cute yes/no
yesBtn.addEventListener("click", () => {
  yesBtn.textContent = "YAY 💘";
  yesBtn.disabled = true;
  noBtn.disabled = true;
  noText.textContent = "Correct choice. See you soon 😌";
  if (confettiToggle.checked) startConfettiBurst(60);
});

let noCount = 0;
const noLines = [
  "hmm… try again 😇",
  "are you *sure*? 🥺",
  "that button seems suspicious…",
  "this is a yes-only zone 😌",
  "ok but what if… yes?",
];

noBtn.addEventListener("click", () => {
  noCount++;
  noText.textContent = noLines[Math.min(noCount - 1, noLines.length - 1)];
  // make the "No" button dodge a bit
  const dx = (Math.random() * 2 - 1) * 120;
  const dy = (Math.random() * 2 - 1) * 70;
  noBtn.style.transform = `translate(${dx}px, ${dy}px)`;
  if (confettiToggle.checked) startConfettiBurst(8);
});

// Replay
replayBtn.addEventListener("click", () => {
  document.querySelectorAll(".stop").forEach((el) => el.classList.remove("open"));
  noCount = 0;
  noBtn.style.transform = "translate(0,0)";
  yesBtn.disabled = false; yesBtn.textContent = "Yes";
  noBtn.disabled = false;
  noText.textContent = "";
  if (confettiToggle.checked) startConfettiBurst(40);
});

// ===============================
// Confetti (tiny canvas effect)
// ===============================
const canvas = document.getElementById("confetti");
const ctx = canvas.getContext("2d");
let particles = [];
let raf = null;

function resize() {
  canvas.width = Math.floor(window.innerWidth * devicePixelRatio);
  canvas.height = Math.floor(window.innerHeight * devicePixelRatio);
}
window.addEventListener("resize", resize);
resize();

function startConfettiBurst(n = 30) {
  for (let i = 0; i < n; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: -20 * devicePixelRatio,
      vx: (Math.random() * 2 - 1) * 2.2 * devicePixelRatio,
      vy: (Math.random() * 1 + 2.5) * devicePixelRatio,
      r: (Math.random() * 3 + 2) * devicePixelRatio,
      a: 1,
      rot: Math.random() * Math.PI,
      vr: (Math.random() * 2 - 1) * 0.06,
      // avoid fixed colors: choose from a small palette via HSL randomness
      hue: 280 + Math.random() * 120,
    });
  }
  if (!raf) raf = requestAnimationFrame(tick);
}

function tick() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles = particles.filter(p => p.a > 0.02 && p.y < canvas.height + 40 * devicePixelRatio);

  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.vy *= 1.01;
    p.rot += p.vr;
    p.a *= 0.985;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = p.a;
    ctx.fillStyle = `hsl(${p.hue} 90% 65%)`;
    ctx.fillRect(-p.r, -p.r, p.r * 2, p.r * 2);
    ctx.restore();
  }

  if (particles.length) {
    raf = requestAnimationFrame(tick);
  } else {
    cancelAnimationFrame(raf);
    raf = null;
  }
}

// ===============================
// Helpers
// ===============================
function wiggle(el) {
  el.animate(
    [
      { transform: "translateX(0)" },
      { transform: "translateX(-8px)" },
      { transform: "translateX(8px)" },
      { transform: "translateX(-5px)" },
      { transform: "translateX(5px)" },
      { transform: "translateX(0)" },
    ],
    { duration: 360, easing: "cubic-bezier(.2,.8,.2,1)" }
  );
}

function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}
function load(key) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  } catch { return null; }
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c])
  );
}
