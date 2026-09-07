import { Button } from "@/components/ui/button";
import { useCatalog } from "@/context/CatalogProvider";
import { useNavigation } from "@/context/NavigationProvider";
import { parseCta } from "@/lib/cta";
import type { Article } from "@/lib/types";

/** Text block with a link — the third column of the news page. */
export function ArticleNote({ article }: { article: Article }) {
  const { navigate } = useNavigation();
  const { setFilter } = useCatalog();

  const cta = parseCta(article.ctaTarget);

  const follow = () => {
    if (!cta) return;
    if (cta.kind === "page") {
      navigate(cta.page);
      return;
    }
    setFilter(cta.filter);
    navigate("catalog");
  };

  return (
    <div className="space-y-1.5">
      <h3 className="text-base">{article.title}</h3>
      <p className="text-sm text-muted-foreground">{article.text}</p>
      {cta && article.ctaLabel && (
        <Button type="button" variant="link" className="h-auto px-0 py-0" onClick={follow}>
          {article.ctaLabel} →
        </Button>
      )}
    </div>
  );
}
