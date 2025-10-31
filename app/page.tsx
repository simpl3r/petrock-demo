"use client";
import { useState, useEffect } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { minikitConfig } from "../minikit.config";
import styles from "./page.module.css";

export default function Home() {
  const { isFrameReady, setFrameReady, context } = useMiniKit();

  // Инициализируем MiniKit кадр
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  // Состояние игры
  const [petCount, setPetCount] = useState<number>(0);
  const [lastPetAt, setLastPetAt] = useState<number | null>(null);
  const [remainingMs, setRemainingMs] = useState<number>(0);

  // Загружаем прогресс из localStorage
  useEffect(() => {
    try {
      const storedCount = Number(localStorage.getItem("petrock_pet_count") || 0);
      const storedLast = localStorage.getItem("petrock_last_pet_at");
      setPetCount(Number.isFinite(storedCount) ? storedCount : 0);
      setLastPetAt(storedLast ? Number(storedLast) : null);
    } catch {
      // Игнорируем ошибки доступа к localStorage
    }
  }, []);

  // Ежесекундно обновляем оставшееся время кулдауна
  useEffect(() => {
    const tick = () => {
      if (!lastPetAt) {
        setRemainingMs(0);
        return;
      }
      const elapsed = Date.now() - lastPetAt;
      const cooldown = 3 * 60 * 1000; // 3 минуты
      const left = Math.max(cooldown - elapsed, 0);
      setRemainingMs(left);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lastPetAt]);

  const canPet = remainingMs === 0;

  const formatTime = (ms: number) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handlePet = () => {
    if (!canPet) return;
    const nowTs = Date.now();
    setPetCount((prev) => {
      const next = prev + 1;
      try {
        localStorage.setItem("petrock_pet_count", String(next));
      } catch {}
      return next;
    });
    setLastPetAt(nowTs);
    try {
      localStorage.setItem("petrock_last_pet_at", String(nowTs));
    } catch {}
  };

  return (
    <div className={styles.container}>
      {/* User header with connected account info */}
      {(() => {
        const user = context?.user;
        const avatarUrl = user?.pfpUrl || "/blue-icon.png";
        const displayName = user?.displayName ?? "Guest";
        const username = user?.username;
        const fid = user?.fid;
        return (
          <div className={styles.userHeader}>
            <img src={avatarUrl} alt={displayName} className={styles.userAvatar} />
            <div className={styles.userDetails}>
              <div className={styles.userName}>{displayName}</div>
              <div className={styles.userMeta}>
                {username ? `@${username}` : "—"}
                {typeof fid === "number" ? ` · FID ${fid}` : ""}
              </div>
            </div>
          </div>
        );
      })()}
      <div className={styles.content}>
        <h1 className={styles.title}>Pet Rock</h1>
        <p className={styles.subtitle}>
          Hi, {context?.user?.displayName || "friend"}. Pet the rock every 3 minutes.
        </p>

        <div className={styles.rockWrap}>
          <img src="/sphere.svg" alt="Pet Rock" className={styles.rock} />
        </div>

        <button
          type="button"
          className={styles.petButton}
          onClick={handlePet}
          disabled={!canPet}
          aria-disabled={!canPet}
        >
          {canPet ? "Pet the rock" : "Please wait..."}
        </button>

        <div className={styles.countdown}>
          {canPet ? (
            <span>You can pet now!</span>
          ) : (
            <span>Next pet in {formatTime(remainingMs)}</span>
          )}
        </div>

        <div className={styles.stats}>
          <div>
            <span className={styles.statLabel}>Total pets:</span>
            <span className={styles.statValue}>{petCount}</span>
          </div>
          {lastPetAt && (
            <div>
              <span className={styles.statLabel}>Last time:</span>
              <span className={styles.statValue}>{new Date(lastPetAt).toLocaleTimeString()}</span>
            </div>
          )}
        </div>

        <p className={styles.subtitle}>
          Built for {minikitConfig.miniapp.name}. Come back in 3 minutes!
        </p>
      </div>
    </div>
  );
}
