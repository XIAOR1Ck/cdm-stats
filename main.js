// Api Base path
const apiBase = "https://cdm-worker.sureshach-off.workers.dev/web/codm";

//Html Elements
const searchArea = document.getElementById('_searchArea');
const dataType = document.getElementById('_dataType');
const season = document.getElementById('_season');
const form = document.getElementById('_searchForm');
const gameMode = document.querySelector('input[name="gameModes"]:checked');
const playerId = document.getElementById('_playerId');


//Handle form submit event
form.addEventListener('submit', function(e){
    e.preventDefault();
    console.log(dataType.value, season.value, gameMode.value, playerId.value);
} );

// Event listener for Search input element rendering
dataType.addEventListener('change', function(){
    const seasonid = season.value;
    if (dataType.value === 'searchPlayer') {
        searchArea.style.display = 'block';
        renderSearch(seasonid);
    } else {
        searchArea.style.display = 'none';
    }
});


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
    } catch (error){
        console.error('Error: ', error);
    }
 };

function parseSchedule(result) {
    const { schedule } = result;
    schedule.forEach(element => {
        const { match_date, gname, hname } = element;
        document.body.innerHTML += `<li>${hname} VS ${gname} on ${match_date}</li>`

    });
    console.log(schedule)
}


// Fetch Player data from the ranking endpoint.
async function getPlayerData(seasonid, game_mode = "FULL") {
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
    } catch (error){
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
        console.log(player, rank.indexOf(player)
        );
    } else {
        alert('Player Not Found');
    }}


// Render player Search Bar
function renderSearch(seasonid){
    fetch(`data/players_${seasonid}.json`)
    .then(response => {
            if (!response.ok){
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
            attachDatalistMapping('_playerInput','_playerId')
        })
    .catch (error => console.error (error));
}
//getPlayerData("CODML2025S2").then(playerData => searchPlayer(playerData, "2006697664"));
//

//renderSearch('CODML2025S2');
