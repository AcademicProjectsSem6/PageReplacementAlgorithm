# Page Replacement Algorithm Simulator

A web app to simulate and compare **FIFO**, **LRU**, **LFU**, and **MFU** page replacement algorithms. Enter a reference string and number of frames to see page faults, hit ratio, and step-by-step frame tables.

** Open the file directly**

- Double-click `index.html`, or  
- Drag `index.html` into your browser.

Some features work best when served over HTTP (e.g. `npm start`).

## Usage

1. Enter a **reference string** (e.g. `7,0,1,2,0,3,0,4,2,3` or `1 2 3 4 5 6`).
2. Enter the number of **frames** (e.g. `3`).
3. Click **Run simulation**.
4. View the **Comparison** tab for summary and best algorithm, and the **FIFO**, **LRU**, **LFU**, **MFU** tabs for detailed frame tables.

## Files

- `index.html` – Structure and UI
- `style.css` – Styling
- `script.js` – Algorithms and simulation logic
