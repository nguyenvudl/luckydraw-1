var conf = config;
const data_file = conf.data_file;
let userData;
let temp_user;
let archived = {};
var current_round = 0;
var timers = {};

var handleTickInit = function (tick) {
  var val = tick._viewDefinition.root.attributes["data-change"].value;
  var timer = Tick.helper.interval(
    function (passed) {
      tick.value = val;
    },
    2000,
    { autostart: false }
  );
  timers[val] = timer;
  //   timer.start();
};

var initPage = function (data) {
  const test = ``;
  const page = `<div class="col-12" id="page-container">
    <div class="col-8 main-page" id="main-page">
    <h1 class="main-title">${conf.oraginzation} - ${conf.current_year}</br>${conf.main_page_title}</h1>
    <div class="tab-wrap" id="tab-wrap"></div></div>
    <div class="col-4 left-page" id="champions-list">
    <h1 class="winners-title">${conf.champion_title}</h1>
    <ul class="list-group list-group-flush" id="champions-list-ul"></ul></div></div>
    <div class="notification-container"><div class="notification"></div></div>`;
  document.body.innerHTML = test + page;
};

var loadChampionList = function (data) {
  var screenHeight = window.innerHeight;
  var dynamicDiv = document.getElementById(data);
  dynamicDiv.style.height = screenHeight + "px";
};

var initStage = function () {
  data = conf.stage_init;
  const parent = document.getElementById("tab-wrap");
  var child_ip = document.createElement("div");
  var child_tab = document.createElement("div");
  ip_items = "";
  tab_items = "";
  if (conf.show_raw_data) {
    show_table = "";
  } else {
    show_table = "none";
  }
  for (var key in data) {
    const check = data[key].checked === true ? " checked" : "";
    const d = data[key].checked === true ? "none" : "none";
    const round = data[key].round;
    ip_items += `<input type="radio" id="tab-${round}" data-round="${round}" name="tabGroup1" class="tab" onclick="setRoundStage(this)"${check}>
        <label class="tab-label" id="tab-label-${round}" for="tab-${round}" style="display:${d};">${data[key].name}</label>`;
    tab_items += `<div class="tab__content" id="tabc-${round}">
          <h1>${data[key].name}</h1>
          <div id="ticker-${round}"></div>
          <table id="randomData-${round}" style="display:${show_table};"><tr><th>ID</th><th>Team</th><th>Prio</th><th>Name</th><th>Status</th></tr></table>
        </div>`;
  }
  child_ip.innerHTML = ip_items;
  while (child_ip.firstChild) {
    parent.appendChild(child_ip.firstChild);
  }
  child_tab.innerHTML = tab_items;
  while (child_tab.firstChild) {
    parent.appendChild(child_tab.firstChild);
  }
  const r = parent.querySelectorAll('input[type="radio"]');
  r.forEach((radio) => {
    if (radio.checked) {
      setRoundStage(radio);
    }
  });
};

var getData = function (data_file) {
  return new Promise((resolve, reject) => {
    fetch(data_file)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        userData = data;
        resolve(userData);
        //   console.log("userData: ", Object.keys(userData).length, userData);
      })
      .catch(function (err) {
        console.log("error: " + err);
        reject(err);
      });
  });
};

var randomUser = function (data) {
  var randomObject;
  if (Array.isArray(data)) {
    randomObject = getRandomObjectFromArray(data);
  } else {
    randomObject = getRandomObjectFromDict(data);
  }
  if (randomObject) {
    return randomObject;
  } else {
    return -1;
  }
};

var getRandomObjectFromArray = function (array) {
  if (Array.isArray(array) && array.length > 0) {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
  } else {
    return null; // Return null if the array is empty or not an array
  }
};

var getRandomObjectFromDict = function (obj) {
  var keys = Object.keys(obj);
  if (keys.length > 0) {
    var rd = (keys.length * Math.random()) << 0;
    return [keys[rd], obj[keys[rd]]];
  } else {
    return null;
  }
};

var removeUser = function (mid) {
  delete userData[mid];
};

var filterDataByGrp = function (jsonData, grp, ValueToFilter) {
  return Object.keys(jsonData)
    .filter((key) => jsonData[key][grp] === ValueToFilter)
    .reduce((key) => {
      delete jsonData[key];
      console.log("filterDataByGrp: ", jsonData, grp, ValueToFilter, key);
      return jsonData;
    }, {});
};

var addChampionList = function (r) {
  if (document.getElementById(`champ-${r}`)) {
    return;
  }
  const parent = document.getElementById("champions-list-ul");
  var child = document.createElement("li");
  child.innerHTML = `<li class="list-group-item active champ-list-label">${conf.stage_init[r].name}</li>
    <li class="list-group-item champ-list" id="champ-${r}"></li>`;
  parent.prepend(child);
};

var addChampionBalls = function (r, data) {
  const parent = document.getElementById(`champ-${r}`);
  var child = document.createElement("span");
  child.innerHTML = `<section class="stage">
  <figure class="ball"><span class="shadow"></span><span class="eight">${data}</span></figure></section>`;
  parent.appendChild(child);
};

