var habits = JSON.parse(localStorage.getItem("habitTrackerData")) || [];
var date = new Date();

function dayKey(d) {
  return d.toLocaleDateString("en-CA");
}

function esc(text) {
  var div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function save() {
  localStorage.setItem("habitTrackerData", JSON.stringify(habits));
  show();
}

function doneList(habit, key) {
  return habit.days[key] || [];
}

function isDone(habit, key) {
  return habit.checkpoints.length > 0 && doneList(habit, key).length === habit.checkpoints.length;
}

function streak(habit) {
  var d = new Date(date);
  var count = 0;
  if (!isDone(habit, dayKey(d))) d.setDate(d.getDate() - 1);
  while (isDone(habit, dayKey(d))) {
    count++;
    d.setDate(d.getDate() - 1);
  }
  return count;
}

function show() {
  var key = dayKey(date);
  var completed = 0;
  var html = "";

  document.getElementById("dateLabel").textContent = date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric"
  });

  habits.forEach(function (h, i) {
    var done = doneList(h, key);
    var finished = isDone(h, key);
    var percent = h.checkpoints.length ? (done.length / h.checkpoints.length) * 100 : 0;
    var days = streak(h);
    if (finished) completed++;

    html += '<div class="habit' + (finished ? ' done' : '') + '">';
    html += '<div class="habit-top"><h2>' + esc(h.name) + '</h2>';
    html += '<button class="delete" onclick="removeHabit(' + i + ')">Delete</button></div>';
    html += '<p class="meta">' + done.length + ' of ' + h.checkpoints.length + ' checkpoints done &middot; streak: ' + days + (days === 1 ? ' day' : ' days') + '</p>';
    html += '<div class="bar"><div style="width:' + percent + '%"></div></div>';

    h.checkpoints.forEach(function (c, j) {
      var isChecked = done.includes(j);
      html += '<label class="checkpoint' + (isChecked ? ' checked' : '') + '">';
      html += '<input type="checkbox" ' + (isChecked ? 'checked' : '') + ' onchange="toggle(' + i + ',' + j + ')">';
      html += '<span>' + esc(c) + '</span></label>';
    });

    html += '</div>';
  });

  document.getElementById("list").innerHTML = html || '<p class="empty">No habits yet. Add your first one above.</p>';

  if (habits.length === 0) {
    document.getElementById("summaryText").textContent = "No habits to track yet.";
    document.getElementById("summaryFill").style.width = "0%";
  } else {
    document.getElementById("summaryText").textContent = completed + " of " + habits.length + " habits completed";
    document.getElementById("summaryFill").style.width = (completed / habits.length) * 100 + "%";
  }
}

function addHabit() {
  var nameInput = document.getElementById("name");
  var cpsInput = document.getElementById("cps");
  var name = nameInput.value.trim();
  var cps = cpsInput.value.split(",").map(function (c) { return c.trim(); }).filter(Boolean);

  if (!name) {
    nameInput.focus();
    return;
  }

  habits.push({ name: name, checkpoints: cps.length ? cps : [name], days: {} });
  nameInput.value = "";
  cpsInput.value = "";
  save();
}

function toggle(i, j) {
  var key = dayKey(date);
  var done = doneList(habits[i], key);
  var pos = done.indexOf(j);
  if (pos < 0) done.push(j);
  else done.splice(pos, 1);
  habits[i].days[key] = done;
  save();
}

function removeHabit(i) {
  if (confirm("Delete this habit and its history?")) {
    habits.splice(i, 1);
    save();
  }
}

function changeDay(n) {
  date.setDate(date.getDate() + n);
  show();
}

document.getElementById("addBtn").onclick = addHabit;
document.getElementById("prev").onclick = function () { changeDay(-1); };
document.getElementById("next").onclick = function () { changeDay(1); };
document.getElementById("todayBtn").onclick = function () {
  date = new Date();
  show();
};

["name", "cps"].forEach(function (id) {
  document.getElementById(id).addEventListener("keydown", function (e) {
    if (e.key === "Enter") addHabit();
  });
});

show();