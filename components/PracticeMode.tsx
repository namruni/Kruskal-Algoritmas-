
import React, { useEffect, useState, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { Edge, Node, LogStep } from '../types';
import { UnionFind } from '../utils/dsu';
import { RotateCcw, CheckCircle, AlertCircle, Trophy, MousePointerClick } from 'lucide-react';

const WIDTH = 800;
const HEIGHT = 500;
const NODE_RADIUS = 20;

const PracticeMode: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedEdgeIds, setSelectedEdgeIds] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<{ text: string, type: 'info' | 'success' | 'error' | 'warning' } | null>(null);
  const [currentWeight, setCurrentWeight] = useState<number>(0);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won'>('playing');
  
  const simulationRef = useRef<d3.Simulation<d3.SimulationNodeDatum, undefined> | null>(null);

  // Generate a random connected graph (similar to Visualizer but maybe simpler for practice)
  const generateGraph = useCallback(() => {
    setSelectedEdgeIds(new Set());
    setMessage({ text: "Başlamak için en küçük ağırlıklı kenara tıkla!", type: "info" });
    setCurrentWeight(0);
    setGameStatus('playing');

    // 6-9 nodes for practice (manageable)
    const numNodes = Math.floor(Math.random() * 4) + 6;
    
    const newNodes: Node[] = Array.from({ length: numNodes }, (_, i) => ({
      id: String.fromCharCode(65 + i),
      x: WIDTH / 2 + (Math.random() - 0.5) * (WIDTH * 0.6),
      y: HEIGHT / 2 + (Math.random() - 0.5) * (HEIGHT * 0.6),
    }));

    const possibleEdges: Edge[] = [];
    const connectedPairs = new Set<string>();

    // Spanning tree first
    for (let i = 0; i < numNodes - 1; i++) {
      const weight = Math.floor(Math.random() * 15) + 1;
      const source = newNodes[i].id;
      const target = newNodes[i + 1].id;
      possibleEdges.push({
        id: `e-${source}-${target}`,
        source,
        target,
        weight,
        status: 'default'
      });
      connectedPairs.add(`${source}-${target}`);
      connectedPairs.add(`${target}-${source}`);
    }

    // Add extra edges
    const targetEdgeCount = Math.floor(numNodes * 1.5); 
    let attempts = 0;
    while (possibleEdges.length < targetEdgeCount && attempts < 200) {
      attempts++;
      const i = Math.floor(Math.random() * numNodes);
      const j = Math.floor(Math.random() * numNodes);
      if (i === j) continue;
      
      const source = newNodes[i].id;
      const target = newNodes[j].id;
      const key = `${source}-${target}`;
      
      if (!connectedPairs.has(key)) {
        const weight = Math.floor(Math.random() * 20) + 1;
        possibleEdges.push({
          id: `e-${source}-${target}`,
          source,
          target,
          weight,
          status: 'default'
        });
        connectedPairs.add(`${source}-${target}`);
        connectedPairs.add(`${target}-${source}`);
      }
    }

    setNodes(newNodes);
    setEdges(possibleEdges);

    // D3 Setup
    if (simulationRef.current) simulationRef.current.stop();
    const simulationLinks = possibleEdges.map(e => ({ ...e }));

    simulationRef.current = d3.forceSimulation(newNodes as d3.SimulationNodeDatum[])
      .force("link", d3.forceLink(simulationLinks).id((d: any) => d.id).distance(120))
      .force("charge", d3.forceManyBody().strength(-800))
      .force("center", d3.forceCenter(WIDTH / 2, HEIGHT / 2))
      .force("collide", d3.forceCollide(NODE_RADIUS + 20))
      .on("tick", () => {
        newNodes.forEach(node => {
            node.x = Math.max(NODE_RADIUS, Math.min(WIDTH - NODE_RADIUS, node.x));
            node.y = Math.max(NODE_RADIUS, Math.min(HEIGHT - NODE_RADIUS, node.y));
        });
        setNodes([...newNodes]);
      });
  }, []);

  useEffect(() => {
    generateGraph();
    return () => {
      if (simulationRef.current) simulationRef.current.stop();
    };
  }, [generateGraph]);

  const handleEdgeClick = (edgeId: string) => {
    if (gameStatus === 'won') return;
    if (selectedEdgeIds.has(edgeId)) return;

    const edge = edges.find(e => e.id === edgeId);
    if (!edge) return;

    // 1. Check for Cycle using DSU on currently selected edges + this edge
    const dsu = new UnionFind(nodes.map(n => n.id));
    selectedEdgeIds.forEach(id => {
      const e = edges.find(ed => ed.id === id);
      if (e) dsu.union(e.source, e.target);
    });

    if (dsu.find(edge.source) === dsu.find(edge.target)) {
      setMessage({ text: "Hata: Bu kenar bir döngü oluşturuyor! Seçilemez.", type: 'error' });
      return;
    }

    // 2. Kruskal Logic Check: Is there a cheaper valid edge available?
    // Filter unselected edges
    const unselectedEdges = edges.filter(e => !selectedEdgeIds.has(e.id));
    
    // Find valid edges among unselected (those that don't create cycles)
    const validUnselectedEdges = unselectedEdges.filter(e => {
       const testDsu = new UnionFind(nodes.map(n => n.id));
       // Build current tree
       selectedEdgeIds.forEach(id => {
         const existing = edges.find(ed => ed.id === id);
         if (existing) testDsu.union(existing.source, existing.target);
       });
       // Check if 'e' creates cycle
       return testDsu.find(e.source) !== testDsu.find(e.target);
    });

    if (validUnselectedEdges.length === 0) {
      // Should not happen if graph is connected and not done
      return;
    }

    // Find min weight among valid edges
    const minWeight = Math.min(...validUnselectedEdges.map(e => e.weight));

    if (edge.weight > minWeight) {
      setMessage({ 
        text: `Hata: Kruskal kuralı ihlali! Ağırlığı ${minWeight} olan daha uygun bir kenar varken ${edge.weight} ağırlıklı kenarı seçemezsin.`, 
        type: 'error' 
      });
      return;
    }

    // Success: Add edge
    const newSelected = new Set(selectedEdgeIds);
    newSelected.add(edgeId);
    setSelectedEdgeIds(newSelected);
    setCurrentWeight(prev => prev + edge.weight);
    setMessage({ text: "Doğru seçim!", type: 'success' });

    // Check Win Condition (V - 1 edges)
    if (newSelected.size === nodes.length - 1) {
      setGameStatus('won');
      setMessage({ text: "Tebrikler! Minimum Tarama Ağacını başarıyla tamamladın.", type: 'success' });
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Top Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <MousePointerClick className="text-violet-600" />
            Uygulama Alanı
          </h2>
          <p className="text-sm text-slate-500">Kenarlara tıklayarak en küçük ağacı (MST) oluştur.</p>
        </div>
        
        <div className="flex items-center gap-6">
           <div className="text-center">
              <span className="block text-xs text-slate-500 font-bold uppercase">Toplam Ağırlık</span>
              <span className="text-2xl font-mono font-bold text-violet-600">{currentWeight}</span>
           </div>
           <div className="text-center">
              <span className="block text-xs text-slate-500 font-bold uppercase">Durum</span>
              <span className="text-lg font-bold text-slate-700">
                {selectedEdgeIds.size} / {nodes.length > 0 ? nodes.length - 1 : 0} Kenar
              </span>
           </div>
           <button
              onClick={generateGraph}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-medium"
            >
              <RotateCcw size={18} /> Yeniden Başla
            </button>
        </div>
      </div>

      {/* Message Area */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 animate-fade-in ${
          message.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
          message.type === 'success' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          {message.type === 'error' && <AlertCircle size={24} />}
          {message.type === 'success' && <CheckCircle size={24} />}
          {message.type === 'info' && <AlertCircle size={24} className="rotate-180" />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Game Area */}
      <div className="relative flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden" style={{ minHeight: '500px' }}>
        
        {gameStatus === 'won' && (
          <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center animate-fade-in">
            <Trophy size={80} className="text-yellow-500 mb-4 drop-shadow-lg" />
            <h3 className="text-4xl font-extrabold text-slate-800 mb-2">Harika İş!</h3>
            <p className="text-xl text-slate-600 mb-6">Kruskal algoritmasını başarıyla uyguladın.</p>
            <button
              onClick={generateGraph}
              className="px-8 py-3 bg-violet-600 text-white rounded-xl font-bold text-lg hover:bg-violet-700 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
            >
              Yeni Test Başlat
            </button>
          </div>
        )}

        <svg width="100%" height="100%" viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
           {/* Edges */}
           {edges.map((edge) => {
              const sourceNode = nodes.find(n => n.id === edge.source);
              const targetNode = nodes.find(n => n.id === edge.target);
              if (!sourceNode || !targetNode) return null;

              const isSelected = selectedEdgeIds.has(edge.id);
              
              return (
                <g 
                  key={edge.id} 
                  onClick={() => handleEdgeClick(edge.id)}
                  className={`cursor-pointer transition-opacity ${gameStatus === 'won' ? '' : 'hover:opacity-80'}`}
                  style={{ pointerEvents: gameStatus === 'won' ? 'none' : 'all' }}
                >
                  {/* Invisible wide stroke for easier clicking */}
                  <line
                    x1={sourceNode.x}
                    y1={sourceNode.y}
                    x2={targetNode.x}
                    y2={targetNode.y}
                    stroke="transparent"
                    strokeWidth="20"
                  />
                  {/* Visible Line */}
                  <line
                    x1={sourceNode.x}
                    y1={sourceNode.y}
                    x2={targetNode.x}
                    y2={targetNode.y}
                    stroke={isSelected ? '#10B981' : '#CBD5E1'}
                    strokeWidth={isSelected ? 6 : 4}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                  {/* Weight Label Background */}
                  <circle 
                    cx={(sourceNode.x + targetNode.x) / 2}
                    cy={(sourceNode.y + targetNode.y) / 2}
                    r="14"
                    fill="white"
                    stroke={isSelected ? '#10B981' : '#94A3B8'}
                    strokeWidth={isSelected ? 2 : 1}
                    className="transition-colors duration-300"
                  />
                  {/* Weight Label */}
                  <text
                    x={(sourceNode.x + targetNode.x) / 2}
                    y={(sourceNode.y + targetNode.y) / 2}
                    textAnchor="middle"
                    dy=".3em"
                    fontSize="12"
                    fontWeight="bold"
                    fill={isSelected ? '#065F46' : '#475569'}
                    className="select-none"
                  >
                    {edge.weight}
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map((node) => (
              <g key={node.id} transform={`translate(${node.x},${node.y})`}>
                <circle
                  r={NODE_RADIUS}
                  fill="white"
                  stroke="#8B5CF6"
                  strokeWidth="3"
                  className="shadow-md"
                />
                <text
                  textAnchor="middle"
                  dy=".3em"
                  className="font-bold text-slate-700 select-none pointer-events-none"
                >
                  {node.id}
                </text>
              </g>
            ))}
        </svg>
      </div>
    </div>
  );
};

export default PracticeMode;
