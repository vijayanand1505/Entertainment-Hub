import { Link, NavLink } from "react-router-dom";
import PlayArrowRoundedIcon from "@material-ui/icons/PlayArrowRounded";
import SearchRoundedIcon from "@material-ui/icons/SearchRounded";
import { useLibrary } from "../../context/LibraryContext";
import AppearanceControl from "../AppearanceControl";
import "./Header.css";

const Header = () => {
  const { watchlist } = useLibrary();
  return (
    <header className="header">
      <div className="header-inner">
        <div className="brand-lockup">
          <Link to="/" className="brand" aria-label="Entertainment Hub home">
            <span className="brand-icon">
              <PlayArrowRoundedIcon />
            </span>
            <span>
              Entertainment<span className="brand-accent">Hub</span>
            </span>
          </Link>
        </div>
        <nav className="desktop-nav" aria-label="Main navigation">
          <NavLink
            exact
            to="/"
            activeClassName="active"
            isActive={(_, location) =>
              ["/", "/trending"].includes(location.pathname)
            }
          >
            Discover
          </NavLink>
          <NavLink to="/movies" activeClassName="active">
            Movies
          </NavLink>
          <NavLink to="/series" activeClassName="active">
            TV Series
          </NavLink>
          <NavLink to="/pick-for-me" activeClassName="active">
            Pick for me
          </NavLink>
          <NavLink to="/movie-night" activeClassName="active">
            Movie night
          </NavLink>
          <NavLink
            to="/watchlist"
            activeClassName="active"
            isActive={(_, location) =>
              ["/watchlist", "/recently-viewed", "/my-titles"].includes(location.pathname) ||
              location.pathname.startsWith("/collections")
            }
          >
            My library
            {watchlist.length > 0 && (
              <span className="nav-count">{watchlist.length}</span>
            )}
          </NavLink>
        </nav>
        <div className="header-actions">
          <Link
            to="/search"
            className="header-search"
            aria-label="Search movies and TV series"
          >
            <SearchRoundedIcon />
            <span>Search titles</span>
            <span className="search-hint">Search</span>
          </Link>
          <AppearanceControl />
        </div>
      </div>
    </header>
  );
};
export default Header;
