"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { motion } from "motion/react";
import type { ApiLink } from "@/lib/api/schemas";
import { useActions } from "@/components/forms/actions-context";
import { INTERACTION, TRANSITIONS } from "@/lib/motion";

const MotionNextLink = motion.create(Link);

/**
 * Renders a CMS link correctly whatever its kind:
 * internal → next/link, external → new tab, action → button that runs the action.
 * Enhanced with subtle scale hover and tap micro-interactions.
 */
export function SmartLink({
  link,
  className,
  children,
  practiceArea,
}: {
  link: ApiLink;
  className?: string;
  children?: ReactNode;
  practiceArea?: string;
}) {
  const { run } = useActions();
  const content = children ?? link.label;
  const isPill = className?.includes("rounded-full");
  const interaction = isPill ? INTERACTION.pill : INTERACTION.button;

  if (link.kind === "action" || link.href.startsWith("action:")) {
    return (
      <motion.button
        type="button"
        className={className}
        whileHover={interaction.whileHover}
        whileTap={interaction.whileTap}
        transition={TRANSITIONS.hover}
        onClick={() => run(link.href, { practiceArea })}
      >
        {content}
      </motion.button>
    );
  }

  if (link.kind === "external" || /^https?:\/\//.test(link.href)) {
    return (
      <motion.a
        href={link.href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={interaction.whileHover}
        whileTap={interaction.whileTap}
        transition={TRANSITIONS.hover}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <MotionNextLink
      href={link.href}
      className={className}
      whileHover={interaction.whileHover}
      whileTap={interaction.whileTap}
      transition={TRANSITIONS.hover}
    >
      {content}
    </MotionNextLink>
  );
}

export function ActionButton({
  action,
  className,
  children,
  practiceArea,
}: {
  action: string;
  className?: string;
  children: ReactNode;
  practiceArea?: string;
}) {
  const { run } = useActions();
  const isPill = className?.includes("rounded-full");
  const interaction = isPill ? INTERACTION.pill : INTERACTION.button;

  return (
    <motion.button
      type="button"
      className={className}
      whileHover={interaction.whileHover}
      whileTap={interaction.whileTap}
      transition={TRANSITIONS.hover}
      onClick={() => run(action, { practiceArea })}
    >
      {children}
    </motion.button>
  );
}
