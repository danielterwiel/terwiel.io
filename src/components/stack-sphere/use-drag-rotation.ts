import { useCallback, useRef, useState } from "react";

/**
 * Drag-to-rotate interaction hook for 3D sphere
 *
 * Tracks mouse/touch drag gestures and converts them to rotation angles.
 * Features:
 * - Maps deltaX → rotateY, deltaY → rotateX
 * - Inertia on release for natural feel
 * - Auto-rotation resumes after idle period
 *
 * @see https://armandocanals.com/posts/CSS-transform-rotating-a-3D-object-perspective-based-on-mouse-position.html
 */

interface DragRotationState {
  /** Current X rotation in degrees (vertical axis drag) */
  rotateX: number;
  /** Current Y rotation in degrees (horizontal axis drag) */
  rotateY: number;
  /** Whether user is currently dragging */
  isDragging: boolean;
  /** Whether inertia animation is active */
  hasInertia: boolean;
}

interface UseDragRotationOptions {
  /** Sensitivity multiplier for drag-to-rotation conversion (default: 0.5) */
  sensitivity?: number;
  /** Friction coefficient for inertia decay (0-1, default: 0.95) */
  friction?: number;
  /** Minimum velocity threshold to stop inertia (default: 0.1) */
  minVelocity?: number;
  /** Idle time in ms before auto-rotation resumes (default: 3000) */
  idleTimeout?: number;
}

interface UseDragRotationReturn {
  /** Current rotation state */
  rotation: DragRotationState;
  /** Whether auto-rotation should be disabled */
  disableAutoRotation: boolean;
  /** Event handlers to attach to the sphere element */
  handlers: {
    onMouseDown: (e: React.MouseEvent) => void;
    onTouchStart: (e: React.TouchEvent) => void;
  };
}

/**
 * Hook for drag-to-rotate sphere interaction
 */
export function useDragRotation(
  options: UseDragRotationOptions = {},
): UseDragRotationReturn {
  const {
    sensitivity = 0.5,
    friction = 0.95,
    minVelocity = 0.1,
    idleTimeout = 3000,
  } = options;

  const [rotation, setRotation] = useState<DragRotationState>({
    rotateX: 0,
    rotateY: 0,
    isDragging: false,
    hasInertia: false,
  });

  const [disableAutoRotation, setDisableAutoRotation] = useState(false);

  // Refs for tracking drag state without causing re-renders
  const lastPosition = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const animationFrame = useRef<number | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear idle timer
  const clearIdleTimer = useCallback(() => {
    if (idleTimer.current) {
      clearTimeout(idleTimer.current);
      idleTimer.current = null;
    }
  }, []);

  // Start idle timer to resume auto-rotation
  const startIdleTimer = useCallback(() => {
    clearIdleTimer();
    idleTimer.current = setTimeout(() => {
      setDisableAutoRotation(false);
    }, idleTimeout);
  }, [clearIdleTimer, idleTimeout]);

  // Cancel any running inertia animation
  const cancelInertia = useCallback(() => {
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = null;
    }
  }, []);

  // Apply inertia animation
  const applyInertia = useCallback(() => {
    const vx = velocity.current.x;
    const vy = velocity.current.y;

    // Check if velocity is below threshold
    if (Math.abs(vx) < minVelocity && Math.abs(vy) < minVelocity) {
      setRotation((prev) => ({ ...prev, hasInertia: false }));
      startIdleTimer();
      return;
    }

    // Apply velocity to rotation
    setRotation((prev) => ({
      ...prev,
      rotateX: prev.rotateX + vy * sensitivity,
      rotateY: prev.rotateY + vx * sensitivity,
    }));

    // Apply friction
    velocity.current.x *= friction;
    velocity.current.y *= friction;

    // Continue animation
    animationFrame.current = requestAnimationFrame(applyInertia);
  }, [friction, minVelocity, sensitivity, startIdleTimer]);

  // Handle mouse/touch move
  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      const deltaX = clientX - lastPosition.current.x;
      const deltaY = clientY - lastPosition.current.y;

      // Update velocity for inertia
      velocity.current.x = deltaX;
      velocity.current.y = deltaY;

      // Update rotation
      setRotation((prev) => ({
        ...prev,
        rotateX: prev.rotateX + deltaY * sensitivity,
        rotateY: prev.rotateY + deltaX * sensitivity,
      }));

      // Update last position
      lastPosition.current = { x: clientX, y: clientY };
    },
    [sensitivity],
  );

  // Handle drag end
  const handleEnd = useCallback(() => {
    setRotation((prev) => ({ ...prev, isDragging: false, hasInertia: true }));

    // Start inertia animation
    animationFrame.current = requestAnimationFrame(applyInertia);
  }, [applyInertia]);

  // Mouse event handlers
  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Only handle left mouse button
      if (e.button !== 0) return;

      e.preventDefault();
      cancelInertia();
      clearIdleTimer();
      setDisableAutoRotation(true);

      lastPosition.current = { x: e.clientX, y: e.clientY };
      velocity.current = { x: 0, y: 0 };

      setRotation((prev) => ({ ...prev, isDragging: true, hasInertia: false }));

      const onMouseMove = (moveEvent: MouseEvent) => {
        handleMove(moveEvent.clientX, moveEvent.clientY);
      };

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        handleEnd();
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [cancelInertia, clearIdleTimer, handleMove, handleEnd],
  );

  // Touch event handlers
  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;

      cancelInertia();
      clearIdleTimer();
      setDisableAutoRotation(true);

      lastPosition.current = { x: touch.clientX, y: touch.clientY };
      velocity.current = { x: 0, y: 0 };

      setRotation((prev) => ({ ...prev, isDragging: true, hasInertia: false }));

      const onTouchMove = (moveEvent: TouchEvent) => {
        const moveTouch = moveEvent.touches[0];
        if (!moveTouch) return;
        handleMove(moveTouch.clientX, moveTouch.clientY);
      };

      const onTouchEnd = () => {
        document.removeEventListener("touchmove", onTouchMove);
        document.removeEventListener("touchend", onTouchEnd);
        document.removeEventListener("touchcancel", onTouchEnd);
        handleEnd();
      };

      document.addEventListener("touchmove", onTouchMove, { passive: true });
      document.addEventListener("touchend", onTouchEnd);
      document.addEventListener("touchcancel", onTouchEnd);
    },
    [cancelInertia, clearIdleTimer, handleMove, handleEnd],
  );

  return {
    rotation,
    disableAutoRotation,
    handlers: {
      onMouseDown,
      onTouchStart,
    },
  };
}
