import React from "react";
import { Treemap } from "d3plus-react";
import { Product, sectionColors } from "../domain/products";
import { formatAbbreviate } from "d3plus-format";

interface TreeMapProps {
  tradeData: any;
}

export const hsId = (prevId: any) => {
  const text = prevId.toString();
  const len = text.length;
  const digit = len + (len % 2) - 2;
  const newId = text.substr(-digit);
  return newId;
};

export const timeFormat = (time: any) => {
  const timeItems = time.split(".").map((d: any) => {
    const n = d.length;
    if (n === 4) return d;
    else if (n === 5) return `${d.slice(0, 4)}-Q${d.slice(4, 5)}`;
    else if (n === 6) return `${d.slice(0, 4)}-${d.slice(4, 6)}`;
    else return "";
  });
  return timeItems.join(".");
};

const tooltipTitle = (bgColor: any, imgUrl: any, title: any) => {
  let tooltip = "<div class='d3plus-tooltip-title-wrapper'>";
  if (bgColor && imgUrl) {
    tooltip += `<div class="icon" style="background-color: ${bgColor}"><img src="${imgUrl}" /></div>`;
  } else if (bgColor) {
    tooltip += `<div class="icon" style="background-color: ${bgColor}">&nbsp;</div>`;
  }
  tooltip += `<div class="title"><span>${title}</span></div>`;
  tooltip += "</div>";
  return tooltip;
};

export const timeTitleFormat = (time: any, isTimeSeriesChart = false) =>
  isTimeSeriesChart
    ? timeFormat(time).replace(".", "-")
    : timeFormat(time)
        .split(".")
        .sort((a: any, b: any) => (a > b ? 1 : -1))
        .join(", ");

function tooltipConfigTitle(d: any, i: any, x: any, that: any) {
  const len = that._groupBy.length;
  const parentName = that._groupBy[0](d);
  let parent = Object.entries(d).find((h: any) => h[1] === parentName) || [
    undefined,
  ];
  let parentId = parent[0];
  if (parentId && parentId.includes(" ID")) {
    parentId = parentId.slice(0, -3);
    parent = Object.entries(d).find((h: any) => h[0] === parentId) || [
      undefined,
    ];
  }
  const itemName = that._groupBy[len - 1](d);
  let item = Object.entries(d).find((h: any) => h[1] === itemName) || [
    undefined,
  ];
  let itemId: string = item?.[0] || "";
  if (itemId && itemId.includes(" ID")) {
    itemId = itemId.slice(0, -3);
    item = Object.entries(d).find((h: any) => h[0] === itemId) || [undefined];
  }
  if (itemId === "ISO 3") {
    itemId = "Country";
    item = Object.entries(d).find((h: any) => h[0] === itemId) || [undefined];
  }
  if (itemId === "id") {
    itemId = "HS4";
    item = Object.entries(d).find((h: any) => h[0] === itemId) || [undefined];
  }

  const title = Array.isArray(item[1])
    ? `Other ${parent[1] || "Values"}`
    : item[1];
  let itemBgImg = ["Country", "Organization"].includes(itemId)
    ? itemId
    : parentId;

  if (itemBgImg === "Section" && !["HS2", "HS4", "HS6"].includes(itemId))
    itemBgImg = "SITC Section";

  // const imgUrl = backgroundImageV2(itemBgImg, d);
  const imgUrl = `https://oec.world/images/icons/hs/hs_${d["Section ID"]}.svg`;
  // const bgColor = "red";
  // const bgColor = findColorV2(itemBgImg, d);
  const bgColor = sectionColors[d["Section ID"]];

  return tooltipTitle(bgColor, imgUrl, title);
}

export function TreeMap({ tradeData }: TreeMapProps) {
  return (
    <Treemap
      config={{
        aggs: {
          "Section ID": (arr: any[]) => arr[0]["Section ID"],
        },
        height: "315",
        data: tradeData.data,
        legend: (config: any, arr: any[]) => arr.length > 1,
        legendConfig: {
          label: "",
          shapeConfig: {
            backgroundImage(d: any) {
              if ("Section ID" in d && !Array.isArray(d.Section)) {
                // return `/images/icons/hs/hs_${d["Section ID"]}.svg`;
                return `https://oec.world/images/icons/hs/hs_${d["Section ID"]}.svg`;
              }
            },
            labelConfig: {
              fontSize: 16,
            },
            height: () => 20,
            width: () => 20,
          },
        },
        legendPosition: "bottom",
        // legendTooltip: {
        //   title: legendTooltipTitle
        // },
        groupBy: ["Section", "HS4"],
        sum: "Trade Value",
        shapeConfig: {
          fill: (d: Product) => {
            return sectionColors[d["Section ID"]];
          },
        },
        tooltipConfig: {
          title(d: any, i: any, x: any) {
            return tooltipConfigTitle(d, i, x, this);
          },
          tbody: (d: any, i: any, x: any) => {
            const tbodyData = [];
            // Look for IDs...
            let idVal: any = [];
            ["Section", "HS2", "HS4", "HS6"].forEach((id) => {
              if (d[`${id} ID`]) {
                idVal = [`${id} ID`, hsId(d[`${id} ID`])];
              }
            });
            if (idVal.length) {
              tbodyData.push(idVal);
            }
            if (d["Trade Value"]) {
              tbodyData.push([
                "Trade Value",
                `$${formatAbbreviate(d["Trade Value"])}`,
              ]);
            }
            if (x && x[0] && x[0].__data__.share) {
              tbodyData.push([
                "Percent",
                `${formatAbbreviate(x[0].__data__.share * 100)}%`,
              ]);
            }

            if (d.Time && d.Time < 203012) {
              const timeOptions: Record<number, string> = {
                4: "Year",
                5: "Quarter",
                6: "Month",
              };

              const timeLength = d.Time.toString().length;
              tbodyData.push([
                timeOptions[timeLength] || "Time",
                timeFormat(d.Time.toString()),
              ]);
            } else if (d.Year && d.Year < 3000) {
              tbodyData.push(["Year", d.Year]);
            }
            return tbodyData;
          },
        },
      }}
    />
  );
}
