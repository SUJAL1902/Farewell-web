import React, { useEffect, useRef } from 'react';
import './Hero.css';

export default function Hero() {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    let raf;

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 3 + 1,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -(Math.random() * 0.4 + 0.1),
      alpha: Math.random() * 0.5 + 0.1,
      color: Math.random() > 0.5 ? '232,168,124' : '201,123,132',
    }));

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
      });
      raf = requestAnimationFrame(draw);
    };

    draw();
    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, []);

  return (
    <section id="hero" className="hero">
      <canvas ref={canvasRef} className="hero-canvas" />

      <div className="hero-content">
        <p className="hero-eyebrow fade-up">✦ JIT Borawan · 2022 – 2026 ✦</p>

        <h1 className="hero-title fade-up fade-up-delay-1">
          Not goodbye —<br />
          <em>just see you on<br />the other side.</em>
        </h1>

        <p className="hero-sub fade-up fade-up-delay-2">
          Four years of late nights, shared laughs, and memories that will<br />
          outlast every deadline. This one's for you, seniors. 🌻
        </p>

        <a href="#gallery" className="hero-cta fade-up fade-up-delay-3">
          Relive the memories ↓
        </a>
      </div>

      <div className="hero-scroll-hint">scroll</div>
    </section>
  );
}
