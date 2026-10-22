import { useRouter } from "@tanstack/react-router";

import { getLocale, setLocale } from "@/paraglide/runtime.js";

export function LanguageSwitcher() {
  const router = useRouter();
  const currentLang = getLocale();

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = e.target.value as "en" | "tr";

    // Geçici olarak as-needed kapatıldı. Her dil için prefix eklenecek.
    // Issue çözüldüğünde eski localizeUrl mantığına dönülebilir.
    const url = new URL(window.location.href);
    const pathSegments = url.pathname.split("/").filter(Boolean);

    if (pathSegments.length > 0 && (pathSegments[0] === "en" || pathSegments[0] === "tr")) {
      pathSegments[0] = nextLocale;
    } else {
      pathSegments.unshift(nextLocale);
    }

    const newPath = "/" + pathSegments.join("/");

    setLocale(nextLocale, { reload: false });
    void router.navigate({
      to: `${newPath}${url.search}${url.hash}`,
      replace: true,
    });
  };

  return (
    <div className="relative">
      <select
        value={currentLang}
        onChange={onChange}
        className="h-9 cursor-pointer appearance-none rounded-md border border-input bg-background pr-8 pl-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none disabled:opacity-50"
      >
        <option value="en">EN</option>
        <option value="tr">TR</option>
      </select>
      <div className="pointer-events-none absolute top-[9px] right-2.5 h-4 w-4 text-muted-foreground">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </div>
  );
}
