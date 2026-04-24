from typing import List, Optional
import json
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from app.routes.auth import get_current_user
from app.graph.nodes import llm
from langchain_core.messages import HumanMessage, SystemMessage

router = APIRouter(prefix="/api", tags=["mindmap"])


class MindMapNode(BaseModel):
    id: str = Field(..., description="Unique identifier for the node")
    label: str = Field(..., description="Short title/label for the node (1-3 words max)")
    detail: str = Field(..., description="Detailed explanation (2-3 sentences)")
    color: str = Field(..., description="Hex color code for the node")
    children: Optional[List["MindMapNode"]] = Field(
        None, description="Sub-topics or child nodes"
    )


class MindMapResponse(BaseModel):
    central_topic: str = Field(..., description="The main central topic of the mind map")
    nodes: List[MindMapNode] = Field(..., description="Root-level sub-topics")


class MindmapRequest(BaseModel):
    text: str


MINDMAP_SYSTEM_PROMPT = """You are a mind map generator. Extract key concepts from the text and create a DEEP, MULTI-LEVEL hierarchical mind map.
Avoid flat structures where all nodes connect only to the root. Instead, create meaningful sub-branches and nested relationships.
Aim for a tree with multiple levels of depth (e.g., Root -> Level 1 -> Level 2 -> Level 3).
Assign each node a vibrant color from this palette: #f97066, #22d3ee, #fbbf24, #34d399, #f472b6, #818cf8, #fb923c, #a78bfa.
Keep labels very concise (1-3 words max) so they fit perfectly in the nodes.
Ensure the total structure is comprehensive but balanced (12-18 nodes total across all levels is ideal)."""


@router.post("/mindmap")
async def generate_mindmap(
    request: MindmapRequest, current_user: dict = Depends(get_current_user)
):
    """Generate a hierarchical mind map structure from the given text content."""
    
    # Use with_structured_output for a guaranteed schema
    structured_llm = llm.with_structured_output(MindMapResponse)
    
    messages = [
        SystemMessage(content=MINDMAP_SYSTEM_PROMPT),
        HumanMessage(content=f"Generate a rich, hierarchical mind map from this content:\n\n{request.text}"),
    ]

    try:
        response = structured_llm.invoke(messages)
        return response.dict()
    except Exception as e:
        print(f"Structured output failed: {e}")
        # Fallback to manual parsing if structured output fails
        fallback_messages = [
            SystemMessage(content=MINDMAP_SYSTEM_PROMPT + "\nReturn valid JSON matching the schema."),
            HumanMessage(content=request.text)
        ]
        res = llm.invoke(fallback_messages)
        content = res.content.strip()
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
            
        try:
            return json.loads(content)
        except:
            return {
                "central_topic": "Topic Overview",
                "nodes": [
                    {
                        "id": "1",
                        "label": "General Overview",
                        "detail": "Could not generate detailed mind map. Please try again with more specific text.",
                        "color": "#818cf8",
                    }
                ],
            }
