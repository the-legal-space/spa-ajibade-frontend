"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { ApiLink } from "@/lib/api/schemas";
import { useActions } from "@/components/forms/actions-context";

/**
 * Renders a CMS link correctly whatever its kind:
 * internal → next/link, external → new tab, action → button that runs the action.
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

  if (link.kind === "action" || link.href.startsWith("action:")) {
    return (
      <button type="button" className={className} onClick={() => run(link.href, { practiceArea })}>
        {content}
      </button>
    );
  }

  if (link.kind === "external" || /^https?:\/\//.test(link.href)) {
    return (
      <a href={link.href} className={className} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return (
    <Link href={link.href} className={className}>
      {content}
    </Link>
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
  return (
    <button type="button" className={className} onClick={() => run(action, { practiceArea })}>
      {children}
    </button>
  );
}
