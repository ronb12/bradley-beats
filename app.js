(() => {
  const key = "bradley-beats-v1";
  const seedStations = [...document.querySelectorAll(".station")].map((station) => ({
    id: crypto.randomUUID(),
    title: station.dataset.title,
    meta: station.dataset.meta,
    label: station.querySelector("b").textContent,
    mood: station.querySelector("small").textContent.includes("Family") ? "Kids" : station.querySelector("b").textContent.includes("Drive") ? "Drive" : station.querySelector("b").textContent.includes("Wellness") ? "Wellness" : "Focus",
    likes: 0,
  }));
  const state = JSON.parse(localStorage.getItem(key) || "null") || {
    stations: seedStations,
    current: 0,
    playing: false,
    filter: "All",
    favorites: [],
  };
  const save = () => localStorage.setItem(key, JSON.stringify(state));

  document.head.insertAdjacentHTML("beforeend", `<style>
    .beats-extra{display:grid;gap:16px;margin-top:18px;grid-template-columns:1fr 1fr}.beats-card{background:#f5f7ff;border:1px solid #d9dff3;border-radius:24px;padding:18px}
    .beats-card form,.beats-card .list{display:grid;gap:10px}.beats-card input,.beats-card select,.beats-card button{font:inherit;padding:11px 12px;border-radius:12px;border:1px solid #b7c4ea}
    .beats-card button{background:#233a7c;color:#fff;cursor:pointer}.entry{background:#eef2ff;border-radius:14px;padding:12px}.tiny{color:#55637f}
    @media (max-width:840px){.beats-extra{grid-template-columns:1fr}}
  </style>`);

  const title = document.querySelector("#trackTitle");
  const meta = document.querySelector("#trackMeta");
  const playButtons = [...document.querySelectorAll('[data-action="play"]')];
  const moodButtons = [...document.querySelectorAll(".mood-bar button")];
  const stationSection = document.querySelector(".stations");
  const licenseSection = document.querySelector(".license");

  licenseSection.insertAdjacentHTML("afterend", `
    <section class="beats-extra">
      <article class="beats-card">
        <h2>Add Station</h2>
        <form id="stationForm">
          <input name="label" placeholder="Station name" required>
          <input name="title" placeholder="Now playing title" required>
          <input name="meta" placeholder="License/source note" required>
          <select name="mood"><option>Focus</option><option>Workout</option><option>Kids</option><option>Drive</option><option>Wellness</option></select>
          <button type="submit">Save Station</button>
        </form>
      </article>
      <article class="beats-card">
        <h2>Favorites</h2>
        <div id="favoriteList" class="list"></div>
      </article>
    </section>`);

  function visibleStations() {
    return state.filter === "All" ? state.stations : state.stations.filter((station) => station.mood === state.filter);
  }

  function normalizeCurrent() {
    if (state.current >= state.stations.length) state.current = 0;
  }

  function currentStation() {
    normalizeCurrent();
    return state.stations[state.current];
  }

  function setPlaying(nextState) {
    state.playing = nextState;
    playButtons.forEach((button) => {
      button.textContent = state.playing
        ? button.classList.contains("primary-action") ? "Listening Now" : "Pause"
        : button.classList.contains("primary-action") ? "Start Listening" : "Play";
    });
  }

  function renderStations() {
    const stations = visibleStations();
    stationSection.innerHTML = stations.map((station) => `
      <button class="station ${station.id === currentStation().id ? "active" : ""}" type="button" data-id="${station.id}">
        <small>${station.mood}</small>
        <b>${station.label}</b>
        <span>${station.meta}</span>
      </button>`).join("");

    stationSection.querySelectorAll("[data-id]").forEach((button) => {
      button.addEventListener("click", () => {
        state.current = state.stations.findIndex((station) => station.id === button.dataset.id);
        sync();
        setPlaying(true);
        save();
      });
    });
  }

  function sync() {
    const station = currentStation();
    title.textContent = station.title;
    meta.textContent = station.meta;
    renderStations();
    document.querySelector("#favoriteList").innerHTML = state.favorites.length
      ? state.favorites.map((favorite) => `<div class="entry"><b>${favorite.label}</b><div class="tiny">${favorite.meta}</div></div>`).join("")
      : `<div class="entry">No favorites yet. Use the like action by clicking a station and then the source checklist link.</div>`;
    save();
  }

  function stepStation(direction) {
    state.current = (state.current + direction + state.stations.length) % state.stations.length;
    sync();
    setPlaying(true);
    save();
  }

  document.querySelectorAll('[data-action="next"]').forEach((button) => button.addEventListener("click", () => stepStation(1)));
  document.querySelector('[data-action="previous"]').addEventListener("click", () => stepStation(-1));
  playButtons.forEach((button) => button.addEventListener("click", () => {
    setPlaying(!state.playing);
    save();
  }));

  moodButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.filter = button.textContent.trim();
      if (state.filter === currentStation().mood || state.filter === "All") {
        sync();
      } else {
        const first = state.stations.findIndex((station) => station.mood === state.filter);
        if (first >= 0) state.current = first;
        sync();
      }
    });
  });

  licenseSection.querySelector("a").addEventListener("click", (event) => {
    event.preventDefault();
    const station = currentStation();
    if (!state.favorites.some((favorite) => favorite.title === station.title)) {
      state.favorites.unshift(station);
      state.favorites = state.favorites.slice(0, 6);
    }
    sync();
  });

  document.querySelector("#stationForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    state.stations.push({
      id: crypto.randomUUID(),
      label: String(form.get("label")),
      title: String(form.get("title")),
      meta: String(form.get("meta")),
      mood: String(form.get("mood")),
      likes: 0,
    });
    state.current = state.stations.length - 1;
    sync();
    setPlaying(true);
  });

  sync();
  setPlaying(state.playing);
})();
