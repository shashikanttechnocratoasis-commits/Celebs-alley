"use client";

import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface RadarDataPoint {
  parameterName: string;
  currentScore: number;
  previousScore?: number;
  fullMark: number;
}

interface ResultsRadarChartProps {
  data: RadarDataPoint[];
  showComparison?: boolean;
}

export function ResultsRadarChart({ data, showComparison }: ResultsRadarChartProps) {
  return (
    <div className="w-full h-72 sm:h-80 select-none">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#D4AF37" strokeOpacity={0.2} />
          <PolarAngleAxis
            dataKey="parameterName"
            stroke="#F5EBDC"
            tick={{ fill: "#D1C2B0", fontSize: 11 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            stroke="#D4AF37"
            strokeOpacity={0.3}
            tick={{ fill: "#9E896C", fontSize: 9 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1A130B",
              borderColor: "#D4AF37",
              borderRadius: "8px",
              fontSize: "12px",
              color: "#F5EBDC",
            }}
          />
          <Radar
            name="Current Scan"
            dataKey="currentScore"
            stroke="#E5A93C"
            fill="#E5A93C"
            fillOpacity={0.4}
          />
          {showComparison && (
            <Radar
              name="Previous Scan"
              dataKey="previousScore"
              stroke="#A855F7"
              fill="#A855F7"
              fillOpacity={0.25}
            />
          )}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
