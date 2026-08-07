const state = {
  day: 1,
  timeLeft: 60,
  score: 0,
  target: 60,
  helped: 0,
  running: false,
  paused: false,
  prepSlots: [],
  prepSlotsMax: 3,
  queue: [],
  maxQueue: 5,
  spawnTimer: 0,
  dragging: false,
};

const EXERCISES = [
  { name: "Articulation", time: 5, points: 12 },
  { name: "Fluency", time: 6, points: 14 },
  { name: "Voice", time: 4, points: 10 },
];

const PATIENTS = [
  "Mila",
  "Jonas",
  "Ava",
  "Nico",
  "Zoe",
  "Hugo",
  "Lea",
  "Oskar",
  "Ida",
  "Noah",
];

const ui = {
  day: document.getElementById("day"),
  timeLeft: document.getElementById("timeLeft"),
  score: document.getElementById("score"),
  target: document.getElementById("target"),
  queue: document.getElementById("queue"),
  goalFill: document.getElementById("goalFill"),
  goalText: document.getElementById("goalText"),
  status: document.getElementById("status"),
  prepGrid: document.getElementById("prepGrid"),
  startBtn: document.getElementById("startBtn"),
  pauseBtn: document.getElementById("pauseBtn"),
  resetBtn: document.getElementById("resetBtn"),
  overlay: document.getElementById("overlay"),
  overlayTitle: document.getElementById("overlayTitle"),
  overlayBody: document.getElementById("overlayBody"),
  nextDayBtn: document.getElementById("nextDayBtn"),
};

const view = {
  patients: new Map(),
};

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

function resetDay({ carryDay = false } = {}) {
  if (!carryDay) {
    state.day = 1;
    state.score = 0;
    state.target = 60;
    state.helped = 0;
  }
  state.timeLeft = 60;
  state.running = false;
  state.paused = false;
  state.queue = [];
  state.spawnTimer = 0;
  state.dragging = false;
  ui.overlay.classList.add("hidden");

  state.prepSlots = Array.from({ length: state.prepSlotsMax }, (_, idx) => ({
    id: `slot-${idx}-${Date.now()}`,
    status: "idle",
    exercise: null,
    timeLeft: 0,
    duration: 0,
    ui: null,
  }));

  view.patients.clear();
  ui.queue.innerHTML = "";
  buildPrepGrid();
  updateUI();
  renderPrepGrid();
  ui.pauseBtn.disabled = true;
  ui.startBtn.disabled = false;
}

function startDay() {
  if (state.running) return;
  state.running = true;
  state.paused = false;
  ui.pauseBtn.disabled = false;
  ui.startBtn.disabled = true;
  ui.status.textContent = `Day ${state.day} — patients incoming.`;
}

function togglePause() {
  if (!state.running) return;
  state.paused = !state.paused;
  ui.pauseBtn.textContent = state.paused ? "Resume" : "Pause";
}

function setStatus(message) {
  ui.status.textContent = message;
}

function endDay() {
  state.running = false;
  ui.pauseBtn.disabled = true;
  ui.startBtn.disabled = false;
  ui.overlay.classList.remove("hidden");
  ui.overlayTitle.textContent = "Successful logopedia!";
  ui.overlayBody.textContent = `Score: ${state.score} | Target: ${state.target} | Patients helped: ${state.helped}`;
  ui.nextDayBtn.textContent = "New Session";
}

function nextDay() {
  state.day += 1;
  state.target = Math.ceil(state.target * 1.1);
  state.score = 0;
  state.helped = 0;
  resetDay({ carryDay: true });
  ui.overlay.classList.add("hidden");
  ui.pauseBtn.textContent = "Pause";
  setStatus(`Day ${state.day} — keep the queue calm.`);
}

function updateUI() {
  ui.day.textContent = state.day;
  ui.timeLeft.textContent = Math.max(0, Math.ceil(state.timeLeft));
  ui.score.textContent = state.score;
  ui.target.textContent = state.target;
  const pct = Math.min(100, (state.score / state.target) * 100);
  ui.goalFill.style.width = `${pct}%`;
  ui.goalText.textContent = `${state.score} / ${state.target}`;
}

