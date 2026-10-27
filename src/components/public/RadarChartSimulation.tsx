"use client";

import { useMemo } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface RadarChartSimulationProps {
  scores: Record<string, number>;
  parameters: Array<{ id: string; name: string; slug: string }>;
}

export function RadarChartSimulation({
  scores,
  parameters,
}: RadarChartSimulationProps) {
  const chartData = useMemo(() => {
    return parameters.map((param) => {
      const key = param.slug || param.id;
      const score = scores[key] ?? 75;
      return {
        subject: param.name.replace(" Index", "").replace(" & Elasticity", ""),
        score: score,
        fullMark: 100,
      };
    });
  }, [scores, parameters]);

  return (
    <div className="w-full h-[320px] sm:h-[380px] relative flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
          <PolarGrid stroke="#D4AF37" strokeOpacity={0.25} />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "#F3E5AB", fontSize: 11, fontFamily: "inherit" }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: "#A89F91", fontSize: 10 }}
            stroke="#D4AF37"
            strokeOpacity={0.2}
          />
          <Radar
            name="Biometric Score"
            dataKey="score"
            stroke="#D4AF37"
            strokeWidth={2.5}
            fill="#D4AF37"
            fillOpacity={0.35}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1A130B",
              borderColor: "rgba(212,175,55,0.4)",
              borderRadius: "12px",
              color: "#F5EDE0",
              fontSize: "12px",
            }}
            itemStyle={{ color: "#D4AF37" }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
