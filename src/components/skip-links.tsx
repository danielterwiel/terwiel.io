"use client";

/**
 * Skip Links Component
 *
 * Provides keyboard navigation shortcuts to bypass repetitive content
 * and jump directly to main sections of the page.
 *
 * WCAG 2.2 SC 2.4.1: Bypass Blocks (Level A)
 * - Visually hidden by default, visible on keyboard focus
 * - First interactive element in tab order
 * - Updated March 2025: Essential for keyboard-only users
 *
 * @see https://www.w3.org/WAI/WCAG22/Understanding/bypass-blocks.html
 * @see https://www.tpgi.com/when-is-a-skip-link-needed/
 */
export const SkipLinks = () => {
  return (
    <nav aria-label="Skip navigation links" className="skip-links-container">
      <a href="#stack" className="skip-link">
        Skip to stack
      </a>
      <a href="#projects" className="skip-link">
        Skip to projects
      </a>
    </nav>
  );
};
