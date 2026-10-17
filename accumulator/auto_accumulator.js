const fs = require('fs');
const path = require('path');

function loadAutoPredictions() {
  const file = path.join(process.cwd(), 'data', 'auto_predictions_latest.json');
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function buildManualHelperAccas() {
  const predictions = loadAutoPredictions();
  const accas = [];

  for (let i = 0; i < 30; i++) {
    const chunk = predictions.slice(i * 5, i * 5 + 5);
    if (!chunk.length) break;
    accas.push({
      id: i + 1,
      risk: i < 5 ? 'SMALL' : i < 15 ? 'MEDIUM' : i < 25 ? 'HIGH' : 'MEGA',
      selections: chunk.map((p) => ({
        fixture_id: p.fixture_id,
        home: p.home,
        away: p.away,
        pick: p.result_tip,
        odd: p.odd
      })),
      totalOdds: Number(chunk.reduce((acc, p) => acc * (p.odd || 1.8), 1).toFixed(2))
    });
  }

  const target = path.join(process.cwd(), 'data', 'auto_accumulators_helper.json');
  fs.writeFileSync(target, JSON.stringify(accas, null, 2), 'utf8');
  return accas;
}

if (require.main === module) {
  buildManualHelperAccas();
}

module.exports = { buildManualHelperAccas };
