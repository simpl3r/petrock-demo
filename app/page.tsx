"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
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
  const [rockSrc, setRockSrc] = useState<string>("/pet-rock.png");
  const [isPetting, setIsPetting] = useState<boolean>(false);

  

  // Загружаем прогресс из localStorage
  useEffect(() => {
    try {
      const storedCount = Number(localStorage.getItem("petrock_pet_count") || 0);
      setPetCount(Number.isFinite(storedCount) ? storedCount : 0);
    } catch {
      // Игнорируем ошибки доступа к localStorage
    }
  }, []);

  

  

  

  const handlePet = () => {
    setPetCount((prev) => {
      const next = prev + 1;
      try {
        localStorage.setItem("petrock_pet_count", String(next));
      } catch {}
      return next;
    });
    setIsPetting(true);
    setTimeout(() => setIsPetting(false), 600);
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
          <motion.div
            animate={
              isPetting
                ? { scale: [1, 1.05, 0.98, 1], rotate: [0, 2, -2, 0] }
                : { scale: 1, rotate: 0 }
            }
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <Image
              src={rockSrc}
              alt="Pet Rock"
              className={styles.rock}
              width={400}
              height={400}
              priority
              onError={() => setRockSrc("/sphere.svg")}
            />
            <AnimatePresence>
              {isPetting && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.5, 0] }}
                  transition={{ duration: 0.6 }}
                  className={styles.rockHighlight}
                />
              )}
            </AnimatePresence>
          </motion.div>

          <div className={styles.handOverlay}>
            <button
              className={styles.handButton}
              onClick={handlePet}
              disabled={isPetting}
              aria-label="Погладить камень"
            >
              <div className={`${styles.handMotion} ${isPetting ? styles.handPetting : ""}`}>
                <Image
                  src="/hand.png"
                  alt="Petting hand"
                  className={styles.handImage}
                  width={180}
                  height={180}
                  draggable={false}
                  priority
                />
              </div>
            </button>
          </div>
        </div>

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
