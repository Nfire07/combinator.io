/*
    Author: Mele Nicolo' Emanuele
    Date: 2026-10-10
    License: MIT
    Description: Displays random numbers and validates the player keystrokes against the configured key bindings.
*/

window.FedeApp = window.FedeApp || {};

(function (app) {
    "use strict";

    const FEEDBACK_DURATION = 400;
    const ADVANCE_DELAY = 150;

    let currentNumber = null;

    const elements = {};

    /**
     * @return {void} Nothing is returned.
     * @desc Caches the display element, listens for keys and shows the first number.
     */
    function initialize() {
        elements.randomValue = document.getElementById("random-value");
        document.addEventListener("keydown", handleGameKeydown);
        restart();
    }

    /**
     * @return {void} Nothing is returned.
     * @desc Picks a new playable number and updates the display.
     */
    function restart() {
        currentNumber = pickPlayableNumber();
        render();
    }

    /**
     * @return {number|null} A playable number or null when the range is empty.
     * @desc Selects a random number, preferring the numbers that are bound.
     */
    function pickPlayableNumber() {
        const numbers = app.state.getNumbersInRange();
        if (numbers.length === 0) {
            return null;
        }
        const boundNumbers = app.state.getBoundNumbers();
        const pool = boundNumbers.length > 0 ? boundNumbers : numbers;
        return pool[Math.floor(Math.random() * pool.length)];
    }

    /**
     * @return {void} Nothing is returned.
     * @desc Clears the feedback styling and writes the current number to the display.
     */
    function render() {
        elements.randomValue.classList.remove("correct", "wrong");
        elements.randomValue.textContent = currentNumber === null ? "--" : String(currentNumber);
    }

    /**
     * @param {KeyboardEvent} event - The keyboard event fired while playing.
     * @return {void} Nothing is returned.
     * @desc Compares the pressed combination with the binding of the shown number.
     */
    function handleGameKeydown(event) {
        if (app.modal.isAnyOpen() || event.repeat || currentNumber === null) {
            return;
        }
        const binding = app.keybindings.eventToBinding(event);
        if (!binding) {
            return;
        }
        const expectedBinding = app.state.getBinding(currentNumber);
        const isCorrect = Boolean(expectedBinding) && binding === expectedBinding;
        if (isCorrect) {
            event.preventDefault();
            showFeedback("correct");
            notifyResult(true, binding);
            window.setTimeout(advanceRound, ADVANCE_DELAY);
        } else {
            showFeedback("wrong");
            notifyResult(false, binding);
        }
    }

    /**
     * @param {boolean} isCorrect - Whether the pressed combination matched the expected one.
     * @param {string} binding - The canonical binding string that was pressed.
     * @return {void} Nothing is returned.
     * @desc Announces the outcome of a keystroke to any interested module.
     */
    function notifyResult(isCorrect, binding) {
        document.dispatchEvent(new CustomEvent("fede-result", {
            detail: {
                correct: isCorrect,
                binding: binding,
                number: currentNumber
            }
        }));
    }

    /**
     * @return {void} Nothing is returned.
     * @desc Advances to a new playable number after a correct answer.
     */
    function advanceRound() {
        currentNumber = pickPlayableNumber();
        render();
    }

    /**
     * @param {string} className - The feedback class to apply to the display.
     * @return {void} Nothing is returned.
     * @desc Briefly highlights the display to signal a correct or wrong answer.
     */
    function showFeedback(className) {
        elements.randomValue.classList.remove("correct", "wrong");
        void elements.randomValue.offsetWidth;
        elements.randomValue.classList.add(className);
        if (className === "wrong") {
            window.setTimeout(function () {
                elements.randomValue.classList.remove("wrong");
            }, FEEDBACK_DURATION);
        }
    }

    app.game = {
        initialize: initialize,
        restart: restart
    };
})(window.FedeApp);
