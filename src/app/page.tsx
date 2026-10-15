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
  const [workflowName, setWorkflowName] = useState<string>('Flux Nou');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEtapaIndex, setSelectedEtapaIndex] = useState<number>(0);
  const [numeBlocNou, setNumeBlocNou] = useState<string>(ETAPE_DISPOZITIV[0].nume);
  const [showFluxPanel, setShowFluxPanel] = useState<boolean>(false);
  const [allWorkflows, setAllWorkflows] = useState<Array<{ id: string; name: string; createdAt: string; canvasData?: string }>>([]);

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

  const fetchWorkflows = async () => {
    try {
      const response = await fetch('/api/workflows');
      if (!response.ok) return [];
      const data = await response.json();
      if (Array.isArray(data)) {
        setAllWorkflows(data);
        return data;
      }
      return [];
    } catch (err) {
      console.error('Eroare la preluarea fluxurilor:', err);
      return [];
    }
  };

  const selectWorkflow = (wf: { id: string; name: string; canvasData?: string }) => {
    try {
      if (!wf.canvasData) {
        alert('Fluxul nu conține date de diagramă!');
        return;
      }
      const parsedData = JSON.parse(wf.canvasData);
      setWorkflowId(wf.id);
      setWorkflowName(wf.name || 'Flux Salvat');
      setNodes(parsedData.nodes || []);
      setEdges(parsedData.edges || []);
      setSelectedNodeId(null);
      setShowFluxPanel(false);
    } catch (err) {
      console.error('Eroare la încărcarea fluxului:', err);
      alert('Eroare la încărcarea fluxului selectat!');
    }
  };

  const creeazaDiagramaNoua = () => {
    setWorkflowId(null);
    setWorkflowName('Flux Nou');
    setNodes([
      {
        id: '1',
        data: { label: 'Start Dispozitiv' },
        position: { x: 100, y: 150 },
        style: {
          background: 'rgba(20, 20, 35, 0.85)',
          color: '#00f3ff',
          border: '1px solid #00f3ff',
          borderRadius: '8px',
          boxShadow: '0 0 10px #00f3ff',
          cursor: 'pointer',
          fontWeight: 'bold',
          padding: '10px'
        }
      }
    ]);
    setEdges([]);
    setSelectedNodeId(null);
    setShowFluxPanel(false);
  };

  const addWorkFlow = async () => {
    const numeSalvat = workflowName.trim() || 'Flux Nou';
    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: numeSalvat,
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
      await fetchWorkflows();
    } catch (err) {
      console.error('Eroare la salvarea fluxului:', err);
      alert('Eroare la salvarea fluxului!');
    }
  };

  const updateWorkFlow = async () => {
    if (!workflowId) {
      alert('Niciun flux salvat nu este activ. Salvați un flux nou mai întâi!');
      return;
    }
    const numeSalvat = workflowName.trim() || 'Flux Actualizat';
    try {
      const response = await fetch('/api/workflows', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: workflowId,
          name: numeSalvat,
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
      await fetchWorkflows();
    } catch (err) {
      console.error('Eroare la actualizarea fluxului:', err);
      alert('Eroare la actualizarea fluxului!');
    }
  };

  const deleteWorkflowById = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm('Ești sigur că vrei să elimini acest flux?')) return;
    try {
      const response = await fetch('/api/workflows', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.error || 'Eroare la ștergerea fluxului!');
        return;
      }
      alert(data.message || 'Flux șters cu succes!');
      if (workflowId === id) {
        setWorkflowId(null);
        setWorkflowName('Flux Nou');
      }
      await fetchWorkflows();
    } catch (err) {
      console.error('Eroare la ștergerea fluxului:', err);
      alert('Eroare la ștergerea fluxului!');
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
    const initWorkflows = async () => {
      const wfs = await fetchWorkflows();
      if (wfs && wfs.length > 0) {
        // Încarcă primul flux găsit automat pe canvas
        selectWorkflow(wfs[0]);
      }
    };
    initWorkflows();
  }, []);

  return (
    <main style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>

      {/* Navbar Glassmorphism */}
      <header className="glass-panel" style={{ margin: '15px', padding: '12px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10, flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <h1 style={{ color: 'var(--neon-cyan)', fontSize: '22px', fontWeight: 'bold', textShadow: '0 0 10px rgba(0,243,255,0.5)', margin: 0 }}>
            ⚡ CYBER-ZAP
          </h1>

          {/* Selector / Editor Nume Flux Curent */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0, 0, 0, 0.45)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(0,243,255,0.3)' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Nume:</span>
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              placeholder="Nume flux..."
              style={{
                background: 'transparent',
                border: 'none',
                color: '#00f3ff',
                fontWeight: 'bold',
                outline: 'none',
                width: '140px',
                fontSize: '13px'
              }}
            />
            {workflowId ? (
              <span title="Flux salvat în baza de date" style={{ color: '#00ff88', fontSize: '11px', background: 'rgba(0,255,136,0.1)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(0,255,136,0.3)', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                ● Salvat
              </span>
            ) : (
              <span title="Diagramă nesalvată încă" style={{ color: '#ffaa00', fontSize: '11px', background: 'rgba(255,170,0,0.1)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(255,170,0,0.3)', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                ● Nou
              </span>
            )}
          </div>
        </div>

        {/* Butoane Gestionare Fluxuri */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => {
              fetchWorkflows();
              setShowFluxPanel(true);
            }}
            style={{
              background: showFluxPanel ? 'rgba(0,243,255,0.2)' : 'transparent',
              color: '#00f3ff',
              padding: '9px 16px',
              border: '1px solid #00f3ff',
              borderRadius: '8px',
              boxShadow: '0 0 10px rgba(0,243,255,0.3)',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px'
            }}
          >
            📁 Fluxuri ({allWorkflows.length})
          </button>

          <button
            onClick={addWorkFlow}
            title="Salvează ca flux nou în baza de date"
            style={{
              background: 'transparent',
              color: '#00ff88',
              padding: '9px 16px',
              border: '1px solid #00ff88',
              borderRadius: '8px',
              boxShadow: '0 0 10px rgba(0,255,136,0.3)',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '13px'
            }}
          >
            💾 Salvează Nou
          </button>

          {workflowId && (
            <button
              onClick={updateWorkFlow}
              title="Actualizează fluxul activ existent"
              style={{
                background: 'transparent',
                color: '#ffcc00',
                padding: '9px 16px',
                border: '1px solid #ffcc00',
                borderRadius: '8px',
                boxShadow: '0 0 10px rgba(255,204,0,0.3)',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '13px'
              }}
            >
              ⚡ Actualizează
            </button>
          )}

          <button
            onClick={creeazaDiagramaNoua}
            title="Golește canvas-ul pentru a începe o diagramă nouă"
            style={{
              background: 'transparent',
              color: '#ff00ff',
              padding: '9px 14px',
              border: '1px solid #ff00ff',
              borderRadius: '8px',
              boxShadow: '0 0 10px rgba(255,0,255,0.3)',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '13px'
            }}
          >
            ✨ Nou
          </button>
        </div>
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

      {/* Modal Panou Gestionare Fluxuri */}
      {showFluxPanel && (
        <div
          onClick={() => setShowFluxPanel(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div
            className="glass-panel"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '560px',
              maxHeight: '80vh',
              background: 'rgba(15, 15, 30, 0.96)',
              border: '1px solid rgba(0, 243, 255, 0.5)',
              borderRadius: '14px',
              boxShadow: '0 0 35px rgba(0, 243, 255, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* Header Modal */}
            <div
              style={{
                padding: '16px 22px',
                borderBottom: '1px solid rgba(0, 243, 255, 0.25)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(0, 243, 255, 0.05)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '22px' }}>📁</span>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#00f3ff', margin: 0 }}>
                    Gestionare Fluxuri Cyber-Zap
                  </h2>
                  <span style={{ fontSize: '12px', color: '#8892b0' }}>
                    {allWorkflows.length} {allWorkflows.length === 1 ? 'flux salvat' : 'fluxuri salvate'} în baza de date
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowFluxPanel(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#8892b0',
                  fontSize: '18px',
                  cursor: 'pointer',
                  padding: '4px 8px'
                }}
              >
                ✖
              </button>
            </div>

            {/* Listă Fluxuri */}
            <div
              style={{
                padding: '16px 20px',
                overflowY: 'auto',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              {allWorkflows.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#8892b0' }}>
                  <div style={{ fontSize: '36px', marginBottom: '10px' }}>📭</div>
                  <p style={{ margin: 0, fontWeight: 'bold', color: '#fff' }}>Nu există fluxuri salvate încă.</p>
                  <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#626d8a' }}>
                    Construiește o diagramă pe canvas și apasă pe &quot;Salvează Nou&quot;.
                  </p>
                </div>
              ) : (
                allWorkflows.map((wf) => {
                  const isActive = wf.id === workflowId;
                  return (
                    <div
                      key={wf.id}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '10px',
                        background: isActive ? 'rgba(0, 243, 255, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                        border: `1px solid ${isActive ? '#00f3ff' : 'rgba(255, 255, 255, 0.1)'}`,
                        boxShadow: isActive ? '0 0 12px rgba(0, 243, 255, 0.2)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 'bold', color: isActive ? '#00f3ff' : '#fff', fontSize: '15px' }}>
                            {wf.name || 'Fără Nume'}
                          </span>
                          {isActive && (
                            <span
                              style={{
                                fontSize: '10px',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                background: 'rgba(0, 243, 255, 0.2)',
                                color: '#00f3ff',
                                border: '1px solid #00f3ff',
                                fontWeight: 'bold'
                              }}
                            >
                              ACTIV
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '12px', color: '#8892b0', marginTop: '3px', display: 'block' }}>
                          Creat la: {new Date(wf.createdAt).toLocaleString('ro-RO')}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => selectWorkflow(wf)}
                          disabled={isActive}
                          style={{
                            background: isActive ? 'rgba(0, 243, 255, 0.15)' : 'transparent',
                            color: isActive ? '#00f3ff' : '#00ff88',
                            border: `1px solid ${isActive ? '#00f3ff' : '#00ff88'}`,
                            padding: '7px 14px',
                            borderRadius: '6px',
                            cursor: isActive ? 'default' : 'pointer',
                            fontWeight: 'bold',
                            fontSize: '13px',
                            opacity: isActive ? 0.7 : 1
                          }}
                        >
                          {isActive ? '✓ Pe Canvas' : '📂 Încarcă'}
                        </button>
                        <button
                          onClick={(e) => deleteWorkflowById(wf.id, e)}
                          title="Șterge acest flux definitiv"
                          style={{
                            background: 'rgba(255, 0, 85, 0.15)',
                            color: '#ff0055',
                            border: '1px solid #ff0055',
                            padding: '7px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '13px'
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Modal */}
            <div
              style={{
                padding: '14px 20px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(0, 0, 0, 0.3)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <button
                onClick={creeazaDiagramaNoua}
                style={{
                  background: 'transparent',
                  color: '#ff00ff',
                  border: '1px solid #ff00ff',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  boxShadow: '0 0 8px rgba(255, 0, 255, 0.3)'
                }}
              >
                ✨ Diagramă Nouă (Reset)
              </button>
              <button
                onClick={() => setShowFluxPanel(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  padding: '8px 18px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '13px'
                }}
              >
                Închide
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
