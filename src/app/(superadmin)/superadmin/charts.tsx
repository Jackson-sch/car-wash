"use client";

import { useRef, useEffect } from "react";
import * as d3 from "d3";
import { formatCurrency } from "@/lib/formats";

interface RevenueItem { mes: string; total: string }
interface GrowthItem { mes: string; total: number }

// ─── Revenue Chart ────────────────────────────────────────────────────────────
export function RevenueChart({ data }: { data: RevenueItem[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || data.length === 0) return;

    const style = getComputedStyle(containerRef.current);

    // ── Colores desde tu sistema de diseño ──────────────────────────────────
    // Usa --chart-1 (#0ea5e9 sky-500) y --chart-2 (#0284c7 sky-600)
    // que ya están definidos en tu globals.css para ambos modos.
    const colorTop    = style.getPropertyValue("--chart-1").trim()   || "#0ea5e9";
    const colorBot    = style.getPropertyValue("--chart-2").trim()   || "#0284c7";
    const colorMuted  = style.getPropertyValue("--muted-foreground").trim() || "#5e5f65";
    const colorBorder = style.getPropertyValue("--border").trim()    || "#d4d4db";

    // Resuelve valores oklch/hsl a hex si es necesario usando el propio browser
    const resolveColor = (raw: string) => {
      if (!raw || raw === "") return "#0ea5e9";
      const tmp = document.createElement("div");
      tmp.style.color = raw;
      document.body.appendChild(tmp);
      const computed = getComputedStyle(tmp).color;
      document.body.removeChild(tmp);
      return computed;
    };

    const c1      = resolveColor(colorTop);
    const c2      = resolveColor(colorBot);
    const cMuted  = resolveColor(colorMuted);
    const cBorder = resolveColor(colorBorder);

    // ── Setup SVG ────────────────────────────────────────────────────────────
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 16, bottom: 28, left: 52 };
    const rect   = containerRef.current.getBoundingClientRect();
    const width  = rect.width;
    const height = 200;
    const innerW = width  - margin.left - margin.right;
    const innerH = height - margin.top  - margin.bottom;

    const chartData = data.map((d) => ({ mes: d.mes, value: parseFloat(d.total) }));

    // ── Escalas ──────────────────────────────────────────────────────────────
    const xScale = d3.scaleBand()
      .domain(chartData.map((d) => d.mes))
      .range([0, innerW])
      .padding(0.38);

    const maxVal = d3.max(chartData, (d) => d.value) || 1;
    const yScale = d3.scaleLinear()
      .domain([0, maxVal * 1.14])
      .range([innerH, 0]);

    // ── Gradientes ───────────────────────────────────────────────────────────
    const defs = svg.append("defs");

    // Gradiente normal: sky-500 arriba → sky-600 con 55% opacidad abajo
    const barGrad = defs.append("linearGradient")
      .attr("id", "barGrad")
      .attr("x1", "0").attr("y1", "0")
      .attr("x2", "0").attr("y2", "1");
    barGrad.append("stop").attr("offset", "0%").attr("stop-color", c1).attr("stop-opacity", "1");
    barGrad.append("stop").attr("offset", "100%").attr("stop-color", c2).attr("stop-opacity", "0.05");

    // Gradiente hover: sky-500 sólido
    const barGradHover = defs.append("linearGradient")
      .attr("id", "barGradHover")
      .attr("x1", "0").attr("y1", "0")
      .attr("x2", "0").attr("y2", "1");
    barGradHover.append("stop").attr("offset", "0%").attr("stop-color", c1).attr("stop-opacity", "1");
    barGradHover.append("stop").attr("offset", "100%").attr("stop-color", c1).attr("stop-opacity", "0.05");

    // ── Grupo principal ──────────────────────────────────────────────────────
    svg
      .attr("width", width)
      .attr("height", height);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // ── Grid lines ───────────────────────────────────────────────────────────
    g.append("g")
      .call(d3.axisLeft(yScale).ticks(5).tickSize(-innerW).tickFormat(() => ""))
      .selectAll(".tick line")
      .attr("stroke", cBorder)
      .attr("stroke-dasharray", "3,4")
      .attr("opacity", 0.5);
    g.selectAll(".domain").remove();

    // ── Eje Y (labels) ───────────────────────────────────────────────────────
    g.append("g")
      .call(
        d3.axisLeft(yScale)
          .ticks(5)
          .tickFormat((d) => `S/${d3.format("~s")(d as number)}`)
      )
      .selectAll("text")
      .attr("fill", cMuted)
      .attr("font-size", "10px")
      .attr("font-weight", "500");
    g.selectAll(".domain").attr("stroke", "none");

    // ── Eje X ────────────────────────────────────────────────────────────────
    g.append("g")
      .attr("transform", `translate(0,${innerH})`)
      .call(d3.axisBottom(xScale).tickSize(0))
      .call((ax) => ax.select(".domain").attr("stroke", cBorder).attr("opacity", 0.5))
      .selectAll("text")
      .attr("fill", cMuted)
      .attr("font-size", "9.5px")
      .attr("dy", "1.2em");

    // ── Barras con animación ─────────────────────────────────────────────────
    const bars = g.selectAll(".bar")
      .data(chartData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x",      (d) => xScale(d.mes)!)
      .attr("y",      innerH)
      .attr("width",  xScale.bandwidth())
      .attr("height", 0)
      .attr("fill",   "url(#barGrad)")
      .attr("rx",     5)
      .attr("ry",     5);

    bars
      .transition()
      .duration(700)
      .delay((_, i) => i * 65)
      .ease(d3.easeCubicOut)
      .attr("y",      (d) => yScale(d.value))
      .attr("height", (d) => innerH - yScale(d.value));

    // ── Tooltip ──────────────────────────────────────────────────────────────
    // Usamos var(--card) directamente (no hsl()) porque --card ya contiene
    // el valor completo (hex en light, oklch en dark).
    const tooltip = d3.select(containerRef.current)
      .append("div")
      .style("position",        "absolute")
      .style("background",      "var(--card)")
      .style("border",          "1px solid var(--border)")
      .style("border-radius",   "10px")
      .style("padding",         "7px 13px")
      .style("font-size",       "11px")
      .style("box-shadow",      "0 8px 24px rgba(0,0,0,0.25)")
      .style("pointer-events",  "none")
      .style("opacity",         "0")
      .style("z-index",         "50")
      .style("transition",      "opacity 0.12s")
      .style("color",           "var(--foreground)");

    // Área de hit transparente sobre las barras
    g.selectAll(".bar-hit")
      .data(chartData)
      .enter()
      .append("rect")
      .attr("class",  "bar-hit")
      .attr("x",      (d) => xScale(d.mes)!)
      .attr("y",      0)
      .attr("width",  xScale.bandwidth())
      .attr("height", innerH)
      .attr("fill",   "transparent")
      .on("mouseenter", (_, d) => {
        // Highlight la barra correspondiente
        g.selectAll<SVGRectElement, typeof d>(".bar")
          .filter((b) => b.mes === d.mes)
          .attr("fill", "url(#barGradHover)");

        tooltip
          .style("opacity", "1")
          .html(
            `<div style="font-weight:600;color:hsl(var(--foreground));margin-bottom:2px">${d.mes}</div>` +
            `<div style="color:var(--chart-1);font-weight:700;font-size:13px">${formatCurrency(d.value)}</div>`
          );
      })
      .on("mousemove", (event) => {
        const [mx, my] = d3.pointer(event, containerRef.current);
        tooltip
          .style("left", `${Math.min(mx + 14, rect.width - 120)}px`)
          .style("top",  `${my - 52}px`);
      })
      .on("mouseleave", (_, d) => {
        g.selectAll<SVGRectElement, typeof d>(".bar")
          .filter((b) => b.mes === d.mes)
          .attr("fill", "url(#barGrad)");
        tooltip.style("opacity", "0");
      });

    return () => {
      if (svgRef.current) {
        d3.select(svgRef.current).selectAll("*").remove();
      }
    };
  }, [data]);

  return (
    <div className="bg-card border border-border p-6 rounded-2xl shadow-sm relative overflow-hidden">
      <h3 className="text-sm font-bold text-foreground mb-1">Ingresos Mensuales</h3>
      <p className="text-[10px] text-muted-foreground mb-3">Facturación total del sistema</p>
      <div ref={containerRef} className="relative">
        <svg ref={svgRef} className="w-full" />
      </div>
    </div>
  );
}

