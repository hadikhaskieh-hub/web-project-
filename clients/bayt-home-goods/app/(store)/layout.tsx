import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

// Prices, stock and settings are edited from the admin panel, so the
// storefront always reads the database on request rather than a build
// time snapshot.
export const dynamic = "force-dynamic";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
