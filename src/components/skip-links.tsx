"use client";

/**
 * Skip Links Component
 *
 * Provides keyboard navigation shortcuts to bypass repetitive content
 * and jump directly to main sections of the page.
 *
 * ## WCAG 2.2 Compliance
 *
 * - **SC 2.4.1 Bypass Blocks (Level A)**: Skip links allow users to bypass
 *   repetitive content like headers and navigation
 * - **SC 2.1.1 Keyboard (Level A)**: All skip links are keyboard accessible
 * - **SC 2.4.7 Focus Visible (Level AA)**: Focus indicators clearly visible
 *
 * ## Keyboard Navigation
 *
 * - **Tab**: Focus skip links (visible when focused)
 * - **Enter/Space**: Activate skip link, jump to target section
 * - **Tab** again: Continue to next skip link or first interactive element
 *
 * ## Visual Behavior
 *
 * - Hidden by default (positioned off-screen at `top: -100vh`)
 * - Slides into view when focused (CSS transition)
 * - High contrast styling: Klein blue background, white text
 * - Inner outline for focus visibility (3px white outline)
 *
 * ## Target Sections
 *
 * - `#main`: Main content area (skip header entirely)
 * - `#stack`: Technology stack visualization (StackCloud component)
 * - `#projects`: Projects list section
 *
 * @see https://www.w3.org/WAI/WCAG22/Understanding/bypass-blocks.html
 * @see https://www.tpgi.com/when-is-a-skip-link-needed/
 * @see globals.css for `.skip-link` and `.skip-links-container` styles
 */
export const SkipLinks = () => {
  return (
    <nav aria-label="Skip navigation links" className="skip-links-container">
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <a href="#stack" className="skip-link">
        Skip to stack
      </a>
      <a href="#projects" className="skip-link">
        Skip to projects
      </a>
    </nav>
  );
};
