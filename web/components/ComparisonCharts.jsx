// TractDashboard.jsx
import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import RadarChart from "./RadarChart";

const TractDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/data/tract_comparison.json");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json(); // ✅ get actual JSON
        setData(json);
      } catch (err) {
        console.error("Failed to load tract data:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <div>Loading…</div>;
  if (error) return <div>Error loading data: {error.message}</div>;
  if (!data) return <div>No data</div>;

  return (
    <div style={{ display: "grid", gap: "2rem" }}>
      <GroupedBarChart data={data} />
      {/* <IgsLineChart data={data} /> */}
    </div>
  );
};

/* ───────────────────────── Grouped Bar Chart ───────────────────────── */

function GroupedBarChart({ data }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data) return;

    const tract105 = data.tract_105;
    const tract1100 = data.tract_1100;
    const metrics = ["igs", "growth", "inclusion"];

    const crossSection = metrics.map((m) => ({
      metric: m,
      tract_105: tract105[m].mean,
      tract_1100: tract1100[m].mean,
    }));

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // clear

    const width = 600;
    const height = 400;
    svg.attr("width", width).attr("height", height);

    const margin = { top: 40, right: 20, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x0 = d3
      .scaleBand()
      .domain(crossSection.map((d) => d.metric))
      .range([0, innerWidth])
      .padding(0.2);

    const x1 = d3
      .scaleBand()
      .domain(["tract_105", "tract_1100"])
      .range([0, x0.bandwidth()])
      .padding(0.05);

    const y = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(crossSection, (d) =>
          Math.max(d.tract_105 ?? 0, d.tract_1100 ?? 0)
        ),
      ])
      .nice()
      .range([innerHeight, 0]);

    const color = d3
      .scaleOrdinal()
      .domain(["tract_105", "tract_1100"])
      .range(["#1f77b4", "#ff7f0e"]);

    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(
        d3
          .axisBottom(x0)
          .tickFormat((d) => d.charAt(0).toUpperCase() + d.slice(1))
      );

    g.append("g").call(d3.axisLeft(y));

    const metricGroups = g
      .selectAll(".metric-group")
      .data(crossSection)
      .enter()
      .append("g")
      .attr("class", "metric-group")
      .attr("transform", (d) => `translate(${x0(d.metric)},0)`);

    metricGroups
      .selectAll("rect")
      .data((d) => [
        { tract: "tract_105", value: d.tract_105 },
        { tract: "tract_1100", value: d.tract_1100 },
      ])
      .enter()
      .append("rect")
      .attr("x", (d) => x1(d.tract))
      .attr("y", (d) => y(d.value))
      .attr("width", x1.bandwidth())
      .attr("height", (d) => innerHeight - y(d.value))
      .attr("fill", (d) => color(d.tract));

    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "600")
      .text("Mean Scores by Metric and Tract");

    // Legend
    const legend = g
      .append("g")
      .attr("transform", `translate(${innerWidth - 180}, 0)`);

    ["tract_105", "tract_1100"].forEach((t, i) => {
      const row = legend
        .append("g")
        .attr("transform", `translate(0, ${i * 20})`);
      row
        .append("rect")
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", color(t));
      row
        .append("text")
        .attr("x", 18)
        .attr("y", 10)
        .style("font-size", "12px")
        .text(t === "tract_105" ? tract105.name : tract1100.name);
    });
  }, [data]);

  return (
    <div>
      <svg ref={svgRef} />
    </div>
  );
}

// /* ───────────────────────── IGS Line Chart ───────────────────────── */

// function IgsLineChart({ data }) {
//   const svgRef = useRef(null);

//   useEffect(() => {
//     if (!data) return;

//     const { time_series: ts, tract_105, tract_1100 } = data;

//     const tsData = ts.years.map((year, i) => ({
//       year,
//       igs_105: ts.tract_105_igs[i],
//       igs_1100: ts.tract_1100_igs[i],
//     }));

