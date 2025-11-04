"use client";
import { useState, useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import PetRockButton from "../components/PetRockButton";
import Image from "next/image";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import styles from "./page.module.css";

// Локальный тип для безопасной проверки наличия метода добавления в избранное
type MiniAppSdkFavorites = {
  actions?: {
    addToFavorites?: () => Promise<void> | void;
  };
};

export default function Home() {
  const { isFrameReady, setFrameReady, context } = useMiniKit();

  // Версия ключа счётчика для глобального сброса через env
  const STORAGE_VERSION = process.env.NEXT_PUBLIC_PETROCK_COUNT_VERSION ?? "v1";
  const STORAGE_KEY = `petrock_pet_count_${STORAGE_VERSION}`;
  // Флаг показа приветственного блока: читаем единожды из ENV
  const showGreeting = process.env.NEXT_PUBLIC_SHOW_GREETING === "true";

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
  // Управление приветствием только через ENV (NEXT_PUBLIC_SHOW_GREETING)


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

  // Автоматически предлагаем «Add Mini App» через SDK на каждую сессию
  useEffect(() => {
    if (!isFrameReady) return;
    const ATTEMPT_KEY = "petrock_auto_add_attempted_session_v1";
    try {
      const attempted = sessionStorage.getItem(ATTEMPT_KEY) === "1";
      if (attempted) return;
    } catch {}
    (async () => {
      try {
        const sdkFavorites = sdk as unknown as MiniAppSdkFavorites;
        const maybeAddToFavorites = sdkFavorites.actions?.addToFavorites;
        if (typeof maybeAddToFavorites === "function") {
          await maybeAddToFavorites();
        }
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.warn("addToFavorites failed or unsupported", err);
        }
      } finally {
        try {
          sessionStorage.setItem(ATTEMPT_KEY, "1");
        } catch {}
      }
    })();
  }, [isFrameReady]);

  

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
            <Image
              src={avatarUrl}
              alt={displayName}
              className={styles.userAvatar}
              width={36}
              height={36}
              unoptimized
            />
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
    {showGreeting && (
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
