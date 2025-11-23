import * as d3 from "d3";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useDeferredValue, useEffect, useRef, useTransition } from "react";

import type { Domain } from "~/types";

import { DOMAIN_OUTLINE_HEX } from "~/constants/colors";
import { PROJECTS } from "~/data/projects";
import { useAccessibility } from "~/hooks/use-accessibility";
import { isEqualDomain, matchesDomainName } from "~/utils/get-domain-names";
import {
  getSearchFilter,
  getSearchQuery,
  toggleFilterParam,
} from "~/utils/search-params";

interface PieSegmentData {
  domain: string;
  value: number;
  color: string;
  percentage: number;
}

// Arc state types for single source of truth
type ArcState = "default" | "selected" | "hover" | "focus";

// Extended type for arc data with state-driven radius (D3 best practice)
// The outerRadius is derived from the state property, ensuring consistency
type ArcDatumWithRadius = d3.PieArcDatum<PieSegmentData> & {
  outerRadius?: number;
  state?: ArcState; // Single source of truth for arc appearance
  strokeWidth?: number; // Current stroke width for synchronized transitions
};

interface RootNodeChartProps {
  pieData: PieSegmentData[];
  pieRadius: number;
  onDomainHover?: (domain: Domain | null) => void;
  onAnimationComplete?: () => void;
  setHoveredDomain: (domain: Domain | null) => void;
  onChartStateChange?: () => void;
  // Roving tabindex functions from parent StackCloudContent
  registerSegmentRef?: (id: string, element: SVGGElement | null) => void;
  getSegmentTabIndex?: (id: string) => number;
  onSegmentFocus?: (index: number) => void;
}

/**
 * Pie chart component for the root node visualization
 * Handles all d3 rendering and interactions for the domain distribution chart
 * Memoized to prevent unnecessary re-renders of expensive d3 operations
 */
// Outline stroke width constant
const STROKE_WIDTH = 2.5;

/**
 * Single source of truth for arc dimensions across all states
 * Returns the path radius for each state
 *
 * With paint-order: stroke, the stroke renders first, then fill covers the inner half.
 * This creates an "outer stroke" effect where only STROKE_WIDTH/2 extends outward.
 * We add STROKE_WIDTH/2 to the radius so the visual outer edge matches expectations.
 */
const getArcRadiusForState = (
  pieRadius: number,
  state: ArcState = "default",
): number => {
  const RING_THICKNESS = pieRadius * 0.08;
  const baseRadius = {
    default: pieRadius,
    selected: pieRadius + RING_THICKNESS * 1.1,
    hover: pieRadius + RING_THICKNESS * 1.1,
    focus: pieRadius + RING_THICKNESS * 1.1,
  }[state];

  // With paint-order: stroke, only the outer half of stroke is visible
  // Add half stroke width so visual outer edge matches the intended radius
  return baseRadius + STROKE_WIDTH / 2;
};

/**
 * Get stroke width for a given state
 */
/**
 * Get stroke width for a given state
 * NOW CONSTANT for all states to prevent layout shifts/gaps
 */
const getStrokeWidthForState = (_state: ArcState = "default"): number => {
  return STROKE_WIDTH;
};

