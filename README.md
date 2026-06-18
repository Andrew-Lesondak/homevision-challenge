# HomeVision House Listings

Infinite-scrolling React + TypeScript app for browsing the HomeVision staging house API.

## What it does

- Loads houses from `https://staging.homevision.co/api_project/houses`
- Requests data page by page with `page` and `per_page` parameters
- Keeps earlier results visible while loading more
- Auto retries flaky API responses before showing an error
- Displays price formatting, Google Maps links, and image fallbacks
- Uses virtualization so the table stays responsive as the list grows

## Getting Started

### Environment

Developed with Node.js `v26.2.0` and npm `11.13.0`.

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

### Tests

```bash
npm run test
```

### Storybook demo

```bash
npm run storybook
```

## Notes on implementation

- `Start page` and `Per page` controls let you change the request range without leaving the page.
- House photos open the original image in a new tab.
- If an image is missing or fails to load, the UI shows a descriptive placeholder instead of a broken thumbnail.
- Address rows link to Google Maps search results for convenience.
- Errors are surfaced through toasts with retry actions so previously loaded houses remain visible.

## Production Notes

- Flaky API responses are handled with retries and a single final error toast if the cycle still fails.
- Infinite scroll stops naturally when the API appears exhausted, so the app does not rely on a hard-coded last page.
- Virtualized rows keep the table responsive as the dataset grows.
- Hover previews and image fallbacks are isolated so failed media does not break the surrounding table layout.
- The loading row is the primary in-flow status indicator; toasts are reserved for hard failures.
- Accessibility was considered with semantic table structure, descriptive image alt text, and keyboard-friendly link/button elements.
- This project intentionally includes tests and Storybook so a reviewer can run, validate, and inspect key UI states without needing the full app flow.

## Future improvements

- Add an end-to-end test that scrolls the table and verifies pagination.
- Add accessibility audits and keyboard-focused table navigation.
- Make the table more mobile friendly, potentially with a card layout or a denser narrow-screen treatment.
- Consider a more explicit loading state for the first page and for pagination retries.
