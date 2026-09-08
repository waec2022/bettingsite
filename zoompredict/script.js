/*
========================================================
JACKPOT X ZOOM PREDICT
FRONTEND ONLY
========================================================

NO BACKEND
NO LOGIN
NO DATABASE
NO USER ACCOUNTS

Prediction data is intentionally stored here so you
can edit it directly every day.

IMPORTANT:

The advertisement unlock below is a DEVELOPMENT DEMO.

It does NOT pretend that a real advertisement was shown.

When an approved ad provider is available, replace ONLY
the RewardedAd.request() implementation with the provider's
real rewarded-ad callback.

========================================================
*/


/* ======================================================
   BOOKMAKERS
====================================================== */

const bookmakers = {

  betPawa:{
    name:"betPawa",
    code:"BP728391",
    marketUrl:"#",
    affiliateUrl:"#"
  },

  sporty:{
    name:"SportyBet",
    code:"SPB7421",
    marketUrl:"#",
    affiliateUrl:"#"
  },

  bet9ja:{
    name:"Bet9ja",
    code:"BJ56321",
    marketUrl:"#",
    affiliateUrl:"#"
  },

  onebet:{
    name:"1xBet",
    code:"1XBET1287",
    marketUrl:"#",
    affiliateUrl:"#"
  },

  betway:{
    name:"betway",
    code:"BW91824",
    marketUrl:"#",
    affiliateUrl:"#"
  }

};


/* ======================================================
   BET OF THE DAY
====================================================== */

const betOfTheDay = [

  {
    market:"Highest Scoring Half (Home)",
    odds:5.09,

    home:"Real Madrid",
    away:"Barcelona",

    homeShort:"RMA",
    awayShort:"FCB",

    time:"Today 21:00",

    bookmaker:"onebet",

    code:"1XBET1287"
  },


  {
    market:"Highest Scoring Half (Away)",
    odds:4.99,

    home:"Liverpool",
    away:"Arsenal",

    homeShort:"LIV",
    awayShort:"ARS",

    time:"Today 17:30",

    bookmaker:"onebet",

    code:"1XBET5673"
  }

];


/* ======================================================
   ZOOM
====================================================== */

const zoomDatasets = [

  [

    {
      home:"Man City",
      away:"Leicester",
      time:"15:00",
      pick:"Over 1.5 Goals",
      odds:1.45,
      bookmaker:"onebet"
    },

    {
      home:"Chelsea",
      away:"Brentford",
      time:"16:30",
      pick:"Chelsea Win",
      odds:1.62,
      bookmaker:"bet9ja"
    },

    {
      home:"Aston Villa",
      away:"Fulham",
      time:"19:00",
      pick:"Over 2.5 Goals",
      odds:1.70,
      bookmaker:"sporty"
    }

  ],


  [

    {
      home:"Liverpool",
      away:"Crystal Palace",
      time:"17:00",
      pick:"Over 1.5 Goals",
      odds:1.48,
      bookmaker:"betPawa"
    },

    {
      home:"Arsenal",
      away:"Everton",
      time:"18:30",
      pick:"Arsenal Win",
      odds:1.58,
      bookmaker:"sporty"
    },

    {
      home:"Barcelona",
      away:"Girona",
      time:"20:00",
      pick:"Over 2.5 Goals",
      odds:1.66,
      bookmaker:"bet9ja"
    }

  ]

];


/* ======================================================
   LIVE
====================================================== */

let livePredictions = [

  {
    home:"Tottenham",
    away:"Man United",

    homeShort:"TOT",
    awayShort:"MUN",

    score:"0 - 0",

    firstHalf:"45:00",
    secondHalf:"00:00",

    pick:"Over 1.5 Goals",

    odds:1.45,

    bookmaker:"sporty",

    code:"SPB7421",

    publishedAt:Date.now()

  }

];


/* ======================================================
   JACKPOT
====================================================== */

