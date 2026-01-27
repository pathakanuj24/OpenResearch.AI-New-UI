"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Drawer,
  IconButton,
  Stack,
  Typography,
  Chip,
  TextField,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ZoomInRoundedIcon from "@mui/icons-material/ZoomInRounded";
import ZoomOutRoundedIcon from "@mui/icons-material/ZoomOutRounded";
import CenterFocusStrongRoundedIcon from "@mui/icons-material/CenterFocusStrongRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import HubRoundedIcon from "@mui/icons-material/HubRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import FormatQuoteRoundedIcon from "@mui/icons-material/FormatQuoteRounded";
import { useQuery } from "@tanstack/react-query";
import * as d3 from "d3";

import { learningAPI, GraphNode, GraphLink } from "@/lib/api/learning";
import { useAnalyses } from "@/lib/hooks/useAnalyses";

// D3 simulation node type
interface D3Node extends d3.SimulationNodeDatum, GraphNode {
  x?: number;
  y?: number;
}

// D3 simulation link type
interface D3Link extends d3.SimulationLinkDatum<D3Node> {
  type: string;
  strength: number;
}

// Node detail panel
function NodeDetailPanel({
  node,
  links,
  nodes,
  onClose,
}: {
  node: GraphNode | null;
  links: GraphLink[];
  nodes: GraphNode[];
  onClose: () => void;
}) {
  if (!node) return null;

  const connectedLinks = links.filter(
    (l) => l.source === node.id || l.target === node.id
  );
  const connectedNodes = connectedLinks.map((l) => {
    const otherId = l.source === node.id ? l.target : l.source;
    return nodes.find((n) => n.id === otherId);
  }).filter(Boolean) as GraphNode[];

  return (
    <Drawer
      anchor="right"
      open={!!node}
      onClose={onClose}
      PaperProps={{
        sx: { width: 400, p: 3 },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 18 }}>Paper Details</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseRoundedIcon />
        </IconButton>
      </Stack>

      {/* Paper info */}
      <Card
        elevation={0}
        sx={{
          p: 2.5,
          mb: 3,
          border: "1px solid rgba(0,0,0,0.06)",
          borderLeft: `4px solid ${node.color}`,
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 1.5, lineHeight: 1.4 }}>
          {node.title}
        </Typography>
        
        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1.5 }}>
          <Chip
            label={node.type}
            size="small"
            sx={{
              bgcolor: `${node.color}20`,
              color: node.color,
              fontWeight: 600,
              textTransform: "capitalize",
            }}
          />
          {node.year && (
            <Chip
              label={node.year}
              size="small"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          )}
          {node.citationCount > 0 && (
            <Chip
              icon={<FormatQuoteRoundedIcon sx={{ fontSize: 14 }} />}
              label={`${node.citationCount} citations`}
              size="small"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          )}
        </Stack>

        {node.authors && node.authors.length > 0 && (
          <Typography sx={{ color: "text.secondary", fontSize: 13, mb: 1.5 }}>
            {node.authors.slice(0, 3).join(", ")}
            {node.authors.length > 3 && ` +${node.authors.length - 3} more`}
          </Typography>
        )}

        {node.abstract && (
          <Typography sx={{ color: "text.secondary", fontSize: 13, lineHeight: 1.7 }}>
            {node.abstract.length > 200 ? node.abstract.slice(0, 200) + "..." : node.abstract}
          </Typography>
        )}

        {node.url && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<OpenInNewRoundedIcon />}
            onClick={() => window.open(node.url!, "_blank")}
            sx={{ mt: 2, borderRadius: 2 }}
          >
            View Paper
          </Button>
        )}
      </Card>

      {/* Connected papers */}
      <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 2 }}>
        Connected Papers ({connectedNodes.length})
      </Typography>

      <Stack spacing={1.5} sx={{ maxHeight: 400, overflow: "auto" }}>
        {connectedNodes.map((n) => (
          <Box
            key={n.id}
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: "rgba(0,0,0,0.02)",
              border: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  bgcolor: n.color,
                  mt: 0.5,
                  flexShrink: 0,
                }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: 13,
                    lineHeight: 1.4,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {n.label}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                  <Typography sx={{ color: "text.secondary", fontSize: 11 }}>
                    {n.type}
                  </Typography>
                  {n.year && (
                    <Typography sx={{ color: "text.secondary", fontSize: 11 }}>
                      • {n.year}
                    </Typography>
                  )}
                </Stack>
              </Box>
            </Stack>
          </Box>
        ))}

        {connectedNodes.length === 0 && (
          <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
            No connected papers found.
          </Typography>
        )}
      </Stack>
    </Drawer>
  );
}

