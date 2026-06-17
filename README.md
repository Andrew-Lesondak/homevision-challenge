# HomeVision House Listings

Infinite-scrolling React + TypeScript app for browsing the HomeVision staging house API.

## What it does

- Loads houses from `https://staging.homevision.co/api_project/houses`
- Requests data page by page with `page` and `per_page` parameters
- Keeps earlier results visible while loading more
- Retries flaky API responses before surfacing an error
- Displays price formatting, Google Maps links, and image fallbacks
- Uses virtualization so the table stays responsive as the list grows

## Getting Started

### Install

```bash
npm install
```

### Run locally

```bash
npm run dev
```

Open the URL printed by Vite, usually `http://localhost:5173`.

### Build for production

```bash
npm run build
```

### Lint

```bash
npm run lint
```

## Notes on implementation

- `Start page` and `Per page` controls let you change the request range without leaving the page.
- House photos open the original image in a new tab.
- If an image is missing or fails to load, the UI shows a descriptive placeholder instead of a broken thumbnail.
- Address rows link to Google Maps search results for convenience.
- Errors are shown in a dedicated banner with a retry button so previously loaded houses remain visible.

## Future improvements

- Add automated unit tests for the helper functions and query behavior.
- Add an end-to-end test that scrolls the table and verifies pagination.
- Improve image hover interactions with an inline preview popover.
- Add accessibility audits and keyboard-focused table navigation.
- Consider a more explicit loading state for the first page and for pagination retries.
