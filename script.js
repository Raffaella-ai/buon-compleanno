document.addEventListener("DOMContentLoaded", () => {
    // ===== RIFERIMENTI DOM =====
    const countdownLayer = document.getElementById("countdown-layer");
    const countdownNumber = document.getElementById("countdown-number");
    const greetingLayer = document.getElementById("greeting-layer");
    const cakeImg = document.getElementById("cake-img");
    const cakePlaceholder = document.getElementById("cake-placeholder");
    const canvas = document.getElementById("fireworks-canvas");
    const ctx = canvas.getContext("2d");
    const fxCanvas = document.getElementById("effects-canvas");
    const fxCtx = fxCanvas.getContext("2d");

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ===== CANVAS RESIZE =====
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        fxCanvas.width = window.innerWidth;
        fxCanvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // ===== FALLBACK TORTA =====
    if (cakeImg) {
        cakeImg.onload = function() {
            cakeImg.classList.remove("hidden");
            if (cakePlaceholder) cakePlaceholder.classList.add("hidden");
        };
        cakeImg.onerror = function() { console.log("Uso del fallback per la torta."); };
        cakeImg.src = cakeImg.getAttribute("src");
    }

    // ===== COUNTDOWN =====
    let currentCount = 3;
    const countdownInterval = setInterval(() => {
        currentCount--;
        countdownNumber.style.transform = "scale(0.5)";
        countdownNumber.style.opacity = "0";
        setTimeout(() => {
            if (currentCount > 0) {
                countdownNumber.textContent = currentCount;
                countdownNumber.style.transform = "scale(1)";
                countdownNumber.style.opacity = "1";
            } else {
                clearInterval(countdownInterval);
                startMainScene();
            }
        }, 200);
    }, 1200);

    function startMainScene() {
        countdownLayer.classList.add("scale-150", "opacity-0");
        setTimeout(() => {
            countdownLayer.classList.add("hidden");
            greetingLayer.classList.remove("hidden");
            greetingLayer.classList.add("flex");
            startFireworks();
        }, 500);
    }

    // ===== FUOCHI D'ARTIFICIO =====
    let particles = [];
    let fireworksActive = true;

    class Particle {
        constructor(x, y, color) {
            this.x = x; this.y = y;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 1;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.gravity = 0.04;
            this.alpha = 1;
            this.fade = Math.random() * 0.015 + 0.008;
            this.color = color;
            this.size = Math.random() * 1.5 + 1;
        }
        update() {
            this.vx *= 0.98; this.vy *= 0.98; this.vy += this.gravity;
            this.x += this.vx; this.y += this.vy; this.alpha -= this.fade;
            if (this.size > 0.1) this.size -= 0.01;
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.shadowBlur = 6;
            ctx.shadowColor = this.color;
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.restore();
        }
    }

    function spawnFirework() {
        const x = Math.random() * (canvas.width * 0.6) + (canvas.width * 0.2);
        const y = Math.random() * (canvas.height * 0.4) + (canvas.height * 0.15);
        // Palette rosso/oro/crema
        const colors = ["#dc2626", "#f87171", "#fbbf24", "#fde68a", "#fecaca", "#FFFFFF"];
        const chosenColor = colors[Math.floor(Math.random() * colors.length)];
        const count = window.innerWidth < 768 ? 40 : 75;
        for (let i = 0; i < count; i++) particles.push(new Particle(x, y, chosenColor));
    }

    function startFireworks() {
        spawnFirework();
        setTimeout(spawnFirework, 400);
        setTimeout(spawnFirework, 900);
        setInterval(() => {
            if (fireworksActive && particles.length < 300) spawnFirework();
        }, 1800);

        function tick() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles = particles.filter(p => p.alpha > 0);
            particles.forEach(p => { p.update(); p.draw(); });
            requestAnimationFrame(tick);
        }
        tick();
    }

    const heroSection = document.getElementById("hero-birthday-section");
    if (heroSection) {
        const heroObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => { fireworksActive = entry.isIntersecting; });
        }, { threshold: 0.1 });
        heroObserver.observe(heroSection);
    }

    // ===== EFFETTI STELLE: PALLONCINI E CORIANDOLI (canvas dedicato) =====
    let fxItems = [];
    let fxRunning = false;

    class Balloon {
        constructor(x) {
            this.x = x;
            this.y = fxCanvas.height + 40;
            this.vy = -(Math.random() * 1.5 + 2);
            this.sway = Math.random() * 2 * Math.PI;
            this.swaySpeed = Math.random() * 0.03 + 0.01;
            this.r = Math.random() * 12 + 16;
            const palette = ["#dc2626", "#ef4444", "#fbbf24", "#f87171", "#fecaca"];
            this.color = palette[Math.floor(Math.random() * palette.length)];
            this.alpha = 1;
        }
        update() {
            this.y += this.vy;
            this.sway += this.swaySpeed;
            this.x += Math.sin(this.sway) * 0.6;
            if (this.y < -60) this.alpha = 0;
        }
        draw() {
            fxCtx.save();
            fxCtx.globalAlpha = this.alpha;
            // corpo palloncino
            fxCtx.beginPath();
            fxCtx.ellipse(this.x, this.y, this.r * 0.8, this.r, 0, 0, Math.PI * 2);
            fxCtx.fillStyle = this.color;
            fxCtx.shadowBlur = 12;
            fxCtx.shadowColor = this.color;
            fxCtx.fill();
            // filo
            fxCtx.beginPath();
            fxCtx.moveTo(this.x, this.y + this.r);
            fxCtx.lineTo(this.x + Math.sin(this.sway) * 4, this.y + this.r + 18);
            fxCtx.strokeStyle = "rgba(255,255,255,0.4)";
            fxCtx.lineWidth = 1;
            fxCtx.stroke();
            fxCtx.restore();
        }
    }

    class Confetto {
        constructor(x, y) {
            this.x = x; this.y = y;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6 + 3;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed - 4;
            this.gravity = 0.15;
            this.size = Math.random() * 6 + 4;
            this.rot = Math.random() * Math.PI;
            this.rotSpeed = (Math.random() - 0.5) * 0.3;
            const palette = ["#dc2626", "#fbbf24", "#f87171", "#fde68a", "#ffffff", "#ef4444"];
            this.color = palette[Math.floor(Math.random() * palette.length)];
            this.alpha = 1;
        }
        update() {
            this.vy += this.gravity;
            this.x += this.vx; this.y += this.vy;
            this.rot += this.rotSpeed;
            this.alpha -= 0.008;
        }
        draw() {
            fxCtx.save();
            fxCtx.globalAlpha = Math.max(0, this.alpha);
            fxCtx.translate(this.x, this.y);
            fxCtx.rotate(this.rot);
            fxCtx.fillStyle = this.color;
            fxCtx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 0.5);
            fxCtx.restore();
        }
    }

    function launchBalloons(originX) {
        for (let i = 0; i < 14; i++) {
            const x = originX + (Math.random() - 0.5) * 200;
            fxItems.push(new Balloon(x));
        }
        ensureFxRunning();
    }

    function launchConfetti(originX, originY) {
        const count = 80;
        for (let i = 0; i < count; i++) fxItems.push(new Confetto(originX, originY));
        ensureFxRunning();
    }

    function ensureFxRunning() {
        if (fxRunning) return;
        fxRunning = true;
        function tick() {
            fxCtx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
            fxItems = fxItems.filter(it => it.alpha > 0);
            fxItems.forEach(it => { it.update(); it.draw(); });
            if (fxItems.length > 0) {
                requestAnimationFrame(tick);
            } else {
                fxRunning = false;
                fxCtx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
            }
        }
        tick();
    }

    // ===== SOFFIO CANDELINE =====
    const blowButton = document.getElementById("blow-button");
    const flames = document.querySelectorAll(".flame");
    const smokes = document.querySelectorAll(".smoke-puff");
    const desireText = document.getElementById("desire-text");

    if (blowButton) {
        blowButton.addEventListener("click", () => {
            if (blowButton.disabled) return;
            blowButton.disabled = true;
            blowButton.classList.add("opacity-0", "scale-95", "pointer-events-none");
            flames.forEach((flame) => {
                flame.style.animation = "";
                flame.classList.remove("flame-extinct", "animate-flame-blown");
                void flame.offsetWidth;
                flame.classList.add("animate-flame-blown");
            });
            flames.forEach((flame, index) => {
                setTimeout(() => {
                    flame.classList.remove("animate-flame-blown");
                    flame.classList.add("flame-extinct");
                    if (smokes[index]) smokes[index].classList.add("smoke-active");
                    if (index === flames.length - 1) triggerFinalRomanceEffects();
                }, 400 + index * 250);
            });
        });
    }

    function triggerFinalRomanceEffects() {
        if (desireText) {
            desireText.classList.add("opacity-0");
            setTimeout(() => {
                desireText.innerHTML = "Che ogni tuo desiderio possa trovare sempre la strada per avverarsi. <span class='text-rose-300'>✨</span>";
                desireText.classList.remove("opacity-0");
                desireText.classList.add("text-transparent", "bg-clip-text", "bg-gradient-to-r", "from-rose-200", "to-amber-100", "font-title", "italic");
                const scrollBtn = document.getElementById("scroll-to-letter");
                if (scrollBtn) {
                    scrollBtn.classList.remove("hidden");
                    setTimeout(() => {
                        scrollBtn.classList.remove("opacity-0", "translate-y-4");
                        scrollBtn.classList.add("opacity-100", "translate-y-0");
                    }, 400);
                }
            }, 1000);
        }
    }

    // Scroll dalla torta alla lettera
    const scrollToLetterBtn = document.getElementById("scroll-to-letter");
    const letterSection = document.getElementById("letter-section");
    if (scrollToLetterBtn && letterSection) {
        scrollToLetterBtn.addEventListener("click", () => {
            letterSection.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    }

    // ===== SEZIONE 2: LETTERA (macchina da scrivere) =====
    const letterCard = document.getElementById("letter-card");
    const letterText = document.getElementById("letter-text");
    const letterCursor = document.getElementById("letter-cursor");
    const letterSignature = document.getElementById("letter-signature");
    const scrollToStarsFromLetter = document.getElementById("scroll-to-stars-from-letter");

    const messaggio = "Trent'anni.\n\nMi fermo un attimo a pensare a quanto sia bello aver attraversato una parte di questi anni accanto a te.\n\nNon ho regali grandi abbastanza, così ho scelto le parole.\n\nBuon compleanno, amore mio.";

    let typingStarted = false;

    function revealLetterArrow() {
        if (!scrollToStarsFromLetter) return;
        scrollToStarsFromLetter.classList.remove("hidden");
        setTimeout(() => scrollToStarsFromLetter.classList.remove("opacity-0", "translate-y-4"), 300);
    }

    function typeWriter(text, element, speed = 28) {
        let i = 0;
        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                const char = text.charAt(i - 1);
                const delay = (char === "." || char === "\n") ? speed * 5 : speed;
                setTimeout(type, delay);
            } else {
                if (letterCursor) letterCursor.style.opacity = "0";
                if (letterSignature) letterSignature.style.opacity = "1";
                setTimeout(revealLetterArrow, 800);
            }
        }
        type();
    }

    function showLetterInstantly() {
        letterText.textContent = messaggio;
        if (letterCursor) letterCursor.style.opacity = "0";
        if (letterSignature) letterSignature.style.opacity = "1";
        revealLetterArrow();
    }

    if (letterCard) {
        const letterObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    letterCard.classList.remove("opacity-0", "translate-y-6");
                    if (!typingStarted) {
                        typingStarted = true;
                        if (prefersReducedMotion) showLetterInstantly();
                        else setTimeout(() => typeWriter(messaggio, letterText), 500);
                    }
                }
            });
        }, { threshold: 0.3 });
        letterObserver.observe(letterCard);
    }

    if (scrollToStarsFromLetter) {
        scrollToStarsFromLetter.addEventListener("click", () => {
            const starsSection = document.getElementById("stars-section");
            if (starsSection) starsSection.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    }

    // ===== SEZIONE 3: 30 STELLE INTERATTIVE =====
    const starsGrid = document.getElementById("stars-grid");
    const starsCount = document.getElementById("stars-count");
    const surpriseContent = document.getElementById("surprise-content");
    const scrollToLove = document.getElementById("scroll-to-love");

    // ---- PERSONALIZZA QUI ----
    // Frasi brevi
    const frasi = [
        "Il tuo sorriso 🤍",
        "Quella volta che ridevamo senza motivo",
        "Sei casa",
        "Le tue mani",
        "Ogni giorno con te",
        "Il modo in cui mi guardi"
    ];

    // Foto: metti i file in assets/images/ e scrivi qui i percorsi.
    // Lascia l'array vuoto [] se per ora non hai foto: il codice le salta da solo.
    const foto = [
        "assets/images/foto1.jpg",
        "assets/images/foto2.jpg",
        "assets/images/foto3.jpg"
    ];

    // Effetti visivi puri
    const effetti = [
        () => `<span class="heart-beat text-4xl">❤️</span>`,
        () => `<span class="heart-beat text-4xl">💫</span>`,
        () => `<span class="text-4xl">🌹</span>`,
        () => `<span class="text-4xl">🥂</span>`,
        () => `<span class="text-3xl font-title">30 ✨</span>`
    ];
    // --------------------------

    const TOTAL_STARS = 30;
    let litStars = 0;

    // Costruisce il mazzo di 30 sorprese, marcando alcune come "special" (con effetto a tutto schermo)
    function buildSurprises() {
        const deck = [];
        frasi.forEach(f => deck.push({ type: "text", value: f }));
        foto.forEach(src => deck.push({ type: "photo", value: src }));

        // Riempie il resto con effetti finché non arriva a 30
        while (deck.length < TOTAL_STARS) {
            const fx = effetti[Math.floor(Math.random() * effetti.length)];
            deck.push({ type: "fx", value: fx });
        }
        deck.length = TOTAL_STARS;

        // Marca alcune stelle come "special": al click lanciano palloncini o coriandoli
        // Ne assegniamo ~6 a caso
        const specials = ["balloons", "confetti", "balloons", "confetti", "confetti", "balloons"];
        // Mescola il mazzo
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        // Assegna gli effetti speciali alle prime N posizioni dopo il mescolamento
        specials.forEach((effect, idx) => {
            if (deck[idx]) deck[idx].special = effect;
        });
        // Rimescola di nuovo così le special non sono tutte insieme
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    }

    const surprises = buildSurprises();

    function showSurprise(item) {
        surpriseContent.classList.remove("surprise-enter");
        void surpriseContent.offsetWidth;
        if (item.type === "text") {
            surpriseContent.innerHTML = `<span>${item.value}</span>`;
        } else if (item.type === "photo") {
            surpriseContent.innerHTML = `<img src="${item.value}" alt="Ricordo" class="surprise-photo" onerror="this.parentElement.innerHTML='<span class=&quot;text-3xl&quot;>📷 ✨</span>'">`;
        } else {
            surpriseContent.innerHTML = item.value();
        }
        surpriseContent.classList.add("surprise-enter");
    }

    // Trova le coordinate del centro di un elemento (per far partire l'effetto da lì)
    function centerOf(el) {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }

    function triggerStarEffect(effect, star) {
        if (prefersReducedMotion) return;
        const c = centerOf(star);
        if (effect === "balloons") launchBalloons(c.x);
        else if (effect === "confetti") launchConfetti(c.x, c.y);
    }

    if (starsGrid) {
        for (let i = 0; i < TOTAL_STARS; i++) {
            const star = document.createElement("button");
            star.className = "sky-star";
            if (surprises[i].special) star.classList.add("special");
            star.textContent = "★";
            star.setAttribute("aria-label", "Accendi una stella");

            star.addEventListener("click", () => {
                if (star.classList.contains("lit")) {
                    showSurprise(surprises[i]);
                    if (surprises[i].special) triggerStarEffect(surprises[i].special, star);
                    return;
                }
                star.classList.add("lit");
                litStars++;
                starsCount.textContent = String(litStars).padStart(2, "0");
                showSurprise(surprises[i]);
                if (surprises[i].special) triggerStarEffect(surprises[i].special, star);
                if (litStars === TOTAL_STARS) onAllStarsLit();
            });

            starsGrid.appendChild(star);
        }
    }

    function onAllStarsLit() {
        surpriseContent.classList.remove("surprise-enter");
        void surpriseContent.offsetWidth;
        surpriseContent.innerHTML = `<span class="heart-beat text-3xl text-transparent bg-clip-text bg-gradient-to-r from-rose-200 to-amber-100 font-title italic">Ti amo 🤍</span>`;
        surpriseContent.classList.add("surprise-enter");
        // Gran finale di coriandoli
        if (!prefersReducedMotion) {
            launchConfetti(window.innerWidth / 2, window.innerHeight / 2);
            setTimeout(() => launchBalloons(window.innerWidth / 2), 300);
        }
        if (scrollToLove) {
            scrollToLove.classList.remove("hidden");
            setTimeout(() => scrollToLove.classList.remove("opacity-0", "translate-y-4"), 400);
        }
    }

    // Scroll dalle stelle al "Ti amo"
    const loveSectionTarget = document.getElementById("love-section");
    if (scrollToLove) {
        scrollToLove.addEventListener("click", () => {
            if (loveSectionTarget) loveSectionTarget.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    }

    // ===== SEZIONE 4: TI AMO + ROSA =====
    const loveTitle = document.getElementById("love-title");
    const loveSub = document.getElementById("love-sub");
    const roseSvg = document.getElementById("rose-svg");
    const loveSec = document.getElementById("love-section");

    if (loveSec) {
        let bloomed = false;
        const loveObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && !bloomed) {
                    bloomed = true;
                    if (loveTitle) loveTitle.classList.remove("opacity-0", "translate-y-6");
                    setTimeout(() => { if (roseSvg) roseSvg.classList.add("bloomed"); }, 600);
                    setTimeout(() => { if (loveSub) loveSub.classList.remove("opacity-0"); }, 3200);
                }
            });
        }, { threshold: 0.35 });
        loveObserver.observe(loveSec);
    }

});
