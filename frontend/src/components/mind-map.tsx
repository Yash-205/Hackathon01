"use client";

import React, { useMemo, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogTitle,
  MorphingDialogDescription,
  MorphingDialogClose,
} from "@/components/core/morphing-dialog";
import { X } from "lucide-react";

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

function SphericalNode({ node }: { node: PositionedNode }) {
  const size = node.isRoot ? ROOT_SIZE : NODE_SIZE;

  return (
    <div
      className="absolute z-10"
      style={{
        left: node.x - size / 2,
        top: node.y - size / 2,
        width: size,
        height: size,
      }}
    >
      <MorphingDialog
        transition={{
          type: "tween",
          ease: "easeOut",
          duration: 0.2,
        }}
      >
        <MorphingDialogTrigger className="w-full h-full rounded-full">
          <div
            className="relative w-full h-full rounded-full flex flex-col items-center justify-center p-4 text-center border backdrop-blur-xl cursor-pointer overflow-hidden"
            style={{
              backgroundColor: `${node.color}20`,
              borderColor: `${node.color}50`,
              boxShadow: `0 0 20px ${node.color}15`,
            }}
          >
            <div 
              className="absolute inset-0 rounded-full opacity-10 blur-xl -z-10"
              style={{ backgroundColor: node.color }}
            />
            <span className="relative z-10 text-[10px] font-black text-white uppercase tracking-tighter leading-[1.2] w-full px-1">
              {node.label}
            </span>
          </div>
        </MorphingDialogTrigger>

        <MorphingDialogContainer>
          <MorphingDialogContent className="relative w-[90vw] max-w-md rounded-3xl border border-white/10 bg-[#0a0a0a] p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-8 h-8 rounded-full border"
                style={{ backgroundColor: `${node.color}20`, borderColor: node.color }}
              />
              <MorphingDialogTitle className="text-lg font-bold text-white uppercase">
                {node.label}
              </MorphingDialogTitle>
            </div>
            <MorphingDialogDescription className="text-sm text-white/60 leading-relaxed" disableLayoutAnimation>
              {node.detail}
            </MorphingDialogDescription>
            <MorphingDialogClose className="absolute top-4 right-4 text-white/40 hover:text-white">
              <X size={18} />
            </MorphingDialogClose>
          </MorphingDialogContent>
        </MorphingDialogContainer>
      </MorphingDialog>
    </div>
  );
}

export function MindMap({ data }: MindMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const positionedNodes = useMemo(() => {
    const root: MindMapNode = {
      id: "root",
      label: data.central_topic,
      detail: "Core Theme.",
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
    <div ref={containerRef} className="w-full h-full overflow-hidden flex items-center justify-center bg-[#030303] relative">
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
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default MindMap;
