// ========================
export type GraphEntry = {
    id: string; // 第一个参与组合的词，如 "king"
    data: {
        targetWord: string; // 第二个参与组合的词，如 "man"
        targetWords: string[]; // 与 (id + targetWord) 的组合向量比较的词
        similarities: number[]; // 对应 targetWords 的相似度
    }[];
};

export type DirectedEdge = {
    source: string;
    target: string;
};

export type GenerationGraph = {
    nodes: string[];
    edges: DirectedEdge[];
};

// ========================
// 正向映射构建
// ========================
function buildForwardMap(entries: GraphEntry[]): Map<string, string> {
    const forwardMap = new Map<string, string>();

    for (const entry of entries) {
        const sourceA = entry.id;
        for (const pair of entry.data) {
            const sourceB = pair.targetWord;

            if(sourceA!=sourceB){
                const bestTarget = pair.targetWords[0];
                const sortedKey = [sourceA, sourceB].sort().join("|");

                if (!forwardMap.has(sortedKey)) {
                    forwardMap.set(sortedKey, bestTarget);
                }
            }
        }
    }
    console.log("Forward Map:", forwardMap);
    return forwardMap;
}

// ========================
// 主算法：构造最优语义图
// ========================
export function buildOptimalSemanticGraph(
    inputWords: string[],
    maxDepth: number,
    similarityGraph: GraphEntry[]
): GenerationGraph {
    const forwardMap = buildForwardMap(similarityGraph);

    const nodes = new Set<any>();
    const edges: DirectedEdge[] = [];


    // init first layer
    for (const word of inputWords) {
        nodes.add({word: word, depth: 0});
    }

    const nonVisitied = new Set<string>();
    for(const entry of similarityGraph){
        nonVisitied.add(entry.id);
    }

    let currentLayer: string[] = [...inputWords];

    let inputMaxLayer = maxDepth;

    let nextLayer: string[] = [];
    while(currentLayer.length > 0 && maxDepth > 0) {
        for(let i=0; i<currentLayer.length; i++){
            for(let j=i+1; j<currentLayer.length; j++){
                const sourceA = currentLayer[i];
                const sourceB = currentLayer[j];

                const sortedKey = [sourceA, sourceB].sort().join("|");
                const bestTarget = forwardMap.get(sortedKey);

                console.log("comb ope", sourceA, sourceB, bestTarget);

                if (bestTarget && (nonVisitied.has(bestTarget))) {
                    edges.push({ source: sourceA, target: bestTarget });
                    edges.push({ source: sourceB, target: bestTarget });
                    
                    nonVisitied.delete(bestTarget);
                    nodes.add({word: bestTarget, depth: inputMaxLayer - maxDepth + 1});
                    console.log("comb ope finished", edges, nodes);
                    nextLayer.push(bestTarget);
                }
            }
        }
        currentLayer = [...nextLayer];
        nextLayer = [];
        maxDepth--;
    }
    console.log("non visited:", nonVisitied);
    return { nodes: Array.from(nodes), edges };
}
