import { useEffect, useState } from 'react';

import '@xyflow/react/dist/style.css';

import GraphView from './GraphView';
import { buildOptimalSemanticGraph, GenerationGraph } from './optim';

export default function App() {
  const [graphData, setGraphData] = useState([])
  const [optimalGraph, setOptimalGraph] = useState<GenerationGraph | null>(null)

  useEffect(() => {
    fetch('./data/similarity_graph.json')
      .then((res) => res.json())
      .then((data) => {
        setGraphData(data);
        return data;
      })
      .then((graphData) => {
        const optimalGraph = buildOptimalSemanticGraph(['king', 'man', 'queen', 'nation', 'country', 'land', 'religion', 'people', ], 3, graphData);
        console.log("Optimal Graph:", optimalGraph);
        setOptimalGraph(optimalGraph)
      })
  }, [])

  return (
    <div>
      {optimalGraph && <GraphView graph={optimalGraph} similarityGraph={graphData}/>}
    </div>
  )
}