//     const svg = d3.select(svgRef.current);
//     svg.selectAll("*").remove();

//     const width = 600;
//     const height = 400;
//     svg.attr("width", width).attr("height", height);

//     const margin = { top: 40, right: 20, bottom: 40, left: 60 };
//     const innerWidth = width - margin.left - margin.right;
//     const innerHeight = height - margin.top - margin.bottom;

//     const g = svg
//       .append("g")
//       .attr("transform", `translate(${margin.left},${margin.top})`);

//     const x = d3
//       .scaleLinear()
//       .domain(d3.extent(tsData, (d) => d.year))
//       .range([0, innerWidth]);

//     const y = d3
//       .scaleLinear()
//       .domain([
//         0,
//         d3.max(tsData, (d) => Math.max(d.igs_105 ?? 0, d.igs_1100 ?? 0)),
//       ])
//       .nice()
//       .range([innerHeight, 0]);

//     g.append("g")
//       .attr("transform", `translate(0,${innerHeight})`)
//       .call(d3.axisBottom(x).ticks(tsData.length).tickFormat(d3.format("d")));

//     g.append("g").call(d3.axisLeft(y));

//     const line105 = d3
//       .line()
//       .x((d) => x(d.year))
//       .y((d) => y(d.igs_105));

//     const line1100 = d3
//       .line()
//       .x((d) => x(d.year))
//       .y((d) => y(d.igs_1100));

//     g.append("path")
//       .datum(tsData)
//       .attr("fill", "none")
//       .attr("stroke", "#1f77b4")
//       .attr("stroke-width", 2)
//       .attr("d", line105);

//     g.append("path")
//       .datum(tsData)
//       .attr("fill", "none")
//       .attr("stroke", "#ff7f0e")
//       .attr("stroke-width", 2)
//       .attr("d", line1100);

//     g.append("text")
//       .attr("x", innerWidth / 2)
//       .attr("y", -10)
//       .attr("text-anchor", "middle")
//       .style("font-size", "16px")
//       .style("font-weight", "600")
//       .text("IGS Over Time (2017–2024)");

//     const legend = g
//       .append("g")
//       .attr("transform", `translate(${innerWidth - 200}, 0)`);

//     [
//       { color: "#1f77b4", label: tract_105.name },
//       { color: "#ff7f0e", label: tract_1100.name },
//     ].forEach((item, i) => {
//       const row = legend
//         .append("g")
//         .attr("transform", `translate(0, ${i * 20})`);
//       row
//         .append("line")
//         .attr("x1", 0)
//         .attr("x2", 20)
//         .attr("y1", 6)
//         .attr("y2", 6)
//         .attr("stroke", item.color)
//         .attr("stroke-width", 2);
//       row
//         .append("text")
//         .attr("x", 26)
//         .attr("y", 10)
//         .style("font-size", "12px")
//         .text(item.label);
//     });
//   }, [data]);

//   return (
//     <div>
//       <svg ref={svgRef} />
//     </div>
//   );
// }

/* ───────────────────────── Radar Chart ───────────────────────── */

// function RadarChart({ data }) {
//   const svgRef = useRef(null);

//   useEffect(() => {
//     if (!data) return;
//     const tract105 = data.tract_105;
//     const tract1100 = data.tract_1100;
//     const metrics = ["igs", "growth", "inclusion"];

//     const svg = d3.select(svgRef.current);
//     svg.selectAll("*").remove();

//     const width = 400;
//     const height = 400;
//     svg.attr("width", width).attr("height", height);

//     const radius = Math.min(width, height) / 2 - 40;
//     const center = { x: width / 2, y: height / 2 };

//     const metricLabels = {
//       igs: "IGS",
//       growth: "Growth",
//       inclusion: "Inclusion",
//     };

//     const maxPerMetric = {};
//     metrics.forEach((m) => {
//       maxPerMetric[m] = d3.max([tract105[m].mean ?? 0, tract1100[m].mean ?? 0]);
//     });

