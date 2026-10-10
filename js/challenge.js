/*
    Author: Mele Nicolo' Emanuele
    Date: 2026-10-10
    License: MIT
    Description: Runs the timed and attempts challenges, tracks live statistics and ends the activity.
*/

window.FedeApp = window.FedeApp || {};

(function (app) {
    "use strict";

    const MODE_TIMED = "timed";
    const MODE_ATTEMPTS = "attempts";
    const TIMER_TICK = 250;
    const DEFAULT_TIMED_SECONDS = 60;
    const DEFAULT_ATTEMPTS = 20;

    let active = false;
    let mode = null;
    let timerId = null;
    let limit = 0;
    let remaining = 0;
    let startedAt = 0;
    let lastSampleSecond = 0;
    let result = null;

    const elements = {};

    /**
     * @return {void} Nothing is returned.
     * @desc Wires the challenge menu, the start buttons, the HUD and the result listener.
     */
    function initialize() {
        elements.backButton = document.getElementById("back-challenge");
        elements.closeButton = document.getElementById("close-challenge");
        elements.timerInput = document.getElementById("challenge-timer-seconds");
        elements.attemptsInput = document.getElementById("challenge-attempts-count");
        elements.startTimedButton = document.getElementById("start-timed");
        elements.startAttemptsButton = document.getElementById("start-attempts");
        elements.hud = document.getElementById("challenge-hud");
        elements.hudLabel = document.getElementById("hud-label");
        elements.hudCorrect = document.getElementById("hud-correct");
        elements.hudWrong = document.getElementById("hud-wrong");
        elements.hudStop = document.getElementById("hud-stop");

        elements.backButton.addEventListener("click", backToActivities);
        elements.closeButton.addEventListener("click", closeMenu);
        elements.startTimedButton.addEventListener("click", startTimedFromInput);
        elements.startAttemptsButton.addEventListener("click", startAttemptsFromInput);
        elements.hudStop.addEventListener("click", finishChallenge);
        document.addEventListener("fede-result", handleResult);
    }

    /**
     * @return {void} Nothing is returned.
     * @desc Opens the challenge selection modal.
     */
    function openMenu() {
        app.modal.open("challenge-modal");
    }

    /**
     * @return {void} Nothing is returned.
     * @desc Closes the challenge selection modal.
     */
    function closeMenu() {
        app.modal.close("challenge-modal");
    }

    /**
     * @return {void} Nothing is returned.
     * @desc Closes the challenge modal and returns to the activities menu.
     */
    function backToActivities() {
        closeMenu();
        app.modal.open("activities-modal");
    }

    /**
     * @return {void} Nothing is returned.
     * @desc Reads the seconds input and starts a timed challenge.
     */
    function startTimedFromInput() {
        const seconds = parseInt(elements.timerInput.value, 10);
        startChallenge(MODE_TIMED, seconds > 0 ? seconds : DEFAULT_TIMED_SECONDS);
    }

    /**
     * @return {void} Nothing is returned.
     * @desc Reads the attempts input and starts an attempts challenge.
     */
    function startAttemptsFromInput() {
        const attempts = parseInt(elements.attemptsInput.value, 10);
        startChallenge(MODE_ATTEMPTS, attempts > 0 ? attempts : DEFAULT_ATTEMPTS);
    }

    /**
     * @param {string} selectedMode - Either the timed or the attempts mode.
     * @param {number} selectedLimit - The seconds or the attempt count of the challenge.
     * @return {void} Nothing is returned.
     * @desc Prepares the result tracker, shows the HUD and starts the challenge.
     */
    function startChallenge(selectedMode, selectedLimit) {
        app.modal.close("challenge-modal");
        active = true;
        mode = selectedMode;
        limit = selectedLimit;
        remaining = selectedLimit;
        startedAt = performance.now();
        lastSampleSecond = 0;
        result = {
            mode: selectedMode,
            limit: selectedLimit,
            correctCount: 0,
            wrongCount: 0,
            totalAttempts: 0,
            durationSeconds: 0,
            samples: [{ elapsed: 0, correct: 0 }]
        };
        elements.hud.style.display = "flex";
        updateHud();
        app.game.restart();
        if (mode === MODE_TIMED) {
            timerId = window.setInterval(tick, TIMER_TICK);
        }
    }

    /**
     * @return {void} Nothing is returned.
     * @desc Updates the countdown, samples the trend and ends the timer challenge.
     */
    function tick() {
        if (!active || mode !== MODE_TIMED || !result) {
            return;
        }
        const elapsed = (performance.now() - startedAt) / 1000;
        remaining = Math.max(0, limit - elapsed);
        recordTimedSample();
        updateHud();
        if (remaining <= 0) {
            finishChallenge();
        }
    }

    /**
     * @return {void} Nothing is returned.
     * @desc Stores one cumulative sample for each elapsed second of the challenge.
     */
    function recordTimedSample() {
        const elapsedSecond = Math.floor((performance.now() - startedAt) / 1000);
        if (elapsedSecond <= lastSampleSecond) {
            return;
        }
        lastSampleSecond = elapsedSecond;
        result.samples.push({ elapsed: elapsedSecond, correct: result.correctCount });
    }

    /**
     * @param {CustomEvent} event - The keystroke result announced by the game module.
     * @return {void} Nothing is returned.
     * @desc Updates the statistics and ends the attempts challenge when exhausted.
     */
    function handleResult(event) {
        if (!active || !result) {
            return;
        }
        result.totalAttempts += 1;
        if (event.detail.correct) {
            result.correctCount += 1;
        } else {
            result.wrongCount += 1;
        }
        if (mode === MODE_ATTEMPTS) {
            remaining -= 1;
        }
        updateHud();
        if (mode === MODE_ATTEMPTS && remaining <= 0) {
            finishChallenge();
        }
    }

    /**
     * @return {void} Nothing is returned.
     * @desc Refreshes the HUD label and the live correct and wrong counters.
     */
    function updateHud() {
        if (!result) {
            return;
        }
        elements.hudLabel.textContent = mode === MODE_TIMED
            ? "Time " + formatDuration(Math.ceil(remaining))
            : "Attempts " + Math.max(0, remaining);
        elements.hudCorrect.textContent = String(result.correctCount);
        elements.hudWrong.textContent = String(result.wrongCount);
    }

    /**
     * @return {void} Nothing is returned.
     * @desc Stops the challenge, hides the HUD and opens the analytics view.
     */
    function finishChallenge() {
        if (!active || !result) {
            return;
        }
        if (mode === MODE_TIMED) {
            result.durationSeconds = Math.round((performance.now() - startedAt) / 1000);
            const lastSample = result.samples[result.samples.length - 1];
            if (lastSample.elapsed !== result.durationSeconds) {
                result.samples.push({ elapsed: result.durationSeconds, correct: result.correctCount });
            }
        }
        const finishedResult = result;
        teardown();
        app.analytics.show(finishedResult);
        app.game.restart();
    }

    /**
     * @return {void} Nothing is returned.
     * @desc Cancels a running challenge without showing the analytics view.
     */
    function stopSilently() {
        if (!active) {
            return;
        }
        teardown();
    }

    /**
     * @return {void} Nothing is returned.
     * @desc Clears the timer, hides the HUD and resets the challenge tracking state.
     */
    function teardown() {
        if (timerId !== null) {
            window.clearInterval(timerId);
            timerId = null;
        }
        active = false;
        result = null;
        mode = null;
        elements.hud.style.display = "none";
    }

    /**
     * @param {number} totalSeconds - The number of seconds to format.
     * @return {string} The time formatted as mm:ss.
     * @desc Formats a duration in seconds into a minutes and seconds label.
     */
    function formatDuration(totalSeconds) {
        const safeSeconds = Math.max(0, totalSeconds);
        const minutes = Math.floor(safeSeconds / 60);
        const seconds = safeSeconds % 60;
        return String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
    }

    app.challenge = {
        initialize: initialize,
        openMenu: openMenu,
        stopSilently: stopSilently,
        isActive: function () {
            return active;
        }
    };
})(window.FedeApp);
