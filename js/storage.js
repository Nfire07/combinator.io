/*
    Author: Mele Nicolo' Emanuele
    Date: 2026-10-10
    License: MIT
    Description: Exports and imports the application configuration as a downloadable and reloadable JSON file.
*/

window.FedeApp = window.FedeApp || {};

(function (app) {
    "use strict";

    const CONFIGURATION_FILE_NAME = "combinator-io-configuration.json";

    const elements = {};

    /**
     * @return {void} Nothing is returned.
     * @desc Wires the export button, the import button and the hidden file input.
     */
    function initialize() {
        elements.exportButton = document.getElementById("export-json");
        elements.importButton = document.getElementById("import-json");
        elements.importInput = document.getElementById("import-file");

        elements.exportButton.addEventListener("click", exportConfiguration);
        elements.importButton.addEventListener("click", requestImportFile);
        elements.importInput.addEventListener("change", handleImportSelection);
    }

    /**
     * @return {void} Nothing is returned.
     * @desc Opens the browser file picker to choose a JSON configuration.
     */
    function requestImportFile() {
        elements.importInput.click();
    }

    /**
     * @return {void} Nothing is returned.
     * @desc Downloads the current configuration as a JSON file.
     */
    function exportConfiguration() {
        const configuration = app.state.serializeConfiguration();
        const blob = new Blob([JSON.stringify(configuration, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = CONFIGURATION_FILE_NAME;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
    }

    /**
     * @param {Event} event - The change event fired by the file input.
     * @return {void} Nothing is returned.
     * @desc Reads the selected file and forwards its text to the parser.
     */
    function handleImportSelection(event) {
        const file = event.target.files[0];
        event.target.value = "";
        if (!file) {
            return;
        }
        const reader = new FileReader();
        reader.addEventListener("load", function () {
            applyConfiguration(reader.result);
        });
        reader.readAsText(file);
    }

    /**
     * @param {string} rawText - The raw JSON content read from the file.
     * @return {void} Nothing is returned.
     * @desc Parses and applies the imported configuration to the application.
     */
    function applyConfiguration(rawText) {
        try {
            const configuration = normalizeConfiguration(JSON.parse(rawText));
            app.state.loadConfiguration(configuration);
            app.settings.syncInputsFromState();
            app.settings.renderKeymap();
            app.game.restart();
        } catch (error) {
            window.alert("Invalid configuration file.");
        }
    }

    /**
     * @param {Object} configuration - The deserialized configuration to validate.
     * @return {Object} A sanitized configuration with safe defaults for invalid fields.
     * @desc Validates imported values and keeps only well formed bindings.
     */
    function normalizeConfiguration(configuration) {
        const settings = configuration || {};
        const range = app.state.clampRange(settings.lowestNumber, settings.highestNumber);
        const numberBindings = {};
        const bindings = settings.numberBindings || {};
        Object.keys(bindings).forEach(function (key) {
            const number = Number(key);
            const value = bindings[key];
            const insideRange = Number.isInteger(number)
                && number >= range.lowestNumber
                && number <= range.highestNumber;
            if (insideRange && typeof value === "string" && value.length > 0) {
                numberBindings[String(number)] = value;
            }
        });
        return {
            lowestNumber: range.lowestNumber,
            highestNumber: range.highestNumber,
            numberBindings: numberBindings
        };
    }

    app.storage = {
        initialize: initialize
    };
})(window.FedeApp);
