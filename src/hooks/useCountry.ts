import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import seedrandom from "seedrandom";
import { countriesWithImage, Country } from "../domain/countries";

const getCountry = async (dateSring: string) => {
  const date = new Date(dateSring);
  return await axios
    .get<string>(
      `http://localhost:3001/api/country?date=${date.getFullYear()}-${
        date.getMonth() + 1
      }-${date.getDate()}`
    )
    .then((res) => res.data)
    .then((data) => data);
};

export function useCountry(dayString: string): [Country, number, number] {
  const [forcedCountryCode, setForcedCountryCode] = useState("");
  useEffect(() => {
    async function fetchData() {
      const code = await getCountry(dayString);
      setForcedCountryCode(code);
    }
    fetchData();
  });
  const country = useMemo(() => {
    const forcedCountry =
      forcedCountryCode !== ""
        ? countriesWithImage.find(
            (country) => country.code === forcedCountryCode.toUpperCase()
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
