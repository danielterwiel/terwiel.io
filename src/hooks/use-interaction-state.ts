import { useCallback, useMemo, useReducer, useRef } from "react";

/**
 * Unified state machine for StackCloud interactive elements.
 * Handles hover, focus, selection, and input modality for both
 * pie chart segments and stack nodes.
 *
 * Key features:
 * - Single source of truth for interaction state
 * - Eliminates race conditions between click and hover events
 * - Tracks input modality for focus-visible behavior
 * - Supports URL-driven selection sync
 */

// Item identifiers follow pattern: "segment-{index}" or "stack-{id}"
export type InteractiveItemId = string;

export type InputModality = "keyboard" | "mouse" | "touch";

export interface InteractionState {
	/** Currently hovered item (null if none) */
	hoveredId: InteractiveItemId | null;
	/** Currently focused item via keyboard (null if none) */
	focusedId: InteractiveItemId | null;
	/** Item that was just clicked, pending URL update */
	pendingClickId: InteractiveItemId | null;
	/** Last input device used - determines if focus ring should show */
	inputModality: InputModality;
	/** Whether an item was just clicked and we're waiting for URL to update */
	isPendingUrlUpdate: boolean;
}

export type InteractionAction =
	| { type: "HOVER_ENTER"; id: InteractiveItemId }
	| { type: "HOVER_LEAVE" }
	| { type: "FOCUS"; id: InteractiveItemId }
	| { type: "BLUR" }
	| { type: "CLICK"; id: InteractiveItemId }
	| { type: "URL_SYNCED" }
	| { type: "SET_INPUT_MODALITY"; modality: InputModality };

const initialState: InteractionState = {
	hoveredId: null,
	focusedId: null,
	pendingClickId: null,
	inputModality: "mouse",
	isPendingUrlUpdate: false,
};

function interactionReducer(
	state: InteractionState,
	action: InteractionAction,
): InteractionState {
	switch (action.type) {
		case "HOVER_ENTER":
			return {
				...state,
				hoveredId: action.id,
			};

		case "HOVER_LEAVE":
			return {
				...state,
				hoveredId: null,
			};

		case "FOCUS":
			return {
				...state,
				focusedId: action.id,
			};

		case "BLUR":
			return {
				...state,
				focusedId: null,
			};

		case "CLICK":
			// Mark this item as pending - we predict its next state
			// until URL update arrives
			return {
				...state,
				pendingClickId: action.id,
				isPendingUrlUpdate: true,
				// Preserve hover state during click to prevent flash
				hoveredId: action.id,
			};

		case "URL_SYNCED":
			// URL has updated, clear pending state
			return {
				...state,
				pendingClickId: null,
				isPendingUrlUpdate: false,
			};

		case "SET_INPUT_MODALITY":
			return {
				...state,
				inputModality: action.modality,
			};

		default:
			return state;
	}
}

export interface UseInteractionStateOptions {
	/** Callback when hover changes */
	onHoverChange?: (id: InteractiveItemId | null) => void;
	/** Callback when focus changes */
	onFocusChange?: (id: InteractiveItemId | null) => void;
}

export function useInteractionState(options: UseInteractionStateOptions = {}) {
	const { onHoverChange, onFocusChange } = options;
	const [state, dispatch] = useReducer(interactionReducer, initialState);

	// Track callbacks in refs to avoid stale closures
	const onHoverChangeRef = useRef(onHoverChange);
	onHoverChangeRef.current = onHoverChange;
	const onFocusChangeRef = useRef(onFocusChange);
	onFocusChangeRef.current = onFocusChange;

	// Action dispatchers with callbacks
	const hoverEnter = useCallback((id: InteractiveItemId) => {
		dispatch({ type: "HOVER_ENTER", id });
		onHoverChangeRef.current?.(id);
	}, []);

	const hoverLeave = useCallback(() => {
		dispatch({ type: "HOVER_LEAVE" });
		onHoverChangeRef.current?.(null);
	}, []);

	const focus = useCallback((id: InteractiveItemId) => {
		dispatch({ type: "FOCUS", id });
		onFocusChangeRef.current?.(id);
	}, []);

	const blur = useCallback(() => {
		dispatch({ type: "BLUR" });
		onFocusChangeRef.current?.(null);
	}, []);

	const click = useCallback((id: InteractiveItemId) => {
		dispatch({ type: "CLICK", id });
	}, []);

	const urlSynced = useCallback(() => {
		dispatch({ type: "URL_SYNCED" });
	}, []);

	const setInputModality = useCallback((modality: InputModality) => {
		dispatch({ type: "SET_INPUT_MODALITY", modality });
	}, []);

	// Derived state: should show focus ring?
	// Only show on keyboard focus, not mouse/touch
	const shouldShowFocusRing = useMemo(() => {
		return state.focusedId !== null && state.inputModality === "keyboard";
	}, [state.focusedId, state.inputModality]);

	// Helper to check if an item is the pending click target
	const isPendingClick = useCallback(
		(id: InteractiveItemId) => {
			return state.pendingClickId === id && state.isPendingUrlUpdate;
		},
		[state.pendingClickId, state.isPendingUrlUpdate],
	);

	// Helper to get the effective selection state for an item
	// This replaces the "predictive state logic" by checking pendingClickId
	const getEffectiveSelectionState = useCallback(
		(
			id: InteractiveItemId,
			isCurrentlySelected: boolean,
		): { isSelected: boolean; isPending: boolean } => {
			if (state.pendingClickId === id && state.isPendingUrlUpdate) {
				// This item was just clicked - invert its selection state
				return {
					isSelected: !isCurrentlySelected,
					isPending: true,
				};
			}
			return {
				isSelected: isCurrentlySelected,
				isPending: false,
			};
		},
		[state.pendingClickId, state.isPendingUrlUpdate],
	);

	// Helper to determine visual state for rendering
	const getVisualState = useCallback(
		(
			id: InteractiveItemId,
			isCurrentlySelected: boolean,
		): "default" | "hover" | "focus" | "selected" => {
			const { isSelected } = getEffectiveSelectionState(id, isCurrentlySelected);

			// Focus takes precedence when keyboard navigating
			if (state.focusedId === id && state.inputModality === "keyboard") {
				return "focus";
			}

			// Then check selection
			if (isSelected) {
				return "selected";
			}

			// Then hover
			if (state.hoveredId === id) {
				return "hover";
			}

			return "default";
		},
		[state.focusedId, state.hoveredId, state.inputModality, getEffectiveSelectionState],
	);

	return {
		// State
		state,
		hoveredId: state.hoveredId,
		focusedId: state.focusedId,
		pendingClickId: state.pendingClickId,
		inputModality: state.inputModality,
		isPendingUrlUpdate: state.isPendingUrlUpdate,

		// Derived state
		shouldShowFocusRing,

		// Actions
		hoverEnter,
		hoverLeave,
		focus,
		blur,
		click,
		urlSynced,
		setInputModality,

		// Helpers
		isPendingClick,
		getEffectiveSelectionState,
		getVisualState,
	};
}

export type UseInteractionStateReturn = ReturnType<typeof useInteractionState>;
