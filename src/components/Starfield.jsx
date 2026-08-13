import { useEffect, useRef } from "react";

/**
 * Ambient signature element: a slow-drifting starfield with a few
 * larger "waypoint" stars that softly pulse. Purely decorative,
 * paused automatically when the tab is hidden or motion is reduced.
 */
export default function Starfield() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width, height, stars, frame;
    const STAR_COUNT = 140;

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    function makeStars() {
      stars = Array.from({ length: STAR_COUNT }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.3 + 0.2,
        drift: Math.random() * 0.06 + 0.01,
        hue: Math.random() < 0.15 ? (Math.random() < 0.5 ? "#22d3ee" : "#f472b6") : "#e8eaf5",
        twinkle: Math.random() * Math.PI * 2,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      for (const s of stars) {
        s.twinkle += 0.02;
        s.y += s.drift;
        if (s.y > height) s.y = 0;
        const alpha = 0.35 + Math.sin(s.twinkle) * 0.35;
        ctx.beginPath();
        ctx.fillStyle = s.hue;
        ctx.globalAlpha = Math.max(0.1, alpha);
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (!reduceMotion) frame = requestAnimationFrame(draw);
    }

    resize();
    makeStars();
    draw();

    window.addEventListener("resize", () => {
      resize();
      makeStars();
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  return <canvas ref={canvasRef} className="starfield" aria-hidden="true" />;
}
