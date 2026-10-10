/*
    Author: Mele Nicolo' Emanuele
    Date: 2026-10-10
    License: MIT
    Description: Presents the activities menu and opens free mode, challenges or settings.
*/

window.FedeApp = window.FedeApp || {};

(function (app) {
    "use strict";

    const elements = {};

    /**
     * @return {void} Nothing is returned.
     * @desc Wires the activities menu button and the three activity choices.
     */
    function initialize() {
        elements.openButton = document.getElementById("open-activities");
        elements.closeButton = document.getElementById("close-activities");
        elements.freeButton = document.getElementById("activity-free");
        elements.challengesButton = document.getElementById("activity-challenges");
        elements.settingsButton = document.getElementById("activity-settings");

        elements.openButton.addEventListener("click", openMenu);
        elements.closeButton.addEventListener("click", closeMenu);
        elements.freeButton.addEventListener("click", startFreeMode);
        elements.challengesButton.addEventListener("click", openChallenges);
        elements.settingsButton.addEventListener("click", openSettings);
    }

    /**
     * @return {void} Nothing is returned.
     * @desc Opens the activities menu modal.
     */
    function openMenu() {
        app.modal.open("activities-modal");
    }

    /**
     * @return {void} Nothing is returned.
     * @desc Closes the activities menu modal.
     */
    function closeMenu() {
        app.modal.close("activities-modal");
    }

    /**
     * @return {void} Nothing is returned.
     * @desc Stops any challenge and starts the free mode for testing combinations.
     */
    function startFreeMode() {
        closeMenu();
        app.challenge.stopSilently();
        app.game.restart();
    }

    /**
     * @return {void} Nothing is returned.
     * @desc Closes the menu and opens the challenge selection modal.
     */
    function openChallenges() {
        closeMenu();
        app.challenge.openMenu();
    }

    /**
     * @return {void} Nothing is returned.
     * @desc Closes the menu and opens the settings modal.
     */
    function openSettings() {
        closeMenu();
        app.settings.open();
    }

    app.activities = {
        initialize: initialize
    };
})(window.FedeApp);
