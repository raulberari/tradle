import { DateTime } from "luxon";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";
import {
  countries,
  getCountryName,
  sanitizeCountryName,
  countryISOMapping,
  fictionalCountries,
} from "../domain/countries";
import { useGuesses } from "../hooks/useGuesses";
import { CountryInput } from "./CountryInput";
import * as geolib from "geolib";
import { Share } from "./Share";
import { Guesses } from "./Guesses";
import { useTranslation } from "react-i18next";
import { SettingsData } from "../hooks/useSettings";
import { useMode } from "../hooks/useMode";
import { useCountry } from "../hooks/useCountry";
import axios from "axios";
import { SelectDropdown } from "@mantine/core/lib/components/Select/SelectDropdown/SelectDropdown";

function getRandomDate(start: Date, end: Date): Date {
  const startTimestamp = start.getTime();
  const endTimestamp = end.getTime();
  const randomTimestamp =
    startTimestamp + Math.random() * (endTimestamp - startTimestamp);
  return new Date(randomTimestamp);
}

function getDayString() {
  const startDate = new Date("2023-01-01");
  const endDate = new Date("2024-12-31");

  const randomDate = getRandomDate(startDate, endDate);

  return DateTime.now().toFormat(randomDate.toString());
}

const MAX_TRY_COUNT = 6;

interface GameProps {
  settingsData: SettingsData;
}

export function Game({ settingsData }: GameProps) {
  const { t, i18n } = useTranslation();
  const dayString = useMemo(getDayString, []);
  const isAprilFools = dayString === "2022-04-01";

  const countryInputRef = useRef<HTMLInputElement>(null);

  let [country] = useCountry(`tradle.${dayString}`);
  if (isAprilFools) {
    country = {
      code: "AJ",
      latitude: 42.546245,
      longitude: 1.601554,
      name: "Land of Oz",
    };
  }

  const [ipData, setIpData] = useState(null);
  const [won, setWon] = useState(false);
  const [currentGuess, setCurrentGuess] = useState<string>("");
  const [countryValue, setCountryValue] = useState<string>("");
  const [guesses, addGuess] = useGuesses(dayString);
  const [hideImageMode, setHideImageMode] = useMode(
    "hideImageMode",
    dayString,
    settingsData.noImageMode
  );
  const [rotationMode, setRotationMode] = useMode(
    "rotationMode",
    dayString,
    settingsData.rotationMode
  );

  const gameEnded =
    guesses.length === MAX_TRY_COUNT ||
    guesses[guesses.length - 1]?.distance === 0;

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const getIpData = async () => {
        const res = await axios.get("https://geolocation-db.com/json/");
        setIpData(res.data);
      };
      const items = isAprilFools ? fictionalCountries : countries;
      const guessedCountry = items.find(
        (country) =>
          sanitizeCountryName(
            getCountryName(i18n.resolvedLanguage, country)
          ) === sanitizeCountryName(currentGuess)
      );

      if (guessedCountry == null) {
        toast.error(t("unknownCountry"));
        return;
      }

      const newGuess = {
        name: currentGuess,
        distance: geolib.getDistance(guessedCountry, country),
        direction: geolib.getCompassDirection(guessedCountry, country),
      };

      addGuess(newGuess);
      setCurrentGuess("");
      setCountryValue("");

      if (newGuess.distance === 0) {
        setWon(true);
        getIpData();
        toast.success(t("welldone"), { delay: 2000 });
      }
    },
    [addGuess, country, currentGuess, i18n.resolvedLanguage, t, isAprilFools]
  );

  useEffect(() => {
    const getIpData = async () => {
      const res = await axios.get("https://geolocation-db.com/json/");
      setIpData(res.data);
    };
    if (
      guesses.length === MAX_TRY_COUNT &&
      guesses[guesses.length - 1].distance > 0
    ) {
      toast.info(getCountryName(i18n.resolvedLanguage, country).toUpperCase(), {
        autoClose: false,
        delay: 2000,
      });
      getIpData();
    }
  }, [country, guesses, i18n.resolvedLanguage]);

  useEffect(() => {
    if (ipData) {
      axios.post("/tradle/score", {
        date: new Date(),
        guesses,
        ip: ipData,
        answer: country,
        won,
      });
    }
  }, [guesses, ipData, won, country]);

  let iframeSrc = "https://oec.world/en/tradle/aprilfools.html";
  let oecLink = "https://oec.world/";
  if (!isAprilFools) {
    const country3LetterCode = countryISOMapping[country.code].toLowerCase();
    iframeSrc = `https://oec.world/en/visualize/embed/tree_map/hs92/export/${country3LetterCode}/all/show/2022/?controls=false&title=false&click=false`;
    oecLink = `https://oec.world/en/profile/country/${country3LetterCode}`;
  }

  return (
    <div className="flex-grow flex flex-col mx-2 relative">
      {hideImageMode && !gameEnded && (
        <button
          className="border-2 uppercase my-2 hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-slate-800 dark:active:bg-slate-700"
          type="button"
          onClick={() => setHideImageMode(false)}
        >
          {t("showCountry")}
        </button>
      )}
      {/* <div className="my-1 mx-auto"> */}
      <h2 className="font-bold text-center">
        Guess which country exports these products!
      </h2>
      <div
        style={{
          position: "relative",
          paddingBottom: "70%",
          paddingTop: "25px",
          height: 0,
        }}
      >
        <iframe
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
          title="Country to guess"
          width="390"
          height="315"
          src={iframeSrc}
          frameBorder="0"
        />
      </div>
      {rotationMode && !hideImageMode && !gameEnded && (
        <button
          className="border-2 uppercase mb-2 hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-slate-800 dark:active:bg-slate-700"
          type="button"
          onClick={() => setRotationMode(false)}
        >
          {t("cancelRotation")}
        </button>
      )}
      <Guesses
        rowCount={MAX_TRY_COUNT}
        guesses={guesses}
        settingsData={settingsData}
        countryInputRef={countryInputRef}
        isAprilFools={isAprilFools}
      />
      <div className="my-2">
        {gameEnded ? (
          <>
            <Share
              guesses={guesses}
              dayString={dayString}
              settingsData={settingsData}
              hideImageMode={hideImageMode}
              rotationMode={rotationMode}
              isAprilFools={isAprilFools}
            />
            <a
              className="underline w-full text-center block mt-4 flex justify-center"
              href={oecLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              {t("showOnGoogleMaps")}
            </a>
            {isAprilFools ? (
              <div className="w-full text-center block mt-4 flex flex-col justify-center text-2xl font-bold">
                <div>🐶 🚲 🌪 🏚</div>
                <div>Happy April Fools!</div>
                <div>👠 🤖 🦁 🎍</div>
              </div>
            ) : null}
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="">
              <CountryInput
                countryValue={countryValue}
                setCountryValue={setCountryValue}
                setCurrentGuess={setCurrentGuess}
                isAprilFools={isAprilFools}
              />
              {/* <button
                className="border-2 uppercase my-0.5 hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-slate-800 dark:active:bg-slate-700"
                type="submit"
              >
                🌍 {t("guess")}
              </button> */}
              <div className="text-left">
                <button className="my-2 inline-block justify-end bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded items-center">
                  {isAprilFools ? "🪄" : "🌍"} <span>Guess</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