const jackpotPredictions = {

  betPawa:[

    ["Liverpool vs Crystal Palace","1X",1.45],
    ["Man Utd vs Everton","1X",1.60],
    ["Arsenal vs Brentford","Over 1.5",1.70],
    ["Aston Villa vs Fulham","1X",1.65],
    ["Chelsea vs Spurs","Over 2.5",1.72],
    ["Man City vs Leicester","1X",1.55],
    ["Fulham vs West Ham","1X",1.68],
    ["Brighton vs Man Utd","1X",1.68],
    ["Newcastle vs Liverpool","Over 1.5",1.75],
    ["Bournemouth vs Chelsea","Over 2.5",1.72],
    ["Arsenal vs Man City","1X",1.60],
    ["Tottenham vs Aston Villa","Over 1.5",1.65],
    ["Everton vs Wolves","1X",1.70],
    ["Leicester vs Newcastle","1X",1.75],
    ["West Ham vs Brighton","1X",1.68],
    ["Liverpool vs Arsenal","Over 2.5",1.72]

  ],


  sporty:[

    ["Chelsea vs Spurs","Over 1.5",1.50],
    ["Barcelona vs Osasuna","1X",1.62],
    ["Napoli vs Roma","1X",1.75],
    ["Inter Milan vs AC Milan","1X",1.80],
    ["PSG vs Marseille","Over 1.5",1.65],
    ["Man City vs Leicester","1X",1.55],
    ["Arsenal vs Everton","1X",1.62],
    ["Liverpool vs Chelsea","Over 1.5",1.70],
    ["Juventus vs Lazio","1X",1.65],
    ["Bayern vs Mainz","1X",1.50],
    ["Real Madrid vs Betis","1X",1.58],
    ["Milan vs Torino","1X",1.60],
    ["Atletico vs Sevilla","1X",1.64],
    ["Dortmund vs Mainz","Over 1.5",1.70],
    ["PSV vs Ajax","Over 1.5",1.72],
    ["Porto vs Braga","1X",1.55]

  ],


  bet9ja:[

    ["Man City vs Leicester","1X",1.55],
    ["Fulham vs West Ham","1X",1.68],
    ["Aston Villa vs Bournemouth","1X",1.72],
    ["Newcastle vs Liverpool","Over 1.5",1.75],
    ["Brighton vs Man Utd","1X",1.68],
    ["Chelsea vs Spurs","1X",1.60],
    ["Arsenal vs Brentford","Over 1.5",1.72],
    ["Everton vs Wolves","1X",1.70],
    ["Liverpool vs Chelsea","Over 1.5",1.65],
    ["West Ham vs Brighton","1X",1.68],
    ["Man Utd vs Everton","1X",1.60],
    ["Tottenham vs Villa","Over 1.5",1.72],
    ["Barcelona vs Girona","1X",1.55],
    ["Real Madrid vs Getafe","1X",1.48],
    ["PSG vs Marseille","Over 1.5",1.65],
    ["Napoli vs Roma","1X",1.70]

  ],


  onebet:[

    ["Real Madrid vs Betis","1X",1.48],
    ["Inter Milan vs AC Milan","1X",1.70],
    ["Juventus vs Lazio","1X",1.82],
    ["Atletico Madrid vs Sociedad","1X",1.66],
    ["Barcelona vs Girona","1X",1.72],
    ["Liverpool vs Arsenal","Over 1.5",1.70],
    ["Man City vs Leicester","1X",1.55],
    ["Chelsea vs Spurs","Over 1.5",1.68],
    ["Bayern vs Mainz","1X",1.48],
    ["PSG vs Marseille","1X",1.55],
    ["Napoli vs Roma","1X",1.72],
    ["Dortmund vs Mainz","Over 1.5",1.65],
    ["Milan vs Torino","1X",1.58],
    ["Porto vs Braga","1X",1.52],
    ["Ajax vs PSV","Over 1.5",1.62],
    ["Benfica vs Porto","1X",1.70]

  ],


  betway:[]

};


/* ======================================================
   RESULTS
====================================================== */

let results = [

  {
    status:"WIN",
    match:"Man City vs Leicester",
    pick:"Over 2.5",
    date:"28 Aug",
    odds:1.70
  },

  {
    status:"LOSS",
    match:"Chelsea vs Spurs",
    pick:"Both Teams to Score",
    date:"27 Aug",
    odds:1.62
  },

  {
    status:"WIN",
    match:"Real Madrid vs Getafe",
    pick:"Home Win",
    date:"26 Aug",
    odds:1.48
  }

];


