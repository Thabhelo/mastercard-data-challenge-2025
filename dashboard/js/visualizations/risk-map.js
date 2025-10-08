export function initRiskMap(data) {
    const container = d3.select('#map-container');
    container.selectAll('*').remove();

    const width = container.node().getBoundingClientRect().width - 50;
    const height = 600;

    const svg = container.append('svg')
        .attr('width', width)
        .attr('height', height);

    const message = svg.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '1rem')
        .style('fill', '#95a5a6')
        .text('Risk map will be rendered here with county-level data');
}

