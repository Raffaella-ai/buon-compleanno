const starsLayer = document.getElementById("starsLayer");
const countdown = document.getElementById("countdown");
const birthdayTitle = document.getElementById("birthdayTitle");
const birthdaySubtitle = document.getElementById("birthdaySubtitle");
const introScreen = document.getElementById("introScreen");
const cakeScreen = document.getElementById("cakeScreen");
const cakeImage = document.getElementById("cakeImage");
const cakeFallback = document.getElementById("cakeFallback");
const canvas = document.getElementById("fireworksCanvas");
const ctx = canvas.getContext("2d");

let particles = [];
let animationId = null;
let fireworksTimer = null;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createStars() {
  starsLayer.innerHTML = "";

  const isMobile = window.innerWidth < 640;
  const amount = isMobile ? 90 : 150;

  for (let i = 0; i < amount; i++) {
    const star = document.createElement("span");
    star.className = "star";

    const size = Math.random() > 0.86 ? 3 : 2;

    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.setProperty("--size", `${size}px`);
    star.style.setProperty("--opacity", `${0.35 + Math.random() * 0.65}`);
    star.style.setProperty("--duration", `${2 + Math.random() * 4}s`);
    star.style.setProperty("--delay", `${Math.random() * 2}s`);

    starsLayer.appendChild(star);
  }
}

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;

  canvas.width = window.innerWidth * ratio;
  canvas.height = window.innerHeight * ratio;

  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;

  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function createFirework(x, y) {
  const colors = [
    "#ffffff",
    "#f9a8d4",
    "#f472b6",
    "#facc15",
    "#93c5fd",
    "#c4b5fd"
  ];

  const color = colors[Math.floor(Math.random() * colors.length)];
  const amount = window.innerWidth < 640 ? 54 : 82;

  for (let i = 0; i < amount; i++) {
    const angle = (Math.PI * 2 * i) / amount;
    const speed = 1.8 + Math.random() * 4.8;
    const spread = 0.78 + Math.random() * 0.5;

    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed * spread,
      vy: Math.sin(angle) * speed * spread,
      gravity: 0.028 + Math.random() * 0.018,
      friction: 0.985,
      alpha: 1,
      life: 74 + Math.random() * 34,
      maxLife: 100,
      color,
      size: 1.2 + Math.random() * 2.4
    });
  }
}

function animateFireworks() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  ctx.globalCompositeOperation = "lighter";

  particles = particles.filter((particle) => {
    particle.vx *= particle.friction;
    particle.vy *= particle.friction;
    particle.vy += particle.gravity;

    particle.x += particle.vx;
    particle.y += particle.vy;

    particle.life -= 1;
    particle.alpha = Math.max(particle.life / particle.maxLife, 0);

    ctx.globalAlpha = particle.alpha;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fillStyle = particle.color;
    ctx.shadowBlur = 22;
    ctx.shadowColor = particle.color;
    ctx.fill();

    return particle.life > 0;
  });

  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";

  if (particles.length > 0 || fireworksTimer) {
    animationId = requestAnimationFrame(animateFireworks);
  } else {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    animationId = null;
  }
}

function startFireworks(duration = 4600) {
  fireworksTimer = setInterval(() => {
    const x = window.innerWidth * (0.16 + Math.random() * 0.68);
    const y = window.innerHeight * (0.12 + Math.random() * 0.38);

    createFirework(x, y);

    if (!animationId) {
      animateFireworks();
    }
  }, 330);

  setTimeout(() => {
    clearInterval(fireworksTimer);
    fireworksTimer = null;
  }, duration);
}

async function runCountdown() {
  const numbers = ["3", "2", "1"];

  for (const number of numbers) {
    countdown.textContent = number;
    countdown.classList.remove("countdown-bump");

    void countdown.offsetWidth;

    countdown.classList.add("countdown-bump");
    await wait(900);
  }

  countdown.classList.add("opacity-0", "scale-90");
  await wait(450);

  birthdayTitle.classList.add("title-glow");
  await wait(450);

  birthdaySubtitle.classList.add("subtitle-show");
  await wait(900);

  startFireworks(4800);
  await wait(5200);

  introScreen.classList.add("intro-hidden");
  await wait(700);

  cakeScreen.classList.add("cake-visible");
}

function setupCakeImage() {
  if (!cakeImage) return;

  const showRealCake = () => {
    cakeImage.classList.remove("hidden");
    cakeFallback.classList.add("hidden");
  };

  if (cakeImage.complete && cakeImage.naturalWidth > 0) {
    showRealCake();
  } else {
    cakeImage.addEventListener("load", showRealCake);
  }
}

window.addEventListener("resize", () => {
  resizeCanvas();
  createStars();
});

createStars();
resizeCanvas();
setupCakeImage();
runCountdown();