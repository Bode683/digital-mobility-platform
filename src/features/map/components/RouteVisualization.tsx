import { useTheme } from "@/hooks/use-theme";
import { LineLayer, ShapeSource, SymbolLayer } from "@rnmapbox/maps";
import React, { useMemo } from "react";

export interface RouteData {
  id: string;
  geometry: {
    type: "LineString";
    coordinates: [number, number][];
  };
  distance?: number;
  duration?: number;
  type?: "fastest" | "eco" | "shortest";
  fare?: number;
}

interface RouteVisualizationProps {
  routes: RouteData[];
  selectedRouteId?: string | null;
  onRoutePress?: (routeId: string) => void;
  lineWidth?: {
    selected: number;
    unselected: number;
  };
  lineColors?: {
    selected: string;
    unselected: string;
  };
  showDirectionArrows?: boolean;
  animate?: boolean;
}

export function RouteVisualization({
  routes,
  selectedRouteId,
  onRoutePress,
  lineWidth = { selected: 4, unselected: 2 },
  lineColors,
  showDirectionArrows = true,
  animate = true,
}: RouteVisualizationProps) {
  const theme = useTheme();

  // Default colors based on theme
  const defaultColors = useMemo(
    () => ({
      selected: theme.colors.primary,
      unselected: theme.colors.border,
    }),
    [theme.colors.primary, theme.colors.border]
  );

  // Use provided colors or defaults
  const colors = lineColors || defaultColors;

  return (
    <>
      {routes.map((route) => {
        const layers: React.ReactElement[] = [
          // Base line (wider, for easier tapping)
          <LineLayer
            key={`route-line-base-${route.id}`}
            id={`route-line-base-${route.id}`}
            style={{
              lineColor: colors.unselected,
              lineWidth: lineWidth.unselected + 4,
              lineCap: "round",
              lineJoin: "round",
              lineOpacity: 0.3,
            }}
          />,
          // Main line
          <LineLayer
            key={`route-line-${route.id}`}
            id={`route-line-${route.id}`}
            style={{
              lineColor:
                route.id === selectedRouteId
                  ? colors.selected
                  : colors.unselected,
              lineWidth:
                route.id === selectedRouteId
                  ? lineWidth.selected
                  : lineWidth.unselected,
              lineCap: "round",
              lineJoin: "round",
            }}
          />,
        ];

        // Direction arrows (optional)
        if (showDirectionArrows) {
          layers.push(
            <SymbolLayer
              key={`route-arrows-${route.id}`}
              id={`route-arrows-${route.id}`}
              style={{
                symbolPlacement: "line",
                symbolSpacing: 100,
                iconImage: "arrow-head",
                iconSize: route.id === selectedRouteId ? 0.8 : 0.6,
                iconAllowOverlap: true,
                iconIgnorePlacement: true,
                iconColor:
                  route.id === selectedRouteId
                    ? colors.selected
                    : colors.unselected,
              }}
            />
          );
        }

        // Animated dot along the route (optional)
        if (animate && route.id === selectedRouteId) {
          layers.push(
            <SymbolLayer
              key={`route-animation-${route.id}`}
              id={`route-animation-${route.id}`}
              style={{
                symbolPlacement: "line",
                iconImage: "pulsing-dot",
                iconSize: 0.8,
                iconAllowOverlap: true,
                iconIgnorePlacement: true,
              }}
            />
          );
        }

        return (
          <React.Fragment key={route.id}>
            <ShapeSource
              id={`route-source-${route.id}`}
              shape={{
                type: "Feature",
                properties: {},
                geometry: route.geometry,
              }}
              onPress={() => onRoutePress && onRoutePress(route.id)}
            >
              {layers}
            </ShapeSource>
          </React.Fragment>
        );
      })}
    </>
  );
}
