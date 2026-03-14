# Page Replacement Algorithm Simulator

A web app to simulate and compare **FIFO**, **LRU**, **LFU**, and **MFU** page replacement algorithms. Enter a reference string and number of frames to see page faults, hit ratio, and step-by-step frame tables.

## Run locally (as a website)

**Option 1 – Simple HTTP server (recommended)**

```bash
npm start
```

Then open **http://localhost:3000** in your browser.

**Option 2 – Open the file directly**

- Double-click `index.html`, or  
- Drag `index.html` into your browser.

Some features work best when served over HTTP (e.g. `npm start`).

## Deploy as a website

The project is static (HTML, CSS, JS only). You can host it on:

- **GitHub Pages** – Push to a repo, enable Pages in repo Settings → Pages, select branch (e.g. `main`).
- **Netlify** – Drag the project folder to [netlify.com/drop](https://app.netlify.com/drop) or connect your Git repo.
- **Vercel** – Import the repo at [vercel.com](https://vercel.com) and deploy (no build step needed).

Root document is `index.html`; no build or server is required.

## Usage

1. Enter a **reference string** (e.g. `7,0,1,2,0,3,0,4,2,3` or `1 2 3 4 5 6`).
2. Enter the number of **frames** (e.g. `3`).
3. Click **Run simulation**.
4. View the **Comparison** tab for summary and best algorithm, and the **FIFO**, **LRU**, **LFU**, **MFU** tabs for detailed frame tables.

## Files

- `index.html` – Structure and UI
- `style.css` – Styling
- `script.js` – Algorithms and simulation logic
