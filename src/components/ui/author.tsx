import { User } from "lucide-react";
import type { ApiImage, InsightAuthor } from "@/lib/api/schemas";
import { cn, initials } from "@/lib/utils";
import { FIGMA, personAvatar } from "@/lib/figma-assets";
import { Media } from "@/components/ui/media";

/**
 * One shape for the three kinds of insight author (attorney, named writer, the firm), so cards, the
 * featured slider and the article page all render them the same way.
 *   person → the attorney's photo, name and role, linking to their profile
 *   writer → their photo (or a neutral avatar when they have none), name and label, no link
 *   firm   → the SPA mark, "SPA AJIBADE & Co." / "Law Firm", no link
 * The label is shown exactly as the API sends it ("Author", "Co-author", a role, "Law Firm").
 */
export type AuthorView = {
  kind: "person" | "writer" | "firm";
  name: string;
  label: string;
  href: string | null;
  photo: ApiImage | null;
};

export function authorView(a: InsightAuthor): AuthorView {
  if (a.type === "person") {
    return {
      kind: "person",
      name: a.person.displayName,
      label: a.person.roleLabel,
      href: `/people/${a.person.slug}`,
      photo: personAvatar(a.person.slug, a.person.photo),
    };
  }
  if (a.type === "writer") return { kind: "writer", name: a.name, label: a.label, href: null, photo: a.photo };
  return { kind: "firm", name: a.name, label: a.label, href: null, photo: null };
}

/** Round avatar. Size comes from `className` (e.g. "size-9"); `sizes` is the image's rendered width hint. */
export function AuthorAvatar({ view, className, sizes = "44px" }: { view: AuthorView; className?: string; sizes?: string }) {
  if (view.kind === "firm") {
    return <img src={FIGMA.firmAvatar} alt="" width={60} height={60} className={cn("shrink-0 rounded-full", className)} />;
  }
  return (
    <span className={cn("shrink-0 overflow-hidden rounded-full bg-[#56697a]", className)}>
      {view.photo ? (
        <Media image={view.photo} alt="" sizes={sizes} />
      ) : view.kind === "person" ? (
        <span className="grid size-full place-items-center text-[10px] text-white">{initials(view.name)}</span>
      ) : (
        // A writer with no photo gets a neutral person icon, never the firm's logo.
        <span className="grid size-full place-items-center text-white/80">
          <User className="size-1/2" strokeWidth={1.5} aria-hidden />
        </span>
      )}
    </span>
  );
}
