"use client";
import { useState, useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import PetRockButton from "../components/PetRockButton";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import styles from "./page.module.css";

type BeforeInstallPromptEvent = Event & {
  readonly platforms?: string[];
  prompt?: () => Promise<void> | void;
  userChoice?: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export default function Home() {
  const { isFrameReady, setFrameReady, context } = useMiniKit();

  // Версия ключа счётчика для глобального сброса через env
  const STORAGE_VERSION = process.env.NEXT_PUBLIC_PETROCK_COUNT_VERSION ?? "v1";
  const STORAGE_KEY = `petrock_pet_count_${STORAGE_VERSION}`;
  // Флаг показа приветственного блока управляется через ENV (Vercel/локально)
  const SHOW_GREETING = process.env.NEXT_PUBLIC_SHOW_GREETING === "true";

  // Инициализируем MiniKit кадр
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  // Отключаем нативные жесты во вьюхе Farcaster через Mini App SDK
  // Вызываем только после готовности MiniKit кадра, чтобы избежать конфликтов рукопожатия
  useEffect(() => {
    if (!isFrameReady) return;
    (async () => {
      try {
        if (typeof sdk?.actions?.ready === "function") {
          await sdk.actions.ready({ disableNativeGestures: true });
        }
      } catch (err) {
        // В обычном веб-превью или вне контейнера Mini App вызов может валиться — игнорируем
        if (process.env.NODE_ENV === "development") {
          console.warn("miniapp-sdk ready failed (non-miniapp env?)", err);
        }
      }
    })();
  }, [isFrameReady]);

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
  }, [STORAGE_KEY]);

  // Вызываем системный промпт установки PWA при открытии (если доступен)
  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      try {
        e.preventDefault?.();
        // Небольшая задержка, чтобы не мешать первичной загрузке UI
        setTimeout(() => {
          e.prompt?.();
        }, 1200);
      } catch {}
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
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
    {SHOW_GREETING && (
      <>
        <h1 className={styles.title}>Pet Rock</h1>
        <p className={styles.subtitle}>
          Hi, {context?.user?.displayName || "friend"}. Pet the rock every 3 minutes.
        </p>
      </>
    )}

        

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
