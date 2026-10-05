import type { Site } from "@/lib/api/schemas";
import { telHref } from "@/lib/utils";
import { SocialLinks } from "@/components/ui/social-icons";

/** Figma "Background" utility bar: 61px, black, Inter Display Medium 14, five 24px social icons. */
export function TopBar({ settings }: { settings: Site["settings"] }) {
  const tel = telHref(settings.phone);
  return (
    <div className="relative z-50 bg-ink text-white">
      <div className="container-site flex flex-col items-start gap-3 py-3 text-[13px] font-medium sm:h-[61px] sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-0 md:text-sm">
        <p className="truncate">
          {settings.phone ? (tel ? <a href={tel} className="hover:underline">{settings.phone}</a> : settings.phone) : null}
          {settings.phone && settings.email ? <span className="px-1.5">|</span> : null}
          {settings.email ? (
            <a href={`mailto:${settings.email}`} className="hover:underline">
              {settings.email}
            </a>
          ) : null}
        </p>
        <SocialLinks socials={settings.socials} always className="gap-6 text-[#e4e7ec]" iconClassName="size-6" />
      </div>
    </div>
  );
}
