/** Shared scroll / stagger presets for landing sections (Motion). */

export function landingGridContainerVariants(reduce: boolean) {
  return {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduce ? 0 : 0.07,
        delayChildren: reduce ? 0 : 0.03,
      },
    },
  };
}

export function landingGridItemVariants(reduce: boolean) {
  return {
    hidden: { opacity: reduce ? 1 : 0, y: reduce ? 0 : 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: reduce
        ? { duration: 0 }
        : { type: "spring" as const, stiffness: 400, damping: 34, mass: 0.9 },
    },
  };
}

export function landingSectionHeaderProps(reduce: boolean) {
  return {
    initial: reduce ? false : { opacity: 0, y: 10 },
    whileInView: reduce ? undefined : { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-64px" as const },
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  };
}
