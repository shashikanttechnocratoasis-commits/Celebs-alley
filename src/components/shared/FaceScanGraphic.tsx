"use client";

import React from "react";
import { motion } from "framer-motion";

interface FaceScanGraphicProps {
  className?: string;
  showScanLine?: boolean;
  showMesh?: boolean;
  showLandmarks?: boolean;
  showZones?: boolean;
  showGrid?: boolean;
  animated?: boolean;
  highlightedZone?: "hydration" | "pigmentation" | "texture" | "redness" | "all";
}

export function FaceScanGraphic({
  className = "",
  showScanLine = true,
  showMesh = true,
  showLandmarks = true,
  showZones = true,
  animated = true,
  highlightedZone = "all",
}: FaceScanGraphicProps) {
  // 68 Facial Landmarks for high-fidelity biometric visual representation
  const landmarks = [
    // Jawline
    { cx: 80, cy: 155 }, { cx: 88, cy: 185 }, { cx: 102, cy: 215 }, { cx: 122, cy: 242 },
    { cx: 150, cy: 260 }, { cx: 178, cy: 242 }, { cx: 198, cy: 215 }, { cx: 212, cy: 185 }, { cx: 220, cy: 155 },
    // Eyebrows
    { cx: 105, cy: 110 }, { cx: 120, cy: 105 }, { cx: 135, cy: 108 },
    { cx: 165, cy: 108 }, { cx: 180, cy: 105 }, { cx: 195, cy: 110 },
    // Eyes
    { cx: 112, cy: 126 }, { cx: 128, cy: 124 }, { cx: 138, cy: 128 }, { cx: 128, cy: 132 }, // Left
    { cx: 162, cy: 128 }, { cx: 172, cy: 124 }, { cx: 188, cy: 126 }, { cx: 172, cy: 132 }, // Right
    // Nose Bridge & Tip
    { cx: 150, cy: 120 }, { cx: 150, cy: 140 }, { cx: 150, cy: 160 }, { cx: 150, cy: 175 },
    { cx: 138, cy: 178 }, { cx: 162, cy: 178 },
    // Cheeks / Zones
    { cx: 105, cy: 165 }, { cx: 120, cy: 185 }, { cx: 180, cy: 185 }, { cx: 195, cy: 165 },
    // Forehead
    { cx: 130, cy: 75 }, { cx: 150, cy: 68 }, { cx: 170, cy: 75 },
    { cx: 115, cy: 88 }, { cx: 150, cy: 88 }, { cx: 185, cy: 88 },
    // Lips
    { cx: 132, cy: 208 }, { cx: 142, cy: 202 }, { cx: 150, cy: 203 }, { cx: 158, cy: 202 }, { cx: 168, cy: 208 },
    { cx: 160, cy: 218 }, { cx: 150, cy: 220 }, { cx: 140, cy: 218 },
  ];

  return (
    <div
      className={`relative w-full aspect-[3/4] flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-[#1A130B] via-[#0E0A07] to-[#0B0907] select-none ${className}`}
      aria-label="Facial Biometric Scanning Visualization"
    >
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(201,154,69,0.15),transparent_70%)]" />

      {/* Primary SVG Biometric Graphic */}
      <svg
        viewBox="0 0 300 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full p-4 drop-shadow-[0_0_20px_rgba(201,154,69,0.2)]"
      >
        <defs>
          {/* Gold Gradient */}
          <linearGradient id="goldMeshGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E8C77A" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#C99A45" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#B8812F" stopOpacity="0.1" />
          </linearGradient>

          {/* Scan Line Gradient */}
          <linearGradient id="laserGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="20%" stopColor="#C99A45" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#FFE082" stopOpacity="1" />
            <stop offset="80%" stopColor="#C99A45" stopOpacity="0.8" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>

          {/* Zone Glow Gradients */}
          <radialGradient id="hydrationZone" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6FA3C7" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#6FA3C7" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="pigmentationZone" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E0A93B" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#E0A93B" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="rednessZone" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#D4604F" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#D4604F" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="textureZone" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#B682D9" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#B682D9" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 1. Target Bounding Frame & Corner Reticles */}
        <g stroke="#C99A45" strokeOpacity="0.4" strokeWidth="1.5">
          {/* Top-Left */}
          <path d="M 30 50 L 30 30 L 50 30" />
          {/* Top-Right */}
          <path d="M 270 50 L 270 30 L 250 30" />
          {/* Bottom-Left */}
          <path d="M 30 310 L 30 330 L 50 330" />
          {/* Bottom-Right */}
          <path d="M 270 310 L 270 330 L 250 330" />

          {/* Center Crosshair Sub-ticks */}
          <line x1="150" y1="20" x2="150" y2="28" strokeOpacity="0.6" />
          <line x1="150" y1="332" x2="150" y2="340" strokeOpacity="0.6" />
          <line x1="20" y1="180" x2="28" y2="180" strokeOpacity="0.6" />
          <line x1="272" y1="180" x2="280" y2="180" strokeOpacity="0.6" />
        </g>

        {/* 2. Stylized Face Silhouette Outer Contour */}
        <path
          d="M 150 48 
             C 215 48, 235 95, 235 155
             C 235 225, 185 272, 150 278
             C 115 272, 65 225, 65 155
             C 65 95, 85 48, 150 48 Z"
          fill="#140E08"
          stroke="#C99A45"
          strokeWidth="1.5"
          strokeOpacity="0.6"
          strokeDasharray="4 2"
        />

        {/* 3. Color-Coded Skin Analysis Zones */}
        {showZones && (
          <g>
            {/* Forehead - Hydration & Texture */}
            {(highlightedZone === "all" || highlightedZone === "hydration") && (
              <ellipse cx="150" cy="88" rx="42" ry="24" fill="url(#hydrationZone)" />
            )}

            {/* Right Cheek (Observer Right) - Pigmentation */}
            {(highlightedZone === "all" || highlightedZone === "pigmentation") && (
              <ellipse cx="185" cy="175" rx="28" ry="22" fill="url(#pigmentationZone)" />
            )}

            {/* Left Cheek (Observer Left) - Redness & Sensitivity */}
            {(highlightedZone === "all" || highlightedZone === "redness") && (
              <ellipse cx="115" cy="175" rx="28" ry="22" fill="url(#rednessZone)" />
            )}

            {/* Chin / Jaw - Texture & Pores */}
            {(highlightedZone === "all" || highlightedZone === "texture") && (
              <ellipse cx="150" cy="245" rx="26" ry="16" fill="url(#textureZone)" />
            )}
          </g>
        )}

        {/* 4. Delaunay / Triangular Topology Mesh */}
        {showMesh && (
          <g stroke="url(#goldMeshGrad)" strokeWidth="0.75" strokeOpacity="0.55">
            {/* Forehead Triangles */}
            <polygon points="150,48 130,75 150,68" />
            <polygon points="150,48 170,75 150,68" />
            <polygon points="130,75 115,88 150,88" />
            <polygon points="170,75 185,88 150,88" />
            <polygon points="115,88 85,95 105,110" />
            <polygon points="185,88 215,95 195,110" />
            <polygon points="115,88 105,110 135,108" />
            <polygon points="185,88 195,110 165,108" />
            <polygon points="115,88 150,88 135,108" />
            <polygon points="185,88 150,88 165,108" />
            <polygon points="135,108 165,108 150,120" />

            {/* Eye & Orbital Triangles */}
            <polygon points="105,110 112,126 128,124" />
            <polygon points="105,110 128,124 135,108" />
            <polygon points="195,110 188,126 172,124" />
            <polygon points="195,110 172,124 165,108" />
            <polygon points="112,126 128,132 138,128" />
            <polygon points="112,126 138,128 128,124" />
            <polygon points="188,126 172,132 162,128" />
            <polygon points="188,126 162,128 172,124" />

            {/* Nose Bridge & Cheeks */}
            <polygon points="135,108 150,120 150,140" />
            <polygon points="165,108 150,120 150,140" />
            <polygon points="138,128 150,140 138,165" />
            <polygon points="162,128 150,140 162,165" />
            <polygon points="150,140 150,175 138,178" />
            <polygon points="150,140 150,175 162,178" />
            <polygon points="112,126 80,155 105,165" />
            <polygon points="188,126 220,155 195,165" />
            <polygon points="105,165 138,165 120,185" />
            <polygon points="195,165 162,165 180,185" />
            <polygon points="80,155 88,185 105,165" />
            <polygon points="220,155 212,185 195,165" />
            <polygon points="88,185 102,215 120,185" />
            <polygon points="212,185 198,215 180,185" />

            {/* Mouth & Chin */}
            <polygon points="138,178 162,178 150,203" />
            <polygon points="138,178 120,185 132,208" />
            <polygon points="162,178 180,185 168,208" />
            <polygon points="132,208 150,203 150,220" />
            <polygon points="168,208 150,203 150,220" />
            <polygon points="132,208 140,218 150,220" />
            <polygon points="168,208 160,218 150,220" />
            <polygon points="102,215 122,242 140,218" />
            <polygon points="198,215 178,242 160,218" />
            <polygon points="140,218 150,220 150,260" />
            <polygon points="160,218 150,220 150,260" />
            <polygon points="122,242 150,260 150,278" />
            <polygon points="178,242 150,260 150,278" />
          </g>
        )}

        {/* 5. Biometric Landmark Dots */}
        {showLandmarks && (
          <g>
            {landmarks.map((lm, idx) => (
              <circle
                key={idx}
                cx={lm.cx}
                cy={lm.cy}
                r="2"
                fill="#FFE082"
                className={animated ? "animate-pulse" : ""}
                style={{
                  animationDuration: `${1.5 + (idx % 4) * 0.4}s`,
                  animationDelay: `${(idx % 6) * 0.15}s`,
                }}
              />
            ))}
          </g>
        )}

        {/* 6. Active Multi-Spectral Region Boxes & Badges */}
        <g stroke="#E8C77A" strokeWidth="0.75" strokeDasharray="2 2" strokeOpacity="0.8">
          {/* Forehead Box */}
          <rect x="120" y="72" width="60" height="24" rx="4" />
          {/* Left Cheek Box */}
          <rect x="95" y="155" width="40" height="35" rx="4" />
          {/* Right Cheek Box */}
          <rect x="165" y="155" width="40" height="35" rx="4" />
        </g>
      </svg>

      {/* 7. Sweeping Laser Scan Line with CSS/Framer Motion */}
      {showScanLine && (
        <div
          className={`absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFE082] to-transparent shadow-[0_0_15px_#D4AF37] pointer-events-none ${
            animated ? "animate-[scan_3.2s_ease-in-out_infinite]" : ""
          }`}
        />
      )}

      {/* 8. HUD Corner Coordinate Callouts */}
      <div className="absolute top-2 left-3 text-[9px] font-mono text-[#E8C77A]/70 uppercase tracking-wider">
        FOV: 78° • SPECTRAL: 8-CH
      </div>
      <div className="absolute top-2 right-3 text-[9px] font-mono text-emerald-400/90 tracking-widest">
        LOCK 99.4%
      </div>
      <div className="absolute bottom-2 left-3 text-[9px] font-mono text-[#C99A45]/80">
        AI-BIOMARKER MATRIX
      </div>
      <div className="absolute bottom-2 right-3 text-[9px] font-mono text-[#E8C77A]/70">
        v3.2 LOCAL
      </div>
    </div>
  );
}
