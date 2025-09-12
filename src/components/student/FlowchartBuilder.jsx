import React, { useCallback } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";

const initialNodes = [
  {
    id: "1",
    type: "input", // circle start
    data: { label: "Start" },
    position: { x: 250, y: 5 },
  },
  {
    id: "2",
    data: { label: "Process" }, // rectangle
    position: { x: 250, y: 100 },
  },
  {
    id: "3",
    type: "output", // circle end
    data: { label: "End" },
    position: { x: 250, y: 200 },
  },
];

const initialEdges = [{ id: "e1-2", source: "1", target: "2" }];

export default function FlowchartBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div style={{ width: "100%", height: "400px" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
