const scene = document.querySelector(".scene");
const starsContainer = document.getElementById("stars");
const countdownEl = document.getElementById("countdown");
const birthdayTitle = document.getElementById("birthdayTitle");
const intro = document.getElementById("intro");
const cakeSection = document.getElementById("cakeSection");
const canvas = document.getElementById("fireworksCanvas");
const ctx = canvas.getContext("2d");

let particles = [];
let animationFrameId = null;
let fireworksInterval = null;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createStars() {
  const starsNumber = window.innerWidth < 600 ? 75 : 120;

  for (let i = 0; i < starsNumber; i++) {
    const star = document.createElement("span");
    star.className = "star";

    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.setProperty("--duration", `${1.8 + Math.random() * 3.8}s`);
    star.style.setProperty("--opacity", `${0.35 + Math.random() * 0.65}`);

    const size = Math.random() > 0.82 ? 3 : 2;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;

    starsContainer.appendChild(star);
  }
}

function resizeCanvas() {
  const pixelRatio = window.devicePixelRatio || 1;

  canvas.width = window.innerWidth * pixelRatio;
  canvas.height = window.innerHeight * pixelRatio;

  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;

  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
}

function createFirework(x, y) {
  const colors = [
    "#ff477e",
    "#ffbe0b",
    "#ffffff",
    "#9b5de5",
    "#00f5d4",
    "#f15bb5"
  ];

  const color = colors[Math.floor(Math.random() * colors.length)];
  const particlesNumber = window.innerWidth < 600 ? 55 : 85;

  for (let i = 0; i < particlesNumber; i++) {
    const angle = Math.PI * 2 * (i / particlesNumber);
    const speed = 1.8 + Math.random() * 4.2;

    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      alpha: 1,
      life: 80 + Math.random() * 20,
      color,
      size: 1.4 + Math.random() * 2.2
    });
  }
}

function animateFireworks() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  ctx.globalCompositeOperation = "lighter";

  particles = particles.filter((particle) => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy += 0.035;
    particle.vx *= 0.99;
    particle.vy *= 0.99;
    particle.life -= 1;
    particle.alpha = Math.max(particle.life / 100, 0);

    ctx.globalAlpha = particle.alpha;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fillStyle = particle.color;
    ctx.shadowBlur = 18;
    ctx.shadowColor = particle.color;
    ctx.fill();

    return particle.life > 0;
  });

  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";

  if (particles.length > 0 || fireworksInterval) {
    animationFrameId = requestAnimationFrame(animateFireworks);
  } else {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    animationFrameId = null;
  }
}

function startFireworks(duration = 4800) {
  scene.classList.add("fireworks-on");

  fireworksInterval = setInterval(() => {
    const x = window.innerWidth * (0.15 + Math.random() * 0.7);
    const y = window.innerHeight * (0.12 + Math.random() * 0.42);

    createFirework(x, y);

    if (!animationFrameId) {
      animateFireworks();
    }
  }, 360);

  setTimeout(() => {
    clearInterval(fireworksInterval);
    fireworksInterval = null;
    scene.classList.remove("fireworks-on");
  }, duration);
}

async function startExperience() {
  const numbers = ["3", "2", "1"];

  for (const number of numbers) {
    countdownEl.textContent = number;
    countdownEl.classList.remove("pulse");

    void countdownEl.offsetWidth;

    countdownEl.classList.add("pulse");
    await wait(900);
  }

  countdownEl.classList.add("hidden");

  await wait(450);

  birthdayTitle.classList.add("show");

  await wait(900);

  startFireworks(5200);

  await wait(5200);

  intro.classList.add("hide");

  await wait(900);

  cakeSection.classList.add("show");
}

window.addEventListener("resize", resizeCanvas);

createStars();
resizeCanvas();
startExperience();