// ─── Growth Chart ─────────────────────────────────────────────────────────────
export function GrowthChart({ data }: { data: GrowthItem[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || data.length === 0) return;

    const style = getComputedStyle(containerRef.current);

    // ── Colores ──────────────────────────────────────────────────────────────
    // Usa --chart-growth y --chart-growth-light que debes agregar en globals.css
    // (ver comentario al final del archivo)
    const colorLineRaw  = style.getPropertyValue("--chart-growth").trim()       || "#10b981";
    const colorAreaRaw  = style.getPropertyValue("--chart-growth-light").trim() || "#34d399";
    const colorMuted    = style.getPropertyValue("--muted-foreground").trim()   || "#5e5f65";
    const colorBorder   = style.getPropertyValue("--border").trim()             || "#d4d4db";

    const resolveColor = (raw: string) => {
      if (!raw) return "#10b981";
      const tmp = document.createElement("div");
      tmp.style.color = raw;
      document.body.appendChild(tmp);
      const computed = getComputedStyle(tmp).color;
      document.body.removeChild(tmp);
      return computed;
    };

    const cLine   = resolveColor(colorLineRaw);
    const cArea   = resolveColor(colorAreaRaw);
    const cMuted  = resolveColor(colorMuted);
    const cBorder = resolveColor(colorBorder);

    // ── Setup SVG ────────────────────────────────────────────────────────────
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 16, bottom: 28, left: 44 };
    const rect   = containerRef.current.getBoundingClientRect();
    const width  = rect.width;
    const height = 200;
    const innerW = width  - margin.left - margin.right;
    const innerH = height - margin.top  - margin.bottom;

    const chartData = data.map((d) => ({ mes: d.mes, value: d.total }));

    // ── Escalas ──────────────────────────────────────────────────────────────
    const xScale = d3.scalePoint()
      .domain(chartData.map((d) => d.mes))
      .range([0, innerW]);

    const maxVal = d3.max(chartData, (d) => d.value) || 1;
    const yScale = d3.scaleLinear()
      .domain([0, maxVal * 1.22])
      .range([innerH, 0]);

    // ── Gradiente área ────────────────────────────────────────────────────────
    const defs = svg.append("defs");

    const areaGrad = defs.append("linearGradient")
      .attr("id", "areaGrad")
      .attr("x1", "0").attr("y1", "0")
      .attr("x2", "0").attr("y2", "1");
    areaGrad.append("stop").attr("offset", "0%").attr("stop-color", cArea).attr("stop-opacity", "0.3");
    areaGrad.append("stop").attr("offset", "80%").attr("stop-color", cLine).attr("stop-opacity", "0.03");

    // ── Grupo principal ──────────────────────────────────────────────────────
    svg
      .attr("width", width)
      .attr("height", height);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // ── Grid lines ───────────────────────────────────────────────────────────
    g.append("g")
      .call(d3.axisLeft(yScale).ticks(5).tickSize(-innerW).tickFormat(() => ""))
      .selectAll(".tick line")
      .attr("stroke", cBorder)
      .attr("stroke-dasharray", "3,4")
      .attr("opacity", 0.5);
    g.selectAll(".domain").remove();

    // ── Eje Y ────────────────────────────────────────────────────────────────
    g.append("g")
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d3.format("d")))
      .selectAll("text")
      .attr("fill", cMuted)
      .attr("font-size", "10px")
      .attr("font-weight", "500");
    g.selectAll(".domain").attr("stroke", "none");

    // ── Eje X ────────────────────────────────────────────────────────────────
    g.append("g")
      .attr("transform", `translate(0,${innerH})`)
      .call(d3.axisBottom(xScale).tickSize(0))
      .call((ax) => ax.select(".domain").attr("stroke", cBorder).attr("opacity", 0.5))
      .selectAll("text")
      .attr("fill", cMuted)
      .attr("font-size", "9.5px")
      .attr("dy", "1.2em");

    // ── Área rellena ──────────────────────────────────────────────────────────
    const areaGen = d3.area<{ mes: string; value: number }>()
      .x((d) => xScale(d.mes)!)
      .y0(innerH)
      .y1((d) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(chartData)
      .attr("fill", "url(#areaGrad)")
      .attr("d", areaGen);

    // ── Línea con animación ───────────────────────────────────────────────────
    const lineGen = d3.line<{ mes: string; value: number }>()
      .x((d) => xScale(d.mes)!)
      .y((d) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    const path = g.append("path")
      .datum(chartData)
      .attr("fill",         "none")
      .attr("stroke",       cLine)
      .attr("stroke-width", 2.5)
      .attr("d",            lineGen);

    const totalLength = path.node()?.getTotalLength() ?? 0;
    path
      .attr("stroke-dasharray",  totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(900)
      .ease(d3.easeCubicOut)
      .attr("stroke-dashoffset", 0);

    // ── Dots ─────────────────────────────────────────────────────────────────
    g.selectAll(".dot")
      .data(chartData)
      .enter()
      .append("circle")
      .attr("class",        "dot")
      .attr("cx",           (d) => xScale(d.mes)!)
      .attr("cy",           (d) => yScale(d.value))
      .attr("r",            0)
      .attr("fill",         cLine)
      .attr("stroke",       "hsl(var(--card))")
      .attr("stroke-width", 2.5)
      .transition()
      .duration(380)
      .delay((_, i) => 700 + i * 70)
      .attr("r", 4.5);

    // ── Tooltip ──────────────────────────────────────────────────────────────
    const tooltip = d3.select(containerRef.current)
      .append("div")
      .style("position",        "absolute")
      .style("background",      "var(--card)")
      .style("border",          "1px solid var(--border)")
      .style("border-radius",   "10px")
      .style("padding",         "7px 13px")
      .style("font-size",       "11px")
      .style("box-shadow",      "0 8px 24px rgba(0,0,0,0.25)")
      .style("pointer-events",  "none")
      .style("opacity",         "0")
      .style("z-index",         "50")
      .style("transition",      "opacity 0.12s")
      .style("color",           "var(--foreground)");

    // Línea vertical de hover
    const hoverLine = g.append("line")
      .attr("y1",                0)
      .attr("y2",                innerH)
      .attr("stroke",            cLine)
      .attr("stroke-dasharray",  "4,4")
      .attr("stroke-width",      1.5)
      .attr("opacity",           0);

    // Área de hit
    g.append("rect")
      .attr("width",  innerW)
      .attr("height", innerH)
      .attr("fill",   "transparent")
      .on("mousemove", (event) => {
        const [mx] = d3.pointer(event, g.node()!);
        const bisect = d3.bisector((d: { mes: string }) => xScale(d.mes)!).center;
        const idx    = Math.max(0, Math.min(bisect(chartData, mx), chartData.length - 1));
        const d      = chartData[idx];
        if (!d) return;

        const cx = xScale(d.mes)!;
        hoverLine.attr("x1", cx).attr("x2", cx).attr("opacity", 0.45);

        g.selectAll(".dot-hover").remove();
        g.append("circle")
          .attr("class",   "dot-hover")
          .attr("cx",      cx)
          .attr("cy",      yScale(d.value))
          .attr("r",       8)
          .attr("fill",    cLine)
          .attr("opacity", 0.15);

        const [pmx, pmy] = d3.pointer(event, containerRef.current);
        tooltip
          .style("opacity", "1")
          .style("left",    `${Math.min(pmx + 14, rect.width - 130)}px`)
          .style("top",     `${pmy - 52}px`)
          .html(
            `<div style="font-weight:600;color:hsl(var(--foreground));margin-bottom:2px">${d.mes}</div>` +
            `<div style="color:var(--chart-growth);font-weight:700;font-size:13px">${d.value} empresa${d.value !== 1 ? "s" : ""}</div>`
          );
      })
      .on("mouseleave", () => {
        hoverLine.attr("opacity", 0);
        g.selectAll(".dot-hover").remove();
        tooltip.style("opacity", "0");
      });

    return () => {
      if (svgRef.current) {
        d3.select(svgRef.current).selectAll("*").remove();
      }
    };
  }, [data]);

  return (
    <div className="bg-card border border-border p-6 rounded-2xl shadow-sm relative overflow-hidden">
      <h3 className="text-sm font-bold text-foreground mb-1">Crecimiento de Empresas</h3>
      <p className="text-[10px] text-muted-foreground mb-3">Nuevos inquilinos por mes</p>
      <div ref={containerRef} className="relative">
        <svg ref={svgRef} className="w-full" />
      </div>
    </div>
  );
}
