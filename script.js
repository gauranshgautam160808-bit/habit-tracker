var habits = [];
var log = {};
var current = new Date();

function load() {
  try {
    habits = JSON.parse(localStorage.getItem("habits")) || [];
    log = JSON.parse(localStorage.getItem("log")) || {};
  } catch (e) {
    habits = [];
    log = {};
  }
}

function save() {
  try {
    localStorage.setItem("habits", JSON.stringify(habits));
    localStorage.setItem("log", JSON.stringify(log));
  } catch (e) {}
}

function key(d) {
  var m = String(d.getMonth() + 1).padStart(2, "0");
  var day = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + m + "-" + day;
}

function checked(dateKey, habit) {
  return (log[dateKey] && log[dateKey][habit.id]) || [];
}

function isDone(dateKey, habit) {
  return habit.checkpoints.length > 0 && checked(dateKey, habit).length === habit.checkpoints.length;
}

function streak(habit) {
  var d = new Date(current);
  var count = 0;
  if (!isDone(key(d), habit)) d.setDate(d.getDate() - 1);
  while (isDone(key(d), habit)) {
    count++;
    d.setDate(d.getDate() - 1);
  }
  return count;
}

function toggle(habitId, index) {
  var k = key(current);
  if (!log[k]) log[k] = {};
  var list = log[k][habitId] || [];
  var pos = list.indexOf(index);
  if (pos === -1) list.push(index);
  else list.splice(pos, 1);
  log[k][habitId] = list;
  save();
  render();
}

function removeHabit(id) {
  if (!confirm("Delete this habit and its history?")) return;
  habits = habits.filter(function (h) { return h.id !== id; });
  Object.keys(log).forEach(function (k) { delete log[k][id]; });
  save();
  render();
}

function render() {
  var k = key(current);
  var today = key(new Date());
  var label = current.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  document.getElementById("dateLabel").textContent = k === today ? "Today, " + label : label;

  var list = document.getElementById("list");
  list.innerHTML = "";

  if (habits.length === 0) {
    var empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "No habits yet. Add your first one above.";
    list.appendChild(empty);
    return;
  }

  habits.forEach(function (h) {
    var done = checked(k, h);
    var box = document.createElement("div");
    box.className = "habit" + (isDone(k, h) ? " done" : "");

    var head = document.createElement("div");
    head.className = "habit-head";
    var title = document.createElement("h2");
    title.textContent = h.name;
    var del = document.createElement("button");
    del.className = "del";
    del.textContent = "Delete";
    del.onclick = function () { removeHabit(h.id); };
    head.appendChild(title);
    head.appendChild(del);
    box.appendChild(head);

    var meta = document.createElement("p");
    meta.className = "meta";
    var s = streak(h);
    meta.textContent = done.length + " of " + h.checkpoints.length + " done, streak: " + s + (s === 1 ? " day" : " days");
    box.appendChild(meta);

    var bar = document.createElement("div");
    bar.className = "bar";
    var fill = document.createElement("div");
    fill.style.width = (h.checkpoints.length ? (done.length / h.checkpoints.length) * 100 : 0) + "%";
    bar.appendChild(fill);
    box.appendChild(bar);

    h.checkpoints.forEach(function (text, i) {
      var row = document.createElement("label");
      row.className = "cp";
      var cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = done.indexOf(i) !== -1;
      cb.onchange = function () { toggle(h.id, i); };
      var span = document.createElement("span");
      span.textContent = " " + text;
      row.appendChild(cb);
      row.appendChild(span);
      box.appendChild(row);
    });

    list.appendChild(box);
  });
}

function addHabit() {
  var nameEl = document.getElementById("name");
  var cpsEl = document.getElementById("cps");
  var name = nameEl.value.trim();
  if (!name) {
    nameEl.focus();
    return;
  }
  var cps = cpsEl.value.split(",").map(function (c) { return c.trim(); }).filter(Boolean);
  if (cps.length === 0) cps = [name];
  habits.push({ id: "h" + Date.now(), name: name, checkpoints: cps });
  nameEl.value = "";
  cpsEl.value = "";
  save();
  render();
}

document.getElementById("addBtn").onclick = addHabit;
document.getElementById("cps").addEventListener("keydown", function (e) {
  if (e.key === "Enter") addHabit();
});
document.getElementById("prev").onclick = function () {
  current.setDate(current.getDate() - 1);
  render();
};
document.getElementById("next").onclick = function () {
  current.setDate(current.getDate() + 1);
  render();
};

load();
render();