import React, { useEffect, useState, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { Edge, Node, LogStep } from '../types';
import { UnionFind } from '../utils/dsu';
import { Play, RotateCcw, SkipForward, SkipBack, Pause } from 'lucide-react';

const WIDTH = 800;
const HEIGHT = 500;
const NODE_RADIUS = 20;

const Visualizer: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [sortedEdges, setSortedEdges] = useState<Edge[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [logs, setLogs] = useState<LogStep[]>([]);
  const [mstWeight, setMstWeight] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [complexity, setComplexity] = useState<'simple' | 'complex'>('complex');
  
  // Simulation ref to keep track of d3 simulation
  const simulationRef = useRef<d3.Simulation<d3.SimulationNodeDatum, undefined> | null>(null);

  // Generate a random connected graph
  const generateGraph = useCallback((type: 'simple' | 'complex' = complexity) => {
    setIsPlaying(false);
    setCurrentStep(-1);
    setLogs([]);
    setMstWeight(0);
    setComplexity(type);

    // Node count based on complexity
    const numNodes = type === 'simple' 
      ? Math.floor(Math.random() * 3) + 5  // 5-7 nodes
      : Math.floor(Math.random() * 5) + 8; // 8-12 nodes
    
    // Spread initial positions
    const newNodes: Node[] = Array.from({ length: numNodes }, (_, i) => ({
      id: String.fromCharCode(65 + i), // A, B, C...
      x: WIDTH / 2 + (Math.random() - 0.5) * (WIDTH * 0.8),
      y: HEIGHT / 2 + (Math.random() - 0.5) * (HEIGHT * 0.8),
    }));

    const possibleEdges: Edge[] = [];
    const connectedPairs = new Set<string>();

    // Create a spanning tree first to ensure connectivity
    for (let i = 0; i < numNodes - 1; i++) {
      const weight = Math.floor(Math.random() * (type === 'simple' ? 10 : 15)) + 1;
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

    // Add random extra edges
    const edgeMultiplier = type === 'simple' ? 1.3 : 1.6;
    const targetEdgeCount = Math.floor(numNodes * edgeMultiplier); 
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
        const weight = Math.floor(Math.random() * (type === 'simple' ? 15 : 20)) + 1;
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
    
    // Sort edges for Kruskal's
    const sorted = [...possibleEdges].sort((a, b) => a.weight - b.weight);
    setSortedEdges(sorted);

    // Initialize D3 simulation
    if (simulationRef.current) simulationRef.current.stop();

    const simulationLinks = possibleEdges.map(e => ({ ...e }));

    simulationRef.current = d3.forceSimulation(newNodes as d3.SimulationNodeDatum[])
      .force("link", d3.forceLink(simulationLinks).id((d: any) => d.id).distance(type === 'simple' ? 150 : 100))
      .force("charge", d3.forceManyBody().strength(type === 'simple' ? -1500 : -1000))
      .force("center", d3.forceCenter(WIDTH / 2, HEIGHT / 2))
      .force("collide", d3.forceCollide(NODE_RADIUS + 25))
      .on("tick", () => {
        newNodes.forEach(node => {
            node.x = Math.max(NODE_RADIUS, Math.min(WIDTH - NODE_RADIUS, node.x));
            node.y = Math.max(NODE_RADIUS, Math.min(HEIGHT - NODE_RADIUS, node.y));
        });
        setNodes([...newNodes]); 
      });

  }, [complexity]);

  // Initial load
  useEffect(() => {
    generateGraph('complex');
    return () => {
      if (simulationRef.current) simulationRef.current.stop();
    };
  }, []); // Run once on mount

  // Helper to calculate visual state at any step
  const updateVisualState = (targetStep: number) => {
    const dsu = new UnionFind(nodes.map(n => n.id));
    let currentMstWeight = 0;
    const newEdges: Edge[] = edges.map(e => ({ ...e, status: 'default' }));
    
    for (let i = 0; i <= targetStep; i++) {
      const e = sortedEdges[i];
      const mainEdgeIndex = newEdges.findIndex(ne => ne.id === e.id);
      
      if (dsu.union(e.source, e.target)) {
        if (mainEdgeIndex !== -1) newEdges[mainEdgeIndex].status = 'accepted';
        currentMstWeight += e.weight;
      } else {
        if (mainEdgeIndex !== -1) newEdges[mainEdgeIndex].status = 'rejected';
      }
    }
    
    setEdges(newEdges);
    setMstWeight(currentMstWeight);
    setCurrentStep(targetStep);
  };

  const nextStep = () => {
    if (currentStep >= sortedEdges.length - 1) {
      setIsPlaying(false);
      return;
    }

    const nextIndex = currentStep + 1;
    const edgeToProcess = sortedEdges[nextIndex];
    
    // Determine log message
    // We need DSU state right before this step to know if it creates a cycle
    const dsu = new UnionFind(nodes.map(n => n.id));
    for (let i = 0; i < nextIndex; i++) {
       dsu.union(sortedEdges[i].source, sortedEdges[i].target);
    }
    
    const root1 = dsu.find(edgeToProcess.source);
    const root2 = dsu.find(edgeToProcess.target);
    const createsCycle = root1 === root2;

    let log: LogStep;
    if (!createsCycle) {
      log = {
        message: `${edgeToProcess.source}-${edgeToProcess.target} kenarı seçildi (${edgeToProcess.weight}). Döngü yok.`,
        type: 'success',
        edgeId: edgeToProcess.id
      };
    } else {
      log = {
        message: `${edgeToProcess.source}-${edgeToProcess.target} kenarı atlandı (${edgeToProcess.weight}). Döngü var!`,
        type: 'error',
        edgeId: edgeToProcess.id
      };
    }

    setLogs(prev => [log, ...prev]);
    updateVisualState(nextIndex);
  };

  const prevStep = () => {
    if (currentStep < 0) return;
    
    setLogs(prev => prev.slice(1));
    updateVisualState(currentStep - 1);
    setIsPlaying(false);
  };

  // Auto-play effect
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        if (currentStep < sortedEdges.length - 1) {
          nextStep();
        } else {
          setIsPlaying(false);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, sortedEdges]); 

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Canvas Area */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col">
        <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
          <div className="flex gap-2">
            <div className="flex bg-slate-100 rounded-lg p-1 mr-2">
               <button 
                 onClick={() => generateGraph('simple')}
                 className={`px-3 py-1.5 text-sm rounded-md transition ${complexity === 'simple' ? 'bg-white shadow-sm text-indigo-700 font-bold' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 Basit
               </button>
               <button 
                 onClick={() => generateGraph('complex')}
                 className={`px-3 py-1.5 text-sm rounded-md transition ${complexity === 'complex' ? 'bg-white shadow-sm text-indigo-700 font-bold' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 Karmaşık
               </button>
            </div>
            
            <button
              onClick={() => generateGraph(complexity)}
              className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition"
              title="Yeni Çizge"
            >
              <RotateCcw size={20} />
            </button>
            
            <div className="w-px h-8 bg-slate-200 mx-1"></div>

            <button
              onClick={prevStep}
              disabled={currentStep < 0 || isPlaying}
              className="flex items-center gap-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition disabled:opacity-50"
            >
              <SkipBack size={18} /> <span className="hidden sm:inline">Geri</span>
            </button>
            
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={currentStep >= sortedEdges.length - 1}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-medium ${
                isPlaying ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              <span className="hidden sm:inline">{isPlaying ? 'Duraklat' : 'Oynat'}</span>
            </button>
            
            <button
              onClick={nextStep}
              disabled={isPlaying || currentStep >= sortedEdges.length - 1}
              className="flex items-center gap-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition disabled:opacity-50"
            >
              <span className="hidden sm:inline">İleri</span> <SkipForward size={18} />
            </button>
          </div>
          <div className="text-lg font-bold text-slate-800 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
            MST: <span className="text-indigo-600 font-mono text-xl">{mstWeight}</span>
          </div>
        </div>

        <div className="relative flex-1 bg-slate-50 rounded-lg overflow-hidden border border-slate-200" style={{ minHeight: '500px' }}>
          <svg width="100%" height="100%" viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
            {/* Edges */}
            {edges.map((edge) => {
              const sourceNode = nodes.find(n => n.id === edge.source);
              const targetNode = nodes.find(n => n.id === edge.target);
              
              if (!sourceNode || !targetNode) return null;

              let strokeColor = '#CBD5E1'; // Slate-300 default
              let strokeWidth = 3;
              let strokeDasharray = "";
              let zIndex = 0;
              let opacity = 1;

              if (edge.status === 'accepted') {
                strokeColor = '#10B981'; // Emerald-500
                strokeWidth = 6;
                zIndex = 10;
              } else if (edge.status === 'rejected') {
                strokeColor = '#EF4444'; // Red-500
                strokeWidth = 2;
                strokeDasharray = "5,5";
                opacity = 0.4;
                zIndex = 0;
              } else if (currentStep > -1 && sortedEdges[currentStep + 1]?.id === edge.id && isPlaying) {
                 // Next up highlight
                 strokeColor = '#F59E0B'; // Amber
                 strokeWidth = 5;
                 zIndex = 5;
              } else {
                 // Default edges
                 strokeColor = '#94A3B8';
              }

              return (
                <g key={edge.id} style={{ opacity }}>
                  <line
                    x1={sourceNode.x}
                    y1={sourceNode.y}
                    x2={targetNode.x}
                    y2={targetNode.y}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                  {/* Weight Label Background */}
                  <circle 
                    cx={(sourceNode.x + targetNode.x) / 2}
                    cy={(sourceNode.y + targetNode.y) / 2}
                    r="12"
                    fill="white"
                    stroke={strokeColor}
                    strokeWidth={edge.status === 'accepted' ? 2 : 1}
                  />
                  {/* Weight Label */}
                  <text
                    x={(sourceNode.x + targetNode.x) / 2}
                    y={(sourceNode.y + targetNode.y) / 2}
                    textAnchor="middle"
                    dy=".3em"
                    fontSize="11"
                    fontWeight="bold"
                    fill="#1E293B"
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
                  stroke="#6366F1"
                  strokeWidth="3"
                  className="shadow-md"
                />
                <text
                  textAnchor="middle"
                  dy=".3em"
                  className="font-bold text-slate-700 select-none pointer-events-none text-sm"
                >
                  {node.id}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Sidebar / Info Panel */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        {/* Sorted Edges List */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 h-1/2 flex flex-col">
          <h3 className="font-bold text-slate-700 mb-2 pb-2 border-b flex justify-between">
             <span>Kenar Listesi</span>
             <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-1 rounded">Küçükten Büyüğe</span>
          </h3>
          <div className="overflow-y-auto flex-1 pr-1 space-y-1">
            {sortedEdges.map((edge, index) => {
              const isProcessed = index <= currentStep;
              const isNext = index === currentStep + 1;
              const status = edges.find(e => e.id === edge.id)?.status;
              
              let bgClass = "bg-white";
              let textClass = "text-slate-500";
              let borderClass = "border-transparent";
              
              if (index === currentStep) {
                // Just processed
                if (status === 'accepted') {
                   bgClass = "bg-emerald-50";
                   textClass = "text-emerald-700 font-bold";
                   borderClass = "border-emerald-500";
                } else {
                   bgClass = "bg-red-50";
                   textClass = "text-red-700 font-bold";
                   borderClass = "border-red-500";
                }
              } else if (isProcessed) {
                 if (status === 'accepted') {
                    bgClass = "bg-emerald-50/30";
                    textClass = "text-emerald-600/70";
                 } else {
                    bgClass = "bg-red-50/30";
                    textClass = "text-red-600/50 line-through decoration-red-300";
                 }
              } else if (isNext) {
                 bgClass = "bg-amber-50";
                 textClass = "text-amber-700 font-bold";
                 borderClass = "border-amber-400";
              }

              return (
                <div key={edge.id} className={`p-2 rounded border-l-4 text-sm flex justify-between items-center transition-all ${bgClass} ${textClass} ${borderClass}`}>
                  <span className="font-mono">{edge.source} <span className="text-xs opacity-50">---</span> {edge.target}</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${isNext ? 'bg-amber-200 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
                    {edge.weight}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Logs */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 h-1/2 flex flex-col">
          <h3 className="font-bold text-slate-700 mb-2 pb-2 border-b">Analiz Günlüğü</h3>
          <div className="overflow-y-auto flex-1 space-y-2 pr-1">
            {logs.length === 0 && <div className="text-slate-400 text-sm text-center py-8">Başlamak için 'İleri' veya 'Oynat' butonuna basın.</div>}
            {logs.map((log, i) => (
              <div key={i} className={`text-sm p-3 rounded-lg border flex gap-2 animate-fade-in ${
                log.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 
                log.type === 'error' ? 'bg-red-50 text-red-800 border-red-100' : 'bg-slate-50 text-slate-700 border-slate-100'
              }`}>
                <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${log.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                <span>{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Visualizer;