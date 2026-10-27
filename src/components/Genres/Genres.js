import axios from "axios";
import { useEffect, useState } from "react";

export default function Genres({ selectedGenres, setSelectedGenres, type }) {
  const [genres, setGenres] = useState([]);
  useEffect(() => {
    let active = true;
    axios
      .get(`https://api.themoviedb.org/3/genre/${type}/list`, {
        params: { api_key: process.env.REACT_APP_API_KEY, language: "en-US" },
      })
      .then(({ data }) => {
        if (active) setGenres(data.genres);
      })
      .catch(() => {
        if (active) setGenres([]);
      });
    return () => {
      active = false;
    };
  }, [type]);
  const toggleGenre = (genre) => {
    setSelectedGenres(
      selectedGenres.some((item) => item.id === genre.id)
        ? selectedGenres.filter((item) => item.id !== genre.id)
        : [...selectedGenres, genre],
    );
  };
  return (
    <div className="genre-filters" role="group" aria-label="Filter by genre">
      <button
        className={`genre-chip ${!selectedGenres.length ? "active" : ""}`}
        aria-pressed={!selectedGenres.length}
        onClick={() => {
          setSelectedGenres([]);
        }}
      >
        All genres
      </button>
      {genres.map((genre) => {
        const selected = selectedGenres.some((item) => item.id === genre.id);
        return (
          <button
            key={genre.id}
            className={`genre-chip ${selected ? "active" : ""}`}
            aria-pressed={selected}
            onClick={() => toggleGenre(genre)}
          >
            {genre.name}
            {selected && <span aria-hidden="true">×</span>}
          </button>
        );
      })}
    </div>
  );
}
