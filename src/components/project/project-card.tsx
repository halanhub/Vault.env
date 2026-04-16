"use client";

import { formatRelativeTime } from "@/lib/utils";
import { Timestamp } from "firebase/firestore";
import { icons } from "lucide-react";

interface ProjectCardProps {
  id: string;
  name: string;
  icon: string;
  imageUrl?: string;
  updatedAt: Timestamp;
  onClick: () => void;
  index: number;
}

export function ProjectCard({ name, icon, imageUrl, updatedAt, onClick }: ProjectCardProps) {
  const IconComponent = icons[icon as keyof typeof icons] ?? icons.Folder;
  const date = updatedAt?.toDate?.() ?? new Date();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      style={{
        backgroundColor: "#fff",
        border: "2px solid #000",
        borderRadius: 28,
        padding: "24px",
        boxShadow: "6px 6px 0 0 #000",
        cursor: "pointer",
        transition: "transform 0.12s, box-shadow 0.12s",
        userSelect: "none",
        outline: "none",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translate(-2px,-2px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "8px 8px 0 0 #000";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translate(0,0)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "6px 6px 0 0 #000";
      }}
      onMouseDown={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translate(3px,3px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "3px 3px 0 0 #000";
      }}
    >
      {/* Logo / Icon */}
      <div style={{
        width: 52, height: 52, marginBottom: 20,
        display: "flex", alignItems: "center", justifyContent: "center",
        borderRadius: 16, border: "2px solid #000",
        backgroundColor: imageUrl ? "transparent" : "#C1F0C1",
        overflow: "hidden",
        flexShrink: 0,
      }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            loading="lazy"
            decoding="async"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
        ) : (
          <IconComponent size={24} strokeWidth={2.5} />
        )}
      </div>

      {/* Name */}
      <h3 style={{
        margin: "0 0 6px",
        fontSize: 18, fontWeight: 900,
        letterSpacing: "-0.03em", lineHeight: 1.2,
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>
        {name}
      </h3>

      {/* Last edited */}
      <p style={{ margin: 0, fontSize: 13, color: "#9ca3af", fontWeight: 500 }}>
        {formatRelativeTime(date)}
      </p>
    </div>
  );
}