function buildPrepGrid() {
  ui.prepGrid.innerHTML = "";
  state.prepSlots.forEach((slot) => {
    const slotEl = document.createElement("div");
    slotEl.className = "prep-slot";
    slotEl.dataset.prepId = slot.id;

    const empty = document.createElement("div");
    empty.className = "prep-empty";
    empty.textContent = "Empty";

    const progress = document.createElement("div");
    progress.className = "prep-progress";

    const progName = document.createElement("div");
    progName.className = "prep-name";

    const bar = document.createElement("div");
    bar.className = "progress-bar";
    const fill = document.createElement("div");
    fill.className = "progress-fill";
    bar.appendChild(fill);

    const time = document.createElement("div");
    time.className = "progress-time";

    progress.appendChild(progName);
    progress.appendChild(bar);
    progress.appendChild(time);

    const ready = document.createElement("div");
    ready.className = "prep-ready";
    ready.setAttribute("draggable", "false");

    const readyName = document.createElement("div");
    readyName.className = "prep-name";

    const done = document.createElement("div");
    done.className = "prep-done";
    done.textContent = "Ready — drag";

    ready.appendChild(readyName);
    ready.appendChild(done);

    ready.addEventListener("dragstart", (event) => {
      if (slot.status !== "ready") {
        event.preventDefault();
        return;
      }
      event.dataTransfer.setData("text/plain", slot.id);
      event.dataTransfer.effectAllowed = "move";
      state.dragging = true;
    });

    ready.addEventListener("dragend", () => {
      state.dragging = false;
      Array.from(document.querySelectorAll(".patient.drop-target")).forEach((el) => {
        el.classList.remove("drop-target");
      });
    });

    slotEl.appendChild(empty);
    slotEl.appendChild(progress);
    slotEl.appendChild(ready);

    slot.ui = { slotEl, empty, progress, progName, fill, time, ready, readyName };
    ui.prepGrid.appendChild(slotEl);
  });
}

function renderPrepGrid() {
  state.prepSlots.forEach((slot) => {
    const { empty, progress, progName, fill, time, ready, readyName, slotEl } = slot.ui;

    empty.classList.add("hidden");
    progress.classList.add("hidden");
    ready.classList.add("hidden");

    slotEl.classList.remove("prep-articulation", "prep-fluency", "prep-voice");

    if (slot.status === "idle") {
      empty.classList.remove("hidden");
      ready.setAttribute("draggable", "false");
    } else if (slot.status === "cooking") {
      progress.classList.remove("hidden");
      progName.textContent = slot.exercise.name;
      fill.style.width = `${((slot.duration - slot.timeLeft) / slot.duration) * 100}%`;
      time.textContent = `${slot.timeLeft.toFixed(1)}s`;
      ready.setAttribute("draggable", "false");
    } else if (slot.status === "ready") {
      ready.classList.remove("hidden");
      readyName.textContent = slot.exercise.name;
      ready.setAttribute("draggable", "true");
      ready.classList.remove("prep-articulation", "prep-fluency", "prep-voice");
      ready.classList.add(`prep-${slot.exercise.name.toLowerCase()}`);
    }
  });
}

function createPatientEl(patient) {
  const card = document.createElement("div");
  card.className = `patient ${patient.mood} ${patient.variant || ""}`.trim();
  card.dataset.id = patient.id;

  const avatar = document.createElement("div");
  avatar.className = `avatar ${patient.skin}`;

  const body = document.createElement("div");
  body.className = `body ${patient.outfit}`;

  const legs = document.createElement("div");
  legs.className = "legs";

  const arms = document.createElement("div");
  arms.className = "arms";

  const hair = document.createElement("div");
  hair.className = `hair ${patient.hair}`;

  const name = document.createElement("div");
  name.className = "name";
  name.textContent = patient.name;

  const bubble = document.createElement("div");
  bubble.className = `bubble bubble-${patient.request.toLowerCase()}`;
  bubble.textContent = patient.request;

  const patience = document.createElement("div");
  patience.className = "patience";

  const patienceFill = document.createElement("div");
  patienceFill.className = "patience-fill";
  patienceFill.style.width = `${patient.patience}%`;

  patience.appendChild(patienceFill);
  avatar.appendChild(hair);
  avatar.appendChild(body);
  avatar.appendChild(arms);
  avatar.appendChild(legs);

  card.appendChild(bubble);
  card.appendChild(avatar);
  card.appendChild(name);
  card.appendChild(patience);

  card.addEventListener("dragover", (event) => {
    if (!hasReadyPrep()) return;
    event.preventDefault();
    card.classList.add("drop-target");
  });

  card.addEventListener("dragleave", () => {
    card.classList.remove("drop-target");
  });

  card.addEventListener("drop", (event) => {
    event.preventDefault();
    card.classList.remove("drop-target");
    const prepId = event.dataTransfer.getData("text/plain");
    deliverExercise(patient.id, prepId);
  });

  return { card, bubble, patienceFill };
}

function spawnPatient() {
  if (state.queue.length >= state.maxQueue) return;
  const exercise = randomFrom(EXERCISES);
  const patience = 100;
  const id = `${Date.now()}-${Math.random()}`;
  const variant = randomFrom(["v1", "v2", "v3"]);
  const skin = randomFrom(["skin1", "skin2", "skin3"]);
  const hair = randomFrom(["hair1", "hair2", "hair3"]);
  const outfit = randomFrom(["outfit1", "outfit2", "outfit3"]);

  const patient = {
    id,
    name: randomFrom(PATIENTS),
    request: exercise.name,
    patience,
    mood: "calm",
    variant,
    skin,
    hair,
    outfit,
  };

  state.queue.push(patient);
  const viewEl = createPatientEl(patient);
  view.patients.set(patient.id, viewEl);
  ui.queue.appendChild(viewEl.card);
}

