"use client";
import { useEffect, useRef, useState } from "react";

type Props = {
  onPet?: () => void;
  className?: string;
};

type HandPhase = "approach" | "stroke" | "leave";

export default function CanvasPetRock({ onPet, className = "" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Logical resolution
    canvas.width = 800;
    canvas.height = 600;

    // --- Parameters ---
    const stone = {
      x: 400,
      y: 300,
      radius: 80,
      blushRadius: 10,
      eyeOffset: 25,
      eyeSize: 15,
      pupilSize: 5,
    };

    const hand = {
      x: -150,
      y: 350,
      phase: "approach" as HandPhase,
      strokeTime: 0,
      strokeCount: 0,
      maxStrokes: 4,
    };

    let time = 0;
    let animationId: number;

    const drawGradient = () => {
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "#1a1a1a");
      gradient.addColorStop(1, "#cccccc");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const drawEye = (ex: number, ey: number) => {
      // Sclera
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(ex, ey, stone.eyeSize, 0, Math.PI * 2);
      ctx.fill();

      // Pupil looks at hand
      const dx = hand.x + 50 - ex;
      const dy = hand.y - ey;
      const dist = Math.hypot(dx, dy) || 1;
      const lookX = ex + (dx / dist) * 8;
      const lookY = ey + (dy / dist) * 8;

      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.arc(lookX, lookY, stone.pupilSize, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawStone = () => {
      const { x, y, radius } = stone;

      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.beginPath();
      ctx.ellipse(x + 10, y + radius + 10, radius * 0.8, radius * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Rock
      ctx.fillStyle = "#808080";
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      const eyeY = y - 20;
      drawEye(x - stone.eyeOffset, eyeY);
      drawEye(x + stone.eyeOffset, eyeY);

      // Blush
      ctx.fillStyle = "#FF69B4";
      ctx.beginPath();
      ctx.arc(x - 40, y, stone.blushRadius, 0, Math.PI * 2);
      ctx.arc(x + 40, y, stone.blushRadius, 0, Math.PI * 2);
      ctx.fill();

      // Smile
      ctx.strokeStyle = "#FF0000";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(x, y + 10, 30, 0, Math.PI);
      ctx.stroke();

      // Pleasure shake
      if (hand.phase === "stroke") {
        const shake = Math.sin(time * 0.3) * 1.5;
        ctx.save();
        ctx.translate(shake, shake);
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = "#808080";
        ctx.fill();
        ctx.restore();
      }
    };

    const updateHand = () => {
      if (hand.phase === "approach") {
        hand.x += 6;
        if (hand.x >= stone.x - stone.radius - 40) {
          hand.phase = "stroke";
          hand.x = stone.x - stone.radius - 40;
          hand.strokeTime = 0;
          hand.strokeCount = 0;
        }
      } else if (hand.phase === "stroke") {
        hand.strokeTime++;
        const cycle = Math.sin(hand.strokeTime * 0.12) * 30;
        hand.y = 350 + cycle;

        if (hand.strokeTime > 30 && cycle < -25) {
          hand.strokeCount++;
          // Notify parent about a pet
          onPet?.();
          if (hand.strokeCount >= hand.maxStrokes) {
            hand.phase = "leave";
          }
        }
      } else if (hand.phase === "leave") {
        hand.x += 7;
        hand.y = 350;
        if (hand.x > canvas.width + 100) {
          hand.x = -150;
          hand.phase = "approach";
          hand.strokeCount = 0;
        }
      }
    };

    const drawHand = () => {
      ctx.save();
      ctx.translate(hand.x, hand.y);

      // Palm
      ctx.fillStyle = "#FFA500";
      ctx.roundRect(0, -15, 70, 35, 15);
      ctx.fill();

      // Fingers
      for (let i = 0; i < 4; i++) {
        const fx = 60 + i * 10;
        const fy = -25 + Math.sin(time * 0.08 + i) * 4;
        ctx.fillStyle = "#FFA500";
        ctx.roundRect(fx, fy, 18, 40, 8);
        ctx.fill();

        // Fingertips
        ctx.beginPath();
        ctx.arc(fx + 9, fy + 40, 9, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    };

    const animate = () => {
      if (!isPlaying) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGradient();
      drawStone();
      updateHand();
      drawHand();

      time++;
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isPlaying, onPet]);

  return (
    <div className={className} style={{ position: "relative" }}>
      <canvas
        ref={canvasRef}
        style={{
          maxWidth: 800,
          width: "100%",
          height: "auto",
          borderRadius: 16,
          boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
          border: "1px solid #3f3f46",
          imageRendering: "crisp-edges",
        }}
      />
      <button
        type="button"
        onClick={() => setIsPlaying((v) => !v)}
        style={{
          position: "absolute",
          bottom: 12,
          right: 12,
          background: "#2563eb",
          color: "white",
          padding: "10px 16px",
          borderRadius: 9999,
          border: "none",
          fontWeight: 600,
          boxShadow: "0 10px 24px rgba(0,0,0,0.35)",
          cursor: "pointer",
        }}
      >
        {isPlaying ? "⏸ Пауза" : "▶ Играть"}
      </button>
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 12,
          background: "rgba(0,0,0,0.55)",
          color: "white",
          padding: "8px 12px",
          borderRadius: 12,
          backdropFilter: "blur(6px)",
          fontWeight: 700,
        }}
      >
        Рука гладит камень
      </div>
    </div>
  );
}