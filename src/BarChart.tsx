import { useEffect, useRef } from "react";
import * as d3 from "d3";


export function BarChart({
  words,
  values,
}: {
  words: string[];
  values: number[];
}) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const width = 140;
    const height = 60;
    const margin = { top: 5, right: 5, bottom: 15, left: 20 };

    const svgRoot = d3.select(ref.current);
    svgRoot.selectAll('*').remove();

    const svg = svgRoot
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand().domain(words).range([0, width]).padding(0.4);
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(values)!])
      .range([height, 0]);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d => d).tickSize(0))
      .selectAll('text')
      .style('font-size', '6px');

    svg.append('g')
      .call(d3.axisLeft(y).ticks(3).tickFormat(d3.format(".2f")))
      .selectAll('text')
      .style('font-size', '6px');

    const tooltip = svgRoot
      .append('div')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background', '#fff')
      .style('border', '1px solid #ccc')
      .style('padding', '2px 5px')
      .style('font-size', '10px');

    svg.selectAll('rect')
      .data(values)
      .enter()
      .append('rect')
      .attr('x', (_, i) => x(words[i])!)
      .attr('y', (d) => y(d))
      .attr('width', x.bandwidth())
      .attr('height', (d) => height - y(d))
      .attr('fill', '#69b3a2')
      .on('mouseover', (_, d) => tooltip.style('visibility', 'visible').text(d.toFixed(2)))
      .on('mousemove', (event) => {
        tooltip
          .style('top', (event.pageY - 30) + 'px')
          .style('left', (event.pageX + 5) + 'px');
      })
      .on('mouseout', () => tooltip.style('visibility', 'hidden'));

    svg.selectAll('text.bar')
      .data(values)
      .enter()
      .append('text')
      .attr('class', 'bar')
      .attr('x', (_, i) => x(words[i])! + x.bandwidth() / 2)
      .attr('y', (d) => y(d) - 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '6px')
      .text((d) => d.toFixed(2));
  }, [words, values]);

  return <div className="bar-scroll" ref={ref} style={{ overflow: 'auto', maxWidth: '150px' }} />;
}