import {
  Award,
  BadgeCheck,
  Eye,
  FolderLock,
  Gavel,
  Handshake,
  Scale,
  ShieldCheck,
  ShieldPlus,
  Target,
  Users,
  type LucideIcon,
} from "lucide-react";

/** Maps the CMS icon keys to icons. Unknown keys fall back to a neutral badge. */
const map: Record<string, LucideIcon> = {
  award: Award,
  "shield-plus": ShieldPlus,
  "shield-check": ShieldCheck,
  handshake: Handshake,
  "folder-lock": FolderLock,
  eye: Eye,
  gavel: Gavel,
  scale: Scale,
  users: Users,
  target: Target,
};

export function CmsIcon({ name, className }: { name: string; className?: string }) {
  const Icon = map[name] ?? BadgeCheck;
  return <Icon className={className} strokeWidth={1.4} aria-hidden />;
}
