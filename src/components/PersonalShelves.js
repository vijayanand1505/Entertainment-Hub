import { Link } from "react-router-dom";
import ArrowForwardRoundedIcon from "@material-ui/icons/ArrowForwardRounded";
import { useLibrary } from "../context/LibraryContext";
import SingleContent from "./SingleContent/SingleContent";
import { titleKey } from "../utils/library";

export default function PersonalShelves() {
  const { watchlist, recentlyViewed } = useLibrary();
  const shelves = [
    {
      items: watchlist,
      title: "Your watchlist",
      href: "/watchlist",
    },
    {
      items: recentlyViewed,
      title: "Recently viewed",
      href: "/recently-viewed",
    },
  ];
  return (
    <>
      {shelves
        .filter((shelf) => shelf.items.length)
        .map((shelf) => (
          <section
            className="personal-shelf home-title-row"
            aria-label={shelf.title}
            key={shelf.href}
          >
            <div className="section-heading">
              <h2>{shelf.title}</h2>
              <Link
                className="text-link"
                to={shelf.href}
                aria-label={`View all ${shelf.title.toLowerCase()} titles`}
              >
                View all
                <ArrowForwardRoundedIcon />
              </Link>
            </div>
            <div className="home-shelf-grid">
              {shelf.items.slice(0, 6).map((item) => (
                <SingleContent
                  key={titleKey(item)}
                  id={item.id}
                  title={item.title}
                  poster={item.poster_path}
                  date={item.release_date}
                  media_type={item.media_type}
                  vote_average={item.vote_average}
                />
              ))}
            </div>
          </section>
        ))}
    </>
  );
}
