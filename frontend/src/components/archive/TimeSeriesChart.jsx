import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const TimeSeriesChart = ({ data, metric, width = 800, height = 400 }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || Object.keys(data).length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 100, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Get all years from data
    const allYears = new Set();
    Object.values(data).forEach(tractData => {
      tractData.forEach(d => allYears.add(d.Year));
    });
    const years = Array.from(allYears).sort();

    // Scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(years))
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([innerHeight, 0]);

    // Color scale
    const colorScale = d3.scaleOrdinal()
      .domain(Object.keys(data))
      .range(d3.schemeCategory10);

    // Line generator
    const line = d3.line()
      .x(d => xScale(d.Year))
      .y(d => yScale(d[metric]))
      .curve(d3.curveMonotoneX);

    // Add lines
    Object.entries(data).forEach(([tract, tractData]) => {
      const sortedData = tractData.sort((a, b) => a.Year - b.Year);
      
      g.append('path')
        .datum(sortedData)
        .attr('fill', 'none')
        .attr('stroke', colorScale(tract))
        .attr('stroke-width', 3)
        .attr('d', line);

      // Add dots
      g.selectAll(`.dot-${tract}`)
        .data(sortedData)
        .enter()
        .append('circle')
        .attr('class', `dot-${tract}`)
        .attr('cx', d => xScale(d.Year))
        .attr('cy', d => yScale(d[metric]))
        .attr('r', 4)
        .attr('fill', colorScale(tract))
        .attr('stroke', 'white')
        .attr('stroke-width', 2);
    });

    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format('d')))
      .selectAll('text')
      .style('font-size', '12px');

    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('font-size', '12px');

    // Add axis labels
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (innerHeight / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Score');

    g.append('text')
      .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + margin.bottom - 10})`)
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Year');

    // Add legend
    const legend = g.append('g')
      .attr('transform', `translate(${innerWidth + 10}, 20)`);

    Object.entries(data).forEach(([tract, tractData], i) => {
      const legendItem = legend.append('g')
        .attr('transform', `translate(0, ${i * 20})`);

      legendItem.append('line')
        .attr('x1', 0)
        .attr('x2', 15)
        .attr('y1', 0)
        .attr('y2', 0)
        .attr('stroke', colorScale(tract))
        .attr('stroke-width', 3);

      legendItem.append('text')
        .attr('x', 20)
        .attr('y', 0)
        .attr('dy', '0.35em')
        .style('font-size', '12px')
        .text(`Tract ${tract}`);
    });

  }, [data, metric, width, height]);

  return (
    <div className="chart-container">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default TimeSeriesChart;