var initRound = function (round, data) {
  var ele_tk = document.getElementById(`ticker-${round}`);
  ele_tk.innerHTML = "";
  var timer_1 = 1 * 1000;
  var timer_2 = 1 * 1000;
  var rduser = randomUser(data);
  temp_user = rduser;
  if (conf.animation || conf.test_mode) {
    var n_elem = document.createElement("div");
    var tickerc = `<div id="t-${round}" class="tick col-12" data-value="000" data-did-init="handleTickInit" data-change="${rduser[0]}">
            <div data-repeat="true" data-layout="horizontal fit" data-transform="arrive(9, .00001) -> round -> pad(\'000\') -> split -> delay(rtl,${timer_1},${timer_2})">
            <span data-view="flip"></span></div></div>
            <div class="col-12 btn-grp">
            <button type="button" class="btn btn-outline-danger btn-lg btn-block btn-roll col-12" id="rollBtn-${round}-${rduser[0]}" data-id="${rduser[0]}" onclick="startRoller(this)">${conf.action_btn.start}</button>
            <button type="button" class="btn btn-outline-warning btn-lg btn-block btn-add col-6" id="addBtn-${round}-${rduser[0]}" data-id="${rduser[0]}" onclick="addRoller(this)" style="display:none;">${conf.action_btn.add}</button>
            <button type="button" class="btn btn-outline-success btn-lg btn-block btn-ok col-6" id="okBtn-${round}-${rduser[0]}" data-id="${rduser[0]}" data-round="${round}" onclick="okRoller(this)" style="display:none;">${conf.action_btn.accept}</button></div>`;
    n_elem.innerHTML = tickerc;
    ele_tk.appendChild(Tick.DOM.create(n_elem, { value: 0 }).root);
    Tick.DOM.parse(n_elem);
  }
  removeUser(rduser[0]);
};

var isMaxPrize = function (round) {
  max_prize = conf.stage_init[round].max;
  if (archived[round].length >= max_prize) {
    return true;
  } else {
    return false;
  }
};

var startRoller = function (data) {
  current_roll = data.getAttribute("data-id");
  timers[current_roll].start();
  var btnAdd = document.getElementById(
    `addBtn-${current_round}-${current_roll}`
  );
  var btnRemove = document.getElementById(
    `removeBtn-${current_round}-${current_roll}`
  );
  var btnOk = document.getElementById(`okBtn-${current_round}-${current_roll}`);
  data.style.display = "none";
  if(conf.test_mode===true){t = 0}else{t=conf.delay};
  setTimeout(() => {
    btnAdd.style.display = "";
    btnOk.style.display = "";
    playFireWorks(true);
    timers[current_roll].stop();
  }, t);
};

var okRoller = function (data) {
  current_roll = data.getAttribute("data-id");
  round = data.getAttribute("data-round");
  rduser = temp_user;
  var ele_table = document.getElementById(`randomData-${round}`);
  if (conf.show_raw_data || conf.test_mode) {
    const new_elem = document.createElement("tr");
    new_elem.innerHTML = `<td>${rduser[0]}</td><td>${rduser[1]["team"]}</td>
                          <td>${rduser[1]["priority"]}</td><td>${rduser[1]["name"]}</td>
                          <td>pending</td>`;
    ele_table.appendChild(new_elem);
  }
  if (conf.show_archived || conf.test_mode) {
    addChampionList(round);
    addChampionBalls(round, rduser[0]);
  }
  if (conf.remove_team_in_rounds.indexOf(round) !== -1) {
    data = filterDataByGrp(data, "team", rduser[1]["team"]);
  }
  archived[round].push(rduser[0]);
  data.disabled = true;
  document.getElementById(`addBtn-${round}-${rduser[0]}`).click();
  playFireWorks(false);
};

var addRoller = function (data) {
  current_roll = data.getAttribute("data-id");
  if (isMaxPrize(current_round) === false) {
    initRound(current_round, userData);
  } else {
    showNotification(
      `Reached the Maximum ${conf.stage_init[current_round].max} prizes of round ${current_round}`
    );
    var next_round = round - 1;
    if (next_round > 0) {
      document.getElementById(`tab-${next_round}`).click();
    } else {
      endGame();
    }
  }
  data.disabled = true;
  playFireWorks(false);
};

var setRoundStage = function (data) {
  current_round = data.getAttribute("data-round");
  archived[current_round] = [];
  initRound(current_round, userData);
};

var playFireWorks = function (data, p) {
  var page = "body";
  if (p) {
    page = p;
  }
  const container = $(page);
  if (data === true) {
    container.fireworks();
  } else {
    container.fireworks("destroy");
  }
};

var endGame = function (params) {
  playFireWorks(false);
  playFireWorks(true, "#champions-list");
  document.getElementById("main-page").classList.add("fade-out");
  const cl = document.getElementById("champions-list");
  setTimeout(function () {
    document.getElementById("main-page").style.display = "none";
    cl.classList.remove("col-4");
    cl.classList.add("col-12");
  }, 3000);
};

var showNotification = function (data) {
  const notification = document.querySelector(".notification-container");
  notification.querySelector(".notification").textContent = data;
  notification.style.display = "block"; // Set the display property to 'block'
  setTimeout(hideNotification, 5000);
};

// Function to hide the notification
var hideNotification = function (data) {
  const notification = document.querySelector(".notification-container");
  notification.style.display = "none"; // Set the display property to 'none'
};

var init = function () {
  getData(data_file)
    .then(() => {
      initStage();
    })
    .catch((error) => {
      // Handle errors if getData() fails
      console.error("Error while getting data:", error);
    });
  document.title = `${conf.app_name} ${conf.current_year}`;
  initPage();
  loadChampionList("page-container");
};

window.onload = function () {
  init();
};
