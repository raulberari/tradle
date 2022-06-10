const axios = require("axios");
const express = require("express");
const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQYpZcp8BgmlSy88NlxFAX4P6zAom_inxSc1cCBV1-jbppbPSlAsQTr1xNz2PnY2VjKwVTja1qs9drD/pub?output=tsv";

const app = express();
const port = 3001;

app.get("/api/country", async function (req, res, next) {
  const date = req.query.date;
  const data = await axios.get(CSV_URL).then((res) => res.data);
  let jsonData = csvJSON(data);
  if (date) {
    jsonData = jsonData.filter((el) => el["date"] === date)[0];
  }
  res.header("Access-Control-Allow-Origin", "*");
  res.status(200).json(jsonData.code);
});

app.listen(port);

function isNumeric(value) {
  return /^-?\d+$/.test(value);
}
function csvJSON(csv, delimiter = "\t") {
  const lines = csv.replace(/\r/g, "").split("\n");
  const result = [];
  const headers = lines[0].split(delimiter);
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i]) continue;
    const obj = {};
    const currentline = lines[i].split(delimiter);
    for (let j = 0; j < headers.length; j++)
      obj[headers[j]] = isNumeric(currentline[j])
        ? currentline[j] * 1
        : currentline[j];

    result.push(obj);
  }
  return result;
}
