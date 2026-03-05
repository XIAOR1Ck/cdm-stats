// Api Base path
const apiBase = "https://cdm-worker.sureshach-off.workers.dev/web/codm";

//Html Elements
const searchArea = document.getElementById('_searchArea');
const formContainer = document.getElementById('_formContainer');
const form = document.getElementById('_searchForm');
const contentArea = document.getElementById('_contentArea');
const fieldset = document.querySelector("fieldset");


//Form elements
const dataType = document.getElementById('_dataType');
const season = document.getElementById('_season');


// front page radio
const frontRadio = document.querySelector('input[name="scheduleRadio"]:checked');

// Front page schedule divs
const scheduleToday = document.getElementById('_scheduleToday');
const schedulePrev = document.getElementById('_schedulePrev');
const scheduleUpcoming = document.getElementById('_scheduleUpcoming');



// show form on clicking search button
function showForm() {
    if (formContainer.style.display === 'none' || formContainer.style.display === '') {
        formContainer.style.display = 'block'; // Show the element
    } else {
        formContainer.style.display = 'none'; // Hide the element
    }
}

//Handle form submit event
form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const gameMode = document.querySelector('input[name="gameModes"]:checked');
    switch (dataType.value) {
        case 'schedule':
            await getSchedule(season.value);

            break;
        case 'searchPlayer':
            console.log(gameMode.value)
            const playerId = document.getElementById('_playerId');
            let playerList = await getPlayerData(season.value, gameMode.value);
            let [playerData, playerRank] = searchPlayer(playerList, playerId.value);
            createStatCard(playerData, gameMode.value, playerRank);
            break;
        case 'mapData':
            //TODO
            break;
        case 'teamData':
            getTeams(season.value);
            break;
        default:
            alert('UNKNOWN DATA TYPE');
    };
});

// Event listener for Search input element rendering
dataType.addEventListener('change', function () {
    const seasonid = season.value;
    switch (dataType.value) {
        case "searchPlayer":
            searchArea.style.display = 'block';
            fieldset.style.display = 'block';
            renderSearch(seasonid);
            break;
        case "teamData":
        case "schedule":
            fieldset.style.display = 'none';
            searchArea.style.display = 'none';
            break;
        case "mapData":
            fieldset.style.display = 'block';
            searchArea.style.display = 'none';
            break;
    }
});

// Event listener to change Combolist values for each season for searching player.
season.addEventListener('change', function () {
    if (dataType.value === 'searchPlayer') {
        renderSearch(season.value);
    }
})


// Get Season Schedule. This also consists of VOD for matches already done.
async function getSchedule(seasonid) {
    const endpoint = "/getCodmSSchedule";
    let reqURL = apiBase + endpoint + `?seasonid=${seasonid}`;
    try {
        const response = await fetch(reqURL);
        if (!response.ok) {
            throw new Error(`Error : ${response.status}`);
        }
        const data = await response.json();
        parseSchedule(data);
    } catch (error) {
        console.error('Error: ', error);
    }
};


// Parse Schedule for display
function parseSchedule(result) {
    const { schedule } = result;
    contentArea.innerHTML = `
        <div id="_scheduleDiv"></div>
    `;
    const scheduleDiv = document.getElementById("_scheduleDiv");
    schedule.forEach(element => {
        const { match_date, gname, glogo, guest_score, hname, host_score, hlogo, vid_list } = element;
        let vodList;
        vid_list.forEach(option => {
            vodList += `<option value="${option}">Map ${vid_list.indexOf(option) + 1}</option>`;
        });
        scheduleDiv.innerHTML += `
        <div id="_schedulePrev">
            <div id="_matchDate">
              <span>${match_date}</span>
            </div>
            <div id="_logo">
              <img src="${glogo}" alt="">
            </div>
            <div id="_name">${gname}</div>
            <div id="_score">
              <div>${guest_score}</div>
              <span>:</span>
              <div>${host_score}</div>
            </div>
            <div id="_name">${hname}</div>
            <div id="_logo">
              <img src="${hlogo}" alt="">  
            </div>
            <div id="_vod">
              <select name="vodList" id="_vodList">
               ${vodList}
              </select>
            </div>
        </div>`;

    });
    console.log(schedule)
}


