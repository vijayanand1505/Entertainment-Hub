import { useState } from "react";
import OpenInNewRoundedIcon from "@material-ui/icons/OpenInNewRounded";
import useTmdb from "../hooks/useTmdb";

const fallbackRegions = [
  { iso_3166_1: "IN", english_name: "India" },
  { iso_3166_1: "US", english_name: "United States" },
  { iso_3166_1: "GB", english_name: "United Kingdom" },
  { iso_3166_1: "CA", english_name: "Canada" },
  { iso_3166_1: "AU", english_name: "Australia" },
];
const groups = [
  ["flatrate", "Stream with subscription"],
  ["free", "Watch free"],
  ["ads", "Free with ads"],
  ["rent", "Rent"],
  ["buy", "Buy"],
];
const initialRegion = () => {
  try {
    const stored = localStorage.getItem("eh-watch-region");
    return /^[A-Z]{2}$/.test(stored || "") ? stored : "IN";
  } catch {
    return "IN";
  }
};
export default function WatchProviders({ id, type }) {
  const [region, setRegion] = useState(initialRegion);
  const providers = useTmdb(`${type}/${id}/watch/providers`);
  const regions = useTmdb("watch/providers/regions");
  const countries = [...(regions.data?.results || fallbackRegions)].sort(
    (a, b) => a.english_name.localeCompare(b.english_name),
  );
  const selected = countries.find((item) => item.iso_3166_1 === region);
  const country = selected?.english_name || region;
  const availability = providers.data?.results?.[region];
  const availableGroups = groups.filter(
    ([key]) => availability?.[key]?.length > 0,
  );
  const changeRegion = (event) => {
    setRegion(event.target.value);
    try {
      localStorage.setItem("eh-watch-region", event.target.value);
    } catch {}
  };
  return (
    <section
      className="watch-providers"
      aria-labelledby={`watch-heading-${type}-${id}`}
    >
      <div className="detail-section-heading">
        <div>
          <span className="eyebrow">MAKE IT A MOVIE NIGHT</span>
          <h3 id={`watch-heading-${type}-${id}`}>Where to watch</h3>
        </div>
        <label className="watch-region">
          Watching from
          <select
            aria-label="Watch country"
            value={region}
            onChange={changeRegion}
          >
            {!selected && <option value={region}>{region}</option>}
            {countries.map((item) => (
              <option key={item.iso_3166_1} value={item.iso_3166_1}>
                {item.english_name}
              </option>
            ))}
          </select>
        </label>
      </div>
      {providers.loading ? (
        <div className="watch-loading" role="status">
          <div className="skeleton" />
          Checking viewing options…
        </div>
      ) : providers.error ? (
        <div className="detail-empty" role="alert">
          <p>Viewing options couldn’t be loaded.</p>
          <button className="text-button" onClick={providers.retry}>
            Try again
          </button>
        </div>
      ) : !availableGroups.length ? (
        <div className="detail-empty">
          <p>No streaming options listed for {country} yet.</p>
          <span>Try another country, or check back closer to release.</span>
        </div>
      ) : (
        <div className="provider-groups">
          {availableGroups.map(([key, label]) => (
            <div className="provider-group" key={key}>
              <h4>{label}</h4>
              <div className="provider-list">
                {[
                  ...new Map(
                    availability[key].map((provider) => [
                      provider.provider_id,
                      provider,
                    ]),
                  ).values(),
                ].map((provider) => (
                  <div className="provider-tile" key={provider.provider_id}>
                    {provider.logo_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                        alt=""
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <span className="provider-monogram" aria-hidden="true">
                        {provider.provider_name.charAt(0)}
                      </span>
                    )}
                    <span>{provider.provider_name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="watch-footer">
        <span>
          Availability data by{" "}
          <a
            href="https://www.justwatch.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            JustWatch
          </a>
        </span>
        {availableGroups.length > 0 && availability.link && (
          <a
            className="text-link"
            href={availability.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            View watching options
            <OpenInNewRoundedIcon />
          </a>
        )}
      </div>
    </section>
  );
}
