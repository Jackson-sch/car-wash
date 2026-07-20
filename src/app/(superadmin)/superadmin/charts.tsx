"use client";

import { useRef, useEffect, useId } from "react";
import { useD3 } from "@/lib/hooks/useD3";
import { formatCurrency } from "@/lib/formats";

export interface RevenueItem {
  mes: string;
  total: string;
}

export interface GrowthItem {
  mes: string;
  total: number;
}

interface DataPoint {
  mes: string;
  value: number;
}

function ChartSkeleton({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="bg-card border border-border p-6 rounded-2xl shadow-sm relative overflow-hidden">
      <h3 className="text-sm font-bold text-foreground mb-1">{title}</h3>
      <p className="text-[10px] text-muted-foreground mb-3">{subtitle}</p>
      <div className="h-[200px] flex items-center justify-center">
        <div className="flex gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="w-8 bg-muted animate-pulse rounded-t-md"
              style={{ height: `${Math.sin(i + 1) * 40 + 80}px` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Revenue Chart ────────────────────────────────────────────────────────────
export function RevenueChart({ data }: { data: RevenueItem[] }) {
  const d3 = useD3();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gradientId = useId().replace(/[:]/g, "-");

  useEffect(() => {
    if (!d3 || !containerRef.current || !svgRef.current || data.length === 0) {
      return () => {};
    }

    const container = containerRef.current;
    const svgEl = svgRef.current;

    const style = getComputedStyle(container);

    const colorTop    = style.getPropertyValue("--chart-1").trim()   || "#0ea5e9";
    const colorBot    = style.getPropertyValue("--chart-2").trim()   || "#0284c7";
    const colorMuted  = style.getPropertyValue("--muted-foreground").trim() || "#5e5f65";
    const colorBorder = style.getPropertyValue("--border").trim()    || "#d4d4db";

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

    const svg = d3.select(svgEl);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 16, bottom: 28, left: 52 };
    const rect   = container.getBoundingClientRect();
    const width  = rect.width;
    const height = 200;
    const innerW = width  - margin.left - margin.right;
    const innerH = height - margin.top  - margin.bottom;

    const chartData: DataPoint[] = data.map((d: RevenueItem) => ({ mes: d.mes, value: parseFloat(d.total) }));

    const xScale = d3.scaleBand()
      .domain(chartData.map((d: DataPoint) => d.mes))
      .range([0, innerW])
      .padding(0.38);

    const maxVal = d3.max(chartData, (d: DataPoint) => d.value) || 1;
    const yScale = d3.scaleLinear()
      .domain([0, maxVal * 1.14])
      .range([innerH, 0]);

    const defs = svg.append("defs");

    const barGrad = defs.append("linearGradient")
      .attr("id", `barGrad-${gradientId}`)
      .attr("x1", "0").attr("y1", "0")
      .attr("x2", "0").attr("y2", "1");
    barGrad.append("stop").attr("offset", "0%").attr("stop-color", c1).attr("stop-opacity", "1");
    barGrad.append("stop").attr("offset", "100%").attr("stop-color", c2).attr("stop-opacity", "0.05");

    const barGradHover = defs.append("linearGradient")
      .attr("id", `barGradHover-${gradientId}`)
      .attr("x1", "0").attr("y1", "0")
      .attr("x2", "0").attr("y2", "1");
    barGradHover.append("stop").attr("offset", "0%").attr("stop-color", c1).attr("stop-opacity", "1");
    barGradHover.append("stop").attr("offset", "100%").attr("stop-color", c1).attr("stop-opacity", "0.05");

    svg
      .attr("width", width)
      .attr("height", height);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    g.append("g")
      .call(d3.axisLeft(yScale).ticks(5).tickSize(-innerW).tickFormat(() => ""))
      .selectAll(".tick line")
      .attr("stroke", cBorder)
      .attr("stroke-dasharray", "3,4")
      .attr("opacity", 0.5);
    g.selectAll(".domain").remove();

    g.append("g")
      .call(
        d3.axisLeft(yScale)
          .ticks(5)
          .tickFormat((d: any) => `S/${d3.format("~s")(d)}`)
      )
      .selectAll("text")
      .attr("fill", cMuted)
      .attr("font-size", "10px")
      .attr("font-weight", "500");
    g.selectAll(".domain").attr("stroke", "none");

    g.append("g")
      .attr("transform", `translate(0,${innerH})`)
      .call(d3.axisBottom(xScale).tickSize(0))
      .call((ax: any) => ax.select(".domain").attr("stroke", cBorder).attr("opacity", 0.5))
      .selectAll("text")
      .attr("fill", cMuted)
      .attr("font-size", "9.5px")
      .attr("dy", "1.2em");

    const bars = g.selectAll<SVGRectElement, DataPoint>(".bar")
      .data<DataPoint>(chartData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x",      (d: DataPoint) => xScale(d.mes)!)
      .attr("y",      innerH)
      .attr("width",  xScale.bandwidth())
      .attr("height", 0)
      .attr("fill",   `url(#barGrad-${gradientId})`)
      .attr("rx",     5)
      .attr("ry",     5);

    bars
      .transition()
      .duration(700)
      .delay((_: unknown, i: number) => i * 65)
      .ease(d3.easeCubicOut)
      .attr("y",      (d: DataPoint) => yScale(d.value))
      .attr("height", (d: DataPoint) => innerH - yScale(d.value));

    const tooltip = d3.select(container)
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

    const overlayNode = g.append("rect")
      .attr("width",  innerW)
      .attr("height", innerH)
      .attr("fill",   "transparent")
      .node();

    const onMouseMove = (event: Event) => {
      const me = event as MouseEvent;
      const [mx, my] = d3.pointer(me, container);
      const [gX] = d3.pointer(me, g.node()!);

      const hovered = chartData.find((d) => {
        const x = xScale(d.mes);
        return x !== undefined && gX >= x && gX <= x + xScale.bandwidth();
      });

      if (hovered) {
        g.selectAll<SVGRectElement, DataPoint>(".bar")
          .attr("fill", (b: DataPoint) => b.mes === hovered.mes ? `url(#barGradHover-${gradientId})` : `url(#barGrad-${gradientId})`);

        tooltip
          .style("opacity", "1")
          .style("left", `${Math.min(mx + 14, rect.width - 120)}px`)
          .style("top",  `${my - 52}px`)
          .html(
            `<div style="font-weight:600;color:hsl(var(--foreground));margin-bottom:2px">${hovered.mes}</div>` +
            `<div style="color:var(--chart-1);font-weight:700;font-size:13px">${formatCurrency(hovered.value)}</div>`
          );
      } else {
        g.selectAll<SVGRectElement, DataPoint>(".bar")
          .attr("fill", (b: DataPoint) => `url(#barGrad-${gradientId})`);
        tooltip.style("opacity", "0");
      }
    };

    const onMouseLeave = () => {
      g.selectAll<SVGRectElement, DataPoint>(".bar")
        .attr("fill", () => `url(#barGrad-${gradientId})`);
      tooltip.style("opacity", "0");
    };

    if (overlayNode) {
      overlayNode.addEventListener("mousemove", onMouseMove);
      overlayNode.addEventListener("mouseleave", onMouseLeave);
    }

    return () => {
      if (overlayNode) {
        overlayNode.removeEventListener("mousemove", onMouseMove);
        overlayNode.removeEventListener("mouseleave", onMouseLeave);
      }
      d3.select(svgEl).selectAll("*").interrupt().remove();
      tooltip.remove();
    };
  }, [data, d3, gradientId]);

  if (!d3) {
    return (
      <ChartSkeleton
        title="Ingresos Mensuales"
        subtitle="Facturación total del sistema"
      />
    );
  }

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
  const d3 = useD3();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!d3 || !containerRef.current || !svgRef.current || data.length === 0) {
      return () => {};
    }

    const container = containerRef.current;
    const svgEl = svgRef.current;

    const style = getComputedStyle(container);

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

    const svg = d3.select(svgEl);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 16, bottom: 28, left: 44 };
    const rect   = container.getBoundingClientRect();
    const width  = rect.width;
    const height = 200;
    const innerW = width  - margin.left - margin.right;
    const innerH = height - margin.top  - margin.bottom;

    const chartData: DataPoint[] = data.map((d: GrowthItem) => ({ mes: d.mes, value: d.total }));

    const xScale = d3.scalePoint()
      .domain(chartData.map((d: DataPoint) => d.mes))
      .range([0, innerW]);

    const maxVal = d3.max(chartData, (d: DataPoint) => d.value) || 1;
    const yScale = d3.scaleLinear()
      .domain([0, maxVal * 1.22])
      .range([innerH, 0]);

    const defs = svg.append("defs");

    const areaGrad = defs.append("linearGradient")
      .attr("id", "areaGrad")
      .attr("x1", "0").attr("y1", "0")
      .attr("x2", "0").attr("y2", "1");
    areaGrad.append("stop").attr("offset", "0%").attr("stop-color", cArea).attr("stop-opacity", "0.3");
    areaGrad.append("stop").attr("offset", "80%").attr("stop-color", cLine).attr("stop-opacity", "0.03");

    svg
      .attr("width", width)
      .attr("height", height);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    g.append("g")
      .call(d3.axisLeft(yScale).ticks(5).tickSize(-innerW).tickFormat(() => ""))
      .selectAll(".tick line")
      .attr("stroke", cBorder)
      .attr("stroke-dasharray", "3,4")
      .attr("opacity", 0.5);
    g.selectAll(".domain").remove();

    g.append("g")
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d3.format("d")))
      .selectAll("text")
      .attr("fill", cMuted)
      .attr("font-size", "10px")
      .attr("font-weight", "500");
    g.selectAll(".domain").attr("stroke", "none");

    g.append("g")
      .attr("transform", `translate(0,${innerH})`)
      .call(d3.axisBottom(xScale).tickSize(0))
      .call((ax: any) => ax.select(".domain").attr("stroke", cBorder).attr("opacity", 0.5))
      .selectAll("text")
      .attr("fill", cMuted)
      .attr("font-size", "9.5px")
      .attr("dy", "1.2em");

    const areaGen = d3.area<DataPoint>()
      .x((d: DataPoint) => xScale(d.mes)!)
      .y0(innerH)
      .y1((d: DataPoint) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(chartData)
      .attr("fill", "url(#areaGrad)")
      .attr("d", areaGen);

    const lineGen = d3.line<DataPoint>()
      .x((d: DataPoint) => xScale(d.mes)!)
      .y((d: DataPoint) => yScale(d.value))
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

    g.selectAll<SVGCircleElement, DataPoint>(".dot")
      .data<DataPoint>(chartData)
      .enter()
      .append("circle")
      .attr("class",        "dot")
      .attr("cx",           (d: DataPoint) => xScale(d.mes)!)
      .attr("cy",           (d: DataPoint) => yScale(d.value))
      .attr("r",            0)
      .attr("fill",         cLine)
      .attr("stroke",       "hsl(var(--card))")
      .attr("stroke-width", 2.5)
      .transition()
      .duration(380)
      .delay((_: unknown, i: number) => 700 + i * 70)
      .attr("r", 4.5);

    const tooltip = d3.select(container)
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

    const hoverLine = g.append("line")
      .attr("y1",                0)
      .attr("y2",                innerH)
      .attr("stroke",            cLine)
      .attr("stroke-dasharray",  "4,4")
      .attr("stroke-width",      1.5)
      .attr("opacity",           0);

    const overlayNode = g.append("rect")
      .attr("width",  innerW)
      .attr("height", innerH)
      .attr("fill",   "transparent")
      .node();

    const onMouseMove = (event: Event) => {
      const [mx] = d3.pointer(event as MouseEvent, g.node()!);
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

      const [pmx, pmy] = d3.pointer(event as MouseEvent, container);
      tooltip
        .style("opacity", "1")
        .style("left",    `${Math.min(pmx + 14, rect.width - 130)}px`)
        .style("top",     `${pmy - 52}px`)
        .html(
          `<div style="font-weight:600;color:hsl(var(--foreground));margin-bottom:2px">${d.mes}</div>` +
          `<div style="color:var(--chart-growth);font-weight:700;font-size:13px">${d.value} empresa${d.value !== 1 ? "s" : ""}</div>`
        );
    };

    const onMouseLeave = () => {
      hoverLine.attr("opacity", 0);
      g.selectAll(".dot-hover").remove();
      tooltip.style("opacity", "0");
    };

    if (overlayNode) {
      overlayNode.addEventListener("mousemove", onMouseMove);
      overlayNode.addEventListener("mouseleave", onMouseLeave);
    }

    return () => {
      if (overlayNode) {
        overlayNode.removeEventListener("mousemove", onMouseMove);
        overlayNode.removeEventListener("mouseleave", onMouseLeave);
      }
      d3.select(svgEl).selectAll("*").interrupt().remove();
      tooltip.remove();
    };
  }, [data, d3]);

  if (!d3) {
    return (
      <ChartSkeleton
        title="Crecimiento de Empresas"
        subtitle="Nuevos inquilinos por mes"
      />
    );
  }

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
