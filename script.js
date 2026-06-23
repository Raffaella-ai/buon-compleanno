document.addEventListener("DOMContentLoaded", () => {
    // ===== RIFERIMENTI DOM =====
    const countdownLayer = document.getElementById("countdown-layer");
    const countdownNumber = document.getElementById("countdown-number");
    const greetingLayer = document.getElementById("greeting-layer");
    const cakeImg = document.getElementById("cake-img");
    const cakePlaceholder = document.getElementById("cake-placeholder");
    const canvas = document.getElementById("fireworks-canvas");
    const ctx = canvas.getContext("2d");

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ===== CANVAS RESIZE =====
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
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
    let animationFrameId;
    let fireworksActive = true; // per fermare l'animazione fuori dal viewport

    class Particle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
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
            this.vx *= 0.98;
            this.vy *= 0.98;
            this.vy += this.gravity;
            this.x += this.vx;
            this.y += this.vy;
            this.alpha -= this.fade;
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
        const colors = ["#FBBF24", "#FDE68A", "#FBCFE8", "#F472B6", "#FFFFFF"];
        const chosenColor = colors[Math.floor(Math.random() * colors.length)];
        const count = window.innerWidth < 768 ? 40 : 75;
        for (let i = 0; i < count; i++) {
            particles.push(new Particle(x, y, chosenColor));
        }
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
            animationFrameId = requestAnimationFrame(tick);
        }
        tick();
    }

    // Ferma i fuochi quando la sezione torta esce dal viewport (risparmio batteria mobile)
    const heroSection = document.getElementById("hero-birthday-section");
    if (heroSection) {
        const heroObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                fireworksActive = entry.isIntersecting;
            });
        }, { threshold: 0.1 });
        heroObserver.observe(heroSection);
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
                desireText.innerHTML = "Che ogni tuo desiderio possa trovare sempre la strada per avverarsi. <span class='text-pink-300'>✨</span>";
                desireText.classList.remove("opacity-0");
                desireText.classList.add("text-transparent", "bg-clip-text", "bg-gradient-to-r", "from-pink-200", "to-amber-200", "font-serif", "italic");

                const scrollBtn = document.getElementById("scroll-to-stars");
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

    // Scroll dalla torta alle stelle
    const scrollToStarsBtn = document.getElementById("scroll-to-stars");
    const starsSection = document.getElementById("stars-section");
    if (scrollToStarsBtn && starsSection) {
        scrollToStarsBtn.addEventListener("click", () => {
            starsSection.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    }

    // ===== SEZIONE 2: 30 STELLE INTERATTIVE =====
    const starsGrid = document.getElementById("stars-grid");
    const starsCount = document.getElementById("stars-count");
    const surpriseContent = document.getElementById("surprise-content");
    const scrollToLetter = document.getElementById("scroll-to-letter");

    // Le TUE frasi brevi (mettine quante ne hai)
    const frasi = [
        "Il tuo sorriso 🤍",
        "Quella volta che ridevamo senza motivo",
        "Sei casa",
        "Le tue mani",
        "Ogni giorno con te",
        "Il modo in cui mi guardi"
    ];

    const effetti = [
        () => `<span class="heart-beat text-3xl">❤️</span>`,
        () => `<span class="heart-beat text-3xl">💫</span>`,
        () => `<span class="text-3xl">🌹</span>`,
        () => `<span class="text-3xl">✨</span>`,
        () => `<span class="text-3xl">🥂</span>`,
        () => `<span class="text-2xl">30 ✨</span>`
    ];

    const TOTAL_STARS = 30;
    let litStars = 0;

    function buildSurprises() {
        const deck = [];
        frasi.forEach(f => deck.push({ type: "text", value: f }));
        while (deck.length < TOTAL_STARS) {
            const fx = effetti[Math.floor(Math.random() * effetti.length)];
            deck.push({ type: "fx", value: fx });
        }
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
            surpriseContent.textContent = item.value;
        } else {
            surpriseContent.innerHTML = item.value();
        }
        surpriseContent.classList.add("surprise-enter");
    }

    if (starsGrid) {
        for (let i = 0; i < TOTAL_STARS; i++) {
            const star = document.createElement("button");
            star.className = "sky-star";
            star.textContent = "★";
            star.setAttribute("aria-label", "Accendi una stella");

            star.addEventListener("click", () => {
                if (star.classList.contains("lit")) {
                    showSurprise(surprises[i]);
                    return;
                }
                star.classList.add("lit");
                litStars++;
                starsCount.textContent = String(litStars).padStart(2, "0");
                showSurprise(surprises[i]);
                if (litStars === TOTAL_STARS) onAllStarsLit();
            });

            starsGrid.appendChild(star);
        }
    }

    function onAllStarsLit() {
        surpriseContent.classList.remove("surprise-enter");
        void surpriseContent.offsetWidth;
        surpriseContent.innerHTML = `<span class="heart-beat text-2xl text-transparent bg-clip-text bg-gradient-to-r from-pink-200 to-amber-200 font-serif italic">Ti amo 🤍</span>`;
        surpriseContent.classList.add("surprise-enter");

        if (scrollToLetter) {
            scrollToLetter.classList.remove("hidden");
            setTimeout(() => scrollToLetter.classList.remove("opacity-0", "translate-y-4"), 400);
        }
    }

    // Scroll dalle stelle alla lettera
    const letterSectionTarget = document.getElementById("letter-section");
    if (scrollToLetter) {
        scrollToLetter.addEventListener("click", () => {
            if (letterSectionTarget) letterSectionTarget.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    }

    // ===== SEZIONE 3: LETTERA (macchina da scrivere) =====
    const letterCard = document.getElementById("letter-card");
    const letterText = document.getElementById("letter-text");
    const letterCursor = document.getElementById("letter-cursor");
    const letterSignature = document.getElementById("letter-signature");
    const scrollToLoveFromLetter = document.getElementById("scroll-to-love-from-letter");

    const messaggio = "Trent'anni.\n\nMi fermo un attimo a pensare a quanto sia bello aver attraversato una parte di questi anni accanto a te.\n\nNon ho regali grandi abbastanza, così ho scelto le parole.\n\nBuon compleanno, amore mio.";

    let typingStarted = false;

    function revealLetterArrow() {
        if (!scrollToLoveFromLetter) return;
        scrollToLoveFromLetter.classList.remove("hidden");
        setTimeout(() => scrollToLoveFromLetter.classList.remove("opacity-0", "translate-y-4"), 300);
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
                        if (prefersReducedMotion) {
                            showLetterInstantly();
                        } else {
                            setTimeout(() => typeWriter(messaggio, letterText), 500);
                        }
                    }
                }
            });
        }, { threshold: 0.3 });
        letterObserver.observe(letterCard);
    }

    if (scrollToLoveFromLetter) {
        scrollToLoveFromLetter.addEventListener("click", () => {
            const loveSection = document.getElementById("love-section");
            if (loveSection) loveSection.scrollIntoView({ behavior: "smooth", block: "start" });
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