/* ======================================================
   STATE
====================================================== */

let selectedJackpot = "betPawa";

let zoomIndex = 0;

let zoomSeconds = 42 * 60 + 18;

let demoTarget = null;

const unlockedCodes = new Set();


/* ======================================================
   HELPERS
====================================================== */

function money(value){

  return "₦" +
    Number(value).toLocaleString(
      "en-NG",
      {
        minimumFractionDigits:0,
        maximumFractionDigits:2
      }
    );

}


function calculateCombinedOdds(items){

  return items.reduce(
    (total,item)=>{

      return total * Number(item[2]);

    },
    1
  );

}


function showToast(message){

  const toast =
    document.getElementById("toast");

  toast.textContent = message;

  toast.classList.add("show");

  setTimeout(
    ()=>{
      toast.classList.remove("show");
    },
    1800
  );

}


/* ======================================================
   BET OF THE DAY
====================================================== */

function renderBetOfDay(){

  const container =
    document.getElementById("betDayGrid");


  container.innerHTML =
    betOfTheDay.map(
      (prediction,index)=>{

        const unlockKey =
          `bet-${index}`;

        const unlocked =
          unlockedCodes.has(unlockKey);


        return `

          <article class="bet-card">

            <div class="market-header">

              <div class="market-name">
                ${prediction.market}
              </div>

              <div class="market-odds">
                ${prediction.odds.toFixed(2)}
              </div>

            </div>


            <div class="match-row">

              <div class="team-box">

                <div class="team-badge">
                  ${prediction.homeShort}
                </div>

                <div class="team-name">
                  ${prediction.home}
                </div>

                <span class="team-side">
                  Home
                </span>

              </div>


              <div class="vs">
                VS
              </div>


              <div class="team-box">

                <div class="team-badge">
                  ${prediction.awayShort}
                </div>

                <div class="team-name">
                  ${prediction.away}
                </div>

                <span class="team-side">
                  Away
                </span>

              </div>

            </div>


            <div class="match-time">
              ◷ ${prediction.time}
            </div>


            <div class="market-detail">
              Market:
              <strong>
                ${prediction.market}
              </strong>
            </div>


            <div class="stake-row">

              <span>
                Stake:
                <strong>₦1,000</strong>
              </span>

              <span>
                Est. Return:
                <strong>
                  ${money(prediction.odds * 1000)}
                </strong>
              </span>

            </div>


            <div class="code-title">
              Code (${bookmakers[prediction.bookmaker].name})
            </div>


            ${
              unlocked

              ?

              `

                <div class="code-row">

                  <input
                    class="code-input"
                    value="${prediction.code}"
                    readonly
                  >

                  <button
                    class="copy-button"
                    data-copy="${prediction.code}"
                    type="button"
                  >
                    COPY CODE
                  </button>

                </div>

              `

              :

              `

                <div class="code-row">

                  <button
                    class="watch-button"
                    data-unlock="${unlockKey}"
                    type="button"
                  >
                    WATCH AD & GET CODE
                  </button>

                </div>

              `
            }


            <div class="bookmaker-row">

              ${
                Object.entries(bookmakers)
                .map(
                  ([key,bookmaker])=>`

                    <button
                      class="
                        bookmaker-button
                        ${key === prediction.bookmaker ? "active" : ""}
                      "
                      data-bookmaker="${key}"
                      type="button"
                    >
                      ${bookmaker.name}
                    </button>

                  `
                )
                .join("")
              }

            </div>

          </article>

        `;

      }
    )
    .join("");

}


/* ======================================================
   LIVE
====================================================== */

