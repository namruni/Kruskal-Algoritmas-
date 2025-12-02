import React, { useEffect, useState, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { Edge, Node, GraphData, LogStep } from '../types';
import { UnionFind } from '../utils/dsu';
import { Play, RotateCcw, SkipForward, Plus } from 'lucide-react';

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
  
  // Simulation ref to keep track of d3 simulation
  const simulationRef = useRef<d3.Simulation<d3.SimulationNodeDatum, undefined> | null>(null);

  // Generate a random connected graph
  const generateGraph = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(-1);
    setLogs([]);
    setMstWeight(0);

    // Increase number of nodes: 8 to 12
    const numNodes = Math.floor(Math.random() * 5) + 8;
    
    // Spread initial positions much wider
    const newNodes: Node[] = Array.from({ length: numNodes }, (_, i) => ({
      id: String.fromCharCode(65 + i), // A, B, C...
      // Use 80% of width/height for initial scatter
      x: WIDTH / 2 + (Math.random() - 0.5) * (WIDTH * 0.8),
      y: HEIGHT / 2 + (Math.random() - 0.5) * (HEIGHT * 0.8),
    }));

    const possibleEdges: Edge[] = [];
    const connectedPairs = new Set<string>();

    // Create a spanning tree first to ensure connectivity
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

    // Add random extra edges for complexity
    // Target roughly 1.6x edges per node to ensure good density
    const targetEdgeCount = Math.floor(numNodes * 1.6); 
    let attempts = 0;
    
    // Safety break after 200 attempts
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
    
    // Sort edges for Kruskal's
    const sorted = [...possibleEdges].sort((a, b) => a.weight - b.weight);
    setSortedEdges(sorted);

    // Initialize D3 simulation
    if (simulationRef.current) simulationRef.current.stop();

    // Create a copy of edges for D3 to use
    const simulationLinks = possibleEdges.map(e => ({ ...e }));

    simulationRef.current = d3.forceSimulation(newNodes as d3.SimulationNodeDatum[])
      .force("link", d3.forceLink(simulationLinks).id((d: any) => d.id).distance(100))
      // Stronger repulsion to spread nodes out
      .force("charge", d3.forceManyBody().strength(-1000))
      .force("center", d3.forceCenter(WIDTH / 2, HEIGHT / 2))
      .force("collide", d3.forceCollide(NODE_RADIUS + 25))
      .on("tick", () => {
        // Constrain nodes to be within the SVG box so they don't fly off
        newNodes.forEach(node => {
            node.x = Math.max(NODE_RADIUS, Math.min(WIDTH - NODE_RADIUS, node.x));
            node.y = Math.max(NODE_RADIUS, Math.min(HEIGHT - NODE_RADIUS, node.y));
        });
        setNodes([...newNodes]); // Trigger re-render on tick
      });

  }, []);

  // Initial load
  useEffect(() => {
    generateGraph();
    return () => {
      if (simulationRef.current) simulationRef.current.stop();
    };
  }, [generateGraph]);

  // Step Logic
  const nextStep = () => {
    if (currentStep >= sortedEdges.length - 1) {
      setIsPlaying(false);
      return;
    }

    const nextIndex = currentStep + 1;
    const edgeToProcess = sortedEdges[nextIndex];
    
    // Re-calculate state based on history up to this point to ensure correctness
    const dsu = new UnionFind(nodes.map(n => n.id));
    let currentMstWeight = 0;
    
    // Process all edges up to previous step to rebuild DSU state
    const newEdges: Edge[] = edges.map(e => ({ ...e, status: 'default' }));
    
    for (let i = 0; i < nextIndex; i++) {
      const e = sortedEdges[i];
      const mainEdgeIndex = newEdges.findIndex(ne => ne.id === e.id);
      
      if (dsu.union(e.source, e.target)) {
        if (mainEdgeIndex !== -1) newEdges[mainEdgeIndex].status = 'accepted';
        currentMstWeight += e.weight;
      } else {
        if (mainEdgeIndex !== -1) newEdges[mainEdgeIndex].status = 'rejected';
      }
    }

    // Now process the current edge
    const mainEdgeIndex = newEdges.findIndex(ne => ne.id === edgeToProcess.id);
    let log: LogStep;

    // Check if adding this edge creates a cycle
    // Note: We use 'find' to check without modifying, then 'union' if valid
    const root1 = dsu.find(edgeToProcess.source);
    const root2 = dsu.find(edgeToProcess.target);

    if (root1 !== root2) {
      if (mainEdgeIndex !== -1) newEdges[mainEdgeIndex].status = 'accepted';
      log = {
        message: `${edgeToProcess.source}-${edgeToProcess.target} kenarı seçildi (Ağırlık: ${edgeToProcess.weight}). Döngü oluşturmuyor.`,
        type: 'success',
        edgeId: edgeToProcess.id
      };
      setMstWeight(currentMstWeight + edgeToProcess.weight);
    } else {
      if (mainEdgeIndex !== -1) newEdges[mainEdgeIndex].status = 'rejected';
      log = {
        message: `${edgeToProcess.source}-${edgeToProcess.target} kenarı reddedildi (Ağırlık: ${edgeToProcess.weight}). Döngü oluşturuyor!`,
        type: 'error',
        edgeId: edgeToProcess.id
      };
      setMstWeight(currentMstWeight); // Weight doesn't increase
    }

    setEdges(newEdges);
    setLogs(prev => [log, ...prev]);
    setCurrentStep(nextIndex);
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
  }, [isPlaying, currentStep, sortedEdges, edges]); 

  const reset = () => {
    setIsPlaying(false);
    setCurrentStep(-1);
    setLogs([]);
    setMstWeight(0);
    setEdges(edges.map(e => ({ ...e, status: 'default' })));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Canvas Area */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <button
              onClick={generateGraph}
              className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <RotateCcw size={16} /> Yeni Karmaşık Çizge
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={currentStep >= sortedEdges.length - 1}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                isPlaying ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-emerald-600 text-white hover:bg-emerald-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isPlaying ? 'Duraklat' : 'Oynat'} <Play size={16} />
            </button>
            <button
              onClick={nextStep}
              disabled={isPlaying || currentStep >= sortedEdges.length - 1}
              className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition disabled:opacity-50"
            >
              İleri <SkipForward size={16} />
            </button>
          </div>
          <div className="text-lg font-bold text-slate-800">
            MST Ağırlığı: <span className="text-indigo-600">{mstWeight}</span>
          </div>
        </div>

        <div className="relative flex-1 bg-slate-50 rounded-lg overflow-hidden border border-slate-200" style={{ minHeight: '500px' }}>
          <svg width="100%" height="100%" viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
            {/* Edges */}
            {edges.map((edge) => {
              const sourceNode = nodes.find(n => n.id === edge.source);
              const targetNode = nodes.find(n => n.id === edge.target);
              
              // Only render if we have valid node coordinates
              if (!sourceNode || !targetNode) return null;

              // Default style (black edges)
              let strokeColor = '#000000'; 
              let strokeWidth = 2;
              let strokeDasharray = "";
              let zIndex = 0;

              if (edge.status === 'accepted') {
                strokeColor = '#10B981'; // Vivid Green for MST
                strokeWidth = 6; // Thicker for emphasis
                zIndex = 10;
              } else if (edge.status === 'rejected') {
                strokeColor = '#EF4444'; // Red
                strokeWidth = 1;
                strokeDasharray = "5,5"; // Dashed for rejected
                zIndex = 0;
              } else if (currentStep > -1 && sortedEdges[currentStep + 1]?.id === edge.id && isPlaying) {
                 // Prediction/Current highlight
                 strokeColor = '#F59E0B'; // Amber/Orange
                 strokeWidth = 4;
                 zIndex = 5;
              }

              return (
                <g key={edge.id} style={{ zIndex }}>
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
                    r="10"
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
                    fontSize="10"
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
                  stroke="#3B82F6"
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

      {/* Sidebar / Info Panel */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        {/* Sorted Edges List */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 h-64 overflow-hidden flex flex-col">
          <h3 className="font-bold text-slate-700 mb-2 pb-2 border-b">Kenar Listesi (Sıralı)</h3>
          <div className="overflow-y-auto flex-1 pr-2 space-y-1">
            {sortedEdges.map((edge, index) => {
              const isProcessed = index <= currentStep;
              const status = edges.find(e => e.id === edge.id)?.status;
              
              let bgClass = "bg-slate-50";
              let textClass = "text-slate-600";
              
              if (index === currentStep) {
                // Just processed
                if (status === 'accepted') {
                   bgClass = "bg-emerald-100 border-l-4 border-emerald-500";
                   textClass = "text-emerald-700 font-bold";
                } else {
                   bgClass = "bg-red-100 border-l-4 border-red-500";
                   textClass = "text-red-700 font-bold";
                }
              } else if (isProcessed) {
                 if (status === 'accepted') {
                    bgClass = "bg-emerald-50/50 opacity-70";
                    textClass = "text-emerald-800";
                 } else {
                    bgClass = "bg-red-50/50 opacity-50 line-through";
                    textClass = "text-red-800";
                 }
              }

              return (
                <div key={edge.id} className={`p-2 rounded text-sm flex justify-between items-center ${bgClass} ${textClass}`}>
                  <span>{edge.source} - {edge.target}</span>
                  <span>Ağırlık: {edge.weight}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Logs */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 h-64 overflow-hidden flex flex-col">
          <h3 className="font-bold text-slate-700 mb-2 pb-2 border-b">İşlem Günlüğü</h3>
          <div className="overflow-y-auto flex-1 space-y-2">
            {logs.length === 0 && <p className="text-slate-400 text-sm italic">Henüz işlem yapılmadı.</p>}
            {logs.map((log, i) => (
              <div key={i} className={`text-sm p-2 rounded ${
                log.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 
                log.type === 'error' ? 'bg-red-50 text-red-800' : 'bg-slate-50 text-slate-700'
              }`}>
                {log.message}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Visualizer;