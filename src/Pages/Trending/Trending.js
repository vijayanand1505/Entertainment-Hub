import "./Trending.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import ArrowForwardRoundedIcon from "@material-ui/icons/ArrowForwardRounded";
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";
import StarRoundedIcon from "@material-ui/icons/StarRounded";
import PauseRoundedIcon from "@material-ui/icons/PauseRounded";
import PlayArrowRoundedIcon from "@material-ui/icons/PlayArrowRounded";
import GroupRoundedIcon from "@material-ui/icons/GroupRounded";
import ShuffleRoundedIcon from "@material-ui/icons/ShuffleRounded";
import ContentModal from "../../components/ContentModal/ContentModal";
import CatalogGrid from "../../components/CatalogGrid";
import SaveButton from "../../components/SaveButton";
import TrendingPeriodTabs from "../../components/TrendingPeriodTabs";
import useCatalog from "../../hooks/useCatalog";
import useAutoSlide from "../../hooks/useAutoSlide";
import PersonalizedShelf from "../../components/PersonalizedShelf";
import { usePersonalization } from "../../context/PersonalizationContext";
import { isExcluded } from "../../utils/personalization";
import PersonalShelves from "../../components/PersonalShelves";

const Trending = () => {
  const [period, setPeriod] = useState("day");
  const catalog = useCatalog(`trending/all/${period}`);
  const { feedback } = usePersonalization();
  const content = catalog.content.filter((item) => !isExcluded(item, feedback));
  const featured = content.filter((item) => item.backdrop_path).slice(0, 5);
  const carousel = useAutoSlide(featured.length, !catalog.loading, period);
  const featuredIndex = carousel.index;
  const spotlight = featured[featuredIndex] || featured[0];
  return (
    <div className="home-page">
      <div className="discover-intro">
        <h1>Find something to watch</h1>
      </div>
      {catalog.loading ? (
        <div
          className="hero hero-skeleton skeleton"
          aria-label="Loading spotlight"
        />
      ) : (
        spotlight && (
          <section
            className="hero"
            aria-label="Featured title"
            aria-roledescription="carousel"
            onMouseEnter={() => carousel.setHovered(true)}
            onMouseLeave={() => carousel.setHovered(false)}
            onFocusCapture={(event) =>
              carousel.setFocused(!event.target.closest(".hero-autoplay"))
            }
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget))
                carousel.setFocused(false);
            }}
          >
            <img
              className="hero-image"
              key={`image-${spotlight.media_type}-${spotlight.id}`}
              src={`https://image.tmdb.org/t/p/w1280${spotlight.backdrop_path}`}
              srcSet={`https://image.tmdb.org/t/p/w780${spotlight.backdrop_path} 780w, https://image.tmdb.org/t/p/w1280${spotlight.backdrop_path} 1280w, https://image.tmdb.org/t/p/original${spotlight.backdrop_path} 1920w`}
              sizes="(max-width: 650px) 100vw, (max-width: 1496px) calc(100vw - 96px), 1400px"
              alt=""
            />
            <div className="hero-shade" />
            <div
              className="hero-content"
              key={`content-${spotlight.media_type}-${spotlight.id}`}
              aria-live={carousel.playing ? "off" : "polite"}
            >
              <span className="hero-label">Featured</span>
              <div className="hero-meta">
                <span className="hero-rating">
                  <StarRoundedIcon />
                  {spotlight.vote_average > 0
                    ? spotlight.vote_average.toFixed(1)
                    : "Not rated"}
                </span>
                <span>
                  {(
                    spotlight.release_date ||
                    spotlight.first_air_date ||
                    ""
                  ).slice(0, 4)}
                </span>
                <span className="meta-dot" />
                <span>
                  {spotlight.media_type === "tv" ? "TV Series" : "Movie"}
                </span>
              </div>
              <h2>{spotlight.title || spotlight.name}</h2>
              <p>
                {spotlight.overview ||
                  "No synopsis available. Open the details to learn more."}
              </p>
              <div className="hero-actions">
                <ContentModal
                  media_type={spotlight.media_type}
                  id={spotlight.id}
                  triggerClassName="button"
                  label={`View details for ${spotlight.title || spotlight.name}`}
                >
                  <InfoOutlinedIcon />
                  View details
                </ContentModal>
                <SaveButton item={spotlight} shortLabel />
              </div>
            </div>
            <div className="hero-bottom">
              <span className="hero-caption">Featured movies and series</span>
              <div className="hero-carousel-controls">
                {featured.length > 1 && (
                  <button
                    className="hero-autoplay"
                    type="button"
                    aria-label={
                      carousel.playing
                        ? "Pause featured slideshow"
                        : "Play featured slideshow"
                    }
                    title={
                      carousel.playing ? "Pause slideshow" : "Play slideshow"
                    }
                    onClick={carousel.togglePlaying}
                  >
                    {carousel.playing ? (
                      <PauseRoundedIcon />
                    ) : (
                      <PlayArrowRoundedIcon />
                    )}
                  </button>
                )}
                <div
                  className="hero-selectors"
                  aria-label="Choose featured title"
                >
                  {featured.map((item, index) => (
                    <button
                      key={`${item.media_type}-${item.id}`}
                      type="button"
                      aria-label={`Feature ${item.title || item.name}`}
                      aria-pressed={index === featuredIndex}
                      className={index === featuredIndex ? "active" : ""}
                      onClick={() => carousel.select(index)}
                    >
                      <span />
                    </button>
                  ))}
                  <span className="hero-count">
                    {featuredIndex + 1}
                    <span> / {featured.length}</span>
                  </span>
                </div>
              </div>
            </div>
          </section>
        )
      )}
      <nav className="home-shortcuts" aria-label="Discovery shortcuts">
        <Link to="/pick-for-me">
          <ShuffleRoundedIcon />
          <span>Pick for me</span>
          <ArrowForwardRoundedIcon className="shortcut-arrow" />
        </Link>
        <Link to="/movie-night">
          <GroupRoundedIcon />
          <span>Movie night</span>
          <ArrowForwardRoundedIcon className="shortcut-arrow" />
        </Link>
      </nav>
      <section className="home-title-row" aria-labelledby="trending-title">
        <div className="section-heading">
          <h2 id="trending-title">Trending now</h2>
          <Link
            to={`/trending?period=${period}`}
            className="text-link"
            aria-label="View all trending titles"
          >
            View all
            <ArrowForwardRoundedIcon />
          </Link>
        </div>
        <div className="catalog-toolbar">
          <TrendingPeriodTabs period={period} onChange={setPeriod} />
        </div>
        <CatalogGrid {...catalog} content={content} limit={6} />
      </section>
      <PersonalizedShelf />
      <PersonalShelves />
      <nav className="home-browse" aria-label="Browse catalogs">
        <span>Keep exploring</span>
        <Link className="text-link" to="/movies">
          Movies <ArrowForwardRoundedIcon />
        </Link>
        <Link className="text-link" to="/series">
          TV series <ArrowForwardRoundedIcon />
        </Link>
      </nav>
    </div>
  );
};
export default Trending;
