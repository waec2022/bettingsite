const fs = require('fs');
const data = [
  {
    id: 1,
    league: "Premier League",
    home: "Arsenal",
    away: "Chelsea",
    homeLogo: "https://media.api-sports.io/football/teams/42.png",
    awayLogo: "https://media.api-sports.io/football/teams/49.png",
    time: new Date().toISOString(),
    status: "upcoming",
    statusLabel: "04:00 PM",
    color: "yellow",
    prediction: "Over 1.5",
    odds: "1.40",
    bookmaker: "",
    code: ""
  }
];
fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
console.log("Written to root data.json");
