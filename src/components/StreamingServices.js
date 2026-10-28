import { useState } from "react";
import { usePersonalization } from "../context/PersonalizationContext";
import useTmdb from "../hooks/useTmdb";
import { FALLBACK_REGIONS, normalizeProvider } from "../utils/personalization";
import "./Personalization.css";

export default function StreamingServices({
  onChange,
  toggleLabel = "Only my streaming services",
}) {
  const {
    region,
    services,
    onlyMyServices,
    setRegion,
    toggleService,
    setOnlyMyServices,
    persistent,
  } = usePersonalization();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const movies = useTmdb(
    open ? `watch/providers/movie?watch_region=${region}` : null,
  );
  const series = useTmdb(
    open ? `watch/providers/tv?watch_region=${region}` : null,
  );
  const regions = useTmdb(open ? "watch/providers/regions" : null);
  const selected = services[region] || [];
  const countries = (regions.data?.results || FALLBACK_REGIONS)
    .slice()
    .sort((a, b) => a.english_name.localeCompare(b.english_name));
  const providers = [
    ...new Map(
      [
        ...selected,
        ...(movies.data?.results || []).map(normalizeProvider),
        ...(series.data?.results || []).map(normalizeProvider),
      ]
        .filter(Boolean)
        .map((p) => [p.id, p]),
    ).values(),
  ].sort(
    (a, b) =>
      Number(selected.some((p) => p.id === b.id)) -
        Number(selected.some((p) => p.id === a.id)) ||
      a.name.localeCompare(b.name),
  );
  const update = (action) => {
    action();
    onChange?.();
  };
  return (
    <section className="streaming-services" aria-label="My streaming services">
      <details
        open={open}
        onToggle={(event) => setOpen(event.currentTarget.open)}
      >
        <summary>
          <strong>My streaming services</strong>
          <span>
            {selected.length
              ? `${selected.length} selected · ${region}`
              : "Choose your subscriptions"}
          </span>
        </summary>
        <div className="streaming-editor">
          <label>
            Watching from
            <select
              aria-label="Streaming country"
              value={region}
              onChange={(e) => {
                setSearch("");
                update(() => setRegion(e.target.value));
              }}
            >
              {!countries.some((c) => c.iso_3166_1 === region) && (
                <option value={region}>{region}</option>
              )}
              {countries.map((country) => (
                <option key={country.iso_3166_1} value={country.iso_3166_1}>
                  {country.english_name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Find a service
            <input
              type="search"
              aria-label="Find a streaming service"
              placeholder="Search services…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          {(movies.loading || series.loading) && (
            <p role="status">Loading services…</p>
          )}
          {(movies.error || series.error) && (
            <p role="alert">
              Some services couldn’t load.{" "}
              <button
                type="button"
                className="text-button"
                onClick={() => {
                  movies.retry();
                  series.retry();
                }}
              >
                Try again
              </button>
            </p>
          )}
          <div
            className="service-options"
            role="group"
            aria-label="Select your streaming subscriptions"
          >
            {providers
              .filter((p) =>
                p.name.toLowerCase().includes(search.toLowerCase().trim()),
              )
              .map((p) => (
                <label key={p.id} className="service-option">
                  <input
                    type="checkbox"
                    checked={selected.some((s) => s.id === p.id)}
                    onChange={() => update(() => toggleService(p))}
                  />
                  {p.logo && (
                    <img
                      src={`https://image.tmdb.org/t/p/w45${p.logo}`}
                      alt=""
                      loading="lazy"
                    />
                  )}
                  <span>{p.name}</span>
                </label>
              ))}
          </div>
          {!movies.loading &&
            !series.loading &&
            !movies.error &&
            !series.error &&
            !providers.length && <p>No services listed for this country.</p>}
          {providers.length > 0 &&
            !providers.some((p) =>
              p.name.toLowerCase().includes(search.toLowerCase().trim()),
            ) && <p>No matching services. Try another name.</p>}
          <p className="personalization-note">
            Choose services you subscribe to. Filtered results include
            subscription access; rentals and purchases remain separate in title
            details. Availability data by{" "}
            <a
              href="https://www.justwatch.com/"
              target="_blank"
              rel="noreferrer"
            >
              JustWatch
            </a>
            .
          </p>
          <button
            type="button"
            className="text-button"
            onClick={() => setOpen(false)}
          >
            Done
          </button>
        </div>
      </details>
      <label className="personalization-check">
        <input
          type="checkbox"
          checked={onlyMyServices && selected.length > 0}
          disabled={!selected.length}
          onChange={(e) => update(() => setOnlyMyServices(e.target.checked))}
        />
        {toggleLabel}
      </label>
      {!persistent && (
        <p className="personalization-note" role="status">
          Browser storage is unavailable. Preferences last for this visit.
        </p>
      )}
    </section>
  );
}