// biome-ignore lint/style/useComponentExportOnlyModules: Component is exported via memo wrapper
const RootNodeChartComponent = (props: RootNodeChartProps) => {
  const {
    pieData,
    pieRadius,
    onDomainHover,
    onAnimationComplete,
    setHoveredDomain,
    onChartStateChange,
    registerSegmentRef,
    getSegmentTabIndex,
    onSegmentFocus,
  } = props;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasAnimatedRef = useRef(false);
  const matchedDomainRef = useRef<string | null>(null);
  // Track previous animation state to detect rapid toggles
  const previouslyAnimatingRef = useRef<boolean>(false);
  const [_isPending, startTransition] = useTransition();

  const a11y = useAccessibility();
  const currentSearchQuery = getSearchQuery(searchParams);
  const currentSearchFilter = getSearchFilter(searchParams);

  // Defer filter updates to let animations complete first
  // This prevents D3 transitions from blocking urgent UI updates
  const _deferredSearchFilter = useDeferredValue(currentSearchFilter);

  // Store ref to the pie chart g element for keyboard event delegation
  const pieChartRef = useRef<SVGGElement>(null);
  // Store ref to glow filter ID so it can be accessed in update effect
  const glowFilterIdRef = useRef<string>("");

  // Track selection state in refs to avoid expensive re-renders
  const currentSearchQueryRef = useRef(currentSearchQuery);
  currentSearchQueryRef.current = currentSearchQuery;

  const currentSearchFilterRef = useRef(currentSearchFilter);
  currentSearchFilterRef.current = currentSearchFilter;

  // Store startTransition in ref so it can be accessed in useEffect
  const startTransitionRef = useRef(startTransition);
  startTransitionRef.current = startTransition;

  // Update visual states without re-rendering entire chart
  // Uses deferred value to avoid blocking urgent UI updates
  // Immediately interrupts ongoing animations on new updates for responsive feel
  // biome-ignore lint/correctness/useExhaustiveDependencies: currentSearchQuery and currentSearchFilter are needed to trigger updates when search params change, even though they're read from refs
  useEffect(() => {
    if (!pieChartRef.current) {
      return;
    }
    if (!hasAnimatedRef.current) {
      return;
    }

    // Use requestAnimationFrame to batch visual updates for better performance
    const rafId = requestAnimationFrame(() => {
      if (!pieChartRef.current) return;

      // Check query first (from SearchInput), then filter (from StackCloud) if no query match
      let matchedDomain = matchesDomainName(
        currentSearchQueryRef.current,
        PROJECTS,
      );
      if (!matchedDomain) {
        matchedDomain = matchesDomainName(
          currentSearchFilterRef.current,
          PROJECTS,
        );
      }

      // CRITICAL BUG FIX: Save previous state BEFORE updating ref
      // Compare NEW state (matchedDomain) with OLD state (matchedDomainRef.current)
      // Use isEqualDomain for case-insensitive comparison
      const stateIsChanging = !isEqualDomain(
        matchedDomain,
        matchedDomainRef.current,
      );

      // Early bailout: Skip update entirely if state hasn't changed
      // This prevents unnecessary DOM operations and D3 transitions
      if (!stateIsChanging) {
        return;
      }

      matchedDomainRef.current = matchedDomain;

      const svg = d3.select(pieChartRef.current);

      // Calculate inner radius using same formula as initial render
      const RING_THICKNESS = pieRadius * 0.08;
      const innerRadius = pieRadius - RING_THICKNESS;

      // Single arc generator that reads outerRadius from datum
      // With paint-order: stroke, fill covers inner half of stroke
      // outerRadius is calculated from the state property using getArcRadiusForState
      const arc = d3
        .arc<ArcDatumWithRadius>()
        .innerRadius(innerRadius)
        .outerRadius((d) => {
          if (d.outerRadius) return d.outerRadius;
          return getArcRadiusForState(pieRadius, d.state);
        });

      // Batch DOM updates together
      const segments = svg.selectAll<
        SVGGElement,
        d3.PieArcDatum<PieSegmentData>
      >("g.segment-visual");

      // PERFORMANCE: Batch ALL DOM reads first (prevents layout thrashing)
      const pathElements = segments.select<SVGPathElement>("path.pie-segment");
      const focusRings = segments.select<SVGPathElement>(
        "path.pie-segment-focus-ring",
      );
      const hitAreas = svg.selectAll<
        SVGPathElement,
        d3.PieArcDatum<PieSegmentData>
      >(".pie-segment-hit-area");

      // Now batch ALL DOM writes together (prevents reflow/repaint churn)
      segments.attr("transform", "translate(0, 0)");

      const baseDuration = a11y.getTransitionDuration(150);

      // Immediately interrupt ongoing animations for responsive feel
      pathElements.interrupt();
      focusRings.interrupt();

      // Use shorter animation if we're in a "burst" of rapid updates
      // (detected by checking if an animation was already running)
      const isRapidBurst = previouslyAnimatingRef.current;
      previouslyAnimatingRef.current = true;

      // Skip animation entirely on rapid bursts to feel snappy
      // Otherwise use normal duration
      const transitionDuration = isRapidBurst ? 0 : baseDuration;

      // Bring selected segment's VISUAL elements to front to prevent border overlap
      // Only reorder segment-visual, NOT segment-group, to preserve roving tabindex
      // Use D3's raise() method - re-inserts element as last child of parent
      segments
        .filter((d) => isEqualDomain(matchedDomain, d.data.domain))
        .raise();

      // Update paths with transition using tween for synchronized radius and stroke
      // With paint-order: stroke, fill and stroke are on the SAME element
      // This guarantees perfect synchronization - no gaps possible
      pathElements
        .transition()
        .duration(transitionDuration)
        .ease(d3.easeCubicInOut) // Smooth easing for synchronized transitions
        .tween("arc-with-stroke", function (d) {
          const datum = d as ArcDatumWithRadius;
          const isSelected = isEqualDomain(matchedDomain, datum.data.domain);
          const targetState: ArcState = isSelected ? "selected" : "default";

          // Pre-select focus ring element for update
          const parent = this.parentNode as SVGGElement;
          const focusRingNode = parent.querySelector<SVGPathElement>(
            ".pie-segment-focus-ring",
          );

          // Calculate radii
          const currentRadius =
            datum.outerRadius ||
            getArcRadiusForState(pieRadius, datum.state || "default");
          const targetRadius = getArcRadiusForState(pieRadius, targetState);

          const radiusInterpolate = d3.interpolate(currentRadius, targetRadius);

          // Target stroke color (instant, no interpolation)
          const targetStrokeColor = isSelected
            ? (DOMAIN_OUTLINE_HEX[datum.data.domain as Domain] ??
              datum.data.color)
            : "transparent";

          // Return tween function that updates attributes on same frame
          return (t: number) => {
            // Update datum properties
            datum.outerRadius = radiusInterpolate(t);

            // Update state at end of transition
            if (t === 1) {
              datum.state = targetState;
            }

            // Calculate new path ONCE
            const newPath = arc(datum) ?? "";

            // Apply updates to DOM - fill, stroke, and path all on same element
            const selection = d3.select(this);
            selection.attr("d", newPath);
            selection.attr("stroke", targetStrokeColor);

            // Update focus ring path to match
            if (focusRingNode) {
              d3.select(focusRingNode).attr("d", newPath);
            }
          };
        })
        .attr("opacity", (d) =>
          isEqualDomain(matchedDomain, d.data.domain) ? "1.0" : "0.55",
        )
        .style("filter", (d) =>
          isEqualDomain(matchedDomain, d.data.domain)
            ? `url(#${glowFilterIdRef.current})`
            : "none",
        )
        .on("end", () => {
          // Reset rapid burst detection after animation completes
          previouslyAnimatingRef.current = false;
        });

      // Focus ring is updated inside the main tween for perfect synchronization

      // Update ARIA states (batched, no transitions needed)
      hitAreas.attr("aria-pressed", (d) =>
        isEqualDomain(matchedDomain, d.data.domain) ? "true" : "false",
      );
    });

    return () => cancelAnimationFrame(rafId);
  }, [a11y, pieRadius, currentSearchQuery, currentSearchFilter]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: onChartStateChange is only called in event handlers, not in render
  useEffect(() => {
    if (!pieChartRef.current) return;

    // Clear hover state when recreating the pie chart
    onDomainHover?.(null);

    const svg = d3.select(pieChartRef.current);

    // Read from refs to get latest search values without retriggering effect
    // Check query first (from SearchInput), then filter (from StackCloud) if no query match
    let matchedDomain = matchesDomainName(
      currentSearchQueryRef.current,
      PROJECTS,
    );
    if (!matchedDomain) {
      matchedDomain = matchesDomainName(
        currentSearchFilterRef.current,
        PROJECTS,
      );
    }
    matchedDomainRef.current = matchedDomain;

    // Clear existing content
    svg.selectAll("*").remove();

    // Create pie layout
    const pie = d3
      .pie<PieSegmentData>()
      .value((d) => d.value)
      .sort(null); // Maintain order

    // Calculate inner radius using same formula as update effect
    const RING_THICKNESS = pieRadius * 0.08;
    const innerRadius = pieRadius - RING_THICKNESS;

    // Single arc generator that reads radius from datum's state
    // This is D3 best practice: one arc generator, interpolate radius values
    // outerRadius accounts for stroke offset to keep outer edge consistent
    const arc = d3
      .arc<ArcDatumWithRadius>()
      .innerRadius(innerRadius)
      .outerRadius((d) => {
        if (d.outerRadius) return d.outerRadius;
        return getArcRadiusForState(pieRadius, d.state);
      });

    // Invisible hit area arc: always full segment for better mobile interaction
    const hitAreaArc = d3
      .arc<d3.PieArcDatum<PieSegmentData>>()
      .innerRadius(0)
      .outerRadius(pieRadius);

    // Generate pie segments and initialize state, outerRadius, and strokeWidth on each datum
    const arcs = pie(pieData);
    arcs.forEach((d) => {
      const datum = d as ArcDatumWithRadius;
      // Set initial state based on whether this domain is selected
      const isSelected = isEqualDomain(matchedDomain, d.data.domain);
      datum.state = isSelected ? "selected" : "default";
      // Calculate strokeWidth first, then use it for radius calculation
      datum.strokeWidth = getStrokeWidthForState(datum.state);
      // Calculate outerRadius with stroke offset to keep outer edge consistent
      datum.outerRadius = getArcRadiusForState(pieRadius, datum.state);
    });

    const shouldAnimate = !hasAnimatedRef.current && !a11y.prefersReducedMotion;

    interface SweepDatum {
      startAngle: number;
      endAngle: number;
      innerRadius: number;
      outerRadius: number;
    }

    let clipPathId: string | undefined;
    let sweepPath:
      | d3.Selection<SVGPathElement, SweepDatum, null, undefined>
      | undefined;
    let sweepArc: d3.Arc<unknown, SweepDatum> | undefined;

    if (shouldAnimate) {
      // Create clip path for pie chart radar sweep animation
      const defs = svg.append("defs");
      const clipPath = defs
        .append("clipPath")
        .attr("id", `radar-sweep-${Math.random().toString(36).substr(2, 9)}`);

      clipPathId = clipPath.attr("id");

      // Create sweep arc (a wedge that grows from 0° to 360°)
      sweepArc = d3
        .arc<SweepDatum>()
        .innerRadius(0)
        .outerRadius(pieRadius * 1.5); // Larger than pie to ensure full coverage

      // Create the sweeping wedge path
      sweepPath = clipPath
        .append("path")
        .datum<SweepDatum>({
          startAngle: 0,
          endAngle: 0,
          innerRadius: 0,
          outerRadius: pieRadius * 1.5,
        })
        .attr("d", sweepArc as unknown as string);
    }

    // Create a group for all pie segments with separate layers for visuals and hit areas
    const pieGroup = svg
      .append("g")
      .attr("clip-path", shouldAnimate ? `url(#${clipPathId})` : null);

    // Create two separate layers: visuals render first, hit areas render on top
    // This allows us to reorder visuals for z-index while keeping hit areas in original order for tabindex
    const visualsLayer = pieGroup.append("g").attr("class", "visuals-layer");
    const hitAreasLayer = pieGroup.append("g").attr("class", "hit-areas-layer");

    // Create SVG filters for visual effects
    const defs = svg.selectAll("defs").empty()
      ? svg.append("defs")
      : svg.select("defs");

    // Create glow filter for focused/selected segments
    const glowFilter = defs
      .append("filter")
      .attr("id", `segment-glow-${Math.random().toString(36).substr(2, 9)}`)
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");

    glowFilter
      .append("feGaussianBlur")
      .attr("stdDeviation", "2")
      .attr("result", "coloredBlur");

    glowFilter
      .append("feMerge")
      .selectAll("feMergeNode")
      .data([{ result: "coloredBlur" }, { result: "SourceGraphic" }])
      .enter()
      .append("feMergeNode")
      .attr("in", (d: { result: string }) => d.result);

    const glowFilterId = glowFilter.attr("id");
    // Store in ref so it can be accessed in update effect
    glowFilterIdRef.current = glowFilterId;

    // Create visible pie segments in the visuals layer
    const visibleSegments = visualsLayer
      .selectAll("g.segment-visual")
      .data(arcs)
      .enter()
      .append("g")
      .attr("class", "segment-visual")
      .attr("data-domain", (d) => d.data.domain); // Link to hit area

    // Create pie segment with fill AND stroke on same element using paint-order
    // paint-order: stroke renders stroke first, then fill covers inner half
    // This guarantees perfect synchronization during animations - no gaps possible
    visibleSegments
      .append("path")
      .attr("fill", (d) => d.data.color)
      .attr("class", (d) => {
        const baseClasses = "pie-segment magnetic-base magnetic-rounded-full";
        const stateClasses = a11y.getStateClasses({
          selected: isEqualDomain(matchedDomain, d.data.domain),
        });
        return `${baseClasses} ${stateClasses}`;
      })
      .attr("opacity", (d) =>
        isEqualDomain(matchedDomain, d.data.domain) ? "1.0" : "0.55",
      ) // Moderate contrast for multiple selections
      .attr("pointer-events", "none")
      .attr("d", arc) // Arc generator reads state from datum
      // Stroke on same element - paint-order ensures outer stroke effect
      .attr("stroke", (d) => {
        const isSelected = isEqualDomain(matchedDomain, d.data.domain);
        return isSelected
          ? (DOMAIN_OUTLINE_HEX[d.data.domain as Domain] ?? d.data.color)
          : "transparent";
      })
      .attr("stroke-width", STROKE_WIDTH)
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .style("paint-order", "stroke") // Render stroke first, fill covers inner half
      .style("filter", (d) =>
        isEqualDomain(matchedDomain, d.data.domain)
          ? `url(#${glowFilterId})`
          : "none",
      );

    // Create focus indicator overlay for keyboard navigation (invisible by default)
    // Uses WCAG-compliant focus color with high opacity for clear visibility
    // Uses same arc as fill/stroke for perfect alignment
    visibleSegments
      .append("path")
      .attr("class", "pie-segment-focus-ring")
      .attr("fill", "none")
      .attr("stroke", a11y.getFocusColor())
      .attr("stroke-width", 3)
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .attr("pointer-events", "none")
      .attr("d", arc) // Uses same arc generator for perfect alignment
      .style("opacity", 0) // Hidden by default, shown on focus
      .style("transition", "opacity 0.2s ease-in-out");

    // Create hit areas in the hit areas layer (always full segments for better touch targets)
    // These render AFTER all visuals, so they're on top for interaction
    const hitAreas = hitAreasLayer
      .selectAll("path.pie-segment-hit-area")
      .data(arcs)
      .enter()
      .append("path")
      .attr("class", () => {
        const baseClass = "pie-segment-hit-area";
        const stateClasses = a11y.getStateClasses({});
        return `${baseClass} ${stateClasses}`;
      })
      .attr("data-domain", (d) => d.data.domain) // Link to visual
      .attr("fill", "transparent")
      .attr("pointer-events", "all")
      .style("cursor", "pointer")
      .style("-webkit-tap-highlight-color", "transparent")
      .attr("d", (d) => hitAreaArc(d) ?? "");

    // Add ARIA attributes for accessibility
    hitAreas
      .attr("role", "button")
      // Set initial tabindex to -1, will be updated by useEffect after refs are registered
      .attr("tabindex", "-1")
      .attr("aria-label", (d) => {
        return `${d.data.domain}: ${d.data.percentage.toFixed(1)}% - click to filter`;
      })
      .attr("aria-pressed", (d) => {
        return isEqualDomain(matchedDomain, d.data.domain) ? "true" : "false";
      });

    const setupHoverInteractions = () => {
      const transitionDuration = a11y.getTransitionDuration(150);

      // Track if a touch is intended as a click (vs scroll/pan)
      let touchWasClick = false;
      // Track which domain was just clicked
      let clickedDomain: string | null = null;
      let clearClickedDomainTimeout: NodeJS.Timeout | null = null;

      // Helper function to bring segment VISUAL elements to front (SVG z-index fix)
      // Uses D3's raise() method - re-inserts element as last child of parent
      const bringSegmentVisualToFront = (hitArea: SVGPathElement) => {
        // Get the domain from the hit area's data attribute
        const domain = hitArea.getAttribute("data-domain");
        if (!domain) return;

        // Find the corresponding visual element in the visuals layer and raise it
        const visualsLayer = svg.select(".visuals-layer");
        visualsLayer.select(`[data-domain="${domain}"]`).raise();
      };

      const handleHoverStart = function (this: SVGPathElement) {
        const datum = d3.select(this).datum() as d3.PieArcDatum<PieSegmentData>;

        // Bring this segment's visual elements to front to prevent border overlap
        bringSegmentVisualToFront(this);

        // If we're hovering a different segment than the one clicked, clear the click tracking
        if (clickedDomain !== null && clickedDomain !== datum.data.domain) {
          if (clearClickedDomainTimeout) {
            clearTimeout(clearClickedDomainTimeout);
            clearClickedDomainTimeout = null;
          }
          clickedDomain = null;
        }

        // Get the corresponding visible segment via data-domain attribute
        const domain = this.getAttribute("data-domain");
        const visualsLayer = svg.select(".visuals-layer");
        const segmentVisual = visualsLayer.select(`[data-domain="${domain}"]`);

        const visiblePath =
          segmentVisual.select<SVGPathElement>("path.pie-segment");
        const focusRing = segmentVisual.select<SVGPathElement>(
          "path.pie-segment-focus-ring",
        );

        // Immediately interrupt any ongoing transitions for responsive feel
        visiblePath.interrupt();
        focusRing.interrupt();

        // Animate to hover state - fill and stroke are on same element with paint-order
        const hoverOpacity = "0.8";
        const targetState: ArcState = "hover";

        // Pre-select focus ring element for update
        const focusRingNode = focusRing.node();

        visiblePath
          .transition()
          .duration(transitionDuration)
          .ease(d3.easeCubicInOut)
          .tween("arc-with-stroke", function (d) {
            const datum = d as ArcDatumWithRadius;

            // Calculate radii
            const currentRadius =
              datum.outerRadius ||
              getArcRadiusForState(pieRadius, datum.state || "default");
            const targetRadius = getArcRadiusForState(pieRadius, targetState);

            const radiusInterpolate = d3.interpolate(
              currentRadius,
              targetRadius,
            );

            // Return tween function that updates attributes on same frame
            return (t: number) => {
              // Update datum properties
              datum.outerRadius = radiusInterpolate(t);

              // Update state at end of transition
              if (t === 1) {
                datum.state = targetState;
              }

              // Calculate new path
              const newPath = arc(datum) ?? "";

              // Apply updates to DOM - fill, stroke, and path all on same element
              const selection = d3.select(this);
              selection.attr("d", newPath);
              selection.attr(
                "stroke",
                DOMAIN_OUTLINE_HEX[datum.data.domain as Domain] ??
                  datum.data.color,
              );

              // Update focus ring path to match
              if (focusRingNode) {
                d3.select(focusRingNode).attr("d", newPath);
              }
            };
          })
          .attr("opacity", hoverOpacity)
          .style("filter", `url(#${glowFilterId})`);

        // Notify parent component of domain hover
        onDomainHover?.(datum.data.domain as Domain);
        setHoveredDomain(datum.data.domain as Domain);
      };

      const handleHoverEnd = function (this: SVGPathElement) {
        const datum = d3.select(this).datum() as d3.PieArcDatum<PieSegmentData>;

        // CRITICAL: If we just clicked this domain, DON'T clear the hover state
        // The click handler has already set the correct hover state
        if (clickedDomain === datum.data.domain) {
          return;
        }

        // Check if this segment's domain is selected
        const isSelected = isEqualDomain(
          matchedDomainRef.current,
          datum.data.domain,
        );

        // When leaving any segment, always clear the hover domain
        // Don't restore to selected domain - that's managed by RootNodeExperience's logic:
        // It will show hoveredStack if hoveredDomain is null and hoveredStack is set
        const restoreDomain = null;

        // Get the corresponding visible segment via data-domain attribute
        const domain = this.getAttribute("data-domain");
        const visualsLayer = svg.select(".visuals-layer");
        const segmentVisual = visualsLayer.select(`[data-domain="${domain}"]`);

        const visiblePath =
          segmentVisual.select<SVGPathElement>("path.pie-segment");
        const focusRing = segmentVisual.select<SVGPathElement>(
          "path.pie-segment-focus-ring",
        );

        // Immediately interrupt any ongoing transitions for responsive feel
        visiblePath.interrupt();
        focusRing.interrupt();

        // Animate back to default or selected state - fill and stroke are on same element
        const targetState: ArcState = isSelected ? "selected" : "default";

        // Pre-select focus ring element for update
        const focusRingNode = focusRing.node();

        // Target stroke color (instant)
        const targetStrokeColor = isSelected
          ? (DOMAIN_OUTLINE_HEX[datum.data.domain as Domain] ??
            datum.data.color)
          : "transparent";

        visiblePath
          .transition()
          .duration(transitionDuration)
          .ease(d3.easeCubicInOut)
          .tween("arc-with-stroke", function (d) {
            const datum = d as ArcDatumWithRadius;

            // Calculate radii
            const currentRadius =
              datum.outerRadius ||
              getArcRadiusForState(pieRadius, datum.state || "default");
            const targetRadius = getArcRadiusForState(pieRadius, targetState);

            const radiusInterpolate = d3.interpolate(
              currentRadius,
              targetRadius,
            );

            // Return tween function that updates attributes on same frame
            return (t: number) => {
              // Update datum properties
              datum.outerRadius = radiusInterpolate(t);

              // Update state at end of transition
              if (t === 1) {
                datum.state = targetState;
              }

              // Calculate new path
              const newPath = arc(datum) ?? "";

              // Apply updates to DOM - fill, stroke, and path all on same element
              const selection = d3.select(this);
              selection.attr("d", newPath);
              selection.attr("stroke", targetStrokeColor);

              // Update focus ring path to match
              if (focusRingNode) {
                d3.select(focusRingNode).attr("d", newPath);
              }
            };
          })
          .attr("opacity", isSelected ? "1.0" : "0.55")
          .style("filter", isSelected ? `url(#${glowFilterId})` : "none");

        // Focus ring is updated in the tween above for perfect sync

        // Notify parent of domain hover state (clear hover when leaving segment)
        onDomainHover?.(restoreDomain);
        setHoveredDomain(restoreDomain);
      };

      const handleClick = function (this: SVGPathElement) {
        const datum = d3.select(this).datum() as d3.PieArcDatum<PieSegmentData>;

        // Check if this click is selecting or deselecting
        const isCurrentlySelected =
          currentSearchFilterRef.current === datum.data.domain;
        const isDeselecting = isCurrentlySelected;

        // Mark this domain as clicked to prevent handleHoverEnd from interfering
        clickedDomain = datum.data.domain;

        // Signal to parent that chart state is changing to skip the next URL effect
        onChartStateChange?.();

        // Only preserve hover state when SELECTING (not deselecting)
        if (!isDeselecting) {
          // Preserve hover state during click to prevent flash of default state
          setHoveredDomain(datum.data.domain as Domain);
          onDomainHover?.(datum.data.domain as Domain);
        } else {
          // When deselecting, immediately clear hover state
          setHoveredDomain(null);
          onDomainHover?.(null);
        }

        // Get the corresponding visible segment via data-domain attribute
        const domain = this.getAttribute("data-domain");
        const visualsLayer = svg.select(".visuals-layer");
        const segmentVisual = visualsLayer.select(`[data-domain="${domain}"]`);
        const visiblePath =
          segmentVisual.select<SVGPathElement>("path.pie-segment");

        // Only interrupt THIS segment's animation, not all segments
        // This prevents breaking state on other segments
        visiblePath.interrupt();

        const queryString = toggleFilterParam(
          currentSearchFilterRef.current,
          datum.data.domain,
        );

        startTransitionRef.current(() => {
          router.push(`${pathname}${queryString}`, { scroll: false });
        });

        // Clear the click tracking after 300ms (well after click/mouseleave cycle is done)
        if (clearClickedDomainTimeout) {
          clearTimeout(clearClickedDomainTimeout);
        }
        clearClickedDomainTimeout = setTimeout(() => {
          clickedDomain = null;
          clearClickedDomainTimeout = null;
        }, 300);
      };

      // Register segments with parent's roving tabindex and set correct tabindex immediately
      hitAreas.each(function (_d, i) {
        const itemId = `segment-${i}`;
        // Register with parent's roving tabindex if function provided
        if (registerSegmentRef) {
          registerSegmentRef(itemId, this);
        }
      });

      // Now update tabindex based on parent's roving tabindex state
      hitAreas.attr("tabindex", (_d, i) => {
        const itemId = `segment-${i}`;
        // Get tabindex from parent if function provided, otherwise default to -1
        const tabIndex = getSegmentTabIndex ? getSegmentTabIndex(itemId) : -1;
        console.log(
          `[D3 Setup] Setting segment ${i} (${itemId}) tabindex=${tabIndex}`,
        );
        return tabIndex;
      });

      hitAreas
        .on("mouseenter", handleHoverStart)
        .on("mouseleave", handleHoverEnd)
        .on("focus", function (this: SVGPathElement) {
          const datum = d3
            .select(this)
            .datum() as d3.PieArcDatum<PieSegmentData>;

          // Bring this segment's visual elements to front using D3's raise()
          bringSegmentVisualToFront(this);

          // Get visual elements
          const domain = this.getAttribute("data-domain");
          const visualsLayer = svg.select(".visuals-layer");
          const segmentVisual = visualsLayer.select(
            `[data-domain="${domain}"]`,
          );
          const visiblePath =
            segmentVisual.select<SVGPathElement>("path.pie-segment");
          const focusRing = segmentVisual.select<SVGPathElement>(
            ".pie-segment-focus-ring",
          );

          // Interrupt any ongoing transitions
          visiblePath.interrupt();
          focusRing.interrupt();

          // Animate to focus state - segment grows AND focus ring animates with it
          const targetState: ArcState = "focus";
          const focusRingNode = focusRing.node();

          visiblePath
            .transition()
            .duration(transitionDuration)
            .ease(d3.easeCubicInOut)
            .tween("arc-focus", function (d) {
              const arcDatum = d as ArcDatumWithRadius;

              const currentRadius =
                arcDatum.outerRadius ||
                getArcRadiusForState(pieRadius, arcDatum.state || "default");
              const targetRadius = getArcRadiusForState(pieRadius, targetState);

              const radiusInterpolate = d3.interpolate(
                currentRadius,
                targetRadius,
              );

              // Interpolate focus ring opacity from 0 to 1
              const opacityInterpolate = d3.interpolate(0, 1);

              return (t: number) => {
                arcDatum.outerRadius = radiusInterpolate(t);

                if (t === 1) {
                  arcDatum.state = targetState;
                }

                const newPath = arc(arcDatum) ?? "";

                // Update main segment path and stroke
                const selection = d3.select(this);
                selection.attr("d", newPath);
                selection.attr(
                  "stroke",
                  DOMAIN_OUTLINE_HEX[arcDatum.data.domain as Domain] ??
                    arcDatum.data.color,
                );

                // Update focus ring path AND opacity together
                if (focusRingNode) {
                  const ringSelection = d3.select(focusRingNode);
                  ringSelection.attr("d", newPath);
                  ringSelection.style("opacity", opacityInterpolate(t));
                }
              };
            })
            .attr("opacity", "0.8")
            .style("filter", `url(#${glowFilterId})`);

          // Update parent's roving tabindex to track this segment's focus
          const index = arcs.findIndex(
            (a) => a.data.domain === datum.data.domain,
          );
          if (index >= 0 && onSegmentFocus) {
            onSegmentFocus(index);
          }
        })
        .on("blur", function (this: SVGPathElement) {
          const datum = d3
            .select(this)
            .datum() as d3.PieArcDatum<PieSegmentData>;

          // Check if this segment is selected (should stay expanded)
          const isSelected = isEqualDomain(
            matchedDomainRef.current,
            datum.data.domain,
          );

          // Get visual elements
          const domain = this.getAttribute("data-domain");
          const visualsLayer = svg.select(".visuals-layer");
          const segmentVisual = visualsLayer.select(
            `[data-domain="${domain}"]`,
          );
          const visiblePath =
            segmentVisual.select<SVGPathElement>("path.pie-segment");
          const focusRing = segmentVisual.select<SVGPathElement>(
            ".pie-segment-focus-ring",
          );

          // Interrupt any ongoing transitions
          visiblePath.interrupt();
          focusRing.interrupt();

          // Animate back to default or selected state
          const targetState: ArcState = isSelected ? "selected" : "default";
          const focusRingNode = focusRing.node();

          const targetStrokeColor = isSelected
            ? (DOMAIN_OUTLINE_HEX[datum.data.domain as Domain] ??
              datum.data.color)
            : "transparent";

          visiblePath
            .transition()
            .duration(transitionDuration)
            .ease(d3.easeCubicInOut)
            .tween("arc-blur", function (d) {
              const arcDatum = d as ArcDatumWithRadius;

              const currentRadius =
                arcDatum.outerRadius ||
                getArcRadiusForState(pieRadius, arcDatum.state || "focus");
              const targetRadius = getArcRadiusForState(pieRadius, targetState);

              const radiusInterpolate = d3.interpolate(
                currentRadius,
                targetRadius,
              );

              // Interpolate focus ring opacity from 1 to 0
              const opacityInterpolate = d3.interpolate(1, 0);

              return (t: number) => {
                arcDatum.outerRadius = radiusInterpolate(t);

                if (t === 1) {
                  arcDatum.state = targetState;
                }

                const newPath = arc(arcDatum) ?? "";

                // Update main segment path and stroke
                const selection = d3.select(this);
                selection.attr("d", newPath);
                selection.attr("stroke", targetStrokeColor);

                // Update focus ring path AND opacity together
                if (focusRingNode) {
                  const ringSelection = d3.select(focusRingNode);
                  ringSelection.attr("d", newPath);
                  ringSelection.style("opacity", opacityInterpolate(t));
                }
              };
            })
            .attr("opacity", isSelected ? "1.0" : "0.55")
            .style("filter", isSelected ? `url(#${glowFilterId})` : "none");
        })
        // Touch events for iOS
        .on("touchstart", (event: TouchEvent) => {
          // Mark this as a potential click
          touchWasClick = true;
          // Don't trigger hover animation on touch - wait to see if it's a click or scroll
          event.preventDefault();
        })
        .on("touchmove", () => {
          // If user moves finger, it's a scroll/pan, not a click
          touchWasClick = false;
        })
        .on("touchend", function (event: TouchEvent) {
          if (touchWasClick) {
            // This was a tap/click, trigger the click handler directly
            // Skip hover animations entirely to avoid conflicts
            event.preventDefault();
            handleClick.call(this);
            touchWasClick = false;
          }
        })
        .on("touchcancel", () => {
          touchWasClick = false;
        })
        .on("click", function () {
          // This will only fire for mouse/trackpad clicks
          // Touch devices use touchend handler which calls preventDefault()
          // preventing the click event from firing
          handleClick.call(this);
        })
        .on("keydown", function (event: KeyboardEvent) {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleClick.call(this);
          }
          // Arrow keys for navigation within segments (handled by roving tabindex)
          // but we need to update local state when focus changes via arrow keys
          if (
            event.key === "ArrowLeft" ||
            event.key === "ArrowRight" ||
            event.key === "Tab"
          ) {
            // These are handled by the container's keydown handler (roving tabindex)
            // but we may need to sync the highlighted segment here if needed
            return;
          }
        });
    };

    if (shouldAnimate && sweepPath && sweepArc) {
      // Animate the sweep wedge from 0 to 2π
      sweepPath
        .transition()
        .duration(1500)
        .attrTween("d", (d) => {
          const interpolate = d3.interpolate(0, Math.PI * 2);
          return (t) => {
            d.endAngle = interpolate(t);
            return (sweepArc?.(d) as string) ?? "";
          };
        })
        .on("end", () => {
          // After sweep completes, remove clip-path and add hover interactions
          pieGroup.attr("clip-path", null);
          hasAnimatedRef.current = true;
          onAnimationComplete?.();
          setupHoverInteractions();
        });
    } else {
      // No animation, setup interactions immediately and mark animation as complete
      hasAnimatedRef.current = true;
      onAnimationComplete?.();
      setupHoverInteractions();
    }
  }, [
    pieData,
    pieRadius,
    onDomainHover,
    onAnimationComplete,
    setHoveredDomain,
    router,
    pathname,
    a11y,
  ]);

  return (
    // Container for pie chart segments - parent SVG handles all keyboard events
    // Individual segments have tabindex set by parent's roving tabindex
    <g ref={pieChartRef} className="pie-chart" />
  );
};

// Export component without memo to ensure useSearchParams() hook re-runs when URL changes
// The memo was preventing React from re-rendering when router.push() updated the URL,
// causing useSearchParams() to return stale values and blocking state updates
export const RootNodeChart = RootNodeChartComponent;
