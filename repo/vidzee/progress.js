(function () {

    function load(key) {
        try {
            return JSON.parse(localStorage.getItem("vidzee_" + key)) || null;
        } catch {
            return null;
        }
    }

    function save(key, data) {
        localStorage.setItem("vidzee_" + key, JSON.stringify(data));
    }

    // Receive VidZee messages
    window.addEventListener("message", (event) => {
        if (event.origin !== "https://player.vidzee.wtf") return;

        const msg = event.data;
        if (!msg) return;

        // MEDIA_DATA (full)
        if (msg.type === "MEDIA_DATA") {
            const d = msg.data;
            const key = `${d.type}_${d.id}`;
            save(key, {
                time: d.progress.watched,
                duration: d.progress.duration,
                season: d.last_season_watched,
                episode: d.last_episode_watched
            });
        }

        // PLAYER_EVENT (live)
        if (msg.type === "PLAYER_EVENT") {
            const d = msg.data;
            const key = `${d.mediaType}_${d.tmdbId}`;
            save(key, {
                time: d.currentTime,
                duration: d.duration,
                season: d.season,
                episode: d.episode
            });
        }
    });

    // Auto-restore progress
    window.addEventListener("DOMContentLoaded", () => {
        const url = window.location.href;

        const movie = url.match(/movie\/(\d+)/);
        const tv = url.match(/tv\/(\d+)\/(\d+)\/(\d+)/);

        if (movie) {
            const id = movie[1];
            const data = load(`movie_${id}`);
            if (data && window.player) window.player.currentTime = data.time;
        }

        if (tv) {
            const id = tv[1];
            const s = tv[2];
            const e = tv[3];
            const data = load(`tv_${id}`);
            if (data && data.season == s && data.episode == e && window.player) {
                window.player.currentTime = data.time;
            }
        }
    });

})();
