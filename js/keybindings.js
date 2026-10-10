/*
    Author: Mele Nicolo' Emanuele
    Date: 2026-10-10
    License: MIT
    Description: Converts keyboard events into canonical binding strings and formats them for display in the interface.
*/

window.FedeApp = window.FedeApp || {};

(function (app) {
    "use strict";

    const MODIFIER_KEYS = [
        "Control",
        "Shift",
        "Alt",
        "Meta",
        "AltGraph",
        "CapsLock",
        "NumLock",
        "ScrollLock",
        "OS"
    ];

    const MODIFIER_LABELS = {
        Ctrl: "Ctrl",
        Alt: "Alt",
        Shift: "Shift",
        Meta: "Meta"
    };

    const SPECIAL_KEY_LABELS = {
        Space: "Space",
        Enter: "Enter",
        NumpadEnter: "Num Enter",
        Tab: "Tab",
        Backspace: "Backspace",
        Delete: "Delete",
        Escape: "Esc",
        ArrowUp: "\u2191",
        ArrowDown: "\u2193",
        ArrowLeft: "\u2190",
        ArrowRight: "\u2192",
        Minus: "-",
        Equal: "=",
        BracketLeft: "[",
        BracketRight: "]",
        Backslash: "\\",
        Semicolon: ";",
        Quote: "'",
        Comma: ",",
        Period: ".",
        Slash: "/",
        Backquote: "`",
        NumpadAdd: "Num +",
        NumpadSubtract: "Num -",
        NumpadMultiply: "Num *",
        NumpadDivide: "Num /",
        NumpadDecimal: "Num ."
    };

    /**
     * @param {KeyboardEvent} keyboardEvent - The keyboard event to inspect.
     * @return {boolean} True when the event was produced by a pure modifier key.
     * @desc Detects whether a keyboard event only involves modifier keys.
     */
    function isModifierEvent(keyboardEvent) {
        return MODIFIER_KEYS.indexOf(keyboardEvent.key) !== -1;
    }

    /**
     * @param {KeyboardEvent} keyboardEvent - The keyboard event to convert.
     * @return {string|null} The canonical binding string or null for modifier only presses.
     * @desc Builds a canonical binding string from the pressed modifiers and main key.
     */
    function eventToBinding(keyboardEvent) {
        if (isModifierEvent(keyboardEvent)) {
            return null;
        }
        const parts = [];
        if (keyboardEvent.ctrlKey) {
            parts.push("Ctrl");
        }
        if (keyboardEvent.altKey) {
            parts.push("Alt");
        }
        if (keyboardEvent.shiftKey) {
            parts.push("Shift");
        }
        if (keyboardEvent.metaKey) {
            parts.push("Meta");
        }
        parts.push(keyboardEvent.code || keyboardEvent.key);
        return parts.join("+");
    }

    /**
     * @param {string} mainCode - The keyboard code of the main key.
     * @return {string} A human readable label for the main key.
     * @desc Formats a keyboard code into a short readable label.
     */
    function formatMainKey(mainCode) {
        if (/^Key[A-Z]$/.test(mainCode)) {
            return mainCode.slice(3);
        }
        if (/^Digit[0-9]$/.test(mainCode)) {
            return mainCode.slice(5);
        }
        if (/^Numpad[0-9]$/.test(mainCode)) {
            return "Num " + mainCode.slice(6);
        }
        if (SPECIAL_KEY_LABELS[mainCode]) {
            return SPECIAL_KEY_LABELS[mainCode];
        }
        return mainCode;
    }

    /**
     * @param {string|null} binding - The canonical binding string to format.
     * @return {string} The readable binding label or the unbound placeholder.
     * @desc Formats a canonical binding string for display in the keymap grid.
     */
    function formatBinding(binding) {
        if (!binding) {
            return "Unbound";
        }
        return binding
            .split("+")
            .map(function (part) {
                return MODIFIER_LABELS[part] || formatMainKey(part);
            })
            .join(" + ");
    }

    app.keybindings = {
        isModifierEvent: isModifierEvent,
        eventToBinding: eventToBinding,
        formatBinding: formatBinding
    };
})(window.FedeApp);
