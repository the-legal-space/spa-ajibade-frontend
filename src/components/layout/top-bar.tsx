import type { Site } from "@/lib/api/schemas";
import { telHref } from "@/lib/utils";
import { SocialLinks } from "@/components/ui/social-icons";

export function TopBar({ settings }: { settings: Site["settings"] }) {
  const tel = telHref(settings.phone);
  return (
    <div className="relative z-50 bg-ink text-white">
      <div className="container-site flex h-[50px] items-center justify-between gap-4 text-[13px]">
        <p className="truncate">
          {settings.phone ? (tel ? <a href={tel} className="hover:underline">{settings.phone}</a> : settings.phone) : null}
          {settings.phone && settings.email ? <span className="px-1.5 text-white/60">|</span> : null}
          {settings.email ? (
            <a href={`mailto:${settings.email}`} className="hover:underline">
              {settings.email}
            </a>
          ) : null}
        </p>
        <SocialLinks socials={settings.socials} className="hidden gap-5 sm:flex" />
      </div>
    </div>
  );
}