function renderLive(){

  const container =
    document.getElementById("liveContainer");


  if(!livePredictions.length){

    container.innerHTML = `

      <div class="live-card">

        No live prediction is active right now.

      </div>

    `;

    return;

  }


  container.innerHTML =
    livePredictions.map(
      (prediction,index)=>`

        <article class="live-card">

          <div class="live-main">

            <div class="team-box">

              <div class="team-badge">
                ${prediction.homeShort}
              </div>

              <div class="team-name">
                ${prediction.home}
              </div>

              <span class="team-side">
                Home
              </span>

            </div>


            <div class="vs">
              VS
            </div>


            <div class="team-box">

              <div class="team-badge">
                ${prediction.awayShort}
              </div>

              <div class="team-name">
                ${prediction.away}
              </div>

              <span class="team-side">
                Away
              </span>

            </div>

          </div>


          <div class="live-score">

            <span>
              Current Score
              <strong>
                ${prediction.score}
              </strong>
            </span>

            <span>
              1st Half
              <strong>
                ${prediction.firstHalf}
              </strong>
            </span>

            <span>
              2nd Half
              <strong>
                ${prediction.secondHalf}
              </strong>
            </span>

          </div>


          <div class="live-prediction">

            <div class="live-code">

              <strong>
                ${prediction.pick}
              </strong>

              <br>

              ${bookmakers[prediction.bookmaker].name}
              ·
              ${prediction.odds.toFixed(2)}

            </div>


            <button
              class="copy-button"
              data-copy="${prediction.code}"
              type="button"
            >
              COPY CODE
            </button>

          </div>


          <div class="live-bookmakers">

            ${
              Object.entries(bookmakers)
              .map(
                ([key,bookmaker])=>`

                  <button
                    class="
                      bookmaker-button
                      ${key === prediction.bookmaker ? "active" : ""}
                    "
                    data-bookmaker="${key}"
                    type="button"
                  >
                    ${bookmaker.name}
                  </button>

                `
              )
              .join("")
            }

          </div>

        </article>

      `
    )
    .join("");

}


/* ======================================================
   ZOOM
====================================================== */

function renderZoom(){

  const container =
    document.getElementById("zoomGrid");

  const dataset =
    zoomDatasets[zoomIndex];


  container.innerHTML =
    dataset.map(
      (prediction,index)=>`

        <article class="zoom-card">

          <div class="zoom-match">

            <div class="zoom-number">
              ${index + 1}
            </div>

            <div>

              <div class="zoom-match-name">

                ${prediction.home}

                <span class="vs">
                  VS
                </span>

                ${prediction.away}

              </div>

              <div class="zoom-match-time">
                ${prediction.time}
              </div>

            </div>

          </div>


          <div class="zoom-pick">

            <span>
              ${prediction.pick}
            </span>

            <strong>
              ${prediction.odds.toFixed(2)}
            </strong>

          </div>


          <div class="zoom-footer">

            <button
              class="bookmaker-button active"
              type="button"
            >
              ${bookmakers[prediction.bookmaker].name}
            </button>


            <button
              class="copy-button"
              data-copy="${bookmakers[prediction.bookmaker].code}"
              type="button"
            >
              COPY CODE
            </button>

          </div>

        </article>

      `
    )
    .join("");

}


/* ======================================================
   JACKPOT
====================================================== */

function renderJackpot(){

  const tabs =
    document.getElementById("bookmakerTabs");

  const content =
    document.getElementById("jackpotContent");


  const bookmakerKeys = [
    "betPawa",
    "sporty",
    "bet9ja",
    "onebet",
    "betway"
  ];


  tabs.innerHTML =
    bookmakerKeys.map(
      key=>`

        <button
          class="
            bookmaker-tab
            ${key === selectedJackpot ? "active" : ""}
          "
          data-jackpot-tab="${key}"
          type="button"
        >
          ${bookmakers[key].name}
        </button>

      `
    )
    .join("");


  const selections =
    jackpotPredictions[selectedJackpot];


  if(!selections || !selections.length){

    content.innerHTML = `

      <div class="jackpot-card">

        Jackpot selections for
        ${bookmakers[selectedJackpot].name}
        have not been added yet.

      </div>

    `;

    updateJackpotCode();

    return;

  }


  const totalOdds =
    calculateCombinedOdds(selections);


  content.innerHTML = `

    <div class="jackpot-card">

      <div class="jackpot-title">

        <strong>
          ${bookmakers[selectedJackpot].name}
        </strong>

        <span>
          16 selections
        </span>

      </div>


      <table class="jackpot-table">

        <thead>

          <tr>
            <th>#</th>
            <th>Match</th>
            <th>Prediction</th>
            <th>Odds</th>
          </tr>

        </thead>


        <tbody>

          ${
            selections.map(
              (item,index)=>`

                <tr>

                  <td>
                    ${index + 1}
                  </td>

                  <td>
                    ${item[0]}
                  </td>

                  <td>
                    ${item[1]}
                  </td>

                  <td>
                    ${item[2].toFixed(2)}
                  </td>

                </tr>

              `
            ).join("")
          }

        </tbody>

      </table>


      <div class="jackpot-total">

        Total Odds:

        <strong>
          ${totalOdds.toFixed(2)}
        </strong>

      </div>


      <div class="jackpot-stake">

        <label>

          Stake:

          <input
            id="jackpotStake"
            type="number"
            min="1"
            value="1000"
          >

        </label>


        <span>

          Est. Return:

          <strong id="jackpotReturn">
            ${money(totalOdds * 1000)}
          </strong>

        </span>

      </div>

    </div>

  `;


  updateJackpotCode();

}


