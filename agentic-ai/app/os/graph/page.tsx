"use client";

import { useEffect, useRef } from "react";
import cytoscape from "cytoscape";

export default function GraphPage() {
  const cyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!cyRef.current) return;

    fetch("/api/graph/all")
      .then((res) => res.json())
      .then((data) => {
        const elements = [
          ...data.nodes.map((n: any) => ({
            data: { id: n.id, label: n.label, type: n.type },
          })),
          ...data.edges.map((e: any) => ({
            data: { source: e.from, target: e.to, id: e.id },
          })),
        ];

        cytoscape({
          container: cyRef.current,
          elements,
          style: [
            {
              selector: "node",
              style: {
                "background-color": (el) =>
                  el.data("type") === "note"
                    ? "#6d28d9"
                    : el.data("type") === "task"
                    ? "#2563eb"
                    : el.data("type") === "journal"
                    ? "#dc2626"
                    : el.data("type") === "habit"
                    ? "#16a34a"
                    : "#52525b",
                label: "data(label)",
                color: "#fff",
                "font-size": "11px",
                "text-wrap": "wrap",
                "text-max-width": "80px",
              },
            },
            {
              selector: "edge",
              style: {
                width: 2,
                "line-color": "#a1a1aa",
                "target-arrow-color": "#a1a1aa",
                "target-arrow-shape": "triangle",
                "curve-style": "bezier",
              },
            },
          ],
          layout: {
            name: "cose",
            animate: true,
            padding: 20,
          },
        });
      });
  }, []);

  return (
    <div className="space-y-4 h-[85vh] flex flex-col">
      <h1 className="text-xl font-semibold">Knowledge Graph</h1>
      <p className="text-muted-foreground text-sm">
        Your graph updates automatically as the AI links notes, tasks, journals,
        habits, and insights.
      </p>

      <div ref={cyRef} className="flex-1 rounded-xl border bg-card shadow-sm" />
    </div>
  );
}
