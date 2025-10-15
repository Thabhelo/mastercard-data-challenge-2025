import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const Heatmap = ({ data, width = 800, height = 500 }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 100, left: 100 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Prepare data for heatmap
    const metrics = ['Inclusive Growth Score', 'Growth', 'Inclusion', 'Place', 'Economy', 'Community'];
    const tracts = [...new Set(data.map(d => d['Tract Label']))].sort();
    
    const heatmapData = [];
    tracts.forEach(tract => {
      const tractData = data.find(d => d['Tract Label'] === tract);
      if (tractData) {
        metrics.forEach(metric => {
          heatmapData.push({
            tract,
            metric,
            value: tractData[metric] || 0,
            opportunityZone: tractData['Opportunity Zone']
          });
        });
      }
    });

    // Scales
    const xScale = d3.scaleBand()
      .domain(metrics)
      .range([0, innerWidth])
      .padding(0.05);

    const yScale = d3.scaleBand()
      .domain(tracts)
      .range([0, innerHeight])
      .padding(0.05);

    const colorScale = d3.scaleSequential(d3.interpolateRdYlBu)
      .domain([100, 0]);

    // Add rectangles
    g.selectAll('rect')
      .data(heatmapData)
      .enter()
      .append('rect')
      .attr('x', d => xScale(d.metric))
      .attr('y', d => yScale(d.tract))
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('fill', d => colorScale(d.value))
      .attr('stroke', d => d.opportunityZone ? 'white' : 'none')
      .attr('stroke-width', d => d.opportunityZone ? 2 : 0)
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('opacity', 0.8)
          .attr('stroke', 'black')
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
          <strong>${d.tract}</strong><br/>
          ${d.metric}: ${d.value.toFixed(1)}<br/>
          Opportunity Zone: ${d.opportunityZone ? 'Yes' : 'No'}
        `)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .attr('opacity', 1)
          .attr('stroke', d.opportunityZone ? 'white' : 'none')
          .attr('stroke-width', d.opportunityZone ? 2 : 0);

        d3.selectAll('.tooltip').remove();
      });

    // Add value labels
    g.selectAll('.heatmap-label')
      .data(heatmapData)
      .enter()
      .append('text')
      .attr('class', 'heatmap-label')
      .attr('x', d => xScale(d.metric) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.tract) + yScale.bandwidth() / 2)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .style('font-size', '10px')
      .style('font-weight', 'bold')
      .style('fill', d => d.value > 50 ? 'white' : 'black')
      .text(d => d.value.toFixed(0));

    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('font-size', '12px')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('font-size', '10px');

    // Add axis labels
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (innerHeight / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Census Tracts');

    g.append('text')
      .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + margin.bottom - 10})`)
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Metrics');

    // Add color legend
    const legendWidth = 200;
    const legendHeight = 20;
    const legend = g.append('g')
      .attr('transform', `translate(${innerWidth - legendWidth}, ${innerHeight + 30})`);

    const legendScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
      .ticks(5)
      .tickFormat(d3.format('d'));

    // Create gradient for legend
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'heatmap-gradient')
      .attr('x1', '0%')
      .attr('x2', '100%')
      .attr('y1', '0%')
      .attr('y2', '0%');

    const stops = [0, 0.25, 0.5, 0.75, 1];
    stops.forEach(stop => {
      gradient.append('stop')
        .attr('offset', `${stop * 100}%`)
        .attr('stop-color', colorScale(100 - stop * 100));
    });

    legend.append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .style('fill', 'url(#heatmap-gradient)');

    legend.append('g')
      .attr('transform', `translate(0,${legendHeight})`)
      .call(legendAxis)
      .selectAll('text')
      .style('font-size', '10px');

    legend.append('text')
      .attr('x', legendWidth / 2)
      .attr('y', -5)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text('Score');

  }, [data, width, height]);

  return (
    <div className="chart-container">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default Heatmap;

