import { useMemo } from "react";
import { usePersonalization } from "../context/PersonalizationContext";
import useCatalog from "../hooks/useCatalog";
import useServiceMatches from "../hooks/useServiceMatches";
import { isExcluded } from "../utils/personalization";
import { titleKey } from "../utils/library";
import CatalogGrid from "./CatalogGrid";

export default function PersonalizedShelf() {
  const { feedback, streaming } = usePersonalization();
  const seed = feedback.find((item) => item.liked && !item.hidden);
  const catalog = useCatalog(
    seed ? `${seed.media_type}/${seed.id}/recommendations` : null,
  );
  const items = useMemo(
    () =>
      catalog.content.filter(
        (item) =>
          item.id !== seed?.id &&
          !feedback.some(
            (entry) =>
              entry.liked &&
              titleKey(entry) ===
                titleKey({ ...item, media_type: seed?.media_type }),
          ) &&
          !isExcluded({ ...item, media_type: seed?.media_type }, feedback),
      ),
    [catalog.content, seed, feedback],
  );
  const availability = useServiceMatches(items, seed?.media_type, streaming);
  if (!seed) return null;
  return (
    <section className="home-title-row" aria-labelledby="personalized-title">
      <div className="section-heading">
        <h2 id="personalized-title">Because you liked {seed.title}</h2>
      </div>
      <p className="recommendation-reason">
        Similar titles
        {streaming
          ? ` included with your subscriptions in ${streaming.region}`
          : ""}
        . Watched and hidden titles are skipped.
      </p>
      <CatalogGrid
        content={availability.content}
        mediaType={seed.media_type}
        limit={6}
        loading={catalog.loading || availability.loading}
        error={catalog.error || availability.error}
        retry={() => {
          catalog.retry();
          availability.retry();
        }}
      />
    </section>
  );
}
