document.addEventListener("DOMContentLoaded", () => {
    // Riferimenti DOM
    const countdownLayer = document.getElementById("countdown-layer");
    const countdownNumber = document.getElementById("countdown-number");
    const greetingLayer = document.getElementById("greeting-layer");
    const cakeImg = document.getElementById("cake-img");
    const cakePlaceholder = document.getElementById("cake-placeholder");
    const canvas = document.getElementById("fireworks-canvas");
    const ctx = canvas.getContext("2d");

    // 1. GESTIONE RESIZE CANVAS & SCENARIO
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // 2. GENERAZIONE STELLE BACKGROUND
    function generateStars() {
        const container = document.getElementById("stars-container");
        const starCount = window.innerWidth < 768 ? 60 : 130; // Meno stelle su mobile per performance
        
        for (let i = 0; i < starCount; i++) {
            const star = document.createElement("div");
            star.classList.add("star");
            
            // Dimensioni variegate ed eleganti (piccole)
            const size = Math.random() * 2 + 0.5;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            
            // Posizionamento casuale
            star.style.top = `${Math.random() * 100}vh`;
            star.style.left = `${Math.random() * 100}vw`;
            
            // Frequenza di scintillio casuale
            star.style.animationDuration = `${Math.random() * 3 + 2}s`;
            
            container.appendChild(star);
        }
    }
    generateStars();

    // 3. CONTROLLO IMMAGINE TORTA (Fallback Elegante)
    if (cakeImg) {
        cakeImg.onload = function() {
            cakeImg.classList.remove("hidden");
            if (cakePlaceholder) cakePlaceholder.classList.add("hidden");
        };
        // Triggera l'errore se non trova il file locale, mantenendo il placeholder attivo
        cakeImg.onerror = function() {
            console.log("Immagine cake.png non trovata. Uso del fallback raffinato.");
        };
        // Forza il refresh del path
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
            // Sfondo semitrasparente per creare l'effetto scia (trail) dei fuochi
            ctx.fillStyle = "rgba(15, 23, 42, 0.15)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            particles = particles.filter(p => p.alpha > 0);

            particles.forEach(p => {
                p.update();
                p.draw();
            });

            animationFrameId = requestAnimationFrame(tick);
        }
        tick();
    }
});