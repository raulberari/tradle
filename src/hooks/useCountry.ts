import { csv } from "d3-fetch";
import { useEffect, useMemo, useState } from "react";
import { countriesWithImage, Country, usaStates } from "../domain/countries";

interface DateCountry {
  location: string;
  date: string;
}

export function useCountry(dayString: string): [Country | undefined] {
  const [forcedCountryCode, setForcedCountryCode] = useState("");

  useEffect(() => {
    csv(
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vTzu4A3HsYmBDdbDAlDiGDaFFUvQUQktxNhasfJ036FjamoUVsgUfo4USoam0eLfFCZSBmnWlkSKN1h/pub?gid=2132644661&single=true&output=csv",
      (d) => {
        return { location: d.location, date: d.date };
      }
    ).then((data) => {
      console.log(
        data.length
          ? (
              data.find((el) => el.date === dayString) as DateCountry
            )?.location.toUpperCase() || ""
          : ""
      );
      setForcedCountryCode(
        data.length
          ? (
              data.find((el) => el.date === dayString) as DateCountry
            )?.location.toUpperCase() || ""
          : ""
      );
    });
  }, [dayString]);

  const location = useMemo(() => {
    const forcedCountry =
      forcedCountryCode !== ""
        ? usaStates.find((state) => state.code === forcedCountryCode)
        : undefined;
    return forcedCountry;
  }, [forcedCountryCode]);
  return [location];
}
