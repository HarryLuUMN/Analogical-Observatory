import {ReactFlow, Background, Node, Edge, MarkerType } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { BarChart } from './BarChart';
import { GraphEntry } from './optim';

interface GenerationNode {
  word: string;
  depth: number;
}

interface DirectedEdge {
  source: string;
  target: string;
}

interface GenerationGraph {
  nodes: GenerationNode[];
  edges: DirectedEdge[];
}

// 假设我们传入一个 GenerationGraph 格式的数据
type Props = {
    graph: any;
    similarityGraph: GraphEntry[]; // 新增
  };
  

export default function GraphViewer({ graph, similarityGraph }: Props) {
    const horizontalSpacing = 180;
    const verticalSpacing = 180;
  
    const layers = new Map<number, GenerationNode[]>();
    for (const node of graph.nodes) {
      if (!layers.has(node.depth)) {
        layers.set(node.depth, []);
      }
      layers.get(node.depth)!.push(node);
    }
  
    const sortedDepths = Array.from(layers.keys()).sort((a, b) => a - b);
  
    const reactFlowNodes: Node[] = [];
    const nodeIdLookup = new Map<string, string[]>();
  
    sortedDepths.forEach((depth) => {
      const nodes = layers.get(depth)!;
      nodes.forEach((node, index) => {
        const id = `${node.word}-${depth}-${index}`;
  
        const label = (
          <div style={{ fontSize: 12, textAlign: 'center' }}>
            <div>{node.word}</div>
            {depth > 0 && (() => {
  const dist = getDistributionForNode(node.word, graph, similarityGraph);
  return dist ? <BarChart words={dist.words} values={dist.values} /> : null;
})()}

          </div>
        );
  
        reactFlowNodes.push({
          id,
          data: { label },
          position: {
            x: index * horizontalSpacing - ((nodes.length - 1) * horizontalSpacing) / 2,
            y: depth * verticalSpacing,
          },
          style: {
            padding: 6,
            border: '1px solid #999',
            borderRadius: 4,
            background: '#fff'
          }
        });
  
        if (!nodeIdLookup.has(node.word)) {
          nodeIdLookup.set(node.word, []);
        }
        nodeIdLookup.get(node.word)!.push(id);
      });
    });
  
    const getShallowest = (ids: string[]) => ids.sort((a, b) => parseInt(a.split('-')[1]) - parseInt(b.split('-')[1]))[0];
    const getDeepest = (ids: string[]) => ids.sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
  
    const edgeSet = new Set<string>();
    const reactFlowEdges: Edge[] = graph.edges.map((e:any) => {
      const sourceIds = nodeIdLookup.get(e.source) || [];
      const targetIds = nodeIdLookup.get(e.target) || [];
      if (sourceIds.length === 0 || targetIds.length === 0) return null;
  
      const source = getShallowest(sourceIds);
      const target = getDeepest(targetIds);
  
      const edgeId = `e-${source}-${target}`;
      if (edgeSet.has(edgeId)) return null;
      edgeSet.add(edgeId);
  
      return {
        id: edgeId,
        source,
        target,
        animated: false,
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
        style: { stroke: '#444' },
      };
    }).filter(Boolean) as Edge[];
  
    return (
      <div style={{ width: '100%', height: '100vh' }}>
        <ReactFlow
          nodes={reactFlowNodes}
          edges={reactFlowEdges}
          fitView
          panOnScroll
          zoomOnScroll
        >
          <Background gap={12} size={1} />
        </ReactFlow>
      </div>
    );
}


function getDistributionForNode(
    nodeWord: string,
    graph: GenerationGraph,
    similarityGraph: GraphEntry[]
  ): { words: string[]; values: number[] } | null {
    // 找到两条边指向该节点的 source
    const sources = graph.edges
      .filter(e => e.target === nodeWord)
      .map(e => e.source);
  
    if (sources.length < 2) return null;
  
    const [a, b] = sources.sort(); // 保持顺序一致
    const entry = similarityGraph.find(e => e.id === a);
    if (!entry) return null;
  
    const pair = entry.data.find(d => d.targetWord === b);
    if (!pair) return null;
  
    const topK = 5;
    const items = pair.targetWords
      .map((word, i) => ({ word, sim: pair.similarities[i] }))
      .sort((a, b) => b.sim - a.sim)
      .slice(0, topK);
  
    return {
      words: items.map(i => i.word),
      values: items.map(i => i.sim),
    };
  }
  