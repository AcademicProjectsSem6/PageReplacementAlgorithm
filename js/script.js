(function () {
    "use strict";

    // ——— Algorithm implementations (return steps + stepFaults for each step) ———

    function fifoPageReplacement(pages, frames) {
        var memory = [];
        var pageFaults = 0;
        var steps = [];
        var stepFaults = [];
        var index = 0;
        var i, page, isFault;

        for (i = 0; i < pages.length; i++) {
            page = pages[i];
            isFault = !memory.includes(page);
            if (isFault) {
                if (memory.length < frames) {
                    memory.push(page);
                } else {
                    memory[index] = page;
                    index = (index + 1) % frames;
                }
                pageFaults++;
            }
            steps.push([].concat(memory, Array(frames - memory.length).fill("-")));
            stepFaults.push(isFault);
        }

        return {
            faults: pageFaults,
            hits: pages.length - pageFaults,
            ratio: pages.length ? Number(((pages.length - pageFaults) / pages.length).toFixed(2)) : 0,
            steps: steps,
            stepFaults: stepFaults
        };
    }

    function lruPageReplacement(pages, frames) {
        var memory = [];
        var pageFaults = 0;
        var steps = [];
        var stepFaults = [];
        var recentlyUsed = [];
        var i, page, isFault, leastRecentlyUsed, indexOfLRUFrame;

        for (i = 0; i < pages.length; i++) {
            page = pages[i];
            isFault = !memory.includes(page);
            if (isFault) {
                if (memory.length < frames) {
                    memory.push(page);
                } else {
                    leastRecentlyUsed = recentlyUsed.shift();
                    indexOfLRUFrame = memory.indexOf(leastRecentlyUsed);
                    memory[indexOfLRUFrame] = page;
                }
                pageFaults++;
            } else {
                recentlyUsed = recentlyUsed.filter(function (p) { return p !== page; });
            }
            recentlyUsed.push(page);
            steps.push([].concat(memory, Array(frames - memory.length).fill("-")));
            stepFaults.push(isFault);
        }

        return {
            faults: pageFaults,
            hits: pages.length - pageFaults,
            ratio: pages.length ? Number(((pages.length - pageFaults) / pages.length).toFixed(2)) : 0,
            steps: steps,
            stepFaults: stepFaults
        };
    }

    function lfuPageReplacement(pages, frames) {
        var memory = [];
        var pageFaults = 0;
        var steps = [];
        var stepFaults = [];
        var pageFrequency = {};
        var pageHist = [];
        var i, page, isFault, minimumFreq, minFreqPages, pageToReplace;

        for (i = 0; i < pages.length; i++) {
            page = pages[i];
            isFault = !memory.includes(page);
            if (isFault) {
                if (memory.length < frames) {
                    memory.push(page);
                    pageHist.push(page);
                } else {
                    minimumFreq = Math.min.apply(null, memory.map(function (x) { return pageFrequency[x]; }));
                    minFreqPages = memory.filter(function (x) { return pageFrequency[x] === minimumFreq; });
                    if (minFreqPages.length === 1) {
                        pageToReplace = minFreqPages[0];
                    } else {
                        pageToReplace = minFreqPages.reduce(function (oldest, current) {
                            return pageHist.indexOf(current) < pageHist.indexOf(oldest) ? current : oldest;
                        });
                    }
                    memory[memory.indexOf(pageToReplace)] = page;
                    pageHist = pageHist.filter(function (p) { return p !== pageToReplace; });
                    pageHist.push(page);
                    delete pageFrequency[pageToReplace];
                }
                pageFaults++;
            }
            pageFrequency[page] = (pageFrequency[page] || 0) + 1;
            steps.push([].concat(memory, Array(frames - memory.length).fill("-")));
            stepFaults.push(isFault);
        }

        return {
            faults: pageFaults,
            hits: pages.length - pageFaults,
            ratio: pages.length ? Number(((pages.length - pageFaults) / pages.length).toFixed(2)) : 0,
            steps: steps,
            stepFaults: stepFaults
        };
    }

    function mfuPageReplacement(pages, frames) {
        var memory = [];
        var pageFaults = 0;
        var steps = [];
        var stepFaults = [];
        var pageFrequency = {};
        var pageHist = [];
        var i, page, isFault, maximumFreq, maxFreqPages, pageToReplace;

        for (i = 0; i < pages.length; i++) {
            page = pages[i];
            isFault = !memory.includes(page);
            if (isFault) {
                if (memory.length < frames) {
                    memory.push(page);
                    pageHist.push(page);
                } else {
                    maximumFreq = Math.max.apply(null, memory.map(function (x) { return pageFrequency[x]; }));
                    maxFreqPages = memory.filter(function (x) { return pageFrequency[x] === maximumFreq; });
                    if (maxFreqPages.length === 1) {
                        pageToReplace = maxFreqPages[0];
                    } else {
                        pageToReplace = maxFreqPages.reduce(function (oldest, current) {
                            return pageHist.indexOf(current) < pageHist.indexOf(oldest) ? current : oldest;
                        });
                    }
                    memory[memory.indexOf(pageToReplace)] = page;
                    pageHist = pageHist.filter(function (p) { return p !== pageToReplace; });
                    pageHist.push(page);
                    delete pageFrequency[pageToReplace];
                }
                pageFaults++;
            }
            pageFrequency[page] = (pageFrequency[page] || 0) + 1;
            steps.push([].concat(memory, Array(frames - memory.length).fill("-")));
            stepFaults.push(isFault);
        }

        return {
            faults: pageFaults,
            hits: pages.length - pageFaults,
            ratio: pages.length ? Number(((pages.length - pageFaults) / pages.length).toFixed(2)) : 0,
            steps: steps,
            stepFaults: stepFaults
        };
    }

    function parsePages(input) {
        return input
            .replace(/,/g, " ")
            .split(/\s+/)
            .filter(function (x) { return x.trim() !== ""; })
            .map(function (x) { return Number(x); });
    }

    // ——— DOM & state ———

    var currentResults = null;
    var currentPages = [];
    var currentFrames = 0;
    var currentPagesInput = "";
    var currentFramesInput = "";

    var sections = ["home", "comparison", "FIFO", "LRU", "LFU", "MFU"];

    function getSectionId(name) {
        return "section-" + name;
    }

    var heroContent = {
        home: {
            title: 'Selecting the <span>Best Algorithm</span> Based on Performance',
            subtitle: 'Compare FIFO, LRU, LFU, and MFU page replacement algorithms with step-by-step simulation.'
        },
        comparison: {
            title: 'Compare All Algorithms',
            subtitle: 'View page faults, hits, hit ratio, and the best algorithm for your reference string.'
        },
        FIFO: {
            title: 'FIFO — First In, First Out',
            subtitle: 'The oldest page in memory is replaced when a page fault occurs. First in, first out replacement policy.'
        },
        LRU: {
            title: 'LRU — Least Recently Used',
            subtitle: 'The page that has not been used for the longest time is replaced when a fault occurs.'
        },
        LFU: {
            title: 'LFU — Least Frequently Used',
            subtitle: 'The page with the smallest reference count is replaced; ties are broken by the oldest page.'
        },
        MFU: {
            title: 'MFU — Most Frequently Used',
            subtitle: 'The page with the largest reference count is replaced; ties are broken by the oldest page.'
        }
    };

    function updateHero(sectionName) {
        var content = heroContent[sectionName];
        var titleEl = document.getElementById("hero-title");
        var subtitleEl = document.getElementById("hero-subtitle");
        if (content && titleEl && subtitleEl) {
            titleEl.innerHTML = content.title;
            subtitleEl.textContent = content.subtitle;
        }
    }

    function showSection(sectionName) {
        var id = getSectionId(sectionName);
        sections.forEach(function (name) {
            var el = document.getElementById(getSectionId(name));
            if (el) el.hidden = name !== sectionName;
        });
        document.querySelectorAll(".nav-link").forEach(function (link) {
            link.classList.toggle("active", link.getAttribute("data-section") === sectionName);
        });
        updateHero(sectionName);
    }

    function renderComparison() {
        var placeholder = document.getElementById("comparison-placeholder");
        var content = document.getElementById("comparison-content");
        var cardsContainer = document.getElementById("comparison-cards");
        var bestCard = document.getElementById("best-algorithm-card");

        if (!currentResults) {
            if (placeholder) placeholder.hidden = false;
            if (content) content.hidden = true;
            return;
        }

        if (placeholder) placeholder.hidden = true;
        if (content) content.hidden = false;

        document.getElementById("used-pages-comparison").textContent = currentPagesInput || "—";
        document.getElementById("used-frames-comparison").textContent = currentFramesInput || "—";

        var minFaults = Math.min.apply(null, Object.keys(currentResults).map(function (k) { return currentResults[k].faults; }));
        var bestAlgorithms = Object.keys(currentResults).filter(function (algo) {
            return currentResults[algo].faults === minFaults;
        });

        cardsContainer.innerHTML = Object.keys(currentResults).map(function (algo) {
            var data = currentResults[algo];
            var isBest = bestAlgorithms.indexOf(algo) !== -1;
            var cardClass = "summary-card summary-card-" + algo.toLowerCase();
            if (isBest) cardClass += " best";
            return (
                '<div class="card ' + cardClass + '">' +
                "<h3>" + algo + "</h3>" +
                "<p><strong>Page faults:</strong> " + data.faults + "</p>" +
                "<p><strong>Hits:</strong> " + data.hits + "</p>" +
                "<p><strong>Hit ratio:</strong> " + data.ratio + "</p>" +
                "</div>"
            );
        }).join("");

        var bestText = bestAlgorithms.length === 1
            ? bestAlgorithms[0] + " is the best algorithm based on minimum page faults."
            : "Tie between: " + bestAlgorithms.join(", ");
        bestCard.innerHTML = "<h2>Best algorithm</h2><p>" + bestText + "</p>";
    }

    function buildAlgorithmTable(algoName, data, referencePages) {
        if (!data || !data.steps || data.steps.length === 0) return "";

        var steps = data.steps;
        var numSteps = steps.length;
        var numFrames = steps[0].length;

        // Reference string row: one cell per step (column = step)
        var refRowCells = referencePages.map(function (ref, i) {
            return "<td class=\"cell-ref\">" + (ref !== undefined ? ref : "—") + "</td>";
        }).join("");

        // Frame rows: row j = Frame j+1, each cell = steps[stepIndex][frameIndex]
        var frameRows = "";
        for (var f = 0; f < numFrames; f++) {
            var cells = "";
            for (var s = 0; s < numSteps; s++) {
                var val = steps[s][f];
                cells += "<td class=\"cell-frame\">" + (val === "-" || val === "" ? "" : val) + "</td>";
            }
            frameRows += "<tr><th class=\"row-label\">Frame " + (f + 1) + "</th>" + cells + "</tr>";
        }

        // Hit/Fault row
        var hfRowCells = "";
        for (var i = 0; i < numSteps; i++) {
            var fault = data.stepFaults && data.stepFaults[i];
            var cls = fault ? "cell-fault" : "cell-hit";
            var text = fault ? "Fault" : "Hit";
            hfRowCells += "<td class=\"" + cls + "\">" + text + "</td>";
        }

        // Header row: empty first cell (row labels), then step numbers 1, 2, 3, ...
        var headerCells = "";
        for (var k = 0; k < numSteps; k++) {
            headerCells += "<th class=\"step-col\">" + (k + 1) + "</th>";
        }

        return (
            "<thead><tr><th class=\"row-label\"></th>" + headerCells + "</tr></thead>" +
            "<tbody>" +
            "<tr><th class=\"row-label\">Reference</th>" + refRowCells + "</tr>" +
            frameRows +
            "<tr><th class=\"row-label\">Hit / Fault</th>" + hfRowCells + "</tr>" +
            "</tbody>"
        );
    }

    function buildRefStringDisplay(referencePages) {
        if (!referencePages || referencePages.length === 0) return "";
        return "<p class=\"ref-string-label\">Reference string:</p>" +
            "<p class=\"ref-string-values\">" + referencePages.join(" ") + "</p>";
    }

    function renderAlgorithmSection(algoName) {
        var sectionId = "section-" + algoName;
        var placeholderId = algoName.toLowerCase() + "-placeholder";
        var contentId = algoName.toLowerCase() + "-content";
        var faultsId = algoName.toLowerCase() + "-faults";
        var hitsId = algoName.toLowerCase() + "-hits";
        var ratioId = algoName.toLowerCase() + "-ratio";
        var tableId = algoName.toLowerCase() + "-table";

        var placeholder = document.getElementById(placeholderId);
        var content = document.getElementById(contentId);

        if (!currentResults || !currentResults[algoName]) {
            if (placeholder) placeholder.hidden = false;
            if (content) content.hidden = true;
            return;
        }

        var data = currentResults[algoName];
        if (placeholder) placeholder.hidden = true;
        if (content) content.hidden = false;

        var faultsEl = document.getElementById(faultsId);
        var hitsEl = document.getElementById(hitsId);
        var ratioEl = document.getElementById(ratioId);
        if (faultsEl) faultsEl.textContent = data.faults;
        if (hitsEl) hitsEl.textContent = data.hits;
        if (ratioEl) ratioEl.textContent = data.ratio;

        var table = document.getElementById(tableId);
        if (table) table.innerHTML = buildAlgorithmTable(algoName, data, currentPages);

        var refDisplay = document.getElementById(algoName.toLowerCase() + "-ref-display");
        if (refDisplay) refDisplay.innerHTML = buildRefStringDisplay(currentPages);
    }

    function runSimulation() {
        var pagesInput = document.getElementById("pages").value.trim();
        var framesInput = document.getElementById("frames").value.trim();
        var errorEl = document.getElementById("error-message");
        var resultsIntro = document.getElementById("results-intro");

        try {
            var pages = parsePages(pagesInput);
            var frames = parseInt(framesInput, 10);

            var invalidPages = pages.length === 0 || pages.some(function (n) { return Number.isNaN(n); });
            var invalidFrames = !Number.isInteger(frames) || frames < 1;

            if (invalidPages || invalidFrames) throw new Error("Invalid input");

            currentPages = pages;
            currentFrames = frames;
            currentPagesInput = pagesInput;
            currentFramesInput = framesInput;

            currentResults = {
                FIFO: fifoPageReplacement(pages, frames),
                LRU: lruPageReplacement(pages, frames),
                LFU: lfuPageReplacement(pages, frames),
                MFU: mfuPageReplacement(pages, frames)
            };

            if (errorEl) errorEl.hidden = true;
            if (resultsIntro) resultsIntro.hidden = false;

            renderComparison();
            ["FIFO", "LRU", "LFU", "MFU"].forEach(renderAlgorithmSection);

            showSection("comparison");
        } catch (e) {
            if (resultsIntro) resultsIntro.hidden = true;
            if (errorEl) {
                errorEl.hidden = false;
            }
        }
    }

    function init() {
        var btnRun = document.getElementById("btn-run");
        if (btnRun) btnRun.addEventListener("click", runSimulation);

        document.querySelectorAll(".nav-link, .logo, .algo-card, .placeholder-card a, .inline-link").forEach(function (el) {
            el.addEventListener("click", function (e) {
                var section = el.getAttribute("data-section");
                if (section) {
                    e.preventDefault();
                    showSection(section);
                }
            });
        });

        showSection("home");
        renderComparison();
        ["FIFO", "LRU", "LFU", "MFU"].forEach(renderAlgorithmSection);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
