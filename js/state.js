/*
    Author: Mele Nicolo' Emanuele
    Date: 2026-10-10
    License: MIT
    Description: Holds the application configuration state including number range and number to key bindings.
*/

window.FedeApp = window.FedeApp || {};

(function (app) {
    "use strict";

    const DEFAULT_LOWEST_NUMBER = 1;
    const DEFAULT_HIGHEST_NUMBER = 10;
    const MAXIMUM_RANGE_SIZE = 150;

    const state = {
        lowestNumber: DEFAULT_LOWEST_NUMBER,
        highestNumber: DEFAULT_HIGHEST_NUMBER,
        numberBindings: {}
    };

    /**
     * @return {{low: number, high: number}} The inclusive range ordered from low to high.
     * @desc Returns the configured range with the extremes ordered correctly.
     */
    function getRange() {
        return {
            low: Math.min(state.lowestNumber, state.highestNumber),
            high: Math.max(state.lowestNumber, state.highestNumber)
        };
    }

    /**
     * @param {number} lowestNumber - The requested first value of the range.
     * @param {number} highestNumber - The requested last value of the range.
     * @return {{lowestNumber: number, highestNumber: number}} The ordered and clamped extremes.
     * @desc Orders the extremes and caps the range size to the maximum bindable keys.
     */
    function clampRange(lowestNumber, highestNumber) {
        let low = Math.trunc(Number(lowestNumber));
        let high = Math.trunc(Number(highestNumber));
        if (!Number.isFinite(low) || !Number.isFinite(high)) {
            low = DEFAULT_LOWEST_NUMBER;
            high = DEFAULT_HIGHEST_NUMBER;
        }
        if (low > high) {
            const temporary = low;
            low = high;
            high = temporary;
        }
        if (high - low + 1 > MAXIMUM_RANGE_SIZE) {
            high = low + MAXIMUM_RANGE_SIZE - 1;
        }
        return { lowestNumber: low, highestNumber: high };
    }

    /**
     * @param {number} lowestNumber - The first value of the range.
     * @param {number} highestNumber - The last value of the range.
     * @return {void} Nothing is returned.
     * @desc Orders the extremes and stores the clamped range in the state.
     */
    function setRange(lowestNumber, highestNumber) {
        const range = clampRange(lowestNumber, highestNumber);
        state.lowestNumber = range.lowestNumber;
        state.highestNumber = range.highestNumber;
    }

    /**
     * @return {number[]} Every integer contained in the configured range.
     * @desc Builds the ordered list of numbers contained in the current range.
     */
    function getNumbersInRange() {
        const range = getRange();
        const numbers = [];
        for (let value = range.low; value <= range.high; value += 1) {
            numbers.push(value);
        }
        return numbers;
    }

    /**
     * @param {number} number - The number whose binding is requested.
     * @return {string|null} The binding string or null when the number is unbound.
     * @desc Returns the key binding currently associated with a number.
     */
    function getBinding(number) {
        return state.numberBindings[String(number)] || null;
    }

    /**
     * @param {number} number - The number to associate with the binding.
     * @param {string} binding - The canonical binding string to store.
     * @return {void} Nothing is returned.
     * @desc Associates a key binding with the given number.
     */
    function setBinding(number, binding) {
        state.numberBindings[String(number)] = binding;
    }

    /**
     * @param {number} number - The number whose binding is removed.
     * @return {void} Nothing is returned.
     * @desc Removes the key binding associated with the given number.
     */
    function clearBinding(number) {
        delete state.numberBindings[String(number)];
    }

    /**
     * @return {number[]} Every number in range that has a key binding.
     * @desc Collects the numbers of the range that are currently bound to a key.
     */
    function getBoundNumbers() {
        return getNumbersInRange().filter(function (number) {
            return getBinding(number) !== null;
        });
    }

    /**
     * @param {Object} configuration - The configuration to load into the state.
     * @return {void} Nothing is returned.
     * @desc Replaces the current state with the provided configuration values.
     */
    function loadConfiguration(configuration) {
        const range = clampRange(configuration.lowestNumber, configuration.highestNumber);
        state.lowestNumber = range.lowestNumber;
        state.highestNumber = range.highestNumber;
        state.numberBindings = {};
        const bindings = configuration.numberBindings || {};
        Object.keys(bindings).forEach(function (key) {
            const number = Number(key);
            const insideRange = Number.isInteger(number)
                && number >= range.lowestNumber
                && number <= range.highestNumber;
            if (insideRange) {
                state.numberBindings[String(number)] = bindings[key];
            }
        });
    }

    /**
     * @return {Object} A plain object with the range and bindings ready to serialize.
     * @desc Produces a serializable snapshot of the current configuration.
     */
    function serializeConfiguration() {
        return {
            lowestNumber: state.lowestNumber,
            highestNumber: state.highestNumber,
            numberBindings: Object.assign({}, state.numberBindings)
        };
    }

    app.state = {
        state: state,
        maximumRangeSize: MAXIMUM_RANGE_SIZE,
        clampRange: clampRange,
        getRange: getRange,
        setRange: setRange,
        getNumbersInRange: getNumbersInRange,
        getBinding: getBinding,
        setBinding: setBinding,
        clearBinding: clearBinding,
        getBoundNumbers: getBoundNumbers,
        loadConfiguration: loadConfiguration,
        serializeConfiguration: serializeConfiguration
    };
})(window.FedeApp);
