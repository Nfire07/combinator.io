/*
    Author: Mele Nicolo' Emanuele
    Date: 2026-10-10
    License: MIT
    Description: Renders the end of challenge analytics and draws the correct combination trend chart.
*/

window.FedeApp = window.FedeApp || {};

(function (app) {
    "use strict";

    const AXIS_COLOR = "rgba(217, 217, 217, 0.45)";
    const GRID_COLOR = "rgba(217, 217, 217, 0.12)";
    const TEXT_COLOR = "#d9d9d9";
    const LINE_COLOR = "#0cc825";
    const AREA_COLOR = "rgba(12, 200, 37, 0.14)";
    const FONT = "11px 'Fira Sans', sans-serif";

    let lastResult = null;

    const elements = {};

    /**
     * @return {void} Nothing is returned.
     * @desc Wires the analytics modal controls and the resize redraw listener.
     */
    function initialize() {
        elements.mode = document.getElementById("analytics-mode");
        elements.correct = document.getElementById("analytics-correct");
        elements.wrong = document.getElementById("analytics-wrong");
        elements.attempts = document.getElementById("analytics-attempts");
        elements.accuracy = document.getElementById("analytics-accuracy");
        elements.chartSection = document.getElementById("analytics-chart-section");
        elements.chart = document.getElementById("analytics-chart");
        elements.closeButton = document.getElementById("close-analytics");

        elements.closeButton.addEventListener("click", close);
        window.addEventListener("resize", handleResize);
    }

    /**
     * @param {Object} result - The finished challenge result to present.
     * @return {void} Nothing is returned.
     * @desc Fills the statistics, opens the modal and draws the trend chart.
     */
    function show(result) {
        lastResult = result;
        elements.mode.textContent = result.mode === "timed" ? "Timed challenge" : "Attempts challenge";
        elements.correct.textContent = String(result.correctCount);
        elements.wrong.textContent = String(result.wrongCount);
        elements.attempts.textContent = String(result.totalAttempts);
        elements.accuracy.textContent = computeAccuracy(result) + "%";
        elements.chartSection.style.display = result.mode === "timed" ? "flex" : "none";
        app.modal.open("analytics-modal");
        if (result.mode === "timed") {
            drawChart(result.samples);
        }
    }

    /**
     * @return {void} Nothing is returned.
     * @desc Closes the analytics modal.
     */
    function close() {
        app.modal.close("analytics-modal");
    }

    /**
     * @param {Object} result - The challenge result to evaluate.
     * @return {number} The rounded percentage of correct combinations.
     * @desc Computes the share of correct combinations over total attempts.
     */
    function computeAccuracy(result) {
        if (result.totalAttempts === 0) {
            return 0;
        }
        return Math.round((result.correctCount / result.totalAttempts) * 100);
    }

    /**
     * @return {void} Nothing is returned.
     * @desc Redraws the chart after a window resize when a timed result is shown.
     */
    function handleResize() {
        if (lastResult && lastResult.mode === "timed" && elements.chartSection.style.display === "flex") {
            drawChart(lastResult.samples);
        }
    }

    /**
     * @param {Array<{elapsed: number, correct: number}>} samples - The cumulative samples over time.
     * @return {void} Nothing is returned.
     * @desc Draws the cumulative correct combinations over time on the canvas.
     */
    function drawChart(samples) {
        const canvas = elements.chart;
        if (!canvas) {
            return;
        }
        const rect = canvas.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
            return;
        }
        const ratio = window.devicePixelRatio || 1;
        canvas.width = Math.round(rect.width * ratio);
        canvas.height = Math.round(rect.height * ratio);
        const context = canvas.getContext("2d");
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        context.clearRect(0, 0, rect.width, rect.height);

        const padding = { top: 16, right: 18, bottom: 30, left: 40 };
        const plotWidth = rect.width - padding.left - padding.right;
        const plotHeight = rect.height - padding.top - padding.bottom;
        if (plotWidth <= 0 || plotHeight <= 0) {
            return;
        }

        const points = samples && samples.length > 0 ? samples : [{ elapsed: 0, correct: 0 }];
        const maxElapsed = Math.max(1, points[points.length - 1].elapsed);
        const maxCorrect = Math.max(1, points.reduce(function (maximum, point) {
            return Math.max(maximum, point.correct);
        }, 0));

        drawGrid(context, padding, plotWidth, plotHeight, maxCorrect);
        drawAxes(context, padding, plotWidth, plotHeight);
        drawLabels(context, padding, plotWidth, plotHeight, maxElapsed);
        drawSeries(context, padding, plotWidth, plotHeight, points, maxElapsed, maxCorrect);
    }

    /**
     * @param {CanvasRenderingContext2D} context - The drawing context.
     * @param {Object} padding - The chart padding values.
     * @param {number} plotWidth - The width of the plot area.
     * @param {number} plotHeight - The height of the plot area.
     * @param {number} maxCorrect - The highest correct value on the axis.
     * @return {void} Nothing is returned.
     * @desc Draws the horizontal grid lines and the correct value labels.
     */
    function drawGrid(context, padding, plotWidth, plotHeight, maxCorrect) {
        const steps = 5;
        context.font = FONT;
        context.textBaseline = "middle";
        context.textAlign = "right";
        context.lineWidth = 1;
        for (let index = 0; index <= steps; index += 1) {
            const value = (maxCorrect / steps) * index;
            const y = padding.top + plotHeight - (value / maxCorrect) * plotHeight;
            context.strokeStyle = GRID_COLOR;
            context.beginPath();
            context.moveTo(padding.left, y);
            context.lineTo(padding.left + plotWidth, y);
            context.stroke();
            context.fillStyle = TEXT_COLOR;
            context.fillText(String(Math.round(value)), padding.left - 8, y);
        }
    }

    /**
     * @param {CanvasRenderingContext2D} context - The drawing context.
     * @param {Object} padding - The chart padding values.
     * @param {number} plotWidth - The width of the plot area.
     * @param {number} plotHeight - The height of the plot area.
     * @return {void} Nothing is returned.
     * @desc Draws the vertical and horizontal axis lines of the chart.
     */
    function drawAxes(context, padding, plotWidth, plotHeight) {
        context.strokeStyle = AXIS_COLOR;
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(padding.left, padding.top);
        context.lineTo(padding.left, padding.top + plotHeight);
        context.lineTo(padding.left + plotWidth, padding.top + plotHeight);
        context.stroke();
    }

    /**
     * @param {CanvasRenderingContext2D} context - The drawing context.
     * @param {Object} padding - The chart padding values.
     * @param {number} plotWidth - The width of the plot area.
     * @param {number} plotHeight - The height of the plot area.
     * @param {number} maxElapsed - The highest elapsed seconds on the axis.
     * @return {void} Nothing is returned.
     * @desc Draws the elapsed time labels under the horizontal axis.
     */
    function drawLabels(context, padding, plotWidth, plotHeight, maxElapsed) {
        context.font = FONT;
        context.fillStyle = TEXT_COLOR;
        context.textAlign = "center";
        context.textBaseline = "top";
        const baseline = padding.top + plotHeight + 8;
        context.fillText("0s", padding.left, baseline);
        context.fillText(maxElapsed + "s", padding.left + plotWidth, baseline);
    }

    /**
     * @param {CanvasRenderingContext2D} context - The drawing context.
     * @param {Object} padding - The chart padding values.
     * @param {number} plotWidth - The width of the plot area.
     * @param {number} plotHeight - The height of the plot area.
     * @param {Array<{elapsed: number, correct: number}>} points - The samples to draw.
     * @param {number} maxElapsed - The highest elapsed seconds on the axis.
     * @param {number} maxCorrect - The highest correct value on the axis.
     * @return {void} Nothing is returned.
     * @desc Draws the filled area, the trend line and the sample points.
     */
    function drawSeries(context, padding, plotWidth, plotHeight, points, maxElapsed, maxCorrect) {
        const mapX = function (elapsed) {
            return padding.left + (elapsed / maxElapsed) * plotWidth;
        };
        const mapY = function (correct) {
            return padding.top + plotHeight - (correct / maxCorrect) * plotHeight;
        };

        context.beginPath();
        context.moveTo(mapX(points[0].elapsed), mapY(0));
        points.forEach(function (point) {
            context.lineTo(mapX(point.elapsed), mapY(point.correct));
        });
        context.lineTo(mapX(points[points.length - 1].elapsed), mapY(0));
        context.closePath();
        context.fillStyle = AREA_COLOR;
        context.fill();

        context.beginPath();
        points.forEach(function (point, index) {
            const x = mapX(point.elapsed);
            const y = mapY(point.correct);
            if (index === 0) {
                context.moveTo(x, y);
            } else {
                context.lineTo(x, y);
            }
        });
        context.strokeStyle = LINE_COLOR;
        context.lineWidth = 2;
        context.stroke();

        context.fillStyle = LINE_COLOR;
        points.forEach(function (point) {
            context.beginPath();
            context.arc(mapX(point.elapsed), mapY(point.correct), 2.5, 0, Math.PI * 2);
            context.fill();
        });
    }

    app.analytics = {
        initialize: initialize,
        show: show
    };
})(window.FedeApp);
