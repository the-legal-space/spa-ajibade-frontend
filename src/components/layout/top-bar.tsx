import type { Site } from "@/lib/api/schemas";
import { telHref } from "@/lib/utils";
import { SocialLinks } from "@/components/ui/social-icons";

/** Figma "Background" utility bar: 61px, black, Inter Display Medium 14, five 24px social icons. */
export function TopBar({ settings, email }: { settings: Site["settings"]; email?: string | null }) {
  const tel = telHref(settings.phone);
  // The Lagos office address (the one in the footer) when known; the general settings email otherwise.
  const shownEmail = email || settings.email;
  return (
    <div className="relative z-50 bg-ink text-white">
      <div className="container-site flex flex-col items-start gap-3 py-3 text-[13px] font-medium sm:h-[61px] sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-0 md:text-sm">
        <p className="max-w-full break-words sm:truncate">
          {settings.phone ? (tel ? <a href={tel} className="hover:underline">{settings.phone}</a> : settings.phone) : null}
          {settings.phone && shownEmail ? <span className="px-1.5">|</span> : null}
          {shownEmail ? (
            <a href={`mailto:${shownEmail}`} className="hover:underline">
              {shownEmail}
            </a>
          ) : null}
        </p>
        <SocialLinks socials={settings.socials} always className="text-[#e4e7ec] sm:gap-6" iconClassName="sm:size-6" />
      </div>
    </div>
  );
}
