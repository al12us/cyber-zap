"use client";

import React, { useState, useCallback } from 'react';
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection
} from 'reactflow';
import 'reactflow/dist/style.css';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: '🌟 Trigger: Email Primit' },
    position: { x: 250, y: 100 },
    style: {
      background: 'rgba(20, 20, 35, 0.7)',
      color: '#00f3ff',
      border: '1px solid #00f3ff',
      borderRadius: '8px',
      boxShadow: '0 0 10px rgba(0, 243, 255, 0.3)'
    }
  },
  {
    id: '2',
    data: { label: '⚙️ Acțiune: Salvează în BD' },
    position: { x: 250, y: 250 },
    style: {
      background: 'rgba(20, 20, 35, 0.7)',
      color: '#ff00ff',
      border: '1px solid #ff00ff',
      borderRadius: '8px',
      boxShadow: '0 0 10px rgba(255, 0, 255, 0.3)'
    },



  }, {

    id: '3',
    data: { label: '📱 Acțiune: Trimite SMS' },
    position: { x: 250, y: 400 },
    style: {
      background: 'rgba(20, 20, 35, 0.7)',
      color: '#00ff00',
      border: '1px solid #00ff00',
      borderRadius: '8px',
      boxShadow: '0 0 10px rgba(0, 255, 115, 0.8)'
    }
  }
];

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    animated: true,
    style: { stroke: '#00f3ff', strokeWidth: 2 }
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    animated: true,
    style: { stroke: '#00ff00', strokeWidth: 2 }
  }
];

export default function CyberZapApp() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge({
      ...connection,
      animated: true,
      style: { stroke: '#ff00ff', strokeWidth: 2 }
    }, eds)),
    []
  );

  return (
    <main style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>

      {/* Navbar Glassmorphism */}
      <header className="glass-panel" style={{ margin: '15px', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
        <h1 style={{ color: 'var(--neon-cyan)', fontSize: '24px', fontWeight: 'bold', textShadow: '0 0 10px rgba(0,243,255,0.5)' }}>
          ⚡ CYBER-ZAP
        </h1>
        <div style={{ color: 'var(--text-secondary)' }}>
          Visual Workflow Builder v1.0
        </div>
      </header>

      {/* Editor Container */}
      <div style={{ flex: 1, position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Background color="rgba(0, 255, 255, 0.1)" gap={16} />
          <Controls />
        </ReactFlow>
      </div>

    </main>
  );
}
