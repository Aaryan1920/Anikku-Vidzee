(function () {

    // Load saved progress
    function getSavedProgress(key) {
        try {
            return JSON.parse(localStorage.getItem("vidzee_progress_" + key)) || null;
        } catch {
            return null;
        }
    }

    // Save progress
    function saveProgress(key, data) {
        localStorage.setItem("vidzee_progress_" + key, JSON.stringify(data));
    }

    // Listen for messages from Vidzee player
    window.addEventListener("message", (event) => {
        if (event.origin !== "https://player.vidzee.wtf") return;

        const msg = event.data;

        // MEDIA_DATA → full progress info
        if (msg?.type === "MEDIA_DATA") {
            const d = msg.data;
            const key = `${d.type}_${d.id}`;

            saveProgress(key, {
                current: d.progress.watched,
                duration: d.progress.duration,
                season: d.last_season_watched,
                episode: d.last_episode_watched,
                updated: Date.now()
            });
        }

        // PLAYER_EVENT → updates while playing
        if (msg?.type === "PLAYER_EVENT") {
            const d = msg.data;
            const key = `${d.mediaType}_${d.tmdbId}`;

            saveProgress(key, {
                current: d.currentTime,
                duration: d.duration,
                season: d.season,
                episode: d.episode,
                updated: Date.now()
            });
        }
    });

    // Restore progress if available
    window.addEventListener("DOMContentLoaded", () => {
        // TMDB ID is inside the iframe URL
        const url = window.location.href;

        const matchMovie = url.match(/movie\/(\d+)/);
        const matchTV = url.match(/tv\/(\d+)\/(\d+)\/(\d+)/);

        if (matchMovie) {
            const id = matchMovie[1];
            const key = `movie_${id}`;
            const saved = getSavedProgress(key);

            if (saved && window.player) {
                window.player.currentTime = saved.current;
            }
        }

        if (matchTV) {
            const id = matchTV[1];
            const season = matchTV[2];
            const episode = matchTV[3];
            const key = `tv_${id}`;
            const saved = getSavedProgress(key);

            if (saved && window.player) {
                if (saved.season == season && saved.episode == episode) {
                    window.player.currentTime = saved.current;
                }
            }
        }
    });
})();
