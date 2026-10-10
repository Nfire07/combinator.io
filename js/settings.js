/*
    Author: Mele Nicolo' Emanuele
    Date: 2026-10-10
    License: MIT
    Description: Builds the settings modal, manages the number range and captures key combinations for each number.
*/

window.FedeApp = window.FedeApp || {};

(function (app) {
    "use strict";

    let capturedNumber = null;
    let snapshot = null;

    const elements = {};

    /**
     * @return {void} Nothing is returned.
     * @desc Wires the modal controls, the range inputs and the capture key listener.
     */
    function initialize() {
        elements.backButton = document.getElementById("back-settings");
        elements.closeButton = document.getElementById("close-settings");
        elements.applyButton = document.getElementById("apply-settings");
        elements.inputFrom = document.getElementById("input-from");
        elements.inputTo = document.getElementById("input-to");
        elements.rangeHint = document.getElementById("range-hint");
        elements.keymap = document.getElementById("keymap");

        elements.backButton.addEventListener("click", backToActivities);
        elements.closeButton.addEventListener("click", closeModal);
        elements.applyButton.addEventListener("click", applyAndClose);
        elements.inputFrom.addEventListener("change", handleRangeChange);
        elements.inputTo.addEventListener("change", handleRangeChange);
        elements.keymap.addEventListener("click", handleKeymapClick);
        document.addEventListener("keydown", handleCaptureKeydown, true);

        elements.rangeHint.textContent = "Up to " + app.state.maximumRangeSize + " bindable keys.";
        syncInputsFromState();
        renderKeymap();
    }

    /**
     * @return {void} Nothing is returned.
     * @desc Opens the settings modal after snapshotting the current configuration.
     */
    function openModal() {
        snapshot = app.state.serializeConfiguration();
        cancelCapture();
        syncInputsFromState();
        renderKeymap();
        app.modal.open("settings-modal");
    }

    /**
     * @return {void} Nothing is returned.
     * @desc Closes the modal and rolls back to the snapshot taken when opening.
     */
    function closeModal() {
        cancelCapture();
        if (snapshot) {
            app.state.loadConfiguration(snapshot);
            snapshot = null;
        }
        app.modal.close("settings-modal");
    }

    /**
     * @return {void} Nothing is returned.
     * @desc Closes the settings modal and returns to the activities menu.
     */
    function backToActivities() {
        closeModal();
        app.modal.open("activities-modal");
    }

    /**
     * @return {void} Nothing is returned.
     * @desc Keeps the configured settings, closes the modal and restarts the round.
     */
    function applyAndClose() {
        cancelCapture();
        snapshot = null;
        app.modal.close("settings-modal");
        app.game.restart();
    }

    /**
     * @return {void} Nothing is returned.
     * @desc Reads the range inputs and regenerates the keymap grid.
     */
    function handleRangeChange() {
        const lowestNumber = parseInt(elements.inputFrom.value, 10);
        const highestNumber = parseInt(elements.inputTo.value, 10);
        if (Number.isNaN(lowestNumber) || Number.isNaN(highestNumber)) {
            syncInputsFromState();
            return;
        }
        app.state.setRange(lowestNumber, highestNumber);
        syncInputsFromState();
        renderKeymap();
    }

    /**
     * @param {MouseEvent} event - The click event fired inside the keymap grid.
     * @return {void} Nothing is returned.
     * @desc Starts listening for a key press to bind to the clicked number.
     */
    function handleKeymapClick(event) {
        const tile = event.target.closest("[data-number]");
        if (!tile) {
            return;
        }
        capturedNumber = parseInt(tile.dataset.number, 10);
        renderKeymap();
    }

    /**
     * @param {KeyboardEvent} event - The keyboard event captured on the document.
     * @return {void} Nothing is returned.
     * @desc Captures the next key combination and assigns it to the selected number.
     */
    function handleCaptureKeydown(event) {
        if (capturedNumber === null) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        if (event.repeat) {
            return;
        }
        if (event.key === "Escape") {
            cancelCapture();
            renderKeymap();
            return;
        }
        const binding = app.keybindings.eventToBinding(event);
        if (!binding) {
            return;
        }
        app.state.setBinding(capturedNumber, binding);
        capturedNumber = null;
        renderKeymap();
    }

    /**
     * @return {void} Nothing is returned.
     * @desc Clears the pending capture so the next key press is ignored.
     */
    function cancelCapture() {
        capturedNumber = null;
    }

    /**
     * @return {void} Nothing is returned.
     * @desc Rebuilds the keymap grid from the numbers of the current range.
     */
    function renderKeymap() {
        elements.keymap.innerHTML = "";
        app.state.getNumbersInRange().forEach(function (number) {
            elements.keymap.appendChild(buildTile(number));
        });
    }

    /**
     * @param {number} number - The number represented by the tile.
     * @return {HTMLButtonElement} The assembled tile element.
     * @desc Creates a single keymap tile with its number and binding label.
     */
    function buildTile(number) {
        const binding = app.state.getBinding(number);
        const tile = document.createElement("button");
        tile.type = "button";
        tile.className = "keymap-tile";
        tile.dataset.number = String(number);
        if (binding) {
            tile.classList.add("bound");
        }
        if (capturedNumber === number) {
            tile.classList.add("listening");
        }

        const numberLabel = document.createElement("span");
        numberLabel.className = "keymap-number";
        numberLabel.textContent = String(number);

        const bindingLabel = document.createElement("span");
        bindingLabel.className = "keymap-binding";
        bindingLabel.textContent = capturedNumber === number
            ? "Press a key..."
            : app.keybindings.formatBinding(binding);

        tile.appendChild(numberLabel);
        tile.appendChild(bindingLabel);
        return tile;
    }

    /**
     * @return {void} Nothing is returned.
     * @desc Copies the current range values into the modal inputs.
     */
    function syncInputsFromState() {
        elements.inputFrom.value = app.state.state.lowestNumber;
        elements.inputTo.value = app.state.state.highestNumber;
    }

    app.settings = {
        initialize: initialize,
        open: openModal,
        renderKeymap: renderKeymap,
        syncInputsFromState: syncInputsFromState
    };
})(window.FedeApp);
