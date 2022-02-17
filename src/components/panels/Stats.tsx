import React from "react";
import { useTranslation } from "react-i18next";
import { formatDistance } from "../../domain/geography";
import { getStatsData } from "../../domain/stats";
import { Panel } from "./Panel";

interface StatsProps {
  isOpen: boolean;
  close: () => void;
  distanceUnit: "km" | "miles";
}

export function Stats({ isOpen, close, distanceUnit }: StatsProps) {
  const { t } = useTranslation();
  const { played, winRatio, currentStreak, maxStreak, averageBestDistance } =
    getStatsData();
  return (
    <Panel title={t("stats.title")} isOpen={isOpen} close={close}>
      <div className="flex justify-center">
        <StatsTile value={played} name={"Played"} />
        <StatsTile value={Math.round(winRatio * 100)} name={"Win %"} />
        <StatsTile value={currentStreak} name={"Current Streak"} />
        <StatsTile value={maxStreak} name={"Max Streak"} />
      </div>
      <div className="flex justify-center mt-4">
        <div className="flex flex-col m-2 max-w-min">
          <p className="text-4xl font-bold text-center">
            {formatDistance(averageBestDistance, distanceUnit)}
          </p>
          <p className="text-center">{"Average Best Distance"}</p>
        </div>
      </div>
    </Panel>
  );
}

interface StatsTileProps {
  value: number;
  name: string;
}

function StatsTile({ value, name }: StatsTileProps) {
  return (
    <div className="flex flex-col m-2 max-w-min">
      <p className="text-3xl font-bold text-center">{value}</p>
      <p className="text-center">{name}</p>
    </div>
  );
}
