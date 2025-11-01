"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
// Removed external Button, hand overlay is the clickable trigger

type Props = {
  onPet?: () => void;
};

export default function PetRockButton({ onPet }: Props) {
  const [isPetting, setIsPetting] = useState(false);

  const handlePet = () => {
    setIsPetting(true);
    try {
      onPet?.();
    } finally {
      setTimeout(() => setIsPetting(false), 600);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-5">
      <div
        className="select-none"
        style={{ position: "relative", width: 240, height: 240 }}
      >
        {/* Камень */}
        <motion.div
          animate={
            isPetting
              ? { scale: [1, 1.05, 0.98, 1], rotate: [0, 2, -2, 0] }
              : { scale: 1, rotate: 0 }
          }
          transition={{ duration: 0.8, ease: "easeInOut" }}
          style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image src="/pet-rock.png" alt="Pet Rock" width={240} height={240} priority />
          </div>
          {/* Блик */}
          <AnimatePresence>
            {isPetting && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.5, 0] }}
                transition={{ duration: 0.6 }}
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0,
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.4)",
                  filter: "blur(18px)",
                  pointerEvents: "none",
                }}
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Рука — всегда видима, кликабельна */}
        <button
          onClick={handlePet}
          disabled={isPetting}
          aria-label="Погладить камень"
          style={{
            position: "absolute",
            top: -8,
            left: -12,
            width: 160,
            height: 160,
            zIndex: 2,
            background: "transparent",
            border: "none",
            padding: 0,
            cursor: "pointer",
          }}
        >
          <motion.div
            initial={{ x: 0, y: 0, opacity: 1, rotate: -30, scaleX: 1 }}
            animate={
              isPetting
                ? { x: [0, 8, 0], y: [0, 10, 0], opacity: 1, rotate: -30, scaleX: 1 }
                : { x: 0, y: 0, opacity: 1, rotate: -30, scaleX: 1 }
            }
            transition={{ duration: 0.6, ease: "easeInOut" }}
            style={{ width: 160, height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <Image
              src="/hand.png"
              alt="Hand Petting"
              width={160}
              height={160}
              draggable={false}
              priority
              style={{ pointerEvents: "none", userSelect: "none" }}
            />
          </motion.div>
        </button>
      </div>
    </div>
  );
}