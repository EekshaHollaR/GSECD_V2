// server/controllers/analysis.js
const EconomicIndicator = require('../models/EconomicIndicator');

exports.getCorrelationMatrix = async (req, res) => {
  const { indicators, countries } = req.query;
  const indList = indicators.split(',');
  const countryList = countries.split(',');
  
  // Fetch values per country x indicator (latest year)
  const rows = [];
  for (const country of countryList) {
    const row = { country };
    for (const code of indList) {
      const doc = await EconomicIndicator.findOne({ countryCode: country, indicatorCode: code })
        .sort({ year: -1 });
      row[code] = doc ? parseFloat(doc.value.toString()) : 0;
    }
    rows.push(row);
  }

  // Compute correlation coefficients
  // Simple Pearson correlation implementation
  const matrix = rows.map(r => {
    const result = { country: r.country };
    indList.forEach(i1 => {
      const values = rows.map(rr => rr[i1]);
      indList.forEach(i2 => {
        const mean = arr => arr.reduce((a,b)=>a+b,0)/arr.length;
        const cov = values.reduce((sum, v, idx) =>
          sum + (v-mean(values))*(rows[idx][i2]-mean(rows.map(r=>r[i2]))), 0
        )/values.length;
        const std = arr => Math.sqrt(arr.reduce((sum,x)=>sum+(x-mean(arr))**2,0)/arr.length);
        const corr = cov/(std(values)*std(rows.map(r=>r[i2]))) || 0;
        if (i1 === i2) result[i1] = 1;
        else if (indList.indexOf(i2) >= indList.indexOf(i1)) result[i2] = parseFloat(corr.toFixed(2));
      });
    });
    return result;
  });

  res.json({ success:true, data: matrix });
};


