import "./Trending.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import ArrowForwardRoundedIcon from "@material-ui/icons/ArrowForwardRounded";
import WhatshotRoundedIcon from "@material-ui/icons/WhatshotRounded";
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";
import StarRoundedIcon from "@material-ui/icons/StarRounded";
import PauseRoundedIcon from "@material-ui/icons/PauseRounded";
import PlayArrowRoundedIcon from "@material-ui/icons/PlayArrowRounded";
import GroupRoundedIcon from "@material-ui/icons/GroupRounded";
import ContentModal from "../../components/ContentModal/ContentModal";
import CatalogGrid from "../../components/CatalogGrid";
import useCatalog from "../../hooks/useCatalog";
import useAutoSlide from "../../hooks/useAutoSlide";
import PersonalShelves from "../../components/PersonalShelves";
import ShuffleRoundedIcon from "@material-ui/icons/ShuffleRounded";
import "../Pick/Pick.css";

const Trending = () => {
  const [period, setPeriod] = useState("day");
  const catalog = useCatalog(`trending/all/${period}`);
  const featured = catalog.content
    .filter((item) => item.backdrop_path)
    .slice(0, 5);
  const carousel = useAutoSlide(featured.length, !catalog.loading, period);
  const featuredIndex = carousel.index;
  const spotlight = featured[featuredIndex] || featured[0];
  return (
    <div>
      <div className="discover-intro">
        <div>
          <span className="eyebrow">YOUR DAILY DOSE OF GREAT STORIES</span>
          <h1>
            Find your next favorite<span>.</span>
          </h1>
        </div>
        <span className="live-label">
          <span />
          Always something worth watching
        </span>
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
              <span className="hero-label">
                <WhatshotRoundedIcon />
                IN THE SPOTLIGHT
              </span>
              <div className="hero-meta">
                <span className="hero-rating">
                  <StarRoundedIcon />
                  {spotlight.vote_average?.toFixed(1)}
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
                <span className="hero-trending">Trending now</span>
              </div>
              <h2>{spotlight.title || spotlight.name}</h2>
              <p>
                {spotlight.overview ||
                  "A story worth discovering. Take a closer look at this trending title."}
              </p>
              <div className="hero-actions">
                <ContentModal
                  media_type={spotlight.media_type}
                  id={spotlight.id}
                  triggerClassName="button"
                  label={`More about ${spotlight.title || spotlight.name}`}
                >
                  <InfoOutlinedIcon />
                  More details
                </ContentModal>
                <Link className="button button-secondary" to="/movies">
                  Explore movies
                  <ArrowForwardRoundedIcon />
                </Link>
              </div>
            </div>
            <div className="hero-bottom">
              <span className="hero-caption">
                A new story. A different world.
              </span>
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
                      aria-label={`Feature ${item.title || item.name}`}
                      aria-pressed={index === featuredIndex}
                      className={index === featuredIndex ? "active" : ""}
                      onClick={() => carousel.select(index)}
                    >
                      <span />
                    </button>
                  ))}
                  <span className="hero-count">
                    0{featuredIndex + 1}
                    <span> / 0{featured.length}</span>
                  </span>
                </div>
              </div>
            </div>
          </section>
        )
      )}
      <section className="pick-home-banner" aria-label="Find a recommendation">
        <div>
          <span className="pick-banner-icon" aria-hidden="true">
            ✦
          </span>
          <div>
            <span className="eyebrow">LET THE STORY FIND YOU</span>
            <h2>Can’t decide what to watch?</h2>
            <p>A mood, a little time, and one pick just for tonight.</p>
          </div>
        </div>
        <Link className="button" to="/pick-for-me">
          <ShuffleRoundedIcon />
          Pick for me
        </Link>
      </section>
      <section className="night-home-banner" aria-label="Movie Night Match">
        <div>
          <span className="night-banner-icon" aria-hidden="true">
            <GroupRoundedIcon />
          </span>
          <div>
            <span className="eyebrow">MAKE A NIGHT OF IT, TOGETHER</span>
            <h2>One movie. Everyone’s kind of night.</h2>
            <p>
              Invite your crew, vote in private, and reveal your shared
              favorites.
            </p>
          </div>
        </div>
        <Link className="button button-secondary" to="/movie-night">
          Plan a movie night
          <ArrowForwardRoundedIcon />
        </Link>
      </section>
      <PersonalShelves />
      <section className="trending-section" aria-labelledby="trending-title">
        <div className="section-heading">
          <div>
            <h2 id="trending-title">
              Worth the hype<span className="heading-dot">.</span>
            </h2>
            <p>The movies and series everyone’s talking about.</p>
          </div>
          <Link to="/movies" className="text-link">
            Discover movies
            <ArrowForwardRoundedIcon />
          </Link>
        </div>
        <div className="catalog-toolbar">
          <div
            className="period-tabs"
            role="group"
            aria-label="Trending time period"
          >
            <button
              className={period === "day" ? "active" : ""}
              aria-pressed={period === "day"}
              onClick={() => {
                setPeriod("day");
              }}
            >
              Today
            </button>
            <button
              className={period === "week" ? "active" : ""}
              aria-pressed={period === "week"}
              onClick={() => {
                setPeriod("week");
              }}
            >
              This week
            </button>
          </div>
          <span className="catalog-note">
            <WhatshotRoundedIcon />
            Trending across movies & TV
          </span>
        </div>
        <CatalogGrid {...catalog} />
      </section>
      <Link className="discover-banner" to="/series">
        <span className="banner-icon">↗</span>
        <span>
          <span className="eyebrow">ONE MORE EPISODE?</span>
          <strong>Meet your next binge.</strong>
          <span className="banner-description">
            New worlds, unforgettable characters, and stories that stay with
            you.
          </span>
        </span>
        <span className="banner-link">
          Explore TV series
          <ArrowForwardRoundedIcon />
        </span>
      </Link>
    </div>
  );
};
export default Trending;
