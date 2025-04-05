import {ReactFlow, Background, Node, Edge, MarkerType } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

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
};

export default function GraphViewer({ graph }: Props) {
    const horizontalSpacing = 180;
  const verticalSpacing = 120;

  // 构建分层（depth）
  const layers = new Map<number, GenerationNode[]>();
  for (const node of graph.nodes) {
    if (!layers.has(node.depth)) {
      layers.set(node.depth, []);
    }
    layers.get(node.depth)!.push(node);
  }

  // 排序层级（深度）
  const sortedDepths = Array.from(layers.keys()).sort((a, b) => a - b);

  // 生成 React Flow 节点（允许重复 word，id 使用 word+depth+index）
  const reactFlowNodes: Node[] = [];
  const nodeIdLookup = new Map<string, string[]>(); // word → nodeIds

  sortedDepths.forEach((depth) => {
    const nodes = layers.get(depth)!;
    nodes.forEach((node, index) => {
      const id = `${node.word}-${depth}-${index}`;
      reactFlowNodes.push({
        id,
        data: { label: node.word },
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

  // 边连接时选择 source 出现最浅的节点，target 出现最深的节点
  const getShallowest = (ids: string[]) => ids.sort((a, b) => parseInt(a.split('-')[1]) - parseInt(b.split('-')[1]))[0];
  const getDeepest = (ids: string[]) => ids.sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];

  const edgeSet = new Set<string>();
  const reactFlowEdges: Edge[] = graph.edges.map((e:any, i:any) => {
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
