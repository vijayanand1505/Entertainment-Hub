<div align="center">

# Entertainment Hub

### Movies, TV series, and a place to plan what to watch.

Discover movies and TV series, organize your next watch, and find a movie your whole group wants to see.

**Designed and developed by [Vijay Anand](https://github.com/vijayanand1505).**

[Live app](https://the-entertainment-hub.vercel.app) · [GitHub repository](https://github.com/vijayanand1505/Entertainment-Hub) · [All screenshots](docs/images/) · [Video recordings](docs/demos/)

![React 17](https://img.shields.io/badge/React-17-61DAFB?logo=react&logoColor=white)
![Material UI 4](https://img.shields.io/badge/Material_UI-4-0081CB?logo=mui&logoColor=white)
![Movie data](https://img.shields.io/badge/Movie_data-TMDB-01B4E4)
![Room service](https://img.shields.io/badge/Shared_rooms-Node.js-339933?logo=nodedotjs&logoColor=white)

[Features](#features) · [Screenshots & demos](#screenshots--demos) · [Quick start](#quick-start) · [Movie Night Match](#movie-night-match) · [Configuration](#configuration)

</div>

![Entertainment Hub desktop homepage with a cinematic spotlight, featured-title controls, and discovery shortcuts](docs/images/home-desktop.jpg)

## Screenshots & demos

**Viewing this file locally:** open `README.md` and press **Cmd+Shift+V** in VS Code or Cursor on macOS (**Ctrl+Shift+V** on Windows/Linux) to render the images. All screenshots are visible below; no gallery expansion is needed. GitHub displays the committed version, so local README and `docs/` changes must be committed and pushed together to appear there.

The screenshots and silent recordings below show the implemented app, using sample watchlists, collections, and room participants. Movie artwork and metadata come from TMDB. The example invite address shown in the recording is a placeholder, not a deployed demo.

[![Animated feature preview showing discovery, search, title details, collections, recommendations, appearance settings, and group matches](docs/demos/feature-preview.gif)](docs/demos/feature-tour.webm)

### Video walkthroughs

| Recording | What it shows | Duration |
| --- | --- | --- |
| [Watch or download the feature tour](docs/demos/feature-tour.webm) | Discovery, search, title details, library, collections, recommendations, appearance, and mobile layouts. | About 58 seconds |
| [Watch or download Movie Night Match](docs/demos/movie-night-match.webm) | A shared lobby, private movie voting, and the group's ranked matches. | About 21 seconds |

The looping preview above plays inline. Open a WebM link to view or download the full recording in a browser or video player that supports WebM.

### Desktop screenshot gallery

| Discovery filters & poster actions                                                                                        | Search suggestions                                                                      |
| ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| ![Movie discovery with language, rating, genre filters, and quick actions on a poster](docs/images/discovery-filters.jpg) | ![Search autocomplete suggestions for Interstellar](docs/images/search-suggestions.jpg) |

| Shareable title pages                                                                                     | Where to watch & related titles                                                                         |
| --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| ![Interstellar title page with synopsis, metadata, save actions, and cast](docs/images/title-details.jpg) | ![Country-specific watching options and related movie recommendations](docs/images/watch-providers.jpg) |

| In-app trailer player                                                                                         | Cast profiles                                                                                          |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| ![Trailer playing in an in-app dialog with a video selector and YouTube link](docs/images/trailer-player.jpg) | ![Matthew McConaughey profile with biography and searchable filmography](docs/images/cast-profile.jpg) |

| Watchlist                                                                              | Recently viewed                                                                                             |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| ![Personal watchlist containing saved movies and TV series](docs/images/watchlist.jpg) | ![Recently viewed titles with search, media filters, and history controls](docs/images/recently-viewed.jpg) |

| Custom collections                                                                                      | Pick for me                                                                                                        |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| ![Named collections with poster collages, descriptions, and color accents](docs/images/collections.jpg) | ![Mood-based recommendation with a time limit, title details, and Try another action](docs/images/pick-for-me.jpg) |

| Appearance controls                                                                                 | Light appearance                                                        |
| --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| ![Appearance settings for theme, text size, and poster layout](docs/images/appearance-settings.jpg) | ![Entertainment Hub homepage in light mode](docs/images/home-light.jpg) |

| Movie-night lobby                                                                                                         | Private voting                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| ![Movie-night lobby with sample participants, shared preferences, and invite controls](docs/images/movie-night-lobby.jpg) | ![Movie-night voting card with Watch it, Maybe, and Pass actions](docs/images/movie-night-voting.jpg) |

### Mobile screenshot gallery

<p align="center">
  <img src="docs/images/mobile-discovery.jpg" alt="Responsive discovery homepage on a phone" width="240" />
  <img src="docs/images/mobile-title.jpg" alt="Readable title details and actions on a phone" width="240" />
  <img src="docs/images/mobile-movie-night.jpg" alt="Movie-night match reveal on a phone in light mode" width="240" />
</p>

Browse the [complete media index](docs/README.md) for direct links to all **19 screenshots**, the animated preview, and both videos. Movie-night results are also shown in the [Movie Night Match](#movie-night-match) section.

## Features

### Discover your next favorite

- **Homepage:** a shorter mobile spotlight with title details and watchlist actions, compact discovery shortcuts, and previews of up to six trending, saved, and recently viewed titles. Featured titles rotate every **5 seconds**, with manual selectors and pause/play controls. Rotation pauses on hover, keyboard interaction, hidden tabs, and open dialogs.
- **Trending movies and series:** switch between today and this week; open the full, paginated catalog from the homepage. The selected period and page are reflected in the URL.
- **Movie and TV catalogs:** genre selection, pagination, poster ratings, and release information.
- **Discovery filters:** original language, release year or first-air year, minimum rating, movie runtime or episode length, and sorting by popularity, rating, or newest release. Filter state is reflected in the URL so a filtered view can be bookmarked or shared.
- **Search suggestions:** debounced autocomplete, keyboard navigation, separate movie/TV search modes, and up to six recent searches that can be cleared.
- **Poster quick actions:** open a trailer, view details, organize a title into collections, or use the bookmark to toggle the watchlist. Actions appear on hover or keyboard focus and remain visible on touch devices.

### Explore titles and the people behind them

- **Rich title details:** artwork, overview, tagline, genres, rating, release date, movie runtime or series season count, and cast.
- **Shareable title pages:** direct movie and TV URLs, copy-link feedback, and a manual-copy fallback.
- **Where to watch:** choose a country and see available subscription, free, ad-supported, rental, and purchase options, with a link to the watching-options page. Country preference is remembered.
- **More like this:** related-title recommendations, with similar titles used when recommendations are empty.
- **Clickable cast profiles:** biography, profile facts when available, and deduplicated filmographies with movie/TV filters, title search, popularity/newest sorting, character roles, and load-more controls.
- **In-app trailers:** YouTube player dialog, available-video selection, retry states, and an external YouTube fallback. Playback stops when the player closes or the route changes.

### Make the library yours

| Feature                 | Implemented behavior                                                                                                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Watchlist**           | Save or remove movies and series from posters or title details; undo the last toggle; search and filter the list.                                                              |
| **Recently Viewed**     | Revisit the last **30 unique titles** opened in the app, most recent first; search, filter, clear, and undo clearing.                                                          |
| **Custom collections**  | Create and rename collections, add descriptions and color accents, place a title in multiple collections, search/filter contents, remove titles, and undo collection deletion. |
| **Browser persistence** | Watchlist, history, collections, and appearance survive reloads and synchronize between tabs on the same browser origin.                                                       |

Collections currently support up to **100 collections**, with up to **1,000 titles per collection**. Browser storage capacity can impose a lower practical limit. When storage is unavailable, the app keeps supported changes in memory for the current visit and shows a notice.

### Streaming services and title preferences

- Open **My streaming services** on Movies, TV Series, Pick for me, or **My library → My titles**. Choose a country and your subscriptions. Selections are remembered separately for each country.
- **Only my streaming services** filters movie/series discovery and picks to subscription access. Provider filters can be shared through discovery URLs. Rentals and purchases remain separate in title details.
- Movie-night hosts can use their selected subscriptions for a room. The room keeps that country and provider selection; every candidate, including titles from a collection, is checked for included subscription access before voting.
- Use **Watched**, **Liked**, and **Not interested** in title details, the picker, or a poster’s **More actions** menu. Changes have an Undo action.
- Watched titles are skipped in recommendations and hidden by default in Movies/TV catalogs; **Show watched titles** includes them again. Not interested hides titles from discovery and recommendations. Search, existing watchlists, and collections remain accessible.
- **My titles** lets you review watched, liked, and hidden titles and restore them. Liking and hiding are mutually exclusive; watched status is independent.
- A **Because you liked…** homepage section uses the most recently updated liked title as its recommendation source, skips watched/hidden/already-liked titles, and checks subscription access when the service filter is enabled.
- These preferences stay in this browser and synchronize between its tabs. When storage is blocked, changes last for the current visit.

### Pick for me

Choose **movies or TV series**, a mood or specific genre, an original language, and an optional time limit. The app suggests one title at a time with details, trailer, watchlist, and collection actions.

- Six mood choices, including **Surprise me**, **Make me smile**, **An adventure**, **Keep me guessing**, **Something moving**, and **Another world**.
- **Try another** avoids repeating titles in the current selection until preferences are reset or changed.
- Your current pick and preferences stay saved in this browser when you switch sections or reload. Changing mood, language, or time keeps the existing pick until you request another; changing streaming filters or marking the current pick watched/hidden removes it from the displayed recommendations. **Clear pick** removes it. Failed or exhausted searches keep the last successful pick.
- Time-limited picks verify title runtime metadata and skip unknown or over-limit runtimes. For TV series, time refers to an episode, not the full series.
- Loading, empty-selection, and retry states keep the next step clear.

### Appearance and accessibility

- **Dark, Light, or Device theme**, with live device-theme following.
- **Standard, Large, or Extra large text** across the interface.
- **Comfortable or Compact posters** with responsive grid layouts.
- Instant updates, browser persistence, cross-tab appearance sync, and an appearance reset that preserves the library.
- Responsive desktop, tablet, and phone layouts; keyboard-accessible controls, focus handling, skip-to-content navigation, reduced-motion styling, loading skeletons, image fallbacks, and useful empty/error states.
- Creator credit linking to **[Vijay Anand's GitHub](https://github.com/vijayanand1505)** in the footer.

## Movie Night Match

**One movie. Everyone's kind of night.** Create a shared room, gather a group, vote privately, and reveal the strongest common picks.

![Movie Night Match results with participant avatars, the group's top pick, vote totals, and ranked alternatives](docs/images/movie-night-matches.jpg)

### How it works

1. Open **Movie night** and enter your name and a room name.
2. Discover a lineup for the group, or start from a collection containing movies.
3. Share the lobby's invite link or **10-character room code**. Rooms support **2–12 participants**; friends join with a display name and their preferences, without an account.
4. Everyone chooses genres they enjoy, accepted languages, and an optional time limit. Preferences can be edited while the lobby is open.
5. The host starts voting after at least one friend joins. Joining and preference edits then close for that round.
6. Everyone receives the **same lineup of up to 12 movies** and privately selects **Watch it**, **Maybe**, or **Pass**. Votes can be reviewed and changed while voting remains open. Only completion progress is visible to the other participants.
7. Matches appear automatically after everyone finishes. Explore details and watching options, play a trailer, save a winner, or start a fresh round with the same group and invite.

### Group preferences and ranking

- The group uses the **shortest selected time limit**.
- Accepted languages must overlap. If there is no shared language, the lobby explains the conflict and the host cannot start until it is resolved. Selecting no languages means any language is accepted.
- Genres help select and prioritize the lineup; they are preferences rather than strict requirements for every film.
- Collection-based rooms consider up to **30 movies** from a snapshot of the selected collection. TV series remain in the collection and are excluded from the movie-night lineup.
- Candidate metadata is checked against the group's language and runtime constraints. If nothing fits, the room returns to the lobby with a recovery message.
- Results rank the **fewest Pass votes first**, then points: **Watch it = 2**, **Maybe = 1**, **Pass = 0**. Ties use genre fit and TMDB rating.
- **Everyone's in** means everyone selected Watch it. A shared possibility has no Pass votes. When every option has a Pass, the app presents closest matches without claiming unanimous agreement.

### Room controls and continuity

The host can remove participants in the lobby or during voting, subject to the two-person minimum for an active voting round. Removed participants lose their seat and votes. The host can reopen the lobby for a fresh round, clearing votes while retaining the group, preferences, source collection, and invite link.

Room updates poll approximately every **2 seconds** while the tab is visible. Reloads, reconnects, and server restarts preserve saved progress. Rooms expire **24 hours after creation**; opening a new round does not extend that expiry. Keep the same browser and app origin to resume your seat.

## Quick start

### Prerequisites

- **Node.js 24 LTS** and npm, matching the Vercel runtime. The app also ran locally on Node.js 18.18.0 / npm 9.8.1 before deployment preparation.
- A **TMDB API v3 key**.
- Internet access for movie metadata, images, and YouTube trailers.

### 1. Clone and install

```sh
git clone https://github.com/vijayanand1505/Entertainment-Hub.git
cd Entertainment-Hub
npm install
```

### 2. Configure TMDB

For a fresh checkout, copy the included template:

```sh
cp .env.example .env.local
```

On Windows, copy `.env.example` to `.env.local` using your file manager or shell. If `.env.local` already exists, edit it instead of overwriting it.

Replace the placeholder in `.env.local`:

```dotenv
REACT_APP_API_KEY=your_tmdb_v3_api_key_here
```

Sign in to TMDB and open [Settings → API](https://www.themoviedb.org/settings/api) to find or request a key. This app expects the **v3 API key**, rather than the longer API Read Access Token. See TMDB's [getting-started guide](https://developer.themoviedb.org/docs/getting-started) for registration details.

### 3. Start the app

```sh
npm start
```

Open **[http://localhost:3001](http://localhost:3001)**.

One command starts both services:

| Service                  | Default address         | Purpose                                                                |
| ------------------------ | ----------------------- | ---------------------------------------------------------------------- |
| React development app    | `http://localhost:3001` | User interface and the same-origin room API proxy.                     |
| Movie Night room service | `http://127.0.0.1:4000` | Shared rooms, participant sessions, private voting, and saved results. |

Stop both with **Ctrl+C**. Restart after changing environment variables. The scripts include the project's legacy OpenSSL compatibility flag. The frontend build and development launcher preload `scripts/node-compat.cjs` so CRA 4 reads its source-map WASM file from disk on modern Node versions.

## Configuration

| Variable            | Default                                     | Where it is used                                                                                                      |
| ------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `REACT_APP_API_KEY` | Required                                    | TMDB API v3 key. Read by the frontend at start/build time and by the room service at startup. Put it in `.env.local`. |
| `PORT`              | `3001` in development; `4000` in production | Frontend development port or production server port. Set in the shell when using `npm start`.                         |
| `HOST`              | `0.0.0.0` in development                    | Development UI bind address. Set in the shell.                                                                        |
| `ROOMS_PORT`        | `4000`                                      | Room-service port; takes precedence over `PORT` in production.                                                        |
| `ROOMS_HOST`        | `0.0.0.0` in production                     | Production bind address. The development room service binds to `127.0.0.1`.                                           |
| `ROOMS_DATA_FILE`   | `.data/movie-night-rooms.json`              | Private JSON storage path for room persistence.                                                                       |
| `PUBLIC_APP_URL`    | Network address for local invites           | Canonical app origin used for local invite-link generation when configured. Use your HTTPS origin for hosting.        |
| `DATABASE_URL`      | Required on Vercel                           | Private Postgres connection string provided by the Neon integration. Never prefix this variable with `REACT_APP_`.    |

Example port overrides in a POSIX shell:

```sh
PORT=3005 ROOMS_PORT=4005 npm start
```

On PowerShell:

```powershell
$env:PORT = "3005"
$env:ROOMS_PORT = "4005"
npm start
```

Use different frontend and room-service ports in development. The room service loads `.env.local`, then `.env`, without overriding values already supplied by the process environment. The development launcher assigns `PORT` and `HOST` before the child services start, so supply those two overrides in the shell.

`.env.local` and `.data/` are ignored by Git. Create React App embeds `REACT_APP_*` values in the browser bundle; do not use that prefix for private server credentials.

## Running and deployment

### Invite friends on the same Wi-Fi

1. Run `npm start` on the host computer and keep it running.
2. Create a room and use the **network invite link shown in the lobby**.
3. Friends open the link on devices connected to the same local network.
4. Allow incoming connections to the frontend port if the operating system asks.

`localhost` and `127.0.0.1` refer to the device opening the link. Sharing those addresses with another device will not reach the host computer. A same-Wi-Fi invite is local access, not public internet hosting.

### Production: UI and rooms on one origin

```sh
npm run build
npm run start:production
```

Open `http://localhost:4000` by default. The Node service serves `build/`, supports SPA deep links, and handles `/api/movie-night` on the same origin.

For example:

```sh
PORT=4000 \
PUBLIC_APP_URL=https://your-app.example \
ROOMS_DATA_FILE=/absolute/private/persistent/path/movie-night-rooms.json \
npm run start:production
```

Configure `REACT_APP_API_KEY` before building and starting. Use an HTTPS reverse proxy or hosting platform for HTTPS; the Node service itself serves HTTP.

For deployment, retain a writable **persistent storage path** for rooms across restarts and releases. This file-backed implementation supports **one room-service process**. Use a transactional shared database before running multiple replicas.

Static-only hosting can serve the catalog UI with an SPA fallback, but shared movie-night rooms also need the Node room service and a route/proxy for `/api/movie-night`. The simplest supported setup is the included production server on one origin.

### Vercel: UI and durable shared rooms

Production: **[the-entertainment-hub.vercel.app](https://the-entertainment-hub.vercel.app)**. Project: **[Vijay's Team / entertainment-hub](https://vercel.com/vijay-s-team4/entertainment-hub)**.

`vercel.json` builds the React app with npm on Node.js 24 and routes deep links back to the app. Requests under `/api/movie-night` use `api/movie-night.js` and a private Neon Postgres database instead of a local JSON file.

1. Import this repository into Vercel, or link it using `vercel link`.
2. Add the **Neon Free** database integration to the project. Choose Singapore (`sin1`) to match the function region and connect the integration to production. It supplies `DATABASE_URL`.
3. Add `REACT_APP_API_KEY` as an encrypted environment variable for production and preview. Set `PUBLIC_APP_URL` to the production HTTPS origin.
4. Deploy using `vercel --prod`. The room table is initialized automatically. Room mutations use Postgres transactions and row locks so concurrent participants do not overwrite one another's votes.

Room records remain private in Postgres and expire after 24 hours; expired records are removed when another room is created. Local `npm start` and `npm run start:production` continue using the file-backed service. A Vercel deployment must not use its temporary filesystem for shared rooms.

The frontend no longer registers an offline service worker. The old cache-first worker could keep showing a previous deployment while tabs remained open. Keep `public/service-worker.js` at the same URL: it replaces that worker, removes its asset caches, unregisters itself, and reloads the tabs it controlled once. Watchlists, collections, preferences, and room tokens in local/session storage are preserved. Vercel requires revalidation of the homepage and does not cache the recovery worker. This follows [Chrome's service-worker recovery approach](https://developer.chrome.com/docs/workbox/remove-buggy-service-workers). Future deployment checks should include a returning browser with an older worker installed, as well as a fresh session.

Browser tab icons have explicit formats and sizes in `public/index.html`, with versioned URLs so browsers request the updated icons. Both web manifests reference existing icon files with their actual dimensions. When replacing icons, update the version in the HTML and both manifests as well.

To run the database concurrency and persistence checks against a test database, set `ROOMS_TEST_DATABASE_URL` and run `npm run test:rooms`. Those checks create and remove their own test rooms. Without that variable, only the database integration checks are skipped.

### Available commands

| Command                                            | Action                                                                |
| -------------------------------------------------- | --------------------------------------------------------------------- |
| `npm start`                                        | Start the React app and room service together.                        |
| `npm run start:rooms`                              | Start only the room API, useful when running the frontend separately. |
| `npm run build`                                    | Create the optimized frontend in `build/`.                            |
| `npm run start:production`                         | Serve the built UI and room API together.                             |
| `npm test`                                         | Run frontend tests in watch mode.                                     |
| `CI=true npm test -- --watchAll=false --runInBand` | Run frontend tests once in a POSIX shell.                             |
| `npm run test:rooms`                               | Run Node room-service tests.                                          |

## Routes

| Route                | Screen                                                               |
| -------------------- | -------------------------------------------------------------------- |
| `/`                  | Discover, featured slideshow, trending titles, and personal shelves. |
| `/trending`          | Full trending catalog with daily/weekly selection and pagination. |
| `/my-titles`         | Streaming preferences and watched, liked, and hidden titles. |
| `/movies`            | Movie discovery and filters.                                         |
| `/series`            | TV-series discovery and filters.                                     |
| `/search`            | Search, autocomplete, and recent searches.                           |
| `/title/movie/:id`   | Shareable movie page, e.g. `/title/movie/157336`.                    |
| `/title/tv/:id`      | Shareable TV page, e.g. `/title/tv/1396`.                            |
| `/person/:id`        | Cast profile and filmography.                                        |
| `/watchlist`         | Saved movies and series.                                             |
| `/recently-viewed`   | Recent title history.                                                |
| `/collections`       | Collection overview and management.                                  |
| `/collections/:id`   | One collection's titles.                                             |
| `/pick-for-me`       | Mood/genre and time-based recommendations.                           |
| `/movie-night`       | Create or join a movie night.                                        |
| `/movie-night/:code` | Shared lobby, voting, and results.                                   |

Movie and TV IDs are TMDB IDs. Direct title URLs can be shared, but another device must be able to reach the app's origin. Collections are browser-local; their URLs do not transfer the collection to another browser.

## Architecture

```mermaid
flowchart LR
    Browser[React app] -->|Catalog, cast, and provider requests| TMDB[TMDB API]
    Browser -->|Trailers| YouTube[YouTube player]
    Browser --> Local[Browser localStorage]
    Browser -->|Room actions and polling| API[Node room API]
    API -->|Discover and verify movies| TMDB
    API --> Disk[Private room JSON file]
```

| Layer            | Technology / responsibility                                                                |
| ---------------- | ------------------------------------------------------------------------------------------ |
| UI               | React 17, Material UI 4, Material icons, and responsive CSS with theme tokens.             |
| Routing          | React Router 5; title pages, cast pages, collections, and shared-room URLs.                |
| Data requests    | Axios for TMDB; Fetch for room actions and polling.                                        |
| State            | React hooks and context for appearance, library, collections, title dialogs, and trailers. |
| Room backend     | Node.js HTTP server, room-domain logic, metadata checks, and atomic JSON-file writes.      |
| Frontend tooling | Create React App / React Scripts 4.                                                        |
| Verification     | Jest, React Testing Library, and Node's built-in test runner.                              |

### Room API

All room endpoints are under `/api/movie-night`. Creating or joining a room returns a participant token. Subsequent participant actions send it in the `Authorization: Bearer <participant-token>` header; it is never part of an invite URL.

| Method & path                     | Purpose                                                                          | Access                |
| --------------------------------- | -------------------------------------------------------------------------------- | --------------------- |
| `GET /health`                     | Check that the room service is running.                                          | Public                |
| `GET /config`                     | Get the invite origin for local sharing.                                         | Public                |
| `POST /rooms`                     | Create a room and its host session.                                              | Public                |
| `GET /rooms/:code`                | Read a preview, or participant state when authenticated.                         | Preview / participant |
| `POST /rooms/:code/join`          | Join an open lobby.                                                              | Public                |
| `PUT /rooms/:code/preferences`    | Update personal preferences in the lobby.                                        | Participant           |
| `POST /rooms/:code/start`         | Build the common lineup and begin voting.                                        | Host                  |
| `PUT /rooms/:code/votes`          | Save a ballot choice using `titleId` and `choice` (`watch`, `maybe`, or `pass`). | Participant           |
| `POST /rooms/:code/reset`         | Clear ballots and reopen the lobby for a new round.                              | Host                  |
| `DELETE /rooms/:code/members/:id` | Remove another participant where permitted.                                      | Host                  |

Anonymous previews omit the deck, participant sessions, and results. An authenticated participant receives their own ballot; other participants' ballots are not returned. Room errors include a readable `error` message and an appropriate HTTP status.

### Project structure

```text
Entertainment-Hub/
├── docs/
│   ├── images/                  # Current app screenshots
│   └── demos/                   # Animated preview and silent screen recordings
├── public/                      # App metadata, icons, and image fallbacks
├── scripts/dev.cjs              # Starts and stops the two development services
├── server/
│   ├── index.cjs                # Environment, storage, and server startup
│   ├── http.cjs                 # Room API and production static serving
│   ├── rooms.cjs                # Room state, permissions, voting, and ranking
│   ├── catalog.cjs              # Group lineup generation and metadata checks
│   └── rooms.test.cjs           # Backend tests
├── src/
│   ├── Pages/                   # Discovery, library, cast, title, picker, and rooms
│   ├── components/              # Posters, dialogs, filters, providers, and controls
│   ├── context/                 # Shared frontend state
│   ├── hooks/                   # Catalog requests, autoplay, picker, and room polling
│   ├── utils/                   # Normalization, storage, filters, and helpers
│   ├── appearance.css           # Theme tokens and layout-density overrides
│   ├── setupProxy.js            # Development proxy for the room API
│   └── App.js                   # Providers, layout, and routes
├── .env.example                 # Key placeholder, safe to copy for setup
├── .env.local                   # Local configuration; ignored by Git
├── .data/                       # Private room persistence; ignored by Git
└── package.json
```

## Data and privacy

| Data                                | Storage                                  | Scope                                                                       |
| ----------------------------------- | ---------------------------------------- | --------------------------------------------------------------------------- |
| Watchlist                           | Browser `localStorage`                   | This browser and app origin; synchronized between its tabs.                 |
| Recently viewed                     | Browser `localStorage`                   | Last 30 unique titles; clearable with undo.                                 |
| Collections                         | Browser `localStorage`                   | Local lists; not cloud-synchronized.                                        |
| Streaming services & title feedback | Browser `localStorage`                   | Country-specific subscriptions and watched/liked/hidden titles.              |
| Appearance                          | Browser `localStorage`                   | Theme, text size, and poster density.                                       |
| Recent searches & watch country     | Browser `localStorage`                   | Local convenience preferences.                                              |
| Pick for me                         | Browser `localStorage`                   | Current pick, preferences, and selection history; clearable with **Clear pick**. |
| Room participant access token       | Browser storage, with in-memory fallback | Resumes a participant in that browser/origin; not included in invite links. |
| Rooms, preferences, votes & results | Private server JSON file locally; Neon Postgres on Vercel | Shared across room participants' devices; persists across server restarts and deployments. |

Only participant token **hashes** are stored in the server file. Individual ballots are not returned to other participants; they see progress during voting and aggregate counts after the reveal. Room records themselves are stored as JSON, not end-to-end encrypted, and should be kept outside the public build directory.

Clearing browser storage removes the local library, preferences, and saved access to room seats. Browser-only changes made while storage is blocked last for that visit. Expired server rooms are pruned on the next room update.

## Development checks

```sh
CI=true npm test -- --watchAll=false --runInBand
npm run test:rooms
npm run build
```

On PowerShell, set `$env:CI = "true"` before running `npm test -- --watchAll=false --runInBand`.

The current suite contains **61 frontend tests and 14 passing room-service tests** (two Postgres integration tests require a configured test database and are skipped without it). Coverage includes persistence, blocked storage, appearance/device-theme changes, discovery parsing, cast-credit handling, player cleanup, slideshow timing, recommendation constraints, room authorization, vote privacy, ranking, restart recovery, and API validation.

The implemented UI has also been checked in separate host/guest browser sessions and at phone, tablet, and desktop widths, including 320px layouts with the largest text setting. These browser checks are not a committed automated Playwright suite.

## Troubleshooting

| Symptom                                              | What to check                                                                                                                                                  |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Catalog or title details will not load               | Confirm a valid TMDB **v3 API key**, internet access, and a restart after editing `.env.local`.                                                                |
| “Movie Night rooms are offline”                      | Start with `npm start`, or run `npm run start:rooms` alongside a separately started frontend. Check the room-service port and `/api/movie-night` proxy.        |
| A friend cannot open an invite                       | Use the lobby's network URL, keep the host running, check the same Wi-Fi connection and firewall, and avoid localhost links.                                   |
| No shared language / no matching movies              | Update accepted languages, allow more time, or use another collection. Genres influence selection; time and language limits can exclude titles.                |
| Watchlist or collections appear empty on another URL | Browser storage is scoped to the origin. `localhost`, `127.0.0.1`, a LAN IP, and different ports each have separate storage.                                   |
| A saved room seat is missing                         | Return using the same browser and origin. Clearing storage or switching origins loses saved access; a removed participant must rejoin while the lobby is open. |
| No watching options or no playable trailer           | Data and playback depend on the title, country, provider, and video availability. Change the country/video or use the external watching-options/YouTube link.  |
| Refreshing a title or room URL gives a hosting 404   | Use the included production server or configure your host to serve the SPA for non-file frontend routes.                                                       |
| Production shows an older design than localhost    | Reopen or reload the production page online. The recovery worker replaces the previous offline cache and refreshes its open tabs; saved browser data stays intact. |
| A port is already in use                             | Stop the previous process or set different `PORT` and `ROOMS_PORT` values.                                                                                     |
| Room data cannot be read or saved                    | Check `ROOMS_DATA_FILE`, directory permissions, available storage, and the validity of a backup before replacing an existing room file.                        |

## Credits

**Project creator:** [Vijay Anand](https://github.com/vijayanand1505) · [Entertainment Hub repository](https://github.com/vijayanand1505/Entertainment-Hub)

- Movie, TV, cast metadata, and artwork: **[The Movie Database](https://www.themoviedb.org/)**.
- Watching-availability data: **[JustWatch](https://www.justwatch.com/)**, accessed through TMDB.
- Trailer playback: **[YouTube](https://www.youtube.com/)**.
- Interface components and icons: **[Material UI](https://v4.mui.com/)**.
- Typography: **Arial**, with Helvetica and sans-serif fallbacks. At the standard text setting, body text is 16px, most controls are 14px, supporting labels are 12px, and page headings scale from 28px to 36px. Larger text settings scale these sizes throughout the app.

This product uses the TMDB API but is not endorsed or certified by TMDB. TMDB usage remains subject to its [API terms and attribution requirements](https://developer.themoviedb.org/docs/faq). Screenshots illustrate the app; third-party artwork and videos retain their respective ownership.

No license file is currently included in this repository.
