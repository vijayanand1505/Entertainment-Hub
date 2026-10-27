import { useEffect } from "react";
import { BrowserRouter, Route, Switch, useLocation } from "react-router-dom";
import "./App.css";
import Header from "./components/Header/Header";
import SimpleBottomNavigation from "./components/MainNav";
import Movies from "./Pages/Movies/Movies";
import Series from "./Pages/Series/Series";
import Trending from "./Pages/Trending/Trending";
import Search from "./Pages/Search/Search";
import CreatorCredit from "./components/CreatorCredit";
import { LibraryProvider } from "./context/LibraryContext";
import { TitleModalProvider } from "./context/TitleModalContext";
import { TrailerProvider } from "./context/TrailerContext";
import PersonPage from "./Pages/Person/Person";
import Library from "./Pages/Library/Library";
import TitlePage, { TitleNotFound } from "./Pages/Title/Title";
import { AppearanceProvider } from "./context/AppearanceContext";
import { CollectionsProvider } from "./context/CollectionsContext";
import Collections from "./Pages/Collections/Collections";
import Pick from "./Pages/Pick/Pick";
import MovieNight from "./Pages/MovieNight/MovieNight";
import "./appearance.css";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

function App() {
  return (
    <AppearanceProvider>
      <LibraryProvider>
        <BrowserRouter>
          <TrailerProvider>
            <CollectionsProvider>
              <TitleModalProvider>
                <ScrollToTop />
                <a className="skip-link" href="#main-content">
                  Skip to content
                </a>
                <Header />
                <main className="app" id="main-content" tabIndex={-1}>
                  <Switch>
                    <Route
                      path="/movie-night/:code?"
                      exact
                      render={({ match }) => (
                        <MovieNight key={match.params.code || "new"} />
                      )}
                    />
                    <Route path="/pick-for-me" exact component={Pick} />
                    <Route
                      path="/collections/:id?"
                      exact
                      component={Collections}
                    />
                    <Route path="/person/:id" exact component={PersonPage} />
                    <Route
                      path="/title/:mediaType/:id"
                      component={TitlePage}
                      exact
                    />
                    <Route
                      path="/watchlist"
                      exact
                      render={() => <Library key="watchlist" />}
                    />
                    <Route
                      path="/recently-viewed"
                      exact
                      render={() => <Library key="history" history />}
                    />
                    <Route path="/" component={Trending} exact />
                    <Route path="/movies" component={Movies} />
                    <Route path="/series" component={Series} />
                    <Route path="/search" component={Search} />
                    <Route component={TitleNotFound} />
                  </Switch>
                </main>
                <footer className="site-footer">
                  <div>
                    <strong>
                      Entertainment<span>Hub</span>
                    </strong>
                    <p>A little less scrolling. A lot more discovering.</p>
                    <CreatorCredit />
                  </div>
                  <div className="footer-credit">
                    <a
                      href="https://www.themoviedb.org"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Movie data by TMDB ↗
                    </a>
                    <p>
                      This product uses the TMDB API but is not endorsed or
                      certified by TMDB.
                    </p>
                  </div>
                </footer>
                <SimpleBottomNavigation />
              </TitleModalProvider>
            </CollectionsProvider>
          </TrailerProvider>
        </BrowserRouter>
      </LibraryProvider>
    </AppearanceProvider>
  );
}

export default App;
