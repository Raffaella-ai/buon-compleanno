document.addEventListener("DOMContentLoaded", () => {
    // Riferimenti DOM
    const countdownLayer = document.getElementById("countdown-layer");
    const countdownNumber = document.getElementById("countdown-number");
    const greetingLayer = document.getElementById("greeting-layer");
    const cakeImg = document.getElementById("cake-img");
    const cakePlaceholder = document.getElementById("cake-placeholder");
    const canvas = document.getElementById("fireworks-canvas");
    const ctx = canvas.getContext("2d");

    // Gestione Resize Canvas
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // NOTA: La funzione generateStars() è stata eliminata! Le performance ringraziano.

    // Controllo Immagine Torta (Fallback)
    if (cakeImg) {
        cakeImg.onload = function() {
            cakeImg.classList.remove("hidden");
            if (cakePlaceholder) cakePlaceholder.classList.add("hidden");
        };
        cakeImg.onerror = function() { console.log("Uso del fallback per la torta."); };
        cakeImg.src = cakeImg.getAttribute("src");
    }

    // 4. LOGICA DEL COUNTDOWN
    let currentCount = 3;
    const countdownInterval = setInterval(() => {
        currentCount--;
        
        // Effetto di zoom out/in fluido al cambio numero
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

    }, 1200); // 1.2 secondi per un ritmo più cinematografico

    // 5. TRANSIZIONE ALLA SCENA PRINCIPALE
    function startMainScene() {
        countdownLayer.classList.add("scale-150", "opacity-0");
        
        setTimeout(() => {
            countdownLayer.classList.add("hidden");
            greetingLayer.classList.remove("hidden");
            greetingLayer.classList.add("flex");
            
            // Facciamo partire i fuochi d'artificio raffinati
            startFireworks();
        }, 500);
    }

    // 6. SISTEMA PARTICELLARE DEI FUOCHI D'ARTIFICIO (Canvas)
    let particles = [];
    let animationFrameId;

    class Particle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            // Angolo e velocità per un'esplosione circolare ed elegante
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 1; 
            
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.gravity = 0.04; // Caduta morbida verso il basso
            this.alpha = 1;
            // Decadimento lento per una scia romantica
            this.fade = Math.random() * 0.015 + 0.008; 
            this.color = color;
            this.size = Math.random() * 1.5 + 1;
        }

        update() {
            this.vx *= 0.98; // Attrito dell'aria per rallentare dolcemente
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
            // Effetto bagliore sulla singola particella
            ctx.shadowBlur = 6;
            ctx.shadowColor = this.color;
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.restore();
        }
    }

    function spawnFirework() {
        // Coordinate di spawn calibrate per non coprire troppo il testo centrale
        const x = Math.random() * (canvas.width * 0.6) + (canvas.width * 0.2);
        const y = Math.random() * (canvas.height * 0.4) + (canvas.height * 0.15);
        
        // Palette raffinata: Oro caldo, Rosa cipria, Bianco riflettente
        const colors = ["#FBBF24", "#FDE68A", "#FBCFE8", "#F472B6", "#FFFFFF"];
        const chosenColor = colors[Math.floor(Math.random() * colors.length)];
        
        const count = window.innerWidth < 768 ? 40 : 75; // Ottimizzazione mobile
        for (let i = 0; i < count; i++) {
            particles.push(new Particle(x, y, chosenColor));
        }
    }

    function startFireworks() {
        // Primi botti istantanei all'apparire della scritta
        spawnFirework();
        setTimeout(spawnFirework, 400);
        setTimeout(spawnFirework, 900);

        // Continua a sparare fuochi ad intervalli regolari ed eleganti
        const fireworkInterval = setInterval(() => {
            if (particles.length < 300) { // Limite per salvaguardare la CPU mobile
                spawnFirework();
            }
        }, 1800);

        // Ciclo di rendering del Canvas
        function tick() {
            // 1. Invece di fillRect con un colore, usiamo clearRect per svuotare il canvas mantenendo la trasparenza
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 2. Filtriamo le particelle ancora vive
            particles = particles.filter(p => p.alpha > 0);

            // 3. Aggiorniamo e disegnamo le particelle
            particles.forEach(p => {
                p.update();
                p.draw();
            });

            animationFrameId = requestAnimationFrame(tick);
        }
        tick();
    }


    // === GESTIONE INTEGRATION STEP 2: SOFFIO CANDELINE ===
    const blowButton = document.getElementById("blow-button");
    const flames = document.querySelectorAll(".flame");
    const smokes = document.querySelectorAll(".smoke-puff");
    const cakeContainer = document.getElementById("cake-container");
    const desireText = document.getElementById("desire-text");
    const romanticText = document.getElementById("romantic-text");

    if (blowButton) {
        blowButton.addEventListener("click", () => {
            console.log("Click sul bottone soffio ricevuto");

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

                    if (smokes[index]) {
                        smokes[index].classList.add("smoke-active");
                    }

                    if (index === flames.length - 1) {
                        triggerFinalRomanceEffects();
                    }
                }, 400 + index * 250);
            });
        });
    }

    function triggerFinalRomanceEffects() {
        if (cakeContainer) {
            cakeContainer.classList.add("cake-glow-flash");
        }

        if (desireText) {
            desireText.classList.add("opacity-0");
            
            setTimeout(() => {
                // Sostituiamo il testo "Esprimi un desiderio" con la dedica finale
                desireText.innerHTML = "Che ogni tuo desiderio possa trovare sempre la strada per avverarsi. <span class='text-pink-300'>✨</span>";
                desireText.classList.remove("opacity-0");
                desireText.classList.add("text-transparent", "bg-clip-text", "bg-gradient-to-r", "from-pink-200", "to-amber-200", "font-serif", "italic");
                
                // Facciamo subentrare la freccina al posto del bottone
                const scrollBtn = document.getElementById("scroll-to-letter");
                if (scrollBtn) {
                    scrollBtn.classList.remove("hidden");
                    setTimeout(() => {
                        scrollBtn.classList.remove("opacity-0", "translate-y-4");
                        scrollBtn.classList.add("opacity-100", "translate-y-0");
                    }, 400); // Entrata fluida dopo il testo
                }

            }, 1000);
        }
    }





    const scrollToLetterBtn = document.getElementById("scroll-to-letter");
    const letterSection = document.getElementById("letter-section"); // Assicurati che la sezione successiva abbia questo ID!

    if (scrollToLetterBtn && letterSection) {
        scrollToLetterBtn.addEventListener("click", () => {
            letterSection.scrollIntoView({ 
                behavior: "smooth", 
                block: "start" 
            });
        });
    }

});

