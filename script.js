document.addEventListener("DOMContentLoaded", () => {
    // ===== RIFERIMENTI DOM BASE =====
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
        cakeImg.onerror = function() { /* resta il placeholder visibile */ };
        cakeImg.src = cakeImg.getAttribute("src");
    }

    // ===== COUNTDOWN INIZIALE =====
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

    // ===== FUOCHI D'ARTIFICIO DI BACKGROUND (Sfondo Etereo) =====
    let particles = [];
    let fireworksActive = true;

    class Particle {
        constructor(x, y, color) {
            this.x = x; this.y = y;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 1;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.gravity = 0.04; this.alpha = 1;
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
            ctx.shadowBlur = 6; ctx.shadowColor = this.color;
            ctx.fillStyle = this.color; ctx.fill();
            ctx.restore();
        }
    }

    function spawnFirework() {
        const x = Math.random() * (canvas.width * 0.6) + (canvas.width * 0.2);
        const y = Math.random() * (canvas.height * 0.4) + (canvas.height * 0.15);
        const colors = ["#c41e3a", "#e8a0b0", "#e8d5a8", "#f5e9cf", "#ffffff"];
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
        new IntersectionObserver((entries) => {
            entries.forEach((e) => { fireworksActive = e.isIntersecting; });
        }, { threshold: 0.1 }).observe(heroSection);
    }

    // ===== SISTEMA DI EFFETTI PARTICOLARI SUL CANVAS SUPREMO =====
    let fxItems = [];
    let fxRunning = false;

    function ensureFxRunning() {
        if (fxRunning) return;
        fxRunning = true;
        function tick() {
            fxCtx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
            fxItems = fxItems.filter(it => it.alpha > 0 && !it.dead);
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

    // 1. Palloncini Eleganti
    class Balloon {
        constructor(x) {
            this.x = x; this.y = fxCanvas.height + 40;
            this.vy = -(Math.random() * 1.3 + 1.8);
            this.sway = Math.random() * Math.PI * 2;
            this.swaySpeed = Math.random() * 0.03 + 0.01;
            this.r = Math.random() * 10 + 14;
            const pal = ["#c41e3a", "#8b0a1e", "#e8d5a8", "#e8a0b0"];
            this.color = pal[Math.floor(Math.random() * pal.length)];
            this.alpha = 1; this.dead = false;
        }
        update() {
            this.y += this.vy; this.sway += this.swaySpeed;
            this.x += Math.sin(this.sway) * 0.5;
            if (this.y < -60) this.dead = true;
        }
        draw() {
            fxCtx.save();
            fxCtx.globalAlpha = this.alpha;
            fxCtx.beginPath();
            fxCtx.ellipse(this.x, this.y, this.r * 0.8, this.r, 0, 0, Math.PI * 2);
            fxCtx.fillStyle = this.color;
            fxCtx.shadowBlur = 10; fxCtx.shadowColor = this.color;
            fxCtx.fill();
            fxCtx.beginPath();
            fxCtx.moveTo(this.x, this.y + this.r);
            fxCtx.lineTo(this.x + Math.sin(this.sway) * 4, this.y + this.r + 16);
            fxCtx.strokeStyle = "rgba(255,255,255,0.3)";
            fxCtx.lineWidth = 1; fxCtx.stroke();
            fxCtx.restore();
        }
    }

    // 2. Coriandoli Esplosivi
    class Confetto {
        constructor(x, y) {
            this.x = x; this.y = y;
            const a = Math.random() * Math.PI * 2;
            const s = Math.random() * 6 + 3;
            this.vx = Math.cos(a) * s; this.vy = Math.sin(a) * s - 4;
            this.gravity = 0.15; this.size = Math.random() * 6 + 4;
            this.rot = Math.random() * Math.PI; this.rotSpeed = (Math.random() - 0.5) * 0.3;
            const pal = ["#c41e3a", "#e8d5a8", "#e8a0b0", "#f5e9cf", "#ffffff"];
            this.color = pal[Math.floor(Math.random() * pal.length)];
            this.alpha = 1; this.dead = false;
        }
        update() {
            this.vy += this.gravity; this.x += this.vx; this.y += this.vy;
            this.rot += this.rotSpeed; this.alpha -= 0.01;
        }
        draw() {
            fxCtx.save();
            fxCtx.globalAlpha = Math.max(0, this.alpha);
            fxCtx.translate(this.x, this.y); fxCtx.rotate(this.rot);
            fxCtx.fillStyle = this.color;
            fxCtx.fillRect(-this.size/2, -this.size/2, this.size, this.size * 0.5);
            fxCtx.restore();
        }
    }

    // 3. Cuoricini Romantici
    class Heart {
        constructor(x, y) {
            this.x = x; this.y = y;
            const a = Math.random() * Math.PI * 2;
            const s = Math.random() * 2 + 1;
            this.vx = Math.cos(a) * s; this.vy = Math.sin(a) * s - 1.5;
            this.size = Math.random() * 10 + 12;
            this.alpha = 1; this.dead = false;
        }
        update() {
            this.x += this.vx; this.y += this.vy; this.alpha -= 0.012;
        }
        draw() {
            fxCtx.save();
            fxCtx.globalAlpha = Math.max(0, this.alpha);
            fxCtx.fillStyle = "#c41e3a";
            fxCtx.shadowBlur = 8; fxCtx.shadowColor = "#c41e3a";
            fxCtx.font = `${this.size}px serif`;
            fxCtx.textAlign = "center";
            fxCtx.fillText("♥", this.x, this.y);
            fxCtx.restore();
        }
    }

    // 4. Stelline Brillanti
    class Sparkle {
        constructor(x, y) {
            this.x = x + (Math.random() - 0.5) * 80;
            this.y = y + (Math.random() - 0.5) * 80;
            this.size = Math.random() * 3 + 1;
            this.alpha = 1; this.dead = false;
            this.fade = Math.random() * 0.02 + 0.01;
            this.twinkle = Math.random() * Math.PI * 2;
        }
        update() { this.alpha -= this.fade; this.twinkle += 0.2; }
        draw() {
            fxCtx.save();
            fxCtx.globalAlpha = Math.max(0, this.alpha) * (0.5 + 0.5 * Math.sin(this.twinkle));
            fxCtx.beginPath(); fxCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            fxCtx.fillStyle = "#f5e9cf";
            fxCtx.shadowBlur = 10; fxCtx.shadowColor = "#e8d5a8";
            fxCtx.fill(); fxCtx.restore();
        }
    }

    // 5. Mini Fuochi Delicati
    class SoftSpark {
        constructor(x, y, color) {
            this.x = x; this.y = y;
            const a = Math.random() * Math.PI * 2;
            const s = Math.random() * 2.2 + 0.8;
            this.vx = Math.cos(a) * s; this.vy = Math.sin(a) * s;
            this.gravity = 0.03; this.alpha = 1;
            this.fade = Math.random() * 0.015 + 0.008;
            this.color = color; this.size = Math.random() * 1.5 + 1;
        }
        update() {
            this.vx *= 0.97; this.vy *= 0.97; this.vy += this.gravity;
            this.x += this.vx; this.y += this.vy; this.alpha -= this.fade;
        }
        draw() {
            fxCtx.save(); fxCtx.globalAlpha = Math.max(0, this.alpha);
            fxCtx.beginPath(); fxCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            fxCtx.shadowBlur = 5; fxCtx.shadowColor = this.color;
            fxCtx.fillStyle = this.color; fxCtx.fill(); fxCtx.restore();
        }
    }

    // Motore Switch per gli effetti
    function playEffect(effect, originX, originY) {
        if (prefersReducedMotion) return;
        switch (effect) {
            case "balloons":
                for (let i = 0; i < 12; i++) fxItems.push(new Balloon(originX + (Math.random() - 0.5) * 140));
                break;
            case "confetti":
                for (let i = 0; i < 60; i++) fxItems.push(new Confetto(originX, originY));
                break;
            case "hearts":
                for (let i = 0; i < 15; i++) fxItems.push(new Heart(originX, originY));
                break;
            case "sparkles":
                for (let i = 0; i < 25; i++) fxItems.push(new Sparkle(originX, originY));
                break;
            case "firework-soft": {
                const pal = ["#c41e3a", "#e8d5a8", "#e8a0b0", "#ffffff"];
                const col = pal[Math.floor(Math.random() * pal.length)];
                for (let i = 0; i < 40; i++) fxItems.push(new SoftSpark(originX, originY, col));
                break;
            }
        }
        ensureFxRunning();
    }

    // ===== GESTIONE COMPLETA SOFFIO CANDELINE =====
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
        if (!desireText) return;
        desireText.classList.add("opacity-0");
        setTimeout(() => {
            // La frase cambia mantenendo lo stesso identico font/stile, senza scatti
            desireText.innerHTML = "Che ogni tuo desiderio possa trovare sempre la strada per avverarsi. <span style='color:#e8a0b0'>✨</span>";
            desireText.style.color = "#f5e9cf"; 
            desireText.className = "text-lg md:text-xl font-title italic text-glow-champagne transition-all duration-1000 ease-in-out";
            
            // Rimuoviamo qualsiasi alterazione dello scale per farla apparire in modo liscio
            desireText.classList.remove("opacity-0");

            const scrollBtn = document.getElementById("scroll-to-letter");
            if (scrollBtn) {
                scrollBtn.classList.remove("hidden");
                setTimeout(() => { scrollBtn.classList.remove("opacity-0", "translate-y-4"); }, 400);
            }
        }, 1000);
    }

    const scrollToLetterBtn = document.getElementById("scroll-to-letter");
    const letterSection = document.getElementById("letter-section");
    if (scrollToLetterBtn && letterSection) {
        scrollToLetterBtn.addEventListener("click", () => {
            letterSection.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    }

    // ===== SEZIONE 2: LETTERA COMPLETA RIGHE PROGRESSIVE =====
    const openLetterBtn = document.getElementById("open-letter-btn");
    const envelopeClosed = document.getElementById("envelope-closed");
    const letterCard = document.getElementById("letter-card");
    const letterBody = document.getElementById("letter-body");
    const letterSignature = document.getElementById("letter-signature");
    const scrollToStarsFromLetter = document.getElementById("scroll-to-stars-from-letter");

    // MODIFICA QUI IL TESTO DELLA TUA LETTERA
    const paragrafiLettera = [
        "Ciao tesoro mio,",
        "Questa notte inizia un nuovo capitolo per te, e io volevo riempirne il primo istante con un pensiero fatto solo per te: qualcosa che avesse dentro cura, amore e un po’ di magia.",
        "Non è facile raccontare quanto una persona possa diventare speciale, ma forse certe cose non hanno bisogno di troppe spiegazioni. Si sentono, si costruiscono piano, si riconoscono nei piccoli gesti, nei ricordi, nei dettagli. E tu, nei miei dettagli, ci sei sempre di più.",
        "Oggi compi 30 anni e volevo dedicarti qualcosa che fosse unico, proprio come unico è il posto che hai preso nella mia vita. Qualcosa che parlasse di te, di noi e di tutto l’amore con cui ti guardo.",
        "Spero che entrando in questo piccolo mondo tu possa sentire almeno un po’ della cura, del bene e della magia con cui è nato.",
        "Buon compleanno amore mio."
    ];

    function buildLetterParagraphs() {
        letterBody.innerHTML = "";
        paragrafiLettera.forEach((p) => {
            const el = document.createElement("p");
            el.className = "letter-line";
            el.textContent = p;
            letterBody.appendChild(el);
        });
    }

    function revealParagraphsProgressively() {
        const lines = letterBody.querySelectorAll(".letter-line");
        lines.forEach((line, i) => {
            setTimeout(() => line.classList.add("show"), 400 + i * 750);
        });
        const totalDuration = 400 + lines.length * 750;
        setTimeout(() => { if (letterSignature) letterSignature.classList.add("show"); }, totalDuration);
        setTimeout(() => {
            if (scrollToStarsFromLetter) {
                scrollToStarsFromLetter.classList.remove("hidden");
                setTimeout(() => scrollToStarsFromLetter.classList.remove("opacity-0", "translate-y-4"), 200);
            }
        }, totalDuration + 600);
    }

    let letterOpened = false;
    function openLetter() {
        if (letterOpened) return;
        letterOpened = true;
        buildLetterParagraphs();
        if (envelopeClosed) {
            envelopeClosed.style.opacity = "0";
            envelopeClosed.style.transform = "scale(0.9)";
            setTimeout(() => { envelopeClosed.style.display = "none"; }, 600);
        }
        setTimeout(() => {
            letterCard.classList.add("open");
            if (prefersReducedMotion) {
                letterBody.querySelectorAll(".letter-line").forEach(l => l.classList.add("show"));
                if (letterSignature) letterSignature.classList.add("show");
                if (scrollToStarsFromLetter) scrollToStarsFromLetter.classList.remove("hidden", "opacity-0", "translate-y-4");
            } else {
                revealParagraphsProgressively();
            }
        }, 500);
    }

    if (openLetterBtn) openLetterBtn.addEventListener("click", openLetter);

    if (scrollToStarsFromLetter) {
        scrollToStarsFromLetter.addEventListener("click", () => {
            const starsSection = document.getElementById("stars-section");
            if (starsSection) starsSection.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    }

    // ===== SEZIONE 3: GRIGLIA DATI 30 STELLE CON IMMAGINE OPZIONALE =====
    const starsGrid = document.getElementById("stars-grid");
    const starsCount = document.getElementById("stars-count");
    const surpriseContent = document.getElementById("surprise-content");
    const scrollToLove = document.getElementById("scroll-to-love");

    // PERSONALIZZA QUI LE TUE 30 STELLE (Puoi inserirne fino a 30)
    // Se ne lasci meno, il sistema popolerà automaticamente le restanti con effetti casuali eleganti!
    const stelle = [
        { title: "Il tuo sorriso", text: "La prima cosa che mi ha totalmente conquistato.", image: "", effect: "hearts" },
        { title: "Che buffo", text: "", image: "assets/images/img-7.jpg", effect: "hearts" },
        { title: "Pasticciere", text: "La prima torta che abbiamo preparato insieme.", image: "assets/images/img-3.jpg", effect: "hearts" },
        { title: "Noi a Parigi", text: "Quella sera magica.", image: "assets/images/img-5.jpg", effect: "hearts" },
        { title: "Sei Casa", text: "Ovunque mi trovi, se ci sei tu sono al sicuro.", image: "assets/images/img-12.jpg", effect: "sparkles" },
        { title: "HAHAHAHA", text: "HAHAHAHAHA", image: "assets/images/img-9.jpg", effect: "sparkles" },
        { title: "Dai, siamo cariniii", text: "", image: "assets/images/img-17.jpg", effect: "sparkles" },
        { title: "Beh dai...", text: "", image: "assets/images/img-19.jpg", effect: "sparkles" },
        { title: "I tuoi 30 anni", text: "Un traguardo splendido per un uomo speciale.", image: "", effect: "balloons" },
        { title: "Patato", text: "", image: "assets/images/img-20.jpg", effect: "balloons" },
        { title: "Il nostro primo viaggio", text: "Uno dei ricordi più intensi e spettacolari di sempre.", image: "assets/images/img-4.jpg", effect: "firework-soft" },
        { title: "Che bono", text: "", image: "assets/images/img-13.jpg", effect: "firework-soft" },
        { title: "Patatino", text: "con stile già da bambino", image: "assets/images/piccolo.jpg", effect: "hearts" },
        { title: "Credimi", text: "Sto bene con te", image: "", effect: "hearts" },
        { title: "Il bello di noi è che lo abbiamo costruito un pezzetto alla volta.", text: "Sto bene con te", image: "", effect: "hearts" },
        { title: "Oggi so bello fotomodello", text: "-cit", image: "assets/images/img-8.jpg", effect: "firework-soft" },
        { title: "Tutto ok?", text: "", image: "assets/images/img-16.jpg", effect: "firework-soft" },
        { title: "Eri in paradiso", text: "", image: "assets/images/img-20.jpg", effect: "confetti" },
        { title: "Ma cosa sei...", text: "", image: "assets/images/img-10.jpg", effect: "firework-soft" },
        { title: "Grazie di tutto", text: "", image: "", effect: "hearts" },
        { title: "Sei anche questo", text: "che tenero", image: "assets/images/img-1.jpg", effect: "confetti" },
        { title: "La tua costante", text: "", image: "assets/images/img-15.jpg", effect: "confetti" },
        { title: "La tua passione", text: "", image: "assets/images/juve.jpg", effect: "firework-soft" },
        { title: "Siamo anche questo", text: "", image: "assets/images/img-22.jpg", effect: "balloons" },
        { title: "La mia ballerina preferita", text: "", image: "assets/images/img-14.jpg", effect: "confetti" },
        { title: "Spero di esserci riuscita", text: "13/05/24", image: "assets/images/img-17.jpg", effect: "hearts" },
        { title: "Sei speciale", text: "", image: "", effect: "hearts" },
        { title: "La mia maniglia antipanico", text: "", image: "assets/images/img-11.jpg", effect: "firework-soft" },
        { title: "Ti voglio bene", text: "", image: "", effect: "hearts" },
        { title: "I tuoi occhi", text: "Il modo in cui continui a guardarmi come il primo giorno.", image: "assets/images/img-6.jpg", effect: "hearts" }
    ];

    const TOTAL_STARS = 30;
    let litStars = 0;

    function buildDeck() {
        const possibiliEffetti = ["balloons", "confetti", "hearts", "sparkles", "firework-soft"];
        const deck = stelle.slice(0, TOTAL_STARS).map(s => ({
            title: s.title || "", text: s.text || "", image: s.image || "", effect: s.effect || ""
        }));
        while (deck.length < TOTAL_STARS) {
            deck.push({
                title: "", text: "", image: "",
                effect: possibiliEffetti[Math.floor(Math.random() * possibiliEffetti.length)]
            });
        }
        // Mescolamento controllato per renderlo dinamico
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    }

    const deck = buildDeck();

    function showSurprise(item) {
        surpriseContent.classList.remove("surprise-enter");
        void surpriseContent.offsetWidth; // Reset animazione CSS

        let html = "";
        if (item.image) {
            html += `<img src="${item.image}" alt="${item.title || "Ricordo"}" class="surprise-photo" onerror="this.style.display='none'">`;
        }
        if (item.title) html += `<div class="surprise-title">${item.title}</div>`;
        if (item.text)  html += `<div class="surprise-text">${item.text}</div>`;
        
        // Fallback elegante se la stella è solo un effetto visivo
        if (!item.image && !item.title && !item.text) {
            html = `<span class="heart-beat" style="font-size:2.2rem">✨</span>`;
        }

        surpriseContent.innerHTML = html;
        surpriseContent.classList.add("surprise-enter");
    }

    function getCenterOf(el) {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }

    if (starsGrid) {
        for (let i = 0; i < TOTAL_STARS; i++) {
            const item = deck[i];
            const star = document.createElement("button");
            star.className = "sky-star";
            if (item.effect) star.classList.add("special");
            star.innerHTML = `<span class="star-glyph">★</span>`;
            star.setAttribute("aria-label", `Accendi la stella numero ${i+1}`);

            star.addEventListener("click", () => {
                const center = getCenterOf(star);
                if (!star.classList.contains("lit")) {
                    star.classList.add("lit");
                    litStars++;
                    starsCount.textContent = String(litStars).padStart(2, "0");
                }
                showSurprise(item);
                if (item.effect) playEffect(item.effect, center.x, center.y);
                if (litStars === TOTAL_STARS) onAllStarsLit();
            });

            starsGrid.appendChild(star);
        }
    }

    function onAllStarsLit() {
        surpriseContent.classList.remove("surprise-enter");
        void surpriseContent.offsetWidth;
        surpriseContent.innerHTML = `<span class="heart-beat font-title italic drop-shadow-[0_0_10px_rgba(196,30,58,0.5)]" style="font-size:1.8rem; color:#c41e3a;">Ti amo immensamente 🤍</span>`;
        surpriseContent.classList.add("surprise-enter");
        playEffect("confetti", window.innerWidth / 2, window.innerHeight / 2);
        setTimeout(() => playEffect("balloons", window.innerWidth / 2, fxCanvas.height), 350);
        if (scrollToLove) {
            scrollToLove.classList.remove("hidden");
            setTimeout(() => scrollToLove.classList.remove("opacity-0", "translate-y-4"), 400);
        }
    }

    const loveSectionTarget = document.getElementById("love-section");
    if (scrollToLove) {
        scrollToLove.addEventListener("click", () => {
            if (loveSectionTarget) loveSectionTarget.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    }

    // ===== SEZIONE 4: INTERSECTION OBSERVER ROSA (CUORE) CHE SBOCCIA =====
    const loveTitle = document.getElementById("love-title");
    const loveSub = document.getElementById("love-sub");
    const loveSignature = document.getElementById("love-signature");
    const roseSvg = document.getElementById("rose-svg");
    const loveSec = document.getElementById("love-section");

    if (loveSec) {
        let bloomed = false;
        new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && !bloomed) {
                    bloomed = true;
                    
                    // 1. Appare subito il titolo "Ti amo"
                    if (loveTitle) loveTitle.classList.remove("opacity-0", "translate-y-6");
                    
                    // 2. Dopo 800ms appare il cuore dal basso in modo morbido
                    setTimeout(() => { if (roseSvg) roseSvg.classList.add("bloomed"); }, 120);
                    
                    // 3. Dopo 2200ms appare la frase sottostante "oggi, domani, sempre"
                    setTimeout(() => { if (loveSub) loveSub.classList.remove("opacity-0"); }, 2200);
                    
                    // 4. Dopo 3500ms compare infine la tua firma
                    setTimeout(() => { if (loveSignature) loveSignature.classList.remove("opacity-0"); }, 2400);
                }
            });
        }, { threshold: 0.35 }).observe(loveSec);
    }


});