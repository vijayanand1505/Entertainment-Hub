import { useHistory, useLocation } from "react-router-dom";
import CatalogGrid from "../../components/CatalogGrid";
import CustomPagination from "../../components/Pagination/CustomPagination";
import TrendingPeriodTabs from "../../components/TrendingPeriodTabs";
import { usePersonalization } from "../../context/PersonalizationContext";
import { isExcluded } from "../../utils/personalization";
import useCatalog from "../../hooks/useCatalog";

export default function TrendingCatalog() {
  const { feedback } = usePersonalization();
  const history = useHistory();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const period = params.get("period") === "week" ? "week" : "day";
  const requestedPage = Number(params.get("page"));
  const page =
    Number.isInteger(requestedPage) &&
    requestedPage >= 1 &&
    requestedPage <= 500
      ? requestedPage
      : 1;
  const catalog = useCatalog(`trending/all/${period}?page=${page}`);
  const update = (nextPeriod, nextPage = 1) =>
    history.push({
      pathname: "/trending",
      search: new URLSearchParams({
        period: nextPeriod,
        page: String(nextPage),
      }).toString(),
    });
  return (
    <div>
      <div className="page-heading">
        <span className="eyebrow">Discover</span>
        <h1>Trending movies and series</h1>
        <p>Browse what’s trending on TMDB today or this week.</p>
      </div>
      <div className="catalog-toolbar">
        <TrendingPeriodTabs
          period={period}
          onChange={(nextPeriod) => update(nextPeriod)}
        />
      </div>
      <CatalogGrid
        {...catalog}
        content={catalog.content.filter((item) => !isExcluded(item, feedback))}
      />
      {catalog.pages > 1 && !catalog.loading && (
        <CustomPagination
          page={page}
          setPage={(nextPage) => update(period, nextPage)}
          numOfPages={catalog.pages}
        />
      )}
    </div>
  );
}
