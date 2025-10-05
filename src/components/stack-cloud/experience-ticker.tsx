import { useEffect, useRef, useState } from "react";

interface ExperienceTickerProps {
  years: number;
  months: number;
  color?: string;
}

/**
 * Animated ticker component that displays years and months
 * Animates when values change with a slide-up effect
 */
export function ExperienceTicker({
  years,
  months,
  color = "#002FA7",
}: ExperienceTickerProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayYears, setDisplayYears] = useState(years);
  const [displayMonths, setDisplayMonths] = useState(months);
  const prevYearsRef = useRef(years);
  const prevMonthsRef = useRef(months);

  useEffect(() => {
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
  }, [years, months]);

  // Safeguard against NaN
  const safeYears = Number.isNaN(displayYears) ? 0 : displayYears;
  const safeMonths = Number.isNaN(displayMonths) ? 0 : displayMonths;

  // When years is 0, only show months with larger font size
  const showOnlyMonths = safeYears === 0 && safeMonths > 0;

  return (
    <div
      className="flex w-full flex-col items-center justify-center"
      style={{
        color,
        minHeight: "3.5em", // Fixed height to prevent jumping
      }}
    >
      <div
        className={`flex w-full flex-col items-center transition-all duration-300 ${isAnimating ? "ticker-exit" : "ticker-enter"}`}
        style={{
          willChange: "transform, opacity",
        }}
      >
        {showOnlyMonths ? (
          /* Only months (with large font when years is 0) */
          <div className="text-center">
            <div
              className="font-bold leading-tight"
              style={{
                fontSize: "1.44em",
                textShadow: "0 1px 3px rgba(0, 0, 0, 0.3)",
              }}
            >
              {safeMonths} {safeMonths === 1 ? "month" : "months"}
            </div>
          </div>
        ) : (
          <>
            {/* Years */}
            <div className="text-center">
              <div
                className="font-bold leading-tight"
                style={{
                  fontSize: "1.44em",
                  textShadow: "0 1px 3px rgba(0, 0, 0, 0.3)",
                }}
              >
                {safeYears} {safeYears === 1 ? "year" : "years"}
              </div>
            </div>

            {/* Months (only show if > 0) */}
            {safeMonths > 0 && (
              <div className="text-center" style={{ marginTop: "0.25em" }}>
                <div
                  className="font-bold leading-tight"
                  style={{
                    fontSize: "0.88em",
                    opacity: 0.9,
                    textShadow: "0 1px 3px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  {safeMonths} {safeMonths === 1 ? "month" : "months"}
                </div>
              </div>
            )}
          </>
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
