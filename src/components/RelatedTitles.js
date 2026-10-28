import { usePersonalization } from "../context/PersonalizationContext";
import { isExcluded } from "../utils/personalization";
import useCatalog from "../hooks/useCatalog";
import SingleContent from "./SingleContent/SingleContent";

export default function RelatedTitles({ id, type, onSelect }) {
  const { feedback } = usePersonalization();
  const recommendations = useCatalog(`${type}/${id}/recommendations`);
  const useSimilar =
    !recommendations.loading &&
    !recommendations.error &&
    !recommendations.content.length;
  const similar = useCatalog(useSimilar ? `${type}/${id}/similar` : null);
  const catalog = useSimilar ? similar : recommendations;
  const items = catalog.content
    .filter(
      (item) =>
        item.id !== id && !isExcluded({ ...item, media_type: type }, feedback),
    )
    .slice(0, 12);
  return (
    <section
      className="related-titles"
      aria-labelledby={`related-heading-${type}-${id}`}
    >
      <div className="detail-section-heading">
        <div>
          <span className="eyebrow">Related titles</span>
          <h3 id={`related-heading-${type}-${id}`}>More like this</h3>
        </div>
        <span className="related-hint">Scroll to explore →</span>
      </div>
      {catalog.error ? (
        <div className="detail-empty" role="alert">
          <p>Related titles couldn’t be loaded.</p>
          <button className="text-button" onClick={catalog.retry}>
            Try again
          </button>
        </div>
      ) : !catalog.loading && !items.length ? (
        <div className="detail-empty">
          <p>No related titles listed yet.</p>
          <span>Browse Movies or TV Series to find more titles.</span>
        </div>
      ) : (
        <div className="related-grid" aria-busy={catalog.loading}>
          {catalog.loading
            ? Array.from({ length: 6 }, (_, index) => (
                <div key={index} aria-hidden="true">
                  <div className="skeleton skeleton-poster" />
                  <div className="skeleton skeleton-line" />
                </div>
              ))
            : items.map((item) => (
                <SingleContent
                  key={item.id}
                  id={item.id}
                  media_type={type}
                  poster={item.poster_path}
                  title={item.title || item.name}
                  date={item.release_date || item.first_air_date}
                  vote_average={item.vote_average}
                  onSelect={() =>
                    onSelect({
                      id: item.id,
                      type,
                      title: item.title || item.name,
                    })
                  }
                />
              ))}
        </div>
      )}
    </section>
  );
}
