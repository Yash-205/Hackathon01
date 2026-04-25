"use client";

import React, { useMemo, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Info } from "lucide-react";

export interface MindMapNode {
  id: string;
  label: string;
  detail: string;
  color: string;
  children?: MindMapNode[];
}

export interface MindMapData {
  central_topic: string;
  nodes: MindMapNode[];
}

interface MindMapProps {
  data: MindMapData;
}

// Layout constants
const NODE_SIZE = 100;
const ROOT_SIZE = 120;
const LEVEL_WIDTH = 220;
const MIN_GAP_Y = 50;

interface PositionedNode extends MindMapNode {
  x: number;
  y: number;
  isRoot?: boolean;
  parentId?: string;
  parentPos?: { x: number; y: number };
}

function getSubtreeHeight(node: MindMapNode, isRoot = false): number {
  const size = isRoot ? ROOT_SIZE : NODE_SIZE;
  if (!node.children || node.children.length === 0) return size + MIN_GAP_Y;
  return Math.max(
    size + MIN_GAP_Y,
    node.children.reduce((acc, child) => acc + getSubtreeHeight(child), 0)
  );
}

function layoutHorizontalTree(
  node: MindMapNode,
  x: number,
  y: number,
  isRoot = false,
  parentId?: string,
  parentPos?: { x: number; y: number }
): PositionedNode[] {
  const positionedNodes: PositionedNode[] = [{ ...node, x, y, isRoot, parentId, parentPos }];
  
  if (node.children && node.children.length > 0) {
    const totalHeight = node.children.reduce((acc, child) => acc + getSubtreeHeight(child), 0);
    let currentY = y - totalHeight / 2;
    
    node.children.forEach((child) => {
      const childHeight = getSubtreeHeight(child);
      const childY = currentY + childHeight / 2;
      positionedNodes.push(...layoutHorizontalTree(child, x + LEVEL_WIDTH, childY, false, node.id, { x, y }));
      currentY += childHeight;
    });
  }
  
  return positionedNodes;
}

function NodeModal({ node, onClose }: { node: PositionedNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        role="dialog"
        aria-modal="true"
        data-testid="node-modal"
        className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl p-8"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/5 text-white/50 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: node.color, boxShadow: `0 0 15px ${node.color}` }}
          />
          <h3 className="text-xl font-bold text-white uppercase tracking-tight">
            {node.label}
          </h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white/30 text-[10px] font-bold uppercase tracking-[0.2em]">
            <Info className="h-3 w-3" />
            Description
          </div>
          <p className="text-white/60 leading-relaxed text-sm">
            {node.detail}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function SphericalNode({ node, onClick }: { node: PositionedNode; onClick: () => void }) {
  const size = node.isRoot ? ROOT_SIZE : NODE_SIZE;

  return (
    <div
      className="absolute z-10"
      data-node-label={node.label}
      style={{
        left: node.x - size / 2,
        top: node.y - size / 2,
        width: size,
        height: size,
      }}
    >
      <motion.button
        onClick={onClick}
        data-testid="mind-map-node"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-full h-full rounded-full overflow-hidden border border-white/10 bg-[#0a0a0a] hover:bg-white/5 transition-all cursor-pointer relative flex flex-col items-center justify-center p-4 text-center group"
        style={{
          backgroundColor: `${node.color}15`,
          borderColor: `${node.color}30`,
        }}
      >
        <div 
          className="absolute inset-0 rounded-full opacity-10 blur-xl -z-10 group-hover:opacity-20 transition-opacity"
          style={{ backgroundColor: node.color }}
        />
        <span className="text-[10px] font-black text-white uppercase tracking-tighter leading-none w-full px-1">
          {node.label}
        </span>
      </motion.button>
    </div>
  );
}

export function MindMap({ data }: MindMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [selectedNode, setSelectedNode] = useState<PositionedNode | null>(null);

  const positionedNodes = useMemo(() => {
    const root: MindMapNode = {
      id: "root",
      label: data.central_topic,
      detail: "Core Theme of the discussion.",
      color: "#8b5cf6",
      children: data.nodes
    };
    return layoutHorizontalTree(root, 0, 0, true);
  }, [data]);

  const bounds = useMemo(() => {
    let minX = 0, maxX = 0, minY = 0, maxY = 0;
    positionedNodes.forEach(n => {
      minX = Math.min(minX, n.x);
      maxX = Math.max(maxX, n.x);
      minY = Math.min(minY, n.y);
      maxY = Math.max(maxY, n.y);
    });
    return {
      minX: minX - 100,
      maxX: maxX + 100,
      minY: minY - 100,
      maxY: maxY + 100,
      width: (maxX - minX) + 200,
      height: (maxY - minY) + 200
    };
  }, [positionedNodes]);

  const centerX = (bounds.maxX + bounds.minX) / 2;
  const centerY = (bounds.maxY + bounds.minY) / 2;

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        setScale(Math.min(1, (offsetWidth - 80) / bounds.width, (offsetHeight - 80) / bounds.height));
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [bounds]);

  return (
    <div 
      ref={containerRef} 
      data-testid="mind-map-container"
      className="w-full h-full overflow-hidden flex items-center justify-center bg-[#030303] relative"
    >
      <AnimatePresence>
        {selectedNode && (
          <NodeModal node={selectedNode} onClose={() => setSelectedNode(null)} />
        )}
      </AnimatePresence>

      <motion.div 
        className="relative flex items-center justify-center z-10"
        animate={{ scale }}
        transition={{ duration: 0.2 }}
        style={{ width: bounds.width, height: bounds.height }}
      >
        <div className="absolute" style={{ left: `calc(50% - ${centerX}px)`, top: `calc(50% - ${centerY}px)` }}>
          <svg className="absolute inset-0 pointer-events-none" style={{ width: bounds.width, height: bounds.height, overflow: "visible" }}>
            {positionedNodes.map((node) => {
              if (!node.parentPos) return null;
              const midX = (node.parentPos.x + node.x) / 2;
              return (
                <path
                  key={`edge-${node.id}`}
                  d={`M ${node.parentPos.x} ${node.parentPos.y} C ${midX} ${node.parentPos.y}, ${midX} ${node.y}, ${node.x} ${node.y}`}
                  fill="none"
                  stroke={node.color}
                  strokeWidth={1.5}
                  strokeOpacity={0.2}
                />
              );
            })}
          </svg>

          {positionedNodes.map((node) => (
            <SphericalNode 
              key={node.id} 
              node={node} 
              onClick={() => setSelectedNode(node)}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default MindMap;
