# Responsive layout audit

Reviewed on 28 October 2026. The project had several edge cases that caused horizontal page scrolling or overlapping content. These were fixed during the audit.

## Results after fixes

| Check | Cases | Result |
| --- | ---: | --- |
| Chrome 150 page layouts: 22 routes/states × 32 widths × 2 appearance settings | 1,408 | No horizontal page overflow; no page runtime errors |
| Firefox 135 page layouts: 22 routes/states × 5 widths × 2 appearance settings | 220 | No horizontal page overflow; no page runtime errors |
| Dialog and interaction layouts across 7 viewports | 126 | No checked overflow or trailer-content overlap; no page runtime errors |
| Empty and unavailable-data states | 57 | No horizontal page overflow |
| Mobile touch controls, filters, search focus, and footer clearance | 15 | Passed |
| Production build (`npm run build`) | — | Passed |

The page sweeps ran against the production build. Interactive checks also exercised the development app. Representative phone, tablet, desktop, and trailer-error screenshots were visually inspected. Existing intentional title truncation and horizontal poster rails remain part of the design.

## Fixes

| Area | Problem | Change |
| --- | --- | --- |
| Recent searches | A long search term without spaces could stretch the page beyond the viewport. | Search chips and their container now shrink and wrap within the available width. |
| Actor filmography | Long actor names in a section description forced the heading row wider than a phone screen. | Section heading content can shrink, and descriptions wrap long words. |
| Movie Night setup | Long recent room names could expand the introduction grid, including at tablet widths. | Grid items can shrink; the single-column layout uses a zero minimum track width; room links wrap long names. |
| Movie Night rooms | Room and source collection names pushed participant avatars off screen. | The heading text column can shrink and room metadata wraps. |
| Title and trailer dialogs | Material UI's default maximum width overrode the intended narrow-screen margins. | Both dialogs now explicitly set their maximum width to match their responsive margins. |
| Trailer failure state | The fixed video area was too short for an error message and retry button at 320px with extra-large text. | Error content participates in normal layout, allowing the area to grow and the dialog to scroll. |

## Coverage

The page sweep covers 22 route/state combinations: homepage, movies, series, trending, search, picker, watchlist, history, collections, a populated collection, title feedback library, movie and TV details, actor profile, Movie Night setup, lobby, voting, results, building, completed voting, invitation preview, and an unknown route.

Chrome widths, in CSS pixels:

```text
320, 360, 375, 390, 414, 480, 550, 600,
650, 651, 750, 751, 760, 768, 800, 801,
850, 851, 900, 901, 1000, 1001, 1024,
1100, 1101, 1200, 1201, 1280, 1366,
1440, 1920, 2560
```

Each page is checked with standard text and comfortable posters, then extra-large text and compact posters. Firefox uses the same page cases at 320, 390, 768, 1024, and 1440px.

Interactive checks use extra-large text, comfortable posters, and the light theme at 320 × 568, 390 × 844, 551 × 800, 768 × 1024, 1024 × 768, 1440 × 900, and landscape 844 × 390. They cover appearance settings, collection editing/deletion/picking, trailer failure and retry, quick title details, feedback menus, search suggestions/results, picker results, and Movie Night preference/confirmation dialogs. Dialog controls are scrolled into view to check that they remain reachable.

Empty libraries/catalogs and unavailable-data states are checked at 320, 768, and 1440px. Touch emulation checks expanded service filters, poster actions, quick details, search focus, and footer clearance at 320, 390, and 768px.

The checks use isolated browser sessions and controlled catalog/room responses, including long unbroken names and search terms, long provider labels, populated libraries, and rooms with 12 participants. Existing user browser data is untouched. Horizontal poster rails and scrollable genre filters are intentional; the page itself should fit the viewport.

## Limits

This is a browser layout audit, not a guarantee for every physical device or browser configuration. Safari/iOS remains unverified: the bundled WebKit browser could not create a page with this Mac's installed testing-tool version. Physical-device checks for mobile browser chrome, notches, and the on-screen keyboard are still useful before release.
