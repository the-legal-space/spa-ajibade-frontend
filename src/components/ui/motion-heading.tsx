"use client";

import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { motion } from "motion/react";
import { EASINGS, REVEAL } from "@/lib/motion";

/** Splits a string into words that rise out of a mask. Spaces stay real text so wrapping is unchanged. */
export function SplitWords({ text, delay = 0 }: { text: string; delay?: number }) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((w, i) => (
          <span key={i}>
            <span className="inline-block overflow-hidden pb-[0.14em] -mb-[0.14em] align-bottom">
              <motion.span
                className="word-inner inline-block will-change-transform"
                custom={i}
                variants={{
                  hidden: { y: "112%" },
                  show: (n: number) => ({
                    y: "0%",
                    transition: { duration: 0.95, ease: EASINGS.easeOut, delay: delay + n * 0.06 },
                  }),
                }}
              >
                {w}
              </motion.span>
            </span>
            {i < words.length - 1 ? " " : null}
          </span>
        ))}
      </span>
    </>
  );
}

/** The heading text as a plain string (directly, or as the only child of one wrapper element), else null. */
function splittable(children: ReactNode): ReactNode | null {
  if (typeof children === "string") return <SplitWords text={children} />;
  const only = Children.count(children) === 1 ? Children.toArray(children)[0] : null;
  if (isValidElement(only)) {
    const el = only as ReactElement<{ children?: ReactNode }>;
    if (typeof el.props.children === "string") {
      return cloneElement(el, undefined, <SplitWords text={el.props.children} />);
    }
  }
  return null;
}

/**
 * Heading that animates once as it enters the viewport: plain text rises word by word out of a mask;
 * anything more complex fades up as a block. Used by `Heading` in primitives.
 */
export function MotionHeading({
  as: Tag = "h2",
  className,
  children,
}: {
  as?: "h1" | "h2" | "h3";
  className?: string;
  children: ReactNode;
}) {
  const Component = motion[Tag];
  const words = splittable(children);
  if (words) {
    return (
      <Component
        className={className}
        initial="hidden"
        whileInView="show"
        viewport={REVEAL.viewport}
        variants={{ hidden: {}, show: {} }}
      >
        {words}
      </Component>
    );
  }
  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: REVEAL.distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={REVEAL.viewport}
      transition={REVEAL.transition}
    >
      {children}
    </Component>
  );
}