function updatePatients() {
  state.queue.forEach((patient) => {
    const viewEl = view.patients.get(patient.id);
    if (!viewEl) return;
    viewEl.patienceFill.style.width = `${patient.patience}%`;
    viewEl.patienceFill.style.background =
      patient.patience < 40 ? "var(--danger)" : "var(--accent-2)";
    viewEl.card.classList.remove("calm", "tired", "angry");
    viewEl.card.classList.add(patient.mood);
  });
}

function hasReadyPrep() {
  return state.prepSlots.some((slot) => slot.status === "ready");
}

function deliverExercise(patientId, prepId = null) {
  const prepSlot =
    state.prepSlots.find((slot) => slot.id === prepId && slot.status === "ready") ||
    state.prepSlots.find((slot) => slot.status === "ready");

  if (!prepSlot) {
    setStatus("No exercise ready yet.");
    return;
  }

  const patientIndex = state.queue.findIndex((p) => p.id === patientId);
  if (patientIndex === -1) return;
  const patient = state.queue[patientIndex];
  const exercise = prepSlot.exercise;

  if (patient.request === exercise.name) {
    state.score += exercise.points;
    state.helped += 1;
    state.queue.splice(patientIndex, 1);
    const viewEl = view.patients.get(patient.id);
    if (viewEl) {
      viewEl.card.remove();
      view.patients.delete(patient.id);
    }
    setStatus(`${patient.name} satisfied with ${exercise.name}.`);
  } else {
    state.score = Math.max(0, state.score - 6);
    patient.patience = Math.max(0, patient.patience - 20);
    setStatus(`${patient.name} needs ${patient.request}, not ${exercise.name}.`);
  }

  prepSlot.status = "idle";
  prepSlot.exercise = null;
  prepSlot.timeLeft = 0;
  prepSlot.duration = 0;
  renderPrepGrid();
  updatePatients();
  updateUI();
}

function startPrep(exerciseName) {
  if (!state.running || state.paused) return;
  const idleSlot = state.prepSlots.find((slot) => slot.status === "idle");
  if (!idleSlot) {
    setStatus("All prep slots are busy.");
    return;
  }
  const exercise = EXERCISES.find((ex) => ex.name === exerciseName);
  idleSlot.status = "cooking";
  idleSlot.exercise = exercise;
  idleSlot.timeLeft = exercise.time;
  idleSlot.duration = exercise.time;
  setStatus(`Preparing ${exercise.name}...`);
  renderPrepGrid();
}

function tick(dt) {
  if (!state.running || state.paused) return;
  state.timeLeft -= dt;
  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    updateUI();
    endDay();
    return;
  }

  state.spawnTimer -= dt;
  if (state.spawnTimer <= 0) {
    spawnPatient();
    state.spawnTimer = 3 + Math.random() * 3;
  }

  state.queue.forEach((patient) => {
    patient.patience -= dt * 6;
    if (patient.patience <= 0) patient.patience = 0;
    if (patient.patience < 30) patient.mood = "angry";
    else if (patient.patience < 60) patient.mood = "tired";
    else patient.mood = "calm";
  });

  state.queue = state.queue.filter((patient) => {
    if (patient.patience <= 0) {
      state.score = Math.max(0, state.score - 10);
      const viewEl = view.patients.get(patient.id);
      if (viewEl) {
        viewEl.card.remove();
        view.patients.delete(patient.id);
      }
      setStatus(`${patient.name} left upset.`);
      return false;
    }
    return true;
  });

  state.prepSlots.forEach((slot) => {
    if (slot.status === "cooking") {
      slot.timeLeft -= dt;
      if (slot.timeLeft <= 0) {
        slot.status = "ready";
        slot.timeLeft = 0;
        setStatus(`${slot.exercise.name} ready to deliver.`);
      }
    }
  });

  updateUI();
  renderPrepGrid();
  updatePatients();
}

let lastTime = performance.now();
function loop(now) {
  const dt = Math.min(0.1, (now - lastTime) / 1000);
  lastTime = now;
  tick(dt);
  requestAnimationFrame(loop);
}

function init() {
  if (!ui.startBtn || !ui.prepGrid || !ui.queue) {
    // Basic guard: show a message in the status if critical UI is missing.
    if (ui.status) {
      ui.status.textContent = "UI error: missing elements. Please refresh.";
    }
    return;
  }

  ui.startBtn.addEventListener("click", startDay);
  ui.pauseBtn.addEventListener("click", togglePause);
  ui.resetBtn.addEventListener("click", () => {
    resetDay({ carryDay: false });
    ui.pauseBtn.textContent = "Pause";
    ui.overlay.classList.add("hidden");
    setStatus("Day reset.");
  });

  ui.nextDayBtn.addEventListener("click", nextDay);

  Array.from(document.querySelectorAll("button[data-ex]")).forEach((btn) => {
    btn.addEventListener("click", () => startPrep(btn.dataset.ex));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "1") startPrep("Articulation");
    if (event.key === "2") startPrep("Fluency");
    if (event.key === "3") startPrep("Voice");
    if (event.key.toLowerCase() === "p") togglePause();
  });

  resetDay();
  setStatus("Ready. Press Start Day.");
  ui.overlay.classList.add("hidden");
  requestAnimationFrame(loop);
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