export default function KnowledgeGraphPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paperHash = searchParams.get("paper");

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // Fetch papers for selector
  const { data: analysesData } = useAnalyses(50, 0);
  const papers = analysesData?.analyses || [];
  const selectedPaper = papers.find((p) => p.file_hash === paperHash);

  // Fetch graph data
  const {
    data: graphData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["knowledge-graph-viz", paperHash],
    queryFn: () => learningAPI.getGraphVisualization(paperHash!),
    enabled: !!paperHash,
  });

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // D3 force simulation
  useEffect(() => {
    if (!graphData || !graphData.nodes || !graphData.links || !svgRef.current || isLoading) return;
    if (graphData.nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { width, height } = dimensions;
    const nodes: D3Node[] = graphData.nodes.map((n) => ({ ...n }));
    const links: D3Link[] = graphData.links.map((l) => ({
      source: l.source,
      target: l.target,
      type: l.type,
      strength: l.strength,
    }));

    // Create container group for zoom/pan
    const g = svg.append("g");

    // Setup zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    zoomRef.current = zoom;
    svg.call(zoom);

    // Create arrow markers for directed edges
    svg.append("defs").selectAll("marker")
      .data(["arrow"])
      .join("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 20)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("fill", "#999")
      .attr("d", "M0,-5L10,0L0,5");

    // Create simulation
    const simulation = d3.forceSimulation<D3Node>(nodes)
      .force("link", d3.forceLink<D3Node, D3Link>(links)
        .id((d) => d.id)
        .distance(150)
        .strength((d) => d.strength * 0.5))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius((d: D3Node) => d.size + 10));

    // Create links
    const link = g.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#ddd")
      .attr("stroke-width", 1.5)
      .attr("stroke-opacity", 0.6)
      .attr("marker-end", "url(#arrow)");

    // Create node groups
    const node = g.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("cursor", "pointer")
      .call(d3.drag<SVGGElement, D3Node>()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    // Add circles to nodes - use size from API
    node.append("circle")
      .attr("r", (d) => Math.max(d.size / 3, 12))
      .attr("fill", (d) => d.color)
      .attr("stroke", (d) => d3.color(d.color)?.darker(0.5)?.toString() || d.color)
      .attr("stroke-width", 2)
      .on("click", (event, d) => {
        event.stopPropagation();
        setSelectedNode(d);
      })
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", Math.max(d.size / 3, 12) + 4);
        
        // Highlight connected edges
        link
          .attr("stroke", (l) => 
            (l.source as D3Node).id === d.id || (l.target as D3Node).id === d.id 
              ? d.color 
              : "#ddd"
          )
          .attr("stroke-width", (l) =>
            (l.source as D3Node).id === d.id || (l.target as D3Node).id === d.id
              ? 2.5
              : 1.5
          );
      })
      .on("mouseout", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", Math.max(d.size / 3, 12));
        
        link
          .attr("stroke", "#ddd")
          .attr("stroke-width", 1.5);
      });

    // Add labels to nodes
    node.append("text")
      .attr("dy", (d) => Math.max(d.size / 3, 12) + 14)
      .attr("text-anchor", "middle")
      .attr("font-size", 10)
      .attr("font-weight", 500)
      .attr("fill", "#333")
      .attr("pointer-events", "none")
      .text((d) => {
        const maxLen = d.type === "current" ? 30 : 20;
        return d.label.length > maxLen ? d.label.slice(0, maxLen) + "..." : d.label;
      });

    // Update positions on tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as D3Node).x!)
        .attr("y1", (d) => (d.source as D3Node).y!)
        .attr("x2", (d) => (d.target as D3Node).x!)
        .attr("y2", (d) => (d.target as D3Node).y!);

      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    // Click on background to deselect
    svg.on("click", () => setSelectedNode(null));

    // Center the graph initially
    svg.call(zoom.transform, d3.zoomIdentity.translate(0, 0).scale(0.8));

    return () => {
      simulation.stop();
    };
  }, [graphData, dimensions, isLoading]);

  // Zoom controls
  const handleZoomIn = () => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(300)
        .call(zoomRef.current.scaleBy, 1.3);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(300)
        .call(zoomRef.current.scaleBy, 0.7);
    }
  };

  const handleResetView = () => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(500)
        .call(zoomRef.current.transform, d3.zoomIdentity.translate(0, 0).scale(0.8));
    }
  };

  // Filter papers for selector
  const filteredPapers = papers.filter((paper) =>
    paper.file_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get node type colors for legend
  const nodeTypes = useMemo(() => {
    if (!graphData?.nodes) return [];
    const types = new Map<string, string>();
    graphData.nodes.forEach((n) => {
      if (!types.has(n.type)) {
        types.set(n.type, n.color);
      }
    });
    return Array.from(types.entries());
  }, [graphData]);

  // No paper selected - show paper selector
  if (!paperHash) {
    const hasPapers = papers.length > 0;

    if (!hasPapers) {
      return (
        <Box
          sx={{
            height: "calc(100vh - 140px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Card
            elevation={0}
            sx={{ p: 6, textAlign: "center", maxWidth: 400, border: "1px dashed rgba(0,0,0,0.15)" }}
          >
            <HubRoundedIcon sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
            <Typography sx={{ fontWeight: 700, fontSize: 18, mb: 1 }}>
              No Papers Yet
            </Typography>
            <Typography sx={{ color: "text.secondary", mb: 3 }}>
              Upload a paper to visualize its knowledge graph.
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push("/dashboard/upload")}
              sx={{ borderRadius: 2.5, fontWeight: 600 }}
            >
              Upload Paper
            </Button>
          </Card>
        </Box>
      );
    }

    return (
      <Box>
        {/* Header */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="space-between"
          spacing={2}
          sx={{ mb: 4 }}
        >
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: 28 }}>Knowledge Graph</Typography>
            <Typography sx={{ color: "text.secondary", mt: 0.5 }}>
              Select a paper to visualize its citation network
            </Typography>
          </Box>
        </Stack>

        {/* Info Banner */}
        <Card
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3,
            bgcolor: "rgba(168,85,247,0.04)",
            border: "1px solid rgba(168,85,247,0.1)",
            borderRadius: 3,
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: "#a855f7",
                display: "grid",
                placeItems: "center",
              }}
            >
              <HubRoundedIcon sx={{ color: "white", fontSize: 20 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                Interactive Citation Network
              </Typography>
              <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                Explore prerequisites, citations, and related papers with an interactive D3.js visualization
              </Typography>
            </Box>
          </Stack>
        </Card>

        {/* Search */}
        <Card
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            border: "1px solid rgba(0,0,0,0.06)",
            borderRadius: 3,
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              placeholder="Search papers..."
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                flex: 1,
                maxWidth: 400,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: "rgba(0,0,0,0.02)",
                },
              }}
              InputProps={{
                startAdornment: (
                  <Box sx={{ color: "text.secondary", mr: 1, display: "flex" }}>
                    <SearchRoundedIcon sx={{ fontSize: 20 }} />
                  </Box>
                ),
              }}
            />
            <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
              {filteredPapers.length} paper{filteredPapers.length !== 1 ? "s" : ""}
            </Typography>
          </Stack>
        </Card>

        {/* Papers Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            },
            gap: 2.5,
          }}
        >
          {filteredPapers.map((paper) => (
            <Card
              key={paper.file_hash}
              elevation={0}
              sx={{
                p: 3,
                height: "100%",
                border: "1px solid rgba(0,0,0,0.06)",
                borderRadius: 3,
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: "#a855f7",
                  boxShadow: "0 8px 30px rgba(168,85,247,0.12)",
                  transform: "translateY(-2px)",
                },
              }}
              onClick={() => router.push(`/dashboard/graph?paper=${paper.file_hash}`)}
            >
              <Stack spacing={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2.5,
                    bgcolor: "rgba(168,85,247,0.08)",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <HubRoundedIcon sx={{ color: "#a855f7", fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: 15,
                      mb: 0.5,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      lineHeight: 1.4,
                    }}
                  >
                    {paper.file_name?.replace(".pdf", "") || "Untitled Paper"}
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                    Click to view citation graph
                  </Typography>
                </Box>
              </Stack>
            </Card>
          ))}
        </Box>

        {/* Empty search result */}
        {filteredPapers.length === 0 && searchQuery && (
          <Card
            elevation={0}
            sx={{
              p: 4,
              textAlign: "center",
              border: "1px dashed rgba(0,0,0,0.15)",
              borderRadius: 3,
            }}
          >
            <Typography sx={{ color: "text.secondary" }}>
              No papers found matching "{searchQuery}"
            </Typography>
          </Card>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ height: "calc(100vh - 140px)", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ pb: 2, borderBottom: "1px solid rgba(0,0,0,0.06)", mb: 2 }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <IconButton onClick={() => router.push("/dashboard/graph")}>
            <ArrowBackRoundedIcon />
          </IconButton>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: 24 }}>Knowledge Graph</Typography>
            {selectedPaper && (
              <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                {selectedPaper.file_name?.replace(".pdf", "")}
              </Typography>
            )}
          </Box>
        </Stack>

        {/* Zoom controls */}
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton onClick={handleZoomIn} title="Zoom In">
            <ZoomInRoundedIcon />
          </IconButton>
          <IconButton onClick={handleZoomOut} title="Zoom Out">
            <ZoomOutRoundedIcon />
          </IconButton>
          <IconButton onClick={handleResetView} title="Reset View">
            <CenterFocusStrongRoundedIcon />
          </IconButton>
        </Stack>
      </Stack>

      {/* Legend & Stats */}
      <Stack direction="row" spacing={2} sx={{ mb: 2 }} flexWrap="wrap" alignItems="center">
        {nodeTypes.map(([type, color]) => (
          <Stack key={type} direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                bgcolor: color,
              }}
            />
            <Typography sx={{ fontSize: 12, color: "text.secondary", textTransform: "capitalize" }}>
              {type}
            </Typography>
          </Stack>
        ))}
        <Box sx={{ flex: 1 }} />
        {graphData?.stats && (
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
            {graphData.stats.total_nodes} papers • {graphData.stats.total_edges} connections
          </Typography>
        )}
      </Stack>

      {/* Graph Container */}
      <Card
        ref={containerRef}
        elevation={0}
        sx={{
          flex: 1,
          border: "1px solid rgba(0,0,0,0.06)",
          borderRadius: 3,
          overflow: "hidden",
          bgcolor: "#fafafa",
        }}
      >
        {isLoading ? (
          <Stack alignItems="center" justifyContent="center" sx={{ height: "100%" }}>
            <CircularProgress size={40} />
            <Typography sx={{ mt: 2, color: "text.secondary" }}>
              Loading knowledge graph...
            </Typography>
          </Stack>
        ) : error ? (
          <Stack alignItems="center" justifyContent="center" sx={{ height: "100%" }}>
            <HubRoundedIcon sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
            <Typography sx={{ color: "error.main", fontWeight: 600 }}>
              Failed to load knowledge graph
            </Typography>
            <Typography sx={{ color: "text.secondary", mt: 1, mb: 2 }}>
              The graph data might not be available for this paper yet.
            </Typography>
            <Button
              variant="outlined"
              onClick={() => router.push("/dashboard/library")}
              sx={{ borderRadius: 2 }}
            >
              Back to Library
            </Button>
          </Stack>
        ) : !graphData?.nodes || graphData.nodes.length === 0 ? (
          <Stack alignItems="center" justifyContent="center" sx={{ height: "100%" }}>
            <HubRoundedIcon sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
            <Typography sx={{ fontWeight: 600 }}>No graph data available</Typography>
            <Typography sx={{ color: "text.secondary", mt: 1 }}>
              This paper hasn't been analyzed yet.
            </Typography>
          </Stack>
        ) : (
          <svg
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            style={{ display: "block" }}
          />
        )}
      </Card>

      {/* Node Detail Panel */}
      <NodeDetailPanel
        node={selectedNode}
        links={graphData?.links || []}
        nodes={graphData?.nodes || []}
        onClose={() => setSelectedNode(null)}
      />
    </Box>
  );
}
