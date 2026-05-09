"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

export function HeroPreviewShell({ children }: { children: ReactNode }) {
  const reduce = Boolean(useReducedMotion());

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 14 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-32px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
