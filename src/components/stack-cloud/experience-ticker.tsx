import { clsx } from "clsx";

import { useEffect, useRef, useState } from "react";

import { KLEIN_BLUE } from "~/constants/colors";

interface ExperienceTickerProps {
  years: number;
  months: number;
  color?: string;
  isInitialAnimating?: boolean;
}

/**
 * Animated ticker component that displays years and months
 * Animates when values change with a slide-up effect
 */
export function ExperienceTicker({
  years,
  months,
  color = KLEIN_BLUE,
  isInitialAnimating = false,
}: ExperienceTickerProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayYears, setDisplayYears] = useState(
    isInitialAnimating ? 0 : years,
  );
  const [displayMonths, setDisplayMonths] = useState(
    isInitialAnimating ? 0 : months,
  );
  const prevYearsRef = useRef(years);
  const prevMonthsRef = useRef(months);
  const hasCountedUpRef = useRef(!isInitialAnimating);

  // Handle initial count-up animation
  useEffect(() => {
    if (isInitialAnimating && !hasCountedUpRef.current) {
      // Count up animation from 0 to target values over 1500ms
      const duration = 1500;
      const startTime = performance.now();
      const targetYears = years;
      const targetMonths = months;

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Linear progression - equal time for each step
        setDisplayYears(Math.floor(targetYears * progress));
        setDisplayMonths(Math.floor(targetMonths * progress));

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Ensure we end exactly on target values
          setDisplayYears(targetYears);
          setDisplayMonths(targetMonths);
          hasCountedUpRef.current = true;
        }
      };

      requestAnimationFrame(animate);
    }
  }, [isInitialAnimating, years, months]);

  useEffect(() => {
    // Only do slide animation after initial count-up is complete
    if (!isInitialAnimating && hasCountedUpRef.current) {
      // Check if values actually changed
      if (years !== prevYearsRef.current || months !== prevMonthsRef.current) {
        // Start animation
        setIsAnimating(true);

        // After exit animation, update values
        const updateTimer = setTimeout(() => {
          setDisplayYears(years);
          setDisplayMonths(months);
        }, 150); // Half of animation duration for exit

        // Reset animation state
        const resetTimer = setTimeout(() => {
          setIsAnimating(false);
          prevYearsRef.current = years;
          prevMonthsRef.current = months;
        }, 300); // Full animation duration

        return () => {
          clearTimeout(updateTimer);
          clearTimeout(resetTimer);
        };
      }
    }
  }, [years, months, isInitialAnimating]);

  // Safeguard against NaN
  const safeYears = Number.isNaN(displayYears) ? 0 : displayYears;
  const safeMonths = Number.isNaN(displayMonths) ? 0 : displayMonths;

  return (
    <div
      className="flex w-full flex-col items-center justify-start"
      style={{
        color,
        minHeight: "3.5em", // Fixed height to prevent jumping
      }}
    >
      <div
        className={clsx(
          "flex w-full flex-col items-center transition-all duration-300",
          isAnimating ? "ticker-exit" : "ticker-enter",
        )}
        style={{
          willChange: "transform, opacity",
        }}
      >
        {/* Years or Months (primary display) */}
        <div className="text-center">
          <div
            className="font-bold leading-tight"
            style={{
              fontSize: "1.44em",
              textShadow: "0 1px 3px oklch(0% 0 0 / 0.3)",
            }}
          >
            {safeYears > 0
              ? `${safeYears} ${safeYears === 1 ? "year" : "years"}`
              : `${safeMonths} ${safeMonths === 1 ? "month" : "months"}`}
          </div>
        </div>

        {/* Additional months (only show if both years and months > 0) */}
        {safeYears > 0 && safeMonths > 0 && (
          <div className="text-center" style={{ marginTop: "0.25em" }}>
            <div
              className="font-bold leading-tight"
              style={{
                fontSize: "0.88em",
                opacity: 0.9,
                textShadow: "0 1px 3px oklch(0% 0 0 / 0.3)",
              }}
            >
              {safeMonths} {safeMonths === 1 ? "month" : "months"}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .ticker-exit {
          animation: slideUpExit 0.3s ease-out forwards;
        }

        .ticker-enter {
          animation: slideUpEnter 0.3s ease-out forwards;
        }

        @keyframes slideUpExit {
          0% {
            transform: translateY(0);
            opacity: 1;
          }
          100% {
            transform: translateY(-10px);
            opacity: 0;
          }
        }

        @keyframes slideUpEnter {
          0% {
            transform: translateY(10px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ticker-exit,
          .ticker-enter {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
