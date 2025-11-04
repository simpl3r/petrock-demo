"use client";
import { useState, useEffect, useRef } from "react";
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

  // Локальное предложение добавить приложение: баннер и хэндлеры
  const [showAddBanner, setShowAddBanner] = useState<boolean>(false);
  const ADD_BANNER_DISMISSED_KEY = "petrock_add_banner_dismissed";
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  
  

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

  // Перехватываем системный промпт установки PWA и сохраняем для ручного вызова
  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      try {
        e.preventDefault?.();
        // Сохраняем событие для последующего вызова из баннера
        deferredPromptRef.current = e;
      } catch {}
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Показываем баннер при первом открытии, если ранее не скрыт
  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(ADD_BANNER_DISMISSED_KEY) === "1";
      if (!dismissed) {
        setShowAddBanner(true);
      }
    } catch {}
  }, []);

  const handleDismissAddBanner = () => {
    try {
      localStorage.setItem(ADD_BANNER_DISMISSED_KEY, "1");
    } catch {}
    setShowAddBanner(false);
  };

  const handleAddMiniApp = async () => {
    // Сначала пробуем через Farcaster Mini App SDK, если у клиента есть поддержка «избранного»
    try {
      const maybeAddToFavorites = (sdk as any)?.actions?.addToFavorites;
      if (typeof maybeAddToFavorites === "function") {
        await maybeAddToFavorites();
        setShowAddBanner(false);
        return;
      }
    } catch {}

    // Фолбэк: предлагаем установку PWA (домашний экран) если доступно
    try {
      const evt = deferredPromptRef.current;
      await evt?.prompt?.();
      setShowAddBanner(false);
      return;
    } catch {}

    // Если ни один способ недоступен — просто скрываем баннер
    setShowAddBanner(false);
  };

  

  

  

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
    {showAddBanner && (
      <div className={styles.addBanner}>
        <div className={styles.addBannerTitle}>Добавить в Мои мини‑приложения?</div>
        <div className={styles.addBannerActions}>
          <button className={styles.addBannerButton} onClick={handleAddMiniApp}>
            Добавить
          </button>
          <button className={styles.addBannerDismiss} onClick={handleDismissAddBanner}>
            Не сейчас
          </button>
        </div>
      </div>
    )}
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
