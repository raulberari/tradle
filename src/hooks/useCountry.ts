import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import seedrandom from "seedrandom";
import { countriesWithImage, Country } from "../domain/countries";

function isNumeric(value: string) {
  return /^-?\d+$/.test(value);
}
function csvJSON(csv: string, delimiter = "\t") {
  const lines = csv.replace(/\r/g, "").split("\n");
  const result = [];
  const headers = lines[0].split(delimiter);
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i]) continue;
    const obj: any = {};
    const currentline: any = lines[i].split(delimiter);
    for (let j = 0; j < headers.length; j++)
      obj[headers[j]] = isNumeric(currentline[j])
        ? currentline[j] * 1
        : currentline[j];

    result.push(obj);
  }
  return result;
}

const getCountry = async (dayString: string) => {
  const date = new Date(dayString);
  const currDate = `${date.getFullYear()}-${
    date.getMonth() + 1
  }-${date.getDate()}`;
  return await axios
    .get("data.csv")
    .then((res) => csvJSON(res.data, ","))
    .then((data) => {
      return data
        .filter((el) => el["date"] === currDate)[0]
        .country.toUpperCase();
    });
};

export function useCountry(dayString: string): [Country, number, number] {
  const [forcedCountryCode, setForcedCountryCode] = useState("");
  useEffect(() => {
    async function fetchData() {
      const code = await getCountry(dayString.replace("tradle.", ""));
      setForcedCountryCode(code);
    }
    fetchData();
  });
  const country = useMemo(() => {
    const forcedCountry =
      forcedCountryCode !== ""
        ? countriesWithImage.find(
            (country) => country.code === forcedCountryCode
          )
        : undefined;
    return (
      forcedCountry ??
      countriesWithImage.reverse()[
        Math.floor(seedrandom.alea(dayString)() * countriesWithImage.length)
      ]
    );
  }, [forcedCountryCode, dayString]);

  const randomAngle = useMemo(
    () => seedrandom.alea(dayString)() * 360,
    [dayString]
  );

  const imageScale = useMemo(() => {
    const normalizedAngle = 45 - (randomAngle % 90);
    const radianAngle = (normalizedAngle * Math.PI) / 180;
    return 1 / (Math.cos(radianAngle) * Math.sqrt(2));
  }, [randomAngle]);

  return [country, randomAngle, imageScale];
}
