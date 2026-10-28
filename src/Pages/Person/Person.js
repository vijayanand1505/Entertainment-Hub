import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import ArrowBackRoundedIcon from "@material-ui/icons/ArrowBackRounded";
import OpenInNewRoundedIcon from "@material-ui/icons/OpenInNewRounded";
import { img_500, noPicture } from "../../config/config";
import { creator } from "../../config/creator";
import useTmdb from "../../hooks/useTmdb";
import SingleContent from "../../components/SingleContent/SingleContent";
import {
  formatPersonDate,
  personCredits,
  sortCredits,
  validPersonId,
} from "../../utils/people";
import "./Person.css";

function MissingPerson() {
  return (
    <div className="catalog-state">
      <span className="eyebrow">Profile unavailable</span>
      <h1>This profile isn’t available.</h1>
      <p>Check the link or open a cast profile from another title.</p>
      <Link className="button" to="/">
        Back to Discover
      </Link>
    </div>
  );
}
function PersonProfile({ id, from, fromTitle }) {
  const profile = useTmdb(`person/${id}?append_to_response=combined_credits`);
  const person = profile.data;
  const [expanded, setExpanded] = useState(false);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("popular");
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(24);
  const credits = personCredits(person?.combined_credits?.cast);
  const filtered = sortCredits(
    credits.filter(
      (item) =>
        (filter === "all" || item.media_type === filter) &&
        item.title.toLowerCase().includes(search.trim().toLowerCase()),
    ),
    sort,
  );
  useEffect(() => {
    if (!person?.name) return;
    const previous = document.title;
    document.title = `${person.name} — Cast profile | Entertainment Hub · ${creator.name}`;
    return () => {
      document.title = previous;
    };
  }, [person?.name]);
  if (profile.status === 404) return <MissingPerson />;
  return (
    <div className="person-page">
      <nav className="title-breadcrumb" aria-label="Cast profile navigation">
        <Link to={from}>
          <ArrowBackRoundedIcon />
          <span>{fromTitle ? `Back to ${fromTitle}` : "Back to browsing"}</span>
        </Link>
        <span>Cast profile</span>
      </nav>
      {profile.error ? (
        <div className="catalog-state" role="alert">
          <h1>Couldn’t load profile</h1>
          <p>We couldn’t load this profile. Please try again.</p>
          <button className="button" onClick={profile.retry}>
            Try again
          </button>
        </div>
      ) : !person ? (
        <div className="person-loading" role="status">
          <h1>Loading profile…</h1>
          <div className="skeleton" />
          <span>Loading profile and credits</span>
        </div>
      ) : (
        <>
          <section className="person-hero" aria-labelledby="person-name">
            <img
              className="person-portrait"
              src={
                person.profile_path
                  ? `${img_500}${person.profile_path}`
                  : noPicture
              }
              alt={person.name}
              onError={(event) => {
                if (!event.currentTarget.src.endsWith(noPicture))
                  event.currentTarget.src = noPicture;
              }}
            />
            <div className="person-intro">
              <span className="eyebrow">Cast and crew</span>
              <h1 id="person-name">{person.name}</h1>
              <div className="person-meta">
                {person.known_for_department && (
                  <span>{person.known_for_department}</span>
                )}
                <span>{credits.length} on-screen credits</span>
              </div>
              <dl className="person-facts">
                {formatPersonDate(person.birthday) && (
                  <div>
                    <dt>Born</dt>
                    <dd>{formatPersonDate(person.birthday)}</dd>
                  </div>
                )}
                {formatPersonDate(person.deathday) && (
                  <div>
                    <dt>Died</dt>
                    <dd>{formatPersonDate(person.deathday)}</dd>
                  </div>
                )}
                {person.place_of_birth && (
                  <div>
                    <dt>Birthplace</dt>
                    <dd>{person.place_of_birth}</dd>
                  </div>
                )}
              </dl>
              <h2>Behind the spotlight</h2>
              <div
                id="person-biography"
                className={`person-biography ${expanded || !person.biography || person.biography.length <= 550 ? "" : "collapsed"}`}
              >
                {person.biography ? (
                  person.biography
                    .split(/\n\s*\n/)
                    .map((paragraph, index) => <p key={index}>{paragraph}</p>)
                ) : (
                  <p>A biography isn’t available for this person yet.</p>
                )}
              </div>
              {person.biography?.length > 550 && (
                <button
                  className="text-button"
                  aria-expanded={expanded}
                  aria-controls="person-biography"
                  onClick={() => setExpanded((value) => !value)}
                >
                  {expanded ? "Show less" : "Read full biography"}
                  <span aria-hidden="true">{expanded ? " ↑" : " ↓"}</span>
                </button>
              )}
              <a
                className="text-link person-tmdb"
                href={`https://www.themoviedb.org/person/${id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Profile on TMDB
                <OpenInNewRoundedIcon />
              </a>
            </div>
          </section>
          <section
            className="person-filmography"
            aria-labelledby="filmography-heading"
          >
            <div className="section-heading">
              <div>
                <h2 id="filmography-heading">
                  Movies and series
                </h2>
                <p>Explore movies and series featuring {person.name}.</p>
              </div>
            </div>
            <div className="filmography-toolbar">
              <div
                className="period-tabs"
                role="group"
                aria-label="Filter filmography"
              >
                {[
                  ["all", "All titles"],
                  ["movie", "Movies"],
                  ["tv", "TV Series"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    aria-pressed={filter === value}
                    className={filter === value ? "active" : ""}
                    onClick={() => {
                      setFilter(value);
                      setLimit(24);
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="filmography-controls">
                <input
                  type="search"
                  aria-label="Search filmography"
                  placeholder="Find a title…"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setLimit(24);
                  }}
                />
                <label className="sr-only" htmlFor="filmography-sort">
                  Sort filmography
                </label>
                <select
                  id="filmography-sort"
                  value={sort}
                  onChange={(event) => {
                    setSort(event.target.value);
                    setLimit(24);
                  }}
                >
                  <option value="popular">Most popular</option>
                  <option value="newest">Newest first</option>
                </select>
              </div>
            </div>
            <p className="discovery-summary" role="status">
              {filtered.length} {filtered.length === 1 ? "title" : "titles"}
              {filtered.length > limit ? ` · Showing ${limit}` : ""}
            </p>
            {filtered.length ? (
              <>
                <div className="trending filmography-grid">
                  {filtered.slice(0, limit).map((item) => (
                    <div
                      className="filmography-item"
                      key={`${item.media_type}:${item.id}`}
                    >
                      <SingleContent
                        id={item.id}
                        media_type={item.media_type}
                        title={item.title}
                        poster={item.poster_path}
                        date={item.release_date}
                        vote_average={item.vote_average}
                      />
                      {item.roles.length > 0 && (
                        <p
                          className="credit-role"
                          title={item.roles.join(" / ")}
                        >
                          As {item.roles.join(" / ")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                {filtered.length > limit && (
                  <div className="filmography-more">
                    <button
                      className="button button-secondary"
                      onClick={() => setLimit((value) => value + 24)}
                    >
                      Load more titles
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="catalog-state">
                <h3>
                  {credits.length
                    ? "No matching titles"
                    : "No on-screen credits listed yet"}
                </h3>
                <p>
                  {credits.length
                    ? "Try another search or switch to All titles."
                    : "Check back soon to explore this person’s movies and series."}
                </p>
                {credits.length > 0 && (
                  <button
                    className="button"
                    onClick={() => {
                      setFilter("all");
                      setSearch("");
                      setLimit(24);
                    }}
                  >
                    Show all titles
                  </button>
                )}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
export default function PersonPage() {
  const { id } = useParams();
  const location = useLocation();
  const candidate = location.state?.from;
  const from =
    typeof candidate === "string" &&
    candidate.startsWith("/") &&
    !candidate.startsWith("//")
      ? candidate
      : "/";
  const fromTitle =
    typeof location.state?.fromTitle === "string"
      ? location.state.fromTitle
      : "";
  return validPersonId(id) ? (
    <PersonProfile key={id} id={Number(id)} from={from} fromTitle={fromTitle} />
  ) : (
    <MissingPerson />
  );
}