/* ======================================================
   JACKPOT CODE
====================================================== */

function updateJackpotCode(){

  const codeBox =
    document.getElementById("jackpotCode");

  const copyButton =
    document.getElementById("jackpotCopy");


  const unlocked =
    unlockedCodes.has("jackpot");


  if(unlocked){

    codeBox.textContent =
      bookmakers[selectedJackpot].code;

    copyButton.disabled =
      false;

    copyButton.dataset.copy =
      bookmakers[selectedJackpot].code;

  }

  else{

    codeBox.textContent =
      "Your code will appear here";

    copyButton.disabled =
      true;

    copyButton.dataset.copy =
      "";

  }

}


/* ======================================================
   RESULTS
====================================================== */

function renderResults(){

  const container =
    document.getElementById("resultsGrid");


  container.innerHTML =
    results.slice(0,9).map(
      result=>`

        <article class="result-card">

          <span
            class="
              result-status
              ${result.status.toLowerCase()}
            "
          >
            ${result.status}
          </span>


          <div>

            <strong>
              ${result.match}
            </strong>

            <small>
              ${result.pick}
            </small>

          </div>


          <span class="result-date">

            ${result.date}

            <br>

            ${Number(result.odds).toFixed(2)}

          </span>

        </article>

      `
    )
    .join("");

}


/* ======================================================
   REWARDED AD DEVELOPMENT ADAPTER
====================================================== */

/*
  IMPORTANT:

  This is NOT a real advertisement.

  It simply opens the clearly-labelled development
  advertisement so the frontend flow can be tested.

  Later, replace the request() function with the actual
  rewarded-ad provider implementation.

  The provider should call the success/reward callback
  ONLY after the user has actually completed an eligible
  rewarded advertisement.
*/


const RewardedAd = {

  request(){

    openDemoAd();

  }

};


/* ======================================================
   DEMO AD
====================================================== */

function openDemoAd(){

  document
    .getElementById("adModal")
    .classList
    .remove("hidden");

}


function closeDemoAd(){

  document
    .getElementById("adModal")
    .classList
    .add("hidden");

  demoTarget = null;

}


function completeDemoAd(){

  if(!demoTarget){
    return;
  }


  unlockedCodes.add(
    demoTarget
  );


  const completedTarget =
    demoTarget;


  closeDemoAd();


  if(completedTarget.startsWith("bet-")){

    renderBetOfDay();

  }


  if(completedTarget === "jackpot"){

    renderJackpot();

  }


  showToast(
    "Code unlocked ✓"
  );

}


/* ======================================================
   COPY
====================================================== */

async function copyCode(code){

  if(!code){
    return;
  }


  try{

    await navigator.clipboard.writeText(code);

    showToast(
      "Code copied ✓"
    );

  }

  catch{

    showToast(
      "Copy unavailable"
    );

  }

}


/* ======================================================
   CLICK HANDLER
====================================================== */

