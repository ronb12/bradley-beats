(() => {
  const key = "bradley-beats-v2";
  const state = JSON.parse(localStorage.getItem(key) || "null") || {
    stations: [
      {
        id: crypto.randomUUID(),
        label: "Focus Flow",
        title: "Blue Horizon",
        meta: "Source candidate: approved royalty-free electronic or original generated loop",
        mood: "Focus",
      },
      {
        id: crypto.randomUUID(),
        label: "Kid Energy",
        title: "Silver Bounce",
        meta: "Source candidate: royalty-free upbeat instrumental",
        mood: "Kids",
      },
      {
        id: crypto.randomUUID(),
        label: "Drive Mode",
        title: "Midnight Chrome",
        meta: "Source candidate: commercial-safe Creative Commons track with verified attribution",
        mood: "Drive",
      },
      {
        id: crypto.randomUUID(),
        label: "Wellness",
        title: "White Noise Reset",
        meta: "Source candidate: approved audio library or in-house ambient loop",
        mood: "Wellness",
      },
    ],
    current: 0,
    playing: false,
    filter: "All",
    favorites: [],
    licenses: [
      {
        station: "Focus Flow",
        rights: "Need commercial-use proof before launch",
        note: "Save source URL, artist name, and screenshot receipt.",
      },
    ],
    activeTab: "home",
  };
  const save = () => localStorage.setItem(key, JSON.stringify(state));

  const title = document.querySelector("#trackTitle");
  const meta = document.querySelector("#trackMeta");
  const playButtons = [...document.querySelectorAll('[data-action="play"]')];
  const tabs = [...document.querySelectorAll("[data-tab]")];
  const app = document.querySelector("#app");

  function normalizeCurrent() {
    if (state.current >= state.stations.length) state.current = 0;
  }

  function currentStation() {
    normalizeCurrent();
    return state.stations[state.current];
  }

  function visibleStations() {
    return state.filter === "All"
      ? state.stations
      : state.stations.filter((station) => station.mood === state.filter);
  }

  function setPlaying(nextState) {
    state.playing = nextState;
    playButtons.forEach((button) => {
      button.textContent = state.playing
        ? button.classList.contains("primary-action")
          ? "Listening Now"
          : "Pause"
        : button.classList.contains("primary-action")
          ? "Start Listening"
          : "Play";
    });
  }

  function renderHome() {
    const station = currentStation();
    return `
      <div class="split-layout">
        <article class="beats-card">
          <h2>Home Shelf</h2>
          <p>The front page now behaves like a music product homepage instead of dropping straight into a generic form board.</p>
          <div class="detail-grid">
            <div class="entry metric">
              <strong>Current Station</strong>
              <span class="metric-value">${station.label}</span>
              <div class="tiny">${station.mood} channel</div>
            </div>
            <div class="entry metric">
              <strong>Saved Favorites</strong>
              <span class="metric-value">${state.favorites.length}</span>
              <div class="tiny">Quick-return mixes</div>
            </div>
            <div class="entry metric">
              <strong>License Notes</strong>
              <span class="metric-value">${state.licenses.length}</span>
              <div class="tiny">Records to finish before launch</div>
            </div>
          </div>
          <div class="mood-grid">
            <div class="entry">
              <strong>Featured Station</strong>
              <div class="tiny">${station.title}</div>
            </div>
            <div class="entry">
              <strong>Now Curating</strong>
              <div class="tiny">${visibleStations().length} mood-matched station${visibleStations().length === 1 ? "" : "s"} in view</div>
            </div>
          </div>
        </article>
        <article class="beats-card">
          <h2>Quick Queue</h2>
          <div class="mini-list">
            ${state.stations.slice(0, 4).map((item) => `
              <div class="entry">
                <strong>${item.label}</strong>
                <div class="tiny">${item.title} • ${item.mood}</div>
              </div>`).join("")}
          </div>
        </article>
      </div>
    `;
  }

  function renderStations() {
    const stations = visibleStations();
    return `
      <div class="split-layout">
        <article class="beats-card">
          <h2>Station Manager</h2>
          <p>Separate the curation workflow from playback so station planning feels like its own product area.</p>
          <div class="filter-row">
            ${["All", "Focus", "Workout", "Kids", "Drive", "Wellness"].map((mood) => `
              <button class="pill-button ${state.filter === mood ? "active" : ""}" type="button" data-filter="${mood}">${mood}</button>`).join("")}
          </div>
          <div class="stations-grid">
            ${stations.map((station) => `
              <button class="beats-card station-grid-card ${station.id === currentStation().id ? "active" : ""}" type="button" data-id="${station.id}">
                <small>${station.mood}</small>
                <b>${station.label}</b>
                <span>${station.meta}</span>
              </button>`).join("")}
          </div>
        </article>
        <article class="beats-card">
          <h2>Add Station</h2>
          <form id="stationForm" class="beats-form">
            <input name="label" placeholder="Station name" required />
            <input name="title" placeholder="Now playing title" required />
            <input name="meta" placeholder="License/source note" required />
            <select name="mood">
              <option>Focus</option>
              <option>Workout</option>
              <option>Kids</option>
              <option>Drive</option>
              <option>Wellness</option>
            </select>
            <button type="submit">Save Station</button>
          </form>
        </article>
      </div>
    `;
  }

  function renderLibrary() {
    return `
      <div class="split-layout">
        <article class="beats-card">
          <h2>Saved Library</h2>
          <p>Favorites are separated from station editing so the listening library feels like a destination, not a footnote.</p>
          <div class="mini-list">
            ${state.favorites.length
              ? state.favorites.map((favorite) => `
                <div class="entry">
                  <strong>${favorite.label}</strong>
                  <div class="tiny">${favorite.meta}</div>
                </div>`).join("")
              : `<div class="empty-card">No favorites yet. Double-click the player card to save the current station.</div>`}
          </div>
        </article>
        <article class="beats-card">
          <h2>Recent Moods</h2>
          <div class="mini-list">
            ${["Focus", "Drive", "Wellness"].map((mood) => `
              <div class="entry">
                <strong>${mood}</strong>
                <div class="tiny">${state.stations.filter((station) => station.mood === mood).length} station slots ready</div>
              </div>`).join("")}
          </div>
        </article>
      </div>
    `;
  }

  function renderLicensing() {
    return `
      <div class="split-layout">
        <article class="beats-card">
          <h2>Licensing Desk</h2>
          <p>Launch prep now has its own workspace for commercial-use notes, attribution text, and source receipts.</p>
          <div class="mini-list">
            ${state.licenses.map((entry) => `
              <div class="entry">
                <strong>${entry.station}</strong>
                <div class="tiny">${entry.rights}</div>
                <div class="tiny">${entry.note}</div>
              </div>`).join("")}
          </div>
        </article>
        <article class="beats-card">
          <h2>Add License Record</h2>
          <form id="licenseForm" class="beats-form">
            <input name="station" placeholder="Station name" required />
            <input name="rights" placeholder="Rights status" required />
            <textarea name="note" placeholder="Attribution text, proof link, or checklist note" required></textarea>
            <button type="submit">Save Record</button>
          </form>
        </article>
      </div>
    `;
  }

  function renderApp() {
    tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === state.activeTab));

    if (state.activeTab === "home") app.innerHTML = renderHome();
    if (state.activeTab === "stations") app.innerHTML = renderStations();
    if (state.activeTab === "library") app.innerHTML = renderLibrary();
    if (state.activeTab === "licensing") app.innerHTML = renderLicensing();

    document.querySelectorAll("[data-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        state.filter = button.dataset.filter;
        const first = visibleStations()[0];
        if (first) {
          state.current = state.stations.findIndex((station) => station.id === first.id);
        }
        render();
      });
    });

    document.querySelectorAll("[data-id]").forEach((button) => {
      button.addEventListener("click", () => {
        state.current = state.stations.findIndex((station) => station.id === button.dataset.id);
        setPlaying(true);
        render();
      });
    });

    const stationForm = document.querySelector("#stationForm");
    if (stationForm) {
      stationForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        state.stations.push({
          id: crypto.randomUUID(),
          label: String(form.get("label")),
          title: String(form.get("title")),
          meta: String(form.get("meta")),
          mood: String(form.get("mood")),
        });
        state.current = state.stations.length - 1;
        setPlaying(true);
        render();
      });
    }

    const licenseForm = document.querySelector("#licenseForm");
    if (licenseForm) {
      licenseForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        state.licenses.unshift({
          station: String(form.get("station")),
          rights: String(form.get("rights")),
          note: String(form.get("note")),
        });
        state.activeTab = "licensing";
        render();
      });
    }
  }

  function syncPlayer() {
    const station = currentStation();
    title.textContent = station.title;
    meta.textContent = station.meta;
    renderApp();
    save();
  }

  function stepStation(direction) {
    state.current = (state.current + direction + state.stations.length) % state.stations.length;
    setPlaying(true);
    syncPlayer();
  }

  document.querySelectorAll('[data-action="next"]').forEach((button) => {
    button.addEventListener("click", () => stepStation(1));
  });

  document.querySelector('[data-action="previous"]').addEventListener("click", () => stepStation(-1));

  playButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setPlaying(!state.playing);
      save();
    });
  });

  document.querySelector(".player").addEventListener("dblclick", () => {
    const station = currentStation();
    if (!state.favorites.some((favorite) => favorite.id === station.id)) {
      state.favorites.unshift(station);
      state.favorites = state.favorites.slice(0, 8);
      state.activeTab = "library";
      syncPlayer();
    }
  });

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      state.activeTab = tab.dataset.tab;
      syncPlayer();
    });
  });

  syncPlayer();
  setPlaying(state.playing);
})();
