import { NavLink } from "react-router-dom";
import TvRoundedIcon from "@material-ui/icons/TvRounded";
import MovieRoundedIcon from "@material-ui/icons/MovieRounded";
import SearchRoundedIcon from "@material-ui/icons/SearchRounded";
import ExploreOutlinedIcon from "@material-ui/icons/ExploreOutlined";
import BookmarkBorderRoundedIcon from "@material-ui/icons/BookmarkBorderRounded";

export default function SimpleBottomNavigation() {
  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      <NavLink
        exact
        to="/"
        activeClassName="active"
        isActive={(_, location) =>
          ["/", "/trending"].includes(location.pathname) ||
          location.pathname.startsWith("/movie-night")
        }
      >
        <ExploreOutlinedIcon />
        Home
      </NavLink>
      <NavLink to="/movies" activeClassName="active">
        <MovieRoundedIcon />
        Movies
      </NavLink>
      <NavLink to="/series" activeClassName="active">
        <TvRoundedIcon />
        Series
      </NavLink>
      <NavLink to="/search" activeClassName="active">
        <SearchRoundedIcon />
        Search
      </NavLink>
      <NavLink
        to="/watchlist"
        activeClassName="active"
        isActive={(_, location) =>
          ["/watchlist", "/recently-viewed", "/my-titles"].includes(location.pathname) ||
          location.pathname.startsWith("/collections")
        }
      >
        <BookmarkBorderRoundedIcon />
        Library
      </NavLink>
    </nav>
  );
}