document.addEventListener(
  "click",
  event=>{


    /* WATCH AD */

    const unlockButton =
      event.target.closest(
        "[data-unlock]"
      );


    if(unlockButton){

      demoTarget =
        unlockButton.dataset.unlock;

      RewardedAd.request();

      return;

    }


    /* COPY */

    const copyButton =
      event.target.closest(
        "[data-copy]"
      );


    if(copyButton){

      const code =
        copyButton.dataset.copy;

      copyCode(code);

      return;

    }


    /* JACKPOT TAB */

    const jackpotTab =
      event.target.closest(
        "[data-jackpot-tab]"
      );


    if(jackpotTab){

      selectedJackpot =
        jackpotTab.dataset.jackpotTab;

      renderJackpot();

      return;

    }


    /* BOOKMAKER BUTTON */

    const bookmakerButton =
      event.target.closest(
        "[data-bookmaker]"
      );


    if(bookmakerButton){

      showToast(
        bookmakers[
          bookmakerButton.dataset.bookmaker
        ].name +
        " selected"
      );

      return;

    }


    /* CLOSE AD */

    if(
      event.target.id ===
      "closeAd"
    ){

      closeDemoAd();

      return;

    }


    /* COMPLETE DEMO AD */

    if(
      event.target.id ===
      "completeAd"
    ){

      completeDemoAd();

      return;

    }

  }
);


/* ======================================================
   JACKPOT STAKE
====================================================== */

document.addEventListener(
  "input",
  event=>{

    if(
      event.target.id !==
      "jackpotStake"
    ){

      return;

    }


    const selections =
      jackpotPredictions[
        selectedJackpot
      ] || [];


    const totalOdds =
      calculateCombinedOdds(
        selections
      );


    const stake =
      Number(
        event.target.value || 0
      );


    const returnElement =
      document.getElementById(
        "jackpotReturn"
      );


    if(returnElement){

      returnElement.textContent =
        money(
          stake * totalOdds
        );

    }

  }
);


/* ======================================================
   TIMERS
====================================================== */

function startTimers(){

  setInterval(
    ()=>{


      /* -----------------------------
         ZOOM TIMER
      ----------------------------- */

      if(zoomSeconds > 0){

        zoomSeconds--;

      }

      else{

        zoomSeconds = 3600;

        zoomIndex++;

        if(
          zoomIndex >=
          zoomDatasets.length
        ){

          zoomIndex = 0;

        }

        renderZoom();

      }


      const zoomMinutes =
        Math.floor(
          zoomSeconds / 60
        );


      const zoomSecondsOnly =
        zoomSeconds % 60;


      document
        .getElementById("zoomTimer")
        .textContent =
        `${String(zoomMinutes).padStart(2,"0")}:${String(zoomSecondsOnly).padStart(2,"0")}`;



      /* -----------------------------
         LIVE TIMER
      ----------------------------- */

      if(!livePredictions.length){

        document
          .getElementById("liveTimer")
          .textContent =
          "00:00:00";

        return;

      }


      const prediction =
        livePredictions[0];


      const totalLiveTime =
        90 * 60 * 1000;


      const elapsed =
        Date.now() -
        prediction.publishedAt;


      const remaining =
        Math.max(
          0,
          totalLiveTime - elapsed
        );


      const hours =
        Math.floor(
          remaining / 3600000
        );


      const minutes =
        Math.floor(
          (remaining % 3600000) /
          60000
        );


      const seconds =
        Math.floor(
          (remaining % 60000) /
          1000
        );


      document
        .getElementById("liveTimer")
        .textContent =
        `${String(hours).padStart(2,"0")}:${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`;


      /* -----------------------------
         EXPIRE LIVE
      ----------------------------- */

      if(remaining <= 0){

        const expired =
          livePredictions.shift();


        results.unshift({

          status:"WIN",

          match:
            `${expired.home} vs ${expired.away}`,

          pick:
            expired.pick,

          date:"Today",

          odds:
            expired.odds

        });


        renderLive();

        renderResults();

      }

    },
    1000
  );

}


/* ======================================================
   MOBILE NAV ACTIVE STATE
====================================================== */

const mobileLinks =
  document.querySelectorAll(
    ".mobile-nav a"
  );


mobileLinks.forEach(
  link=>{

    link.addEventListener(
      "click",
      ()=>{

        mobileLinks.forEach(
          item=>{
            item.classList.remove(
              "active"
            );
          }
        );

        link.classList.add(
          "active"
        );

      }
    );

  }
);


/* ======================================================
   INITIALIZE
====================================================== */

function init(){

  renderBetOfDay();

  renderLive();

  renderZoom();

  renderJackpot();

  renderResults();

  startTimers();

}


init();