/*
    Author: Mele Nicolo' Emanuele
    Date: 2026-10-10
    License: MIT
    Description: Centralizes opening and closing of the application modals and tracks whether any is visible.
*/

window.FedeApp = window.FedeApp || {};

(function (app) {
    "use strict";

    const openModals = {};

    /**
     * @param {string} elementId - The id of the modal element to display.
     * @return {void} Nothing is returned.
     * @desc Displays a modal and marks it as currently open.
     */
    function open(elementId) {
        const modal = document.getElementById(elementId);
        if (!modal) {
            return;
        }
        modal.style.display = "flex";
        openModals[elementId] = true;
    }

    /**
     * @param {string} elementId - The id of the modal element to hide.
     * @return {void} Nothing is returned.
     * @desc Hides a modal and clears its open state.
     */
    function close(elementId) {
        const modal = document.getElementById(elementId);
        if (!modal) {
            return;
        }
        modal.style.display = "none";
        delete openModals[elementId];
    }

    /**
     * @return {boolean} True when at least one managed modal is open.
     * @desc Reports whether any modal is currently visible to block game input.
     */
    function isAnyOpen() {
        return Object.keys(openModals).length > 0;
    }

    app.modal = {
        open: open,
        close: close,
        isAnyOpen: isAnyOpen
    };
})(window.FedeApp);
