import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const BarChart = ({ data, metric, width = 600, height = 400 }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 100, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Sort data by metric value
    const sortedData = [...data].sort((a, b) => b[metric] - a[metric]);

    // Scales
    const xScale = d3.scaleBand()
      .domain(sortedData.map(d => d['Tract Label']))
      .range([0, innerWidth])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(sortedData, d => d[metric])])
      .range([innerHeight, 0])
      .nice();

    const colorScale = d3.scaleOrdinal()
      .domain([true, false])
      .range(['#2E8B57', '#4169E1']);

    // Add bars
    g.selectAll('rect')
      .data(sortedData)
      .enter()
      .append('rect')
      .attr('x', d => xScale(d['Tract Label']))
      .attr('y', d => yScale(d[metric]))
      .attr('width', xScale.bandwidth())
      .attr('height', d => innerHeight - yScale(d[metric]))
      .attr('fill', d => colorScale(d['Opportunity Zone']))
      .attr('opacity', 0.8)
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('opacity', 1)
          .attr('stroke', 'white')
          .attr('stroke-width', 2);

        // Show tooltip
        const tooltip = d3.select('body').append('div')
          .attr('class', 'tooltip')
          .style('position', 'absolute')
          .style('background', 'rgba(0, 0, 0, 0.8)')
          .style('color', 'white')
          .style('padding', '8px')
          .style('border-radius', '4px')
          .style('font-size', '12px')
          .style('pointer-events', 'none')
          .style('opacity', 0);

        tooltip.transition().duration(200).style('opacity', 1);
        tooltip.html(`
          <strong>${d['Tract Label']}</strong><br/>
          ${metric}: ${d[metric].toFixed(1)}<br/>
          Opportunity Zone: ${d['Opportunity Zone'] ? 'Yes' : 'No'}
        `)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('opacity', 0.8)
          .attr('stroke', 'none');

        d3.selectAll('.tooltip').remove();
      });

    // Add value labels on bars
    g.selectAll('.bar-label')
      .data(sortedData)
      .enter()
      .append('text')
      .attr('class', 'bar-label')
      .attr('x', d => xScale(d['Tract Label']) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d[metric]) - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('font-weight', 'bold')
      .style('fill', 'white')
      .text(d => d[metric].toFixed(1));

    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('font-size', '10px')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

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
      .text(metric);

    // Add legend
    const legend = g.append('g')
      .attr('transform', `translate(${innerWidth - 100}, 20)`);

    const legendData = [
      { label: 'Opportunity Zone', color: '#2E8B57' },
      { label: 'Regular Tract', color: '#4169E1' }
    ];

    legendData.forEach((item, i) => {
      const legendItem = legend.append('g')
        .attr('transform', `translate(0, ${i * 20})`);

      legendItem.append('rect')
        .attr('x', 0)
        .attr('y', -8)
        .attr('width', 12)
        .attr('height', 12)
        .attr('fill', item.color)
        .attr('opacity', 0.8);

      legendItem.append('text')
        .attr('x', 15)
        .attr('y', 0)
        .attr('dy', '0.35em')
        .style('font-size', '12px')
        .text(item.label);
    });

  }, [data, metric, width, height]);

  return (
    <div className="chart-container">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default BarChart;