// Fetch Player data from the ranking endpoint.
async function getPlayerData(seasonid, game_mode) {
    const endpoint = "/getPlayerRanking";
    let reqURL = apiBase + endpoint;
    try {
        const response = await fetch(reqURL, {
            method: "POST",
            body: JSON.stringify({
                game_mode: game_mode,
                seasonid: seasonid,
            })
        });
        if (!response.ok) {
            throw new Error(`Error : ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error: ', error);
    }


}

// Create Hidden input for combolist implementation
function attachDatalistMapping(inputId, hiddenId) {
    const input = document.getElementById(inputId);
    const hidden = document.getElementById(hiddenId);
    const datalist = document.getElementById(input.getAttribute('list'));

    input.addEventListener('input', function () {
        const match = Array.from(datalist.options)
            .find(option => option.value === input.value);

        hidden.value = match ? match.dataset.id : '';
    });
}



// Extract the stats of a individual player from ranking data
function searchPlayer(playerData, player_id) {
    const { rank } = playerData.data;
    const player = rank.find(player => {
        return player.player_id === player_id;
    });

    if (player) {
        return [player, rank.indexOf(player)];

    } else {
        alert('Player Not Found');
    };
}

// Create Player Stats Card
function createStatCard(player, game_mode, rank) {
    let { player_name, player_logo, team_name, team_logo, mvp, rating, times5accu_kill, max_k, k, d, kd, a } = player;
    contentArea.innerHTML = `<div id="_playerCard">
            <div id="_playerImage">
              <img src="${player_logo}" alt="">
            </div>
            <div id="_playerDetails">
              <div id="_playerName">
                <h2>${player_name}</h2>
                <div id="_rating">Rating: ${rating.toFixed(2)}</div>
                <div id="_mvp">MVP: ${mvp}</div>
                <div id="_rank">Rank: ${rank + 1}</div>
                <div id="_teamTag">
                  <img src="${team_logo}" width="20px" height="20px" alt="">
                  ${team_name}</div>
              </div>
              <div id="_stats">
              </div>
            </div>
        </div>`;
    const statsArea = document.getElementById('_stats');
    switch (game_mode) {
        case 'FULL':
            statsArea.innerHTML = `
                <div id="_statBox">Kills: ${k}</div>
                <div id="_statBox">Death: ${d}</div>
                <div id="_statBox">Assist: ${a}</div>
                <div id="_statBox">KD: ${kd}</div>
                <div id="_statBox">MaxKills: ${max_k}</div>
                <div id="_statBox">Five Spree: ${times5accu_kill}</div>
            `;
            break;
        case 'Blast':
            let { first_blood, sniper_kill_per_round, first_blood_rate, k_per_round, times_sniper_kill } = player;
            statsArea.innerHTML = `
                <div id="_statBox">First Bloods: ${first_blood}</div>
                <div id="_statBox">Sniper KPR: ${sniper_kill_per_round}</div>
                <div id="_statBox">First Blood Rate: ${first_blood_rate}</div>
                <div id="_statBox">Avg KPR: ${k_per_round}</div>
                <div id="_statBox">Avg death: ${Math.round(d)}</div>
                <div id="_statBox">Ace: ${times5accu_kill}</div>
                <div id="_statBox">SR kill rate: ${times_sniper_kill.toFixed(2)}</div>
                <div id="_statBox">KD: ${kd.toFixed(2)}</div>
            `;
            break;
        case "Hotspot":
        case "Control":
            let { hp_time, times_ult_kill, rounds } = player;
            const mins = Math.floor(hp_time / 60);
            const secs = hp_time % 60;
            statsArea.innerHTML = `
                <div id="_statBox">Avg Kills: ${k.toFixed(2)}</div>
                <div id="_statBox">Avg Death: ${d.toFixed(2)}</div>
                <div id="_statBox">Avg Assist: ${a.toFixed(2)}</div>
                <div id="_statBox">KD: ${kd.toFixed(2)}</div>
                <div id="_statBox">Max Kills: ${max_k}</div>
                <div id="_statBox">Five Spree: ${times5accu_kill}</div>
                <div id="_statBox">Avg operator kills: ${times_ult_kill.toFixed(2)}</div>
                <div id="_statBox">Hill Time: ${mins}'${Math.floor(secs)}"</div>
            `;
            if (game_mode === "Hotspot") {
                statsArea.innerHTML += `<div id="_statBox">Games Played: ${rounds}</div>`;
            }
            break;
        case 'Control':
            break;
    }
}

// Render player Search Bar
function renderSearch(seasonid) {
    searchArea.innerHTML = '';
    fetch(`data/players_${seasonid}.json`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed fetching Players list:', response.statusText);
            }
            return response.json();
        })
        .then(data => {
            const dataOptions = data.map((values) => `<option value="${values.player_name}" data-id="${values.player_id}"></option>`).join('');
            //const searchArea = document.getElementById("_searchArea");
            searchArea.innerHTML = `
            <input type="text" id="_playerInput" list="_playerList" placeholder="Search Player...">
            <datalist id="_playerList">
                ${dataOptions}
            </datalist>
            <input type="hidden" id="_playerId">
`;
            attachDatalistMapping('_playerInput', '_playerId')
        })
        .catch(error => console.error(error));
}

// Get Team Data
async function getTeams(seasonid) {
    const endpoint = "/getTeamRanking";
    let reqURL = apiBase + endpoint;
    try {
        const response = await fetch(reqURL, {
            method: "POST",
            body: JSON.stringify({
                seasonid: seasonid,
            })
        });
        if (!response.ok) {
            throw new Error(`Error : ${response.status}`);
        }
        const teamData = await response.json();
        const { data } = teamData;
        createTeamCards(data)
    } catch (error) {
        console.error('Error: ', error);
    }
}

// Create Team Cards From the Data
function createTeamCards(teamData) {
    //clear previous content from content area
    contentArea.innerHTML = '';
    const { rank } = teamData;
    rank.forEach(elements => {
        const teamRank = rank.indexOf(elements) + 1;
        const { team_logo, hp_points_diff, bomb_win_rate, win_rate, control_points_diff, control_win_rate, team_name, bomb_points_diff, hp_win_rate } = elements;
        contentArea.innerHTML += `
            <div id="_teamCard">
            <div id="_teamLogo">
              <img src="${team_logo}" alt="">
            </div>
            <div id="_teamStats">
              <div id="_teamDet">
                <div id="_teamName">${team_name}</div>
                <div id="_teamRank">Rank ${teamRank}</div>
              </div>
              <div id="_statArea">
                <div id="_statsBox">Win Rate: ${parseFloat(win_rate * 100).toFixed(2)}%</div>
                <div id="_statsBox">SnD Win Rate: ${parseFloat(bomb_win_rate * 100).toFixed(2)}%</div>
                <div id="_statsBox">SnD Round Diff: ${parseFloat(bomb_points_diff.toFixed(2))}</div>
                <div id="_statsBox">HP Win Rate: ${parseFloat(hp_win_rate * 100).toFixed(2)}%</div>
                <div id="_statsBox">HP Points Diff:${parseFloat(hp_points_diff.toFixed(2))}</div>
                <div id="_statsBox">Ctl Win Rate: ${parseFloat(control_win_rate * 100).toFixed(2)}%</div>
                <div id="_statsBox">Ctl Round Diff: ${parseFloat(control_points_diff.toFixed(2))}</div>
                <div id="_statsBox">Rank: ${teamRank}</div>
              </div>
            </div>
        </div>
        `;
    })
}

// render Front page
// Select the container and radio buttons
const scheduleDiv = document.getElementById('_scheduleDiv');
const radios = document.querySelectorAll('input[name="scheduleRadio"]');

// Containers for categorized matches
let pastMatches = [];
let todayMatches = [];
let upcomingMatches = [];

// Fetch schedule data
async function fetchSchedule() {
  try {
    const response = await fetch('https://cdm-worker.sureshach-off.workers.dev/web/codm/getCodmSSchedule?seasonid=CODMl2026S1');
    const data = await response.json();
    const schedule = data.schedule;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // normalize time

    // Categorize matches
    schedule.forEach(match => {
      const matchDate = new Date(match.match_date);
      matchDate.setHours(0, 0, 0, 0);

      if (matchDate.getTime() < today.getTime()) {
        pastMatches.push(match);
      } else if (matchDate.getTime() === today.getTime()) {
        todayMatches.push(match);
      } else {
        upcomingMatches.push(match);
      }
    });

    // Initially display today's matches
    renderMatches('today');
  } catch (error) {
    console.error('Error fetching schedule:', error);
    scheduleDiv.innerHTML = '<p>Error loading schedule.</p>';
  }
}

// Function to render matches in the container
function renderMatches(type) {
  scheduleDiv.innerHTML = ''; // clear container

  let matchesToRender = [];
  if (type === 'today') matchesToRender = todayMatches;
  else if (type === 'previous') matchesToRender = pastMatches;
  else if (type === 'upcoming') matchesToRender = upcomingMatches;

  matchesToRender.forEach(match => {
    let matchHTML = '';

    if (type === 'today') {
      matchHTML = `
        <div id="_scheduleToday">
          <div id="_matchDate"><span>${match.match_date}</span></div>
          <div id="_logo"><img src="${match.glogo}" alt=""></div>
          <div id="_name">${match.gname}</div>
          <div id="_score">
            <div>${match.guest_score}</div>
            <span>:</span>
            <div>${match.host_score}</div>
          </div>
          <div id="_name">${match.hname}</div>
          <div id="_logo"><img src="${match.hlogo}" alt=""></div>
        </div>
      `;
    } else if (type === 'upcoming') {
      matchHTML = `
        <div id="_scheduleUpcoming">
          <div id="_matchDate"><span>${match.match_date}</span></div>
          <div id="_logo"><img src="${match.glogo}" alt=""></div>
          <div id="_name">${match.gname}</div>
          <div id="_score">VS</div>
          <div id="_name">${match.hname}</div>
          <div id="_logo"><img src="${match.hlogo}" alt=""></div>
        </div>
      `;
    } else if (type === 'previous') {
      const vodOptions = match.vodList ? match.vodList.map(v => `<option value="${v}">${v}</option>`).join('') : '';
      matchHTML = `
        <div id="_schedulePrev">
          <div id="_matchDate"><span>${match.match_date}</span></div>
          <div id="_logo"><img src="${match.glogo}" alt=""></div>
          <div id="_name">${match.gname}</div>
          <div id="_score">
            <div>${match.guest_score}</div>
            <span>:</span>
            <div>${match.host_score}</div>
          </div>
          <div id="_name">${match.hname}</div>
          <div id="_logo"><img src="${match.hlogo}" alt=""></div>
          <div id="_vod">
            <select name="vodList" id="_vodList">${vodOptions}</select>
          </div>
        </div>
      `;
    }

    scheduleDiv.insertAdjacentHTML('beforeend', matchHTML);
  });
}

// Add event listeners to radios
radios.forEach(radio => {
  radio.addEventListener('change', (e) => {
    renderMatches(e.target.value);
  });
});

// Fetch and display schedule
fetchSchedule();