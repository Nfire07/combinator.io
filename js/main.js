/*
    Author: Mele Nicolo' Emanuele
    Date: 2026-10-10
    License: MIT
    Description: Boots the application by initializing the settings, storage and game modules in order.
*/

window.FedeApp = window.FedeApp || {};

(function (app) {
    "use strict";

    /**
     * @return {void} Nothing is returned.
     * @desc Initializes every module once the document has finished loading.
     */
    function boot() {
        app.settings.initialize();
        app.storage.initialize();
        app.game.initialize();
        app.analytics.initialize();
        app.challenge.initialize();
        app.activities.initialize();
    }

    document.addEventListener("DOMContentLoaded", boot);
})(window.FedeApp);
