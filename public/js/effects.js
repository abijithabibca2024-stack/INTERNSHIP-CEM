// Visual effects: floating particles, scroll reveal, number counters, countdown.

// ---------- Floating particles on the background canvas ----------
function startParticles() {
  const canvas = $('#fx');
  const context = canvas.getContext('2d');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!context || reducedMotion) return;

  const colors = ['34,211,238', '139,92,246', '232,121,249', '59,130,246'];
  const particles = [];

  function resize() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
  }
  resize();
  addEventListener('resize', resize);

  for (let i = 0; i < 32; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2 + 0.6,
      speedX: (Math.random() - 0.5) * 0.25,
      speedY: -Math.random() * 0.3 - 0.05,
      pulse: Math.random() * 6,
      color: colors[i % colors.length],
    });
  }

  function drawFrame() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    if (!document.hidden) {
      for (const p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;
        p.pulse += 0.02;

        // Particle left the top of the screen -> restart from the bottom
        if (p.y < -5) {
          p.y = canvas.height + 5;
          p.x = Math.random() * canvas.width;
        }

        context.beginPath();
        context.fillStyle = `rgba(${p.color}, ${0.25 + 0.35 * Math.sin(p.pulse)})`;
        context.shadowColor = `rgb(${p.color})`;
        context.shadowBlur = 8;
        context.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        context.fill();
      }
    }
    requestAnimationFrame(drawFrame);
  }
  drawFrame();
}

// ---------- Number counters (500+, 23+, ...) ----------
function animateCounters(container) {
  container.querySelectorAll('.counter').forEach((element) => {
    const target = Number(element.dataset.target);
    const prefix = element.dataset.prefix;
    const suffix = element.dataset.suffix;
    const duration = 1200; // milliseconds
    const startTime = performance.now();

    function step(now) {
      const progress = Math.min(1, (now - startTime) / duration);
      element.textContent = prefix + Math.round(target * progress) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}

// ---------- Fade-in when an element scrolls into view ----------
let revealObserver = null;

function setupReveal() {
  const hiddenElements = $$('.reveal:not(.visible)');

  // Very old browsers: just show everything
  if (!window.IntersectionObserver) {
    hiddenElements.forEach((element) => {
      element.classList.add('visible');
      animateCounters(element);
    });
    return;
  }

  if (!revealObserver) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
          animateCounters(entry.target);
        }
      },
      { threshold: 0.1 }
    );
  }
  hiddenElements.forEach((element) => revealObserver.observe(element));
}

// ---------- Countdown to the fest start ----------
let countdownTimer = null;
const FEST_START = new Date('2026-11-12T09:00:00').getTime();

function startCountdown() {
  clearInterval(countdownTimer);
  if (!$('#countdown')) return;

  const labels = ['DAYS', 'HOURS', 'MIN', 'SEC'];

  function update() {
    const box = $('#countdown');
    if (!box) {                     // user left the home page
      clearInterval(countdownTimer);
      return;
    }

    const remaining = Math.max(0, FEST_START - Date.now());
    const values = [
      Math.floor(remaining / 86400000),
      Math.floor((remaining % 86400000) / 3600000),
      Math.floor((remaining % 3600000) / 60000),
      Math.floor((remaining % 60000) / 1000),
    ];

    box.innerHTML = values
      .map((value, i) => `<div class="panel countdown-box"><b>${String(value).padStart(2, '0')}</b>${labels[i]}</div>`)
      .join('');
  }

  update();
  countdownTimer = setInterval(update, 1000);
}