//     function buildPoints(tract) {
//       return metrics.map((m, i) => {
//         const angle = (Math.PI * 2 * i) / metrics.length - Math.PI / 2;
//         const value = (tract[m].mean ?? 0) / (maxPerMetric[m] || 1);
//         const r = value * radius;
//         return {
//           x: center.x + r * Math.cos(angle),
//           y: center.y + r * Math.sin(angle),
//         };
//       });
//     }

//     const points105 = buildPoints(tract105);
//     const points1100 = buildPoints(tract1100);

//     const levels = 4;
//     for (let l = 1; l <= levels; l++) {
//       const r = (radius / levels) * l;
//       const circle = d3.path();
//       circle.moveTo(center.x + r, center.y);
//       for (let a = 0; a <= 360; a += 10) {
//         const rad = (a * Math.PI) / 180;
//         circle.lineTo(
//           center.x + r * Math.cos(rad),
//           center.y + r * Math.sin(rad)
//         );
//       }
//       svg
//         .append("path")
//         .attr("d", circle.toString())
//         .attr("fill", "none")
//         .attr("stroke", "#ddd")
//         .attr("stroke-width", 0.5);
//     }

//     metrics.forEach((m, i) => {
//       const angle = (Math.PI * 2 * i) / metrics.length - Math.PI / 2;
//       const x = center.x + radius * Math.cos(angle);
//       const y = center.y + radius * Math.sin(angle);

//       svg
//         .append("line")
//         .attr("x1", center.x)
//         .attr("y1", center.y)
//         .attr("x2", x)
//         .attr("y2", y)
//         .attr("stroke", "#aaa")
//         .attr("stroke-width", 1);

//       svg
//         .append("text")
//         .attr("x", center.x + (radius + 15) * Math.cos(angle))
//         .attr("y", center.y + (radius + 15) * Math.sin(angle))
//         .attr("text-anchor", "middle")
//         .attr("alignment-baseline", "middle")
//         .style("font-size", "12px")
//         .text(metricLabels[m]);
//     });

//     function pointsToString(points) {
//       return points.map((p) => `${p.x},${p.y}`).join(" ");
//     }

//     svg
//       .append("polygon")
//       .attr("points", pointsToString(points105))
//       .attr("fill", "rgba(31,119,180,0.35)")
//       .attr("stroke", "#1f77b4")
//       .attr("stroke-width", 2);

//     svg
//       .append("polygon")
//       .attr("points", pointsToString(points1100))
//       .attr("fill", "rgba(255,127,14,0.35)")
//       .attr("stroke", "#ff7f0e")
//       .attr("stroke-width", 2);

//     svg
//       .append("text")
//       .attr("x", center.x)
//       .attr("y", 24)
//       .attr("text-anchor", "middle")
//       .style("font-size", "16px")
//       .style("font-weight", "600")
//       .text("Tract Profiles (Radar)");

//     const legend = svg.append("g").attr("transform", "translate(10, 10)");

//     [
//       { label: tract105.name, color: "#1f77b4" },
//       { label: tract1100.name, color: "#ff7f0e" },
//     ].forEach((item, i) => {
//       const row = legend
//         .append("g")
//         .attr("transform", `translate(0, ${i * 18})`);
//       row
//         .append("rect")
//         .attr("width", 12)
//         .attr("height", 12)
//         .attr("fill", item.color)
//         .attr("opacity", 0.7);
//       row
//         .append("text")
//         .attr("x", 18)
//         .attr("y", 10)
//         .style("font-size", "12px")
//         .text(item.label);
//     });
//   }, [data]);

//   return (
//     <div>
//       <svg ref={svgRef} />
//     </div>
//   );
// }
{
  /* <div style={{ padding: "1rem", background: "black", borderRadius: "10px" }}>
  <RadarChart />
</div>; */
}

export default TractDashboard;
