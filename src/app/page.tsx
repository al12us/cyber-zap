"use client";

import React, { useState, useCallback, useEffect } from 'react';
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

  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

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

  const onNodeClick = (event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
    //memorararea id-ului nodului selectat
  };
  const schimbaContinuaNod = (textNou: string, culoareNoua: string) => {
    setNodes((noduriActuale) => noduriActuale.map((nod) => {
      if (nod.id === selectedNodeId) {
        // returnnodul nou modificat
        return {
          ...nod, data: { ...nod.data, label: textNou },
          style: { ...nod.style, border: `1px solid ${culoareNoua}`, color: culoareNoua, boxShadow: `0 0 10px ${culoareNoua}` }
        }
      }
      return nod; // Return unchanged node
    }))
  }
  const saveWorkFlow = async () => {
    const response = await fetch('/api/workflows', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        name: 'Fluxul Meu Test',
        nodes: nodes,
        edges: edges
      })
    });
    const data = await response.json();
    alert(data.message);
  };

  const loadWorkFlow = async () => {
    const response = await fetch('/api/workflows');
    const data = await response.json();
    if (data.length === 0) {
      alert('Nu există fluxuri salvate!');
      return;
    }

    if (data.length > 0) {
      const parsedData = JSON.parse(data[0].canvasData);
      setWorkflowId(data[0].id);
      setNodes(parsedData.nodes);
      setEdges(parsedData.edges);
    }
  };
  const deleteWorkFlow = async () => {
    if (!workflowId) {
      alert('Nici un flux nu este selectat. Apăsați pe "Adaugă Fluxul" pentru a adăuga un nou flux.');
      return;
    }
    const response = await fetch('/api/workflows', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: workflowId })
    });
    const data = await response.json();
    alert(data.message);
    setWorkflowId(null);
  };
  const addWorkFlow = async () => {

    const response = await fetch('/api/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Fluxul Meu Test',
        nodes: nodes,
        edges: edges
      })
    });
    const data = await response.json();
    alert(data.message);
    if (data.workflow?.id) {
      setWorkflowId(data.workflow.id);
    }
  };
  const updateWorkFlow = async () => {
    if (!workflowId) {
      alert('Nici un flux nu este selectat. Apăsați pe "Adaugă Fluxul" pentru a adăuga un nou flux.');
      return;
    }
    const response = await fetch('/api/workflows', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: workflowId,
        name: 'Fluxul Meu Test',
        nodes: nodes,
        edges: edges
      })
    });
    const data = await response.json();
    alert(data.message);
  }
  const adaugaBlocNou = () => {
    const newId = (nodes.length + 1).toString();
    const newNode = {
      id: newId,
      data: { label: `⚡ Nod Nou ${newId}` },

      position: {
        x: Math.random() * 300,
        y: Math.random() * 300
      },
      style: {
        background: 'rgba(20, 20, 35, 0.7)',
        color: '#ffcc00',
        border: '1px solid #ffcc00',
        borderRadius: '8px',
        boxShadow: '0 0 10px rgba(0,243,255,0.3)',
        cursor: 'pointer',
        fontWeight: 'bold'
      }
    }
    setNodes(noduriVechi => [...noduriVechi, newNode])
  };
  useEffect(() => {
    loadWorkFlow()
  }, []);

  return (
    <main style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>

      {/* Navbar Glassmorphism */}
      <header className="glass-panel" style={{ margin: '15px', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
        <h1 style={{ color: 'var(--neon-cyan)', fontSize: '24px', fontWeight: 'bold', textShadow: '0 0 10px rgba(0,243,255,0.5)' }}>
          ⚡ CYBER-ZAP
        </h1>
        <button onClick={saveWorkFlow} style={{ background: 'transparent', color: '#00f3ff', padding: '10px 20px', border: '1px solid #00f3ff', borderRadius: '8px', boxShadow: '0 0 10px rgba(0,243,255,0.3)', cursor: 'pointer', fontWeight: 'bold' }}>
          💾 Salvează Fluxul
        </button>
        <button onClick={loadWorkFlow} style={{ background: 'transparent', color: '#ff00ff', padding: '10px 20px', border: '1px solid #ff00ff', borderRadius: '8px', boxShadow: '0 0 10px rgba(0,243,255,0.3)', cursor: 'pointer', fontWeight: 'bold' }}>
          💾 Încarcă Fluxul
        </button>
        <button onClick={addWorkFlow} style={{ background: 'transparent', color: '#00ff00', padding: '10px 20px', border: '1px solid #00ff00', borderRadius: '8px', boxShadow: '0 0 10px rgba(0,243,255,0.3)', cursor: 'pointer', fontWeight: 'bold' }}>
          Adaugă Fluxul
        </button>
        <button onClick={updateWorkFlow} style={{ background: 'transparent', color: '#00ff00', padding: '10px 20px', border: '1px solid #00ff00', borderRadius: '8px', boxShadow: '0 0 10px rgba(0,243,255,0.3)', cursor: 'pointer', fontWeight: 'bold' }}>
          Actualizează Fluxul
        </button>
        <button onClick={deleteWorkFlow} style={{ background: 'transparent', color: '#ff0000', padding: '10px 20px', border: '1px solid #ff0000', borderRadius: '8px', boxShadow: '0 0 10px rgba(0,243,255,0.3)', cursor: 'pointer', fontWeight: 'bold' }}>
          Șterge Fluxul
        </button>
        <button onClick={adaugaBlocNou} style={{ background: 'transparent', color: '#ffcc00', border: '1px solid #ffcc00', borderRadius: '8px', boxShadow: '0 0 10px rgba(255,204,0,0.3)', cursor: 'pointer', fontWeight: 'bold' }}> ➕ Creează Bloc</button>
        <div style={{ color: 'var(--text-secondary)' }}>
          Visual Workflow Builder v1.0
        </div>
      </header>
      {selectedNodeId && (
        <div style={{ padding: '15px', background: 'rgba(20,20,35,0.9)', borderBottom: '1px solid #ffcc00' }}>
          <span style={{ color: 'white', marginRight: '10px' }}>Editează Nodul {selectedNodeId}:</span>
          <input type="text" placeholder="Nume nou..." onChange={(e) => schimbaContinuaNod(e.target.value, "#ffcc00")} style={{ background: 'transparent', color: '#ffcc00', border: '1px solid #ffcc00', padding: '5px', borderRadius: '5px', marginRight: '10px' }} />
          <button onClick={() => setSelectedNodeId(null)} style={{ background: 'transparent', color: '#ff0000', border: 'none', cursor: 'pointer' }}> ✖ Închide Panoul</button>
        </div>
      )}
      {/* Editor Container */}
      <div style={{ flex: 1, position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onNodeClick={onNodeClick}
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
