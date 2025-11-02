"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";

type Props = {
  onPet?: () => void;
};

export default function PetRockButton({ onPet }: Props) {
  const [isPetting, setIsPetting] = useState(false);
  const [isCooldown, setIsCooldown] = useState(false);
  const cooldownRef = useRef<number | null>(null);
  const COOLDOWN_MS = 3 * 60 * 1000;
  const COOLDOWN_STORAGE_KEY = "petrock_cooldown_end";
  const [remainingMs, setRemainingMs] = useState(0);
  const countdownIntervalRef = useRef<number | null>(null);
  const cooldownEndRef = useRef<number | null>(null);

  const handlePet = () => {
    if (isPetting || isCooldown) return;
    setIsPetting(true);
    setIsCooldown(true);
    cooldownEndRef.current = Date.now() + COOLDOWN_MS;
    try {
      localStorage.setItem(COOLDOWN_STORAGE_KEY, String(cooldownEndRef.current));
    } catch {}
    setRemainingMs(COOLDOWN_MS);
    try {
      onPet?.();
    } finally {
      setTimeout(() => setIsPetting(false), 600);
    }
    if (cooldownRef.current) {
      clearTimeout(cooldownRef.current);
    }
    cooldownRef.current = window.setTimeout(() => {
      setIsCooldown(false);
      setRemainingMs(0);
      cooldownEndRef.current = null;
      try {
        localStorage.removeItem(COOLDOWN_STORAGE_KEY);
      } catch {}
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      cooldownRef.current = null;
    }, COOLDOWN_MS);

    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    countdownIntervalRef.current = window.setInterval(() => {
      if (!cooldownEndRef.current) return;
      const rem = Math.max(0, cooldownEndRef.current - Date.now());
      setRemainingMs(rem);
      if (rem <= 0) {
        setIsCooldown(false);
        setRemainingMs(0);
        cooldownEndRef.current = null;
        try {
          localStorage.removeItem(COOLDOWN_STORAGE_KEY);
        } catch {}
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
      }
    }, 1000);
  };

  // Восстановление кулдауна из localStorage при монтировании
  useEffect(() => {
    try {
      const raw = localStorage.getItem(COOLDOWN_STORAGE_KEY);
      const storedEnd = raw ? parseInt(raw, 10) : 0;
      if (storedEnd && Number.isFinite(storedEnd)) {
        const now = Date.now();
        if (storedEnd > now) {
          cooldownEndRef.current = storedEnd;
          setIsCooldown(true);
          setRemainingMs(storedEnd - now);

          // Запустить интервальный пересчёт
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
          }
          countdownIntervalRef.current = window.setInterval(() => {
            if (!cooldownEndRef.current) return;
            const rem = Math.max(0, cooldownEndRef.current - Date.now());
            setRemainingMs(rem);
            if (rem <= 0) {
              setIsCooldown(false);
              setRemainingMs(0);
              cooldownEndRef.current = null;
              try {
                localStorage.removeItem(COOLDOWN_STORAGE_KEY);
              } catch {}
              if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
                countdownIntervalRef.current = null;
              }
            }
          }, 1000);
        } else {
          // Просрочен — очистим ключ
          try {
            localStorage.removeItem(COOLDOWN_STORAGE_KEY);
          } catch {}
        }
      }
    } catch {}
  }, []);

  // Очистка таймера кулдауна при размонтировании
  useEffect(() => {
    return () => {
      if (cooldownRef.current) {
        clearTimeout(cooldownRef.current);
        cooldownRef.current = null;
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, []);

  return (
    <div className="select-none" style={{ position: "relative", width: 240, height: 240 }}>
      {/* КАМЕНЬ — центр контейнера */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 200,
          height: 200,
          zIndex: 1,
        }}
      >
        <Image
          src="/pet-rock.png"
          alt="Камень"
          width={200}
          height={200}
          draggable={false}
          priority
          style={{ pointerEvents: "none", userSelect: "none" }}
        />
      </div>

      {/* РУКА — справа от камня, кликабельна */}
      <button
        onClick={handlePet}
        disabled={isPetting || isCooldown}
        aria-label="Погладить камень"
        style={{
          position: "absolute",
          top: 11,
          right: -19,
          transform: "none",
          marginLeft: 0,
          width: 160,
          height: 160,
          zIndex: 2,
          background: "transparent",
          border: "none",
          padding: 0,
          cursor: isPetting || isCooldown ? "default" : "pointer",
        }}
      >
        <motion.div
          initial={{ x: 0, y: 0, rotate: 45, scaleX: 1 }}
          animate={
            isPetting
              ? { x: [-15, -5, -15], y: [-5, 5, -5], rotate: [40, 35, 40], scaleX: 1 }
              : { x: 0, y: 0, rotate: 45, scaleX: 1 }
          }
          transition={{ duration: 0.6, ease: "easeInOut", times: [0, 0.5, 1] }}
          style={{ width: 160, height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <Image
            src="/hand.png"
            alt="Рука"
            width={160}
            height={160}
            draggable={false}
            priority
            style={{ pointerEvents: "none", userSelect: "none" }}
          />
        </motion.div>
      </button>

      {isCooldown && (
        <div
          style={{
            position: "absolute",
            bottom: -12,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.6)",
            color: "white",
            padding: "6px 10px",
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 700,
            textAlign: "center",
            backdropFilter: "blur(4px)",
            zIndex: 3,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            whiteSpace: "nowrap",
          }}
        >
          <span>Come back in:</span>
          <span style={{ fontVariantNumeric: "tabular-nums" }}>{formatTime(remainingMs)}</span>
        </div>
      )}
    </div>
  );
}

function formatTime(ms: number) {
  const totalSeconds = Math.ceil(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  const sStr = s < 10 ? `0${s}` : String(s);
  return `${m}:${sStr}`;
}