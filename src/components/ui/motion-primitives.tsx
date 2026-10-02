"use client";

import Link from "next/link";
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ComponentProps,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, type HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";
import { buttonClass, type ButtonVariant } from "./button";
import { INTERACTION, TRANSITIONS, staggerItemVariants } from "@/lib/motion";

/**
 * Animated 3-dot loading indicator for buttons and inline actions.
 */
export function LoadingDots({ className }: { className?: string }) {
  return (
    <motion.span
      className={cn("inline-flex items-center gap-1", className)}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.15 }}
      aria-hidden="true"
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-current"
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [0.85, 1.15, 0.85],
          }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            delay: i * 0.18,
            ease: "easeInOut",
          }}
        />
      ))}
    </motion.span>
  );
}

/**
 * Interactive Button with Motion micro-interactions:
 * - Hover scale / lift
 * - Tap scale down
 * - AnimatePresence loading state swap without layout shift (fixed stable height/min-width)
 */
export type MotionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
  loadingText?: string;
  className?: string;
  children?: ReactNode;
};

export const MotionButton = forwardRef<HTMLButtonElement, MotionButtonProps>(
  function MotionButton(
    {
      variant = "dark",
      loading = false,
      loadingText,
      className,
      children,
      disabled,
      type = "button",
      ...props
    },
    ref,
  ) {
    const isPill = variant === "pill" || variant === "pillDark";
    const interaction = isPill ? INTERACTION.pill : INTERACTION.button;

    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        aria-busy={loading}
        whileHover={disabled || loading ? undefined : interaction.whileHover}
        whileTap={disabled || loading ? undefined : interaction.whileTap}
        transition={TRANSITIONS.hover}
        className={cn(
          buttonClass(variant, className),
          "relative select-none",
          loading && "pointer-events-none cursor-not-allowed opacity-90",
        )}
        {...(props as HTMLMotionProps<"button">)}
      >
        <AnimatePresence mode="wait" initial={false}>
          {loading ? (
            <motion.span
              key="loading"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="inline-flex items-center justify-center gap-2"
            >
              <LoadingDots />
              <span>{loadingText || "Processing…"}</span>
            </motion.span>
          ) : (
            <motion.span
              key="content"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className="inline-flex items-center justify-center gap-2"
            >
              {children}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    );
  },
);

const MotionNextLink = motion.create(Link);

export type MotionLinkProps = ComponentProps<typeof MotionNextLink> & {
  variant?: ButtonVariant;
};

/**
 * Interactive Link with micro-interactions
 */
export function MotionLink({
  variant,
  className,
  children,
  ...props
}: MotionLinkProps) {
  const isPill = variant === "pill" || variant === "pillDark";
  const interaction = isPill ? INTERACTION.pill : INTERACTION.button;

  return (
    <MotionNextLink
      whileHover={interaction.whileHover}
      whileTap={interaction.whileTap}
      transition={TRANSITIONS.hover}
      className={variant ? buttonClass(variant, className) : className}
      {...props}
    >
      {children}
    </MotionNextLink>
  );
}

/**
 * Staggered Entrance List/Grid Container
 */
export function MotionList({
  children,
  className,
  stagger = 0.16,
  delay = 0.1,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
}) {
  return (
    <motion.ul
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: stagger,
            delayChildren: delay,
          },
        },
      }}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
      className={className}
    >
      {children}
    </motion.ul>
  );
}

/**
 * Staggered Entrance List Item
 */
export function MotionListItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.li variants={staggerItemVariants} className={className}>
      {children}
    </motion.li>
  );
}

/**
 * Interactive Card Container with subtle lift and tap feedback
 */
export function MotionCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={INTERACTION.card.whileHover}
      whileTap={INTERACTION.card.whileTap}
      transition={TRANSITIONS.hover}
      className={className}
    >
      {children}
    </motion.div>
  );
}
