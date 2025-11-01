"use client";
import { useState, useEffect } from "react";
import PetRockButton from "../components/PetRockButton";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import styles from "./page.module.css";
 

export default function Home() {
  const { isFrameReady, setFrameReady, context } = useMiniKit();

  // Версия ключа счётчика для глобального сброса через env
  const STORAGE_VERSION = process.env.NEXT_PUBLIC_PETROCK_COUNT_VERSION ?? "v1";
  const STORAGE_KEY = `petrock_pet_count_${STORAGE_VERSION}`;

  // Инициализируем MiniKit кадр
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  // Состояние игры
  const [petCount, setPetCount] = useState<number>(0);
  

  

  // Загружаем сохранённое количество поглаживаний при запуске
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const saved = raw ? parseInt(raw, 10) : 0;
      setPetCount(Number.isNaN(saved) ? 0 : saved);
    } catch {
      setPetCount(0);
    }
  }, []);

  // Вызываем системный промпт установки PWA при открытии (если доступен)
  useEffect(() => {
    const handler = (e: any) => {
      try {
        e.preventDefault?.();
        // Небольшая задержка, чтобы не мешать первичной загрузке UI
        setTimeout(() => {
          e.prompt?.();
        }, 1200);
      } catch {}
    };
    window.addEventListener("beforeinstallprompt", handler as any);
    return () => window.removeEventListener("beforeinstallprompt", handler as any);
  }, []);

  

  

  

  const handlePet = () => {
    setPetCount((prev) => {
      const next = prev + 1;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {}
      return next;
    });
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

        

        <PetRockButton onPet={handlePet} />

        <div className={styles.stats}>
          <div>
            <span className={styles.statLabel}>Total pets:</span>
            <span className={styles.statValue}>{petCount}</span>
          </div>
        </div>

        
      </div>
    </div>
  );
}
