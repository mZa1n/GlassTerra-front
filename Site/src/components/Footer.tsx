import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Separator } from "@/components/ui/separator";
import { useCatalog } from "@/context/CatalogProvider";
import { useNavigation } from "@/context/NavigationProvider";
import { SHOP } from "@/data/shop";
import type { CatalogFilter, Page } from "@/lib/types";

interface FooterLink {
  label: string;
  page: Page;
  /** Optional catalog filter applied before navigating. */
  filter?: CatalogFilter;
}

const BUYER_LINKS: readonly FooterLink[] = [
  { label: "Каталог товаров", page: "catalog", filter: { kind: "all" } },
  { label: "Новинки", page: "catalog", filter: { kind: "new" } },
  { label: "Товары со скидкой", page: "catalog", filter: { kind: "sale" } },
  { label: "Доставка и оплата", page: "delivery" },
  { label: "Возврат товара", page: "returns" },
];

const COMPANY_LINKS: readonly FooterLink[] = [
  { label: "О нас", page: "about" },
  { label: "Контакты", page: "contacts" },
  { label: "Вакансии", page: "vacancies" },
  { label: "Новости и акции", page: "news" },
  { label: "Партнёрам", page: "partners" },
];

const LEGAL_LINKS: readonly FooterLink[] = [
  { label: "Политика конфиденциальности", page: "privacy" },
  { label: "Пользовательское соглашение", page: "terms" },
];

function FooterNav({ title, links }: { title: string; links: readonly FooterLink[] }) {
  const { navigate } = useNavigation();
  const { setFilter } = useCatalog();

  return (
    <div>
      <h3 className="mb-4 text-sm tracking-wide uppercase opacity-60">{title}</h3>
      <ul className="space-y-2 text-sm">
        {links.map((link) => (
          <li key={link.label}>
            <button
              type="button"
              onClick={() => {
                if (link.filter) setFilter(link.filter);
                navigate(link.page);
              }}
              className="text-left opacity-70 transition-opacity hover:opacity-100"
            >
              {link.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const { navigate } = useNavigation();

  return (
    <footer className="mt-20 bg-surface-strong text-surface-strong-foreground">
      <div className="mx-auto max-w-[1400px] px-4 py-12 md:px-6">
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <Logo />
            </div>
            <p className="text-sm leading-relaxed opacity-70">
              Стеклянная и керамическая посуда для дома. Качество и стиль в каждом изделии.
            </p>
          </div>

          <FooterNav title="Покупателям" links={BUYER_LINKS} />
          <FooterNav title="О компании" links={COMPANY_LINKS} />

          <div>
            <h3 className="mb-4 text-sm tracking-wide uppercase opacity-60">Контакты</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 size-4 shrink-0" />
                <a href={SHOP.phoneHref} className="opacity-70 transition-opacity hover:opacity-100">
                  {SHOP.phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 size-4 shrink-0" />
                <a href={`mailto:${SHOP.email}`} className="opacity-70 transition-opacity hover:opacity-100">
                  {SHOP.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0" />
                <button
                  type="button"
                  onClick={() => navigate("contacts")}
                  className="text-left opacity-70 transition-opacity hover:opacity-100"
                >
                  {SHOP.address}
                </button>
              </li>
            </ul>

            <ul className="mt-6 flex flex-wrap gap-3 text-sm">
              {SHOP.social.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded border border-current/20 px-3 py-1.5 opacity-80 transition-opacity hover:opacity-100"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="bg-current/15" />

        <div className="flex flex-col items-center justify-between gap-4 pt-8 text-sm opacity-70 md:flex-row">
          <p>
            © {new Date().getFullYear()} {SHOP.name}. Все права защищены.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {LEGAL_LINKS.map((link) => (
              <button
                key={link.page}
                type="button"
                onClick={() => navigate(link.page)}
                className="opacity-70 transition-opacity hover:opacity-100"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
