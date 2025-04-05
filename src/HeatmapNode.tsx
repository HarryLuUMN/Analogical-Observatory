import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'

type HeatmapNodeProps = {
  id: string
  data: {
    label: string
    matrix: number[][]          // 相似度矩阵
    xLabels: string[]           // targetWords
    yLabels: string[]           // otherWords
  }
}

const cellSize = 20
const margin = { top: 20, right: 20, bottom: 50, left: 60 }

export default function HeatmapNode({ data }: HeatmapNodeProps) {
  const ref = useRef(null)

  useEffect(() => {
    const svg = d3.select(ref.current)
    svg.selectAll("*").remove()

    const width = data.xLabels.length * cellSize
    const height = data.yLabels.length * cellSize

    const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
      .domain([0, 1])

    const g = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // 绘制格子
    g.selectAll("rect.cell")
      .data(data.matrix.flatMap((row, y) => row.map((val, x) => ({ x, y, val }))))
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr("x", d => d.x * cellSize)
      .attr("y", d => d.y * cellSize)
      .attr("width", cellSize)
      .attr("height", cellSize)
      .attr("fill", d => colorScale(d.val))

    // x轴标签：旋转，防止重叠
        // x轴标签：旋转45度并定位
        g.selectAll("text.xLabel")
        .data(data.xLabels)
        .enter()
        .append("text")
        .attr("class", "xLabel")
        .attr("text-anchor", "start")
        .attr("font-size", "10px")
        .attr("transform", (_, i) => {
          const x = i * cellSize + cellSize / 2
          const y = height + 30
          return `translate(${x},${y}) rotate(45)`
        })
        .text(d => d)
  

    // y轴标签
    g.selectAll("text.yLabel")
      .data(data.yLabels)
      .enter()
      .append("text")
      .attr("class", "yLabel")
      .attr("x", -5)
      .attr("y", (_, i) => i * cellSize + cellSize / 2)
      .attr("text-anchor", "end")
      .attr("font-size", "10px")
      .attr("dy", "0.35em")
      .text(d => d)
  }, [data])

  return (
    <div style={{ padding: 4 }}>
      <div style={{ textAlign: 'center', marginBottom: 4, fontWeight: 600 }}>{data.label}</div>
      <svg ref={ref} />
    </div>
  )
}
