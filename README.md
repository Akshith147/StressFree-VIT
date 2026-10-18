# StressFree VIT

A student mental-health check-in website for the multidisciplinary project at VIT Vellore (Computer Science + Psychology). Choose a mood, leave an optional note, and look back at your check-ins in the same browser.

This is a self-awareness project, not a diagnostic tool or an emergency service.

## Current features

- Home page with links to Check-in and History.
- Five numbered mood choices and an optional note of up to 500 characters.
- Browser storage with validated entries, newest first.
- History with a seven-day summary, individual deletion and clear-all confirmation.
- Shared navigation and help footer on every page.
- Responsive cream, yellow, orange and red interface with system fonts.

Chat, Resources and Counsellor are placeholders for the remaining team work. The keyword chatbot is not implemented yet. The counsellor screen is a demo that sends no request. Login and sign-up are deferred. No backend, database, analytics or network APIs are connected.

## Run locally

Install Node.js 24 and npm, then run:

```bash
git clone https://github.com/Akshith147/StressFree-VIT.git
cd StressFree-VIT
npm ci
npm run dev
```

Open the URL Vite prints, normally `http://localhost:5173`. Try `/#/checkin`, save an entry, open History and refresh to confirm it remains.

If the repository is already on your computer, open that folder in Terminal before running npm commands. Users of nvm can run `nvm install` and `nvm use` to select the version in `.nvmrc`.

## Build and tests

```bash
npm test
npm run build
```

The build performs strict TypeScript checks and creates static files in `dist/`. Tests cover validation, sorting, note limits, deletion, storage failures, change events, weekly date boundaries and rendering contracts for all six routes.

To inspect the production build locally, run `npm run preview` and open its printed URL. Development and preview use separate browser storage because they have different origins. Do not open `dist/index.html` directly from the filesystem.

## Project structure

| Area | Purpose |
| --- | --- |
| `src/pages/` | Home, CheckIn, History, Chat, Resources and Counsellor pages |
| `src/components/` | Layout, navigation and shared UI components |
| `src/lib/constants.ts` | Site name and shared support contacts |
| `src/lib/checkins.ts` | Storage, validation, React hook and weekly summary |
| `src/data/` | Reserved for approved chatbot and resource content |
| `docs/` | Reserved for team documents |
| `.github/workflows/` | Pull-request checks and GitHub Pages deployment |

React Router uses `HashRouter`, so routes look like `/#/history` and can be refreshed on static hosting. Unknown routes redirect to Home. Shared page components export a default component without props and use the common Layout.

## Data and privacy

Entries stay in localStorage on the current browser profile, device and site origin. They are not encrypted or protected by a login. Anyone using that profile can view them. Entries are not sent to a counsellor. Clearing site data removes them; changing browser, domain or device does not transfer them. Use sample information for the review demo.

Storage key: `mhc.checkins.v1`. Each entry contains `{ id, date, mood, note }`. Mood is an integer from 1 to 5; dates are ISO timestamps displayed in the viewer's local timezone using Indian formatting. Notes are trimmed and limited to 500 characters. Weekly statistics cover the preceding 168 hours.

Malformed entries are skipped. Corrupt or inaccessible reads do not crash the page. Failed saves or deletions show an error instead of reporting success. Other open pages on the same origin refresh after changes. Simultaneous writes from multiple tabs may overwrite each other because localStorage is not transactional.

## Team responsibilities

| Member | Role |
| --- | --- |
| Akshith Kesari | Coder A: setup, shared UI, mood check-ins, History and reviews |
| Neeraj | Coder B: Home and resource pages; login deferred |
| Aarush Bharadwaj | Coder C: keyword chatbot and demo counsellor screen |
| Dinesh | Content and psychology: approved wording and wireframes |
| Ansh | Project management, testing, DNS and documents |

Coordinate shared-file changes before integration.

## Remaining checks and integration

- Check all routes on a laptop and at 375 px, including keyboard focus and radio arrow keys.
- Test refresh persistence, delete/cancel, clear/cancel and storage errors in the browser.
- Integrate the keyword chatbot, resource text and verified campus counselling contact.
- Check crisis handling before the chatbot is used in the review.
- Confirm the final custom domain.

Automated build and unit checks run locally and in the included workflows. Browser visual checks and interactive end-to-end checks remain separate review steps.

## GitHub Pages

In repository **Settings → Pages**, choose **GitHub Actions** as the source. The deployment workflow runs tests and builds on pushes to `main`, then publishes `dist/`. The pull-request workflow checks tests and builds without deployment. Both use Node.js 24.

Vite uses `base: './'`. There is no `public/CNAME`; set a custom domain in Pages settings after DNS is confirmed. Later feature changes should use task branches and teammate review before merging.

## Five-line explanation for the review

1. React Router switches pages using the hash part of the address, which works on static hosting.
2. The form collects a mood and an optional note and saves a dated entry in browser storage.
3. The storage module validates saved data and sorts entries newest first.
4. History reads those entries, calculates a seven-day summary and supports confirmed deletion.
5. Shared UI, navigation and the help footer keep the pages consistent while teammates finish their sections.
