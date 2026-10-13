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

interface EtapeTemplate {
  nume: string;
  culoare: string;
}

const ETAPE_DISPOZITIV: EtapeTemplate[] = [
  { nume: '🔌 Inițializare: Alimentare', culoare: '#00f3ff' },
  { nume: '📡 Senzori: Achiziție Date', culoare: '#00ff00' },
  { nume: '⚙️ Procesare: Calcul & Filtru', culoare: '#ff00ff' },
  { nume: '📶 Transmisie: Comunicație IoT', culoare: '#ffcc00' },
  { nume: '🚨 Protecție: Alertă / Eroare', culoare: '#ff0055' },
  { nume: '💤 Standby: Mod Economic', culoare: '#a855f7' }
];

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
  const [selectedEtapaIndex, setSelectedEtapaIndex] = useState<number>(0);
  const [numeBlocNou, setNumeBlocNou] = useState<string>(ETAPE_DISPOZITIV[0].nume);

  const handleEtapaChange = (index: number) => {
    setSelectedEtapaIndex(index);
    setNumeBlocNou(ETAPE_DISPOZITIV[index]?.nume || '');
  };

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
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const schimbaTextNod = (textNou: string) => {
    setNodes((noduri) => noduri.map((nod) => nod.id === selectedNodeId ? { ...nod, data: { ...nod.data, label: textNou } } : nod))
  };
  const schimbaCuloareNod = (culoareNoua: string) => {
    setNodes((noduri) => noduri.map((nod) => nod.id === selectedNodeId ? {
      ...nod, style: {
        ...nod.style, color: culoareNoua, border: `1px solid ${culoareNoua}`, boxShadow: `0 0 10px ${culoareNoua}`
      }
    } : nod))
  };

  const stergeBlocSelectat = () => {
    if (!selectedNodeId) return;
    const id = selectedNodeId;
    setNodes((noduri) => noduri.filter((n) => n.id !== id));
    setEdges((muchii) => muchii.filter((e) => e.source !== id && e.target !== id));
    setSelectedNodeId(null);
  };

  const onNodesDelete = useCallback((nodesToDelete: Node[]) => {
    const idsToDelete = new Set(nodesToDelete.map((n) => n.id));
    setEdges((eds) => eds.filter((e) => !idsToDelete.has(e.source) && !idsToDelete.has(e.target)));
    if (selectedNodeId && idsToDelete.has(selectedNodeId)) {
      setSelectedNodeId(null);
    }
  }, [selectedNodeId]);


  const loadWorkFlow = async (showEmptyAlert = true) => {
    try {
      const response = await fetch('/api/workflows');
      if (!response.ok) {
        console.error('Eroare la încărcare flux: status', response.status);
        if (showEmptyAlert) alert(`Eroare la încărcare flux (${response.status})`);
        return;
      }
      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) {
        if (showEmptyAlert) alert('Nu există fluxuri salvate!');
        return;
      }

      if (data.length > 0) {
        const parsedData = JSON.parse(data[0].canvasData);
        setWorkflowId(data[0].id);
        setNodes(parsedData.nodes);
        setEdges(parsedData.edges);
      }
    } catch (err) {
      console.error('Eroare la încărcarea fluxului:', err);
      if (showEmptyAlert) alert('Eroare la conectarea cu serverul!');
    }
  };

  const deleteWorkFlow = async () => {
    if (!workflowId) {
      alert('Nici un flux nu este selectat. Apăsați pe "Adaugă Fluxul" pentru a adăuga un nou flux.');
      return;
    }
    try {
      const response = await fetch('/api/workflows', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: workflowId })
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.error || 'Eroare la ștergerea fluxului!');
        return;
      }
      alert(data.message || 'Flux șters cu succes!');
      setWorkflowId(null);
    } catch (err) {
      console.error('Eroare la ștergerea fluxului:', err);
      alert('Eroare la ștergerea fluxului!');
    }
  };

  const addWorkFlow = async () => {
    try {
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
      if (!response.ok) {
        alert(data.error || 'Eroare la salvarea fluxului!');
        return;
      }
      alert(data.message || 'Flux salvat cu succes!');
      if (data.workflow?.id) {
        setWorkflowId(data.workflow.id);
      }
    } catch (err) {
      console.error('Eroare la salvarea fluxului:', err);
      alert('Eroare la salvarea fluxului!');
    }
  };

  const updateWorkFlow = async () => {
    if (!workflowId) {
      alert('Nici un flux nu este selectat. Apăsați pe "Adaugă Fluxul" pentru a adăuga un nou flux.');
      return;
    }
    try {
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
      if (!response.ok) {
        alert(data.error || 'Eroare la actualizarea fluxului!');
        return;
      }
      alert(data.message || 'Flux actualizat cu succes!');
    } catch (err) {
      console.error('Eroare la actualizarea fluxului:', err);
      alert('Eroare la actualizarea fluxului!');
    }
  };
  const adaugaBlocNou = () => {
    const sablon = ETAPE_DISPOZITIV[selectedEtapaIndex] || ETAPE_DISPOZITIV[0];
    const textFinal = numeBlocNou.trim() || sablon.nume;
    const newId = (Date.now() % 100000).toString();
    const newNode: Node = {
      id: newId,
      data: { label: textFinal },
      position: {
        x: 120 + Math.random() * 250,
        y: 100 + Math.random() * 250
      },
      style: {
        background: 'rgba(20, 20, 35, 0.85)',
        color: sablon.culoare,
        border: `1px solid ${sablon.culoare}`,
        borderRadius: '8px',
        boxShadow: `0 0 10px ${sablon.culoare}`,
        cursor: 'pointer',
        fontWeight: 'bold',
        padding: '10px'
      }
    };
    setNodes((noduriVechi) => [...noduriVechi, newNode]);
    setSelectedNodeId(newId);
    setNumeBlocNou(sablon.nume);
  };
  useEffect(() => {
    loadWorkFlow(false);
  }, []);

  return (
    <main style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>

      {/* Navbar Glassmorphism */}
      <header className="glass-panel" style={{ margin: '15px', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
        <h1 style={{ color: 'var(--neon-cyan)', fontSize: '24px', fontWeight: 'bold', textShadow: '0 0 10px rgba(0,243,255,0.5)' }}>
          ⚡ CYBER-ZAP
        </h1>
        <button onClick={() => loadWorkFlow(true)} style={{ background: 'transparent', color: '#ff00ff', padding: '10px 20px', border: '1px solid #ff00ff', borderRadius: '8px', boxShadow: '0 0 10px rgba(255,0,255,0.3)', cursor: 'pointer', fontWeight: 'bold' }}>
          💾 Încarcă Fluxul
        </button>
        <button onClick={addWorkFlow} style={{ background: 'transparent', color: '#00ff00', padding: '10px 20px', border: '1px solid #00ff00', borderRadius: '8px', boxShadow: '0 0 10px rgba(0,255,0,0.3)', cursor: 'pointer', fontWeight: 'bold' }}>
          ➕ Salvează Flux Nou
        </button>
        <button onClick={updateWorkFlow} style={{ background: 'transparent', color: '#00f3ff', padding: '10px 20px', border: '1px solid #00f3ff', borderRadius: '8px', boxShadow: '0 0 10px rgba(0,243,255,0.3)', cursor: 'pointer', fontWeight: 'bold' }}>
          ⚡ Actualizează Fluxul
        </button>
        <button onClick={deleteWorkFlow} style={{ background: 'transparent', color: '#ff0000', padding: '10px 20px', border: '1px solid #ff0000', borderRadius: '8px', boxShadow: '0 0 10px rgba(255,0,0,0.3)', cursor: 'pointer', fontWeight: 'bold' }}>
          🗑️ Șterge Fluxul
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select
            value={selectedEtapaIndex}
            onChange={(e) => handleEtapaChange(Number(e.target.value))}
            style={{
              background: 'rgba(20, 20, 35, 0.95)',
              color: ETAPE_DISPOZITIV[selectedEtapaIndex]?.culoare || '#ffcc00',
              border: `1px solid ${ETAPE_DISPOZITIV[selectedEtapaIndex]?.culoare || '#ffcc00'}`,
              borderRadius: '8px',
              padding: '9px 12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              outline: 'none',
              boxShadow: `0 0 8px ${ETAPE_DISPOZITIV[selectedEtapaIndex]?.culoare || '#ffcc00'}44`
            }}
          >
            {ETAPE_DISPOZITIV.map((etapa, idx) => (
              <option key={idx} value={idx} style={{ background: '#141423', color: etapa.culoare }}>
                {etapa.nume}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Nume bloc personalizat..."
            value={numeBlocNou}
            onChange={(e) => setNumeBlocNou(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                adaugaBlocNou();
              }
            }}
            style={{
              background: 'rgba(0, 0, 0, 0.6)',
              color: '#fff',
              border: `1px solid ${ETAPE_DISPOZITIV[selectedEtapaIndex]?.culoare || '#ffcc00'}`,
              borderRadius: '8px',
              padding: '9px 14px',
              outline: 'none',
              minWidth: '220px',
              fontWeight: '500'
            }}
          />
          <button
            onClick={adaugaBlocNou}
            style={{
              background: 'transparent',
              color: ETAPE_DISPOZITIV[selectedEtapaIndex]?.culoare || '#ffcc00',
              padding: '10px 18px',
              border: `1px solid ${ETAPE_DISPOZITIV[selectedEtapaIndex]?.culoare || '#ffcc00'}`,
              borderRadius: '8px',
              boxShadow: `0 0 10px ${ETAPE_DISPOZITIV[selectedEtapaIndex]?.culoare || '#ffcc00'}55`,
              cursor: 'pointer',
              fontWeight: 'bold',
              whiteSpace: 'nowrap'
            }}
          >
            ➕ Adaugă Bloc
          </button>
        </div>
        <div style={{ color: 'var(--text-secondary)' }}>
          Visual Workflow Builder v1.0
        </div>
      </header>
      {selectedNode && (
        <div style={{ padding: '12px 25px', background: 'rgba(20,20,35,0.95)', borderBottom: '1px solid rgba(0,243,255,0.4)', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ color: 'white', fontWeight: 'bold' }}>Editează Etapa {selectedNode.id}:</span>
          {/*Input Text (preia automat textul curent al nodului) */}
          <input
            type="text"
            placeholder="Nume etapă..."
            value={(selectedNode.data?.label as string) || ''}
            onChange={(e) => schimbaTextNod(e.target.value)}
            style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', border: '1px solid #00f3ff', padding: '6px 12px', borderRadius: '6px', outline: 'none', minWidth: '220px' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: "var(--text-secondary)", fontSize: '14px' }}>Culoare:</span>
            <input
              type="color"
              value={(selectedNode.style?.color as string) || '#00f3ff'}
              onChange={(e) => schimbaCuloareNod(e.target.value)}
              style={{ width: '36px', height: '36px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: 'transparent' }}
            />
          </div>
          {/* Buton Șterge Blocul */}
          <button
            onClick={stergeBlocSelectat}
            style={{
              background: 'rgba(255, 0, 85, 0.15)',
              color: '#ff0055',
              border: '1px solid #ff0055',
              padding: '7px 14px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 0 8px rgba(255, 0, 85, 0.3)'
            }}
          >
            🗑️ Șterge Blocul
          </button>
          <button
            onClick={() => setSelectedNodeId(null)}
            style={{ marginLeft: 'auto', background: 'transparent', color: '#8892b0', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
          >
            ✖ Închide Panoul
          </button>
        </div>
      )}
      {/* Editor Container */}
      <div style={{ flex: 1, position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onNodeClick={onNodeClick}
          onNodesDelete={onNodesDelete}
          deleteKeyCode={['Backspace', 'Delete']}
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
