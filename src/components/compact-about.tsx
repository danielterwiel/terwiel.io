"use client";

import { useState } from "react";
import { Icon } from "~/components/icon";

const keySkills = [
	"JavaScript",
	"TypeScript",
	"React",
	"Vue",
	"Rust",
	"HTML",
	"CSS",
];

const languages = [
	{ name: "Dutch", icon: "🇳🇱", level: "Native" },
	{ name: "English", icon: "🇺🇸", level: "Fluent" },
	{ name: "Italian", icon: "🇮🇹", level: "Conversational" },
];

const focus = [
	"Communication",
	"Architecture",
	"Performance",
	"Accessibility",
	"Simplicity",
];

export default function CompactAbout() {
	const [expanded, setExpanded] = useState(false);

	return (
		<section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
			{/* Core Skills */}
			<div>
				<h3 className="flex items-center gap-2 font-semibold text-gray-900 mb-2">
					<div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
						<Icon.Stack
							aria-hidden={true}
							className="w-full h-full text-klein"
						/>
					</div>
					Core Skills
				</h3>
				<div className="flex flex-wrap gap-1">
					{keySkills.map((skill) => (
						<span
							key={skill}
							className="px-2 py-1 bg-klein/10 text-klein rounded text-xs font-medium"
						>
							{skill}
						</span>
					))}
				</div>
			</div>

			{/* Focus Areas */}
			<div>
				<h3 className="flex items-center gap-2 font-semibold text-gray-900 mb-2">
					<div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
						<Icon.Focus
							aria-hidden={true}
							className="w-full h-full text-klein"
						/>
					</div>
					Focus
				</h3>
				<div className="space-y-1">
					{focus.slice(0, expanded ? focus.length : 3).map((item) => (
						<div key={item} className="text-xs text-gray-600">
							• {item}
						</div>
					))}
					{!expanded && focus.length > 3 && (
						<button
							type="button"
							onClick={() => setExpanded(true)}
							className="text-xs text-klein hover:underline print:hidden"
						>
							+{focus.length - 3} more
						</button>
					)}
				</div>
			</div>

			{/* Languages */}
			<div>
				<h3 className="flex items-center gap-2 font-semibold text-gray-900 mb-2">
					<div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
						<Icon.Language
							aria-hidden={true}
							className="w-full h-full text-klein"
						/>
					</div>
					Languages
				</h3>
				<div className="space-y-1">
					{languages.map((lang) => (
						<div key={lang.name} className="flex items-center gap-2 text-xs">
							<span>{lang.icon}</span>
							<span className="text-gray-600">{lang.name}</span>
							<span className="text-gray-400">({lang.level})</span>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
