import { NavLink } from "react-router-dom";
import BookmarkBorderRoundedIcon from "@material-ui/icons/BookmarkBorderRounded";
import HistoryRoundedIcon from "@material-ui/icons/HistoryRounded";
import FolderOutlinedIcon from "@material-ui/icons/FolderOutlined";
import { useLibrary } from "../context/LibraryContext";
import { useCollections } from "../context/CollectionsContext";
import "../Pages/Library/Library.css";
import FavoriteBorderRoundedIcon from "@material-ui/icons/FavoriteBorderRounded";
export default function LibraryTabs() {
  const { watchlist, recentlyViewed } = useLibrary();
  const { collections } = useCollections();
  return (
    <nav className="library-tabs" aria-label="Your library">
      <NavLink to="/watchlist" activeClassName="active">
        <BookmarkBorderRoundedIcon />
        Watchlist<span>{watchlist.length}</span>
      </NavLink>
      <NavLink to="/recently-viewed" activeClassName="active">
        <HistoryRoundedIcon />
        Recently viewed<span>{recentlyViewed.length}</span>
      </NavLink>
      <NavLink to="/collections" activeClassName="active">
        <FolderOutlinedIcon />
        Collections<span>{collections.length}</span>
      </NavLink>
      <NavLink to="/my-titles" activeClassName="active">
        <FavoriteBorderRoundedIcon />
        My titles
      </NavLink>
    </nav>
  );
}
