"use client";
import { useState, useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import PetRockButton from "../components/PetRockButton";
import Image from "next/image";
import { useMiniKit, useComposeCast } from "@coinbase/onchainkit/minikit";
import { Button } from "../components/ui/button";
import { minikitConfig } from "../minikit.config";
import styles from "./page.module.css";

// Локальный тип для безопасной проверки наличия метода добавления в избранное
type MiniAppSdkFavorites = {
  actions?: {
    addToFavorites?: () => Promise<void> | void;
  };
};

export default function Home() {
  const { isFrameReady, setFrameReady, context } = useMiniKit();
  const { composeCastAsync } = useComposeCast();

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

  // После готовности MiniKit: ready-handshake и автопредложение «Add Mini App» (один раз за сессию)
  useEffect(() => {
    if (!isFrameReady) return;
    (async () => {
      try {
        if (typeof sdk?.actions?.ready === "function") {
          await sdk.actions.ready({ disableNativeGestures: true });
        }
        const ATTEMPT_KEY = "petrock_auto_add_attempted_session_v1";
        const attempted = (() => {
          try {
            return sessionStorage.getItem(ATTEMPT_KEY) === "1";
          } catch {
            return false;
          }
        })();
        if (!attempted) {
          const sdkFavorites = sdk as unknown as MiniAppSdkFavorites;
          const maybeAddToFavorites = sdkFavorites.actions?.addToFavorites;
          if (typeof maybeAddToFavorites === "function") {
            await maybeAddToFavorites();
          }
          try {
            sessionStorage.setItem(ATTEMPT_KEY, "1");
          } catch {}
        }
      } catch (err) {
        // В обычном веб-превью или вне контейнера Mini App вызовы могут валиться — игнорируем
        if (process.env.NODE_ENV === "development") {
          console.warn("miniapp-sdk ready/addToFavorites failed (non-miniapp env?)", err);
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

  const handleShare = async () => {
    try {
      const text = `Petting my rock on ${minikitConfig.miniapp.name}! Join me 👉`;
      const embedUrl = String(minikitConfig.miniapp.homeUrl || "");
      const result = await composeCastAsync({
        text,
        embeds: [embedUrl],
      });
      if (process.env.NODE_ENV === "development") {
        if (result?.cast) {
          console.log("Cast created successfully:", result.cast.hash);
        } else {
          console.log("User cancelled or composer unavailable");
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn("Compose cast failed or unsupported in this environment", error);
      }
    }
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

        <div className={styles.shareRow}>
          <div className={styles.shareButtonFrame}>
            <Button onClick={handleShare}>
              Share with friends
            </Button>
          </div>
        </div>
        
      </div>
    </div>
  );
}
