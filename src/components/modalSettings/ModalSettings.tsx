import { useDeviceDetect } from "use-device-detect";
import { useState, useEffect, useRef } from "react";

import type { Language } from "../../context/translations";
import { useLanguage } from "../../hooks/useLanguage";
import { useTheme } from "../../hooks/useTheme";

import IconOpenArchive from "../../icons/IconOpenArchive";
import IconTheme from "../../icons/IconTheme";

interface ModalSettingsProps {
	openArchive: () => void;
}

interface LanguageOption {
	value: Language;
	label: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
	{ value: "en", label: "en" },
	{ value: "ua", label: "ua" },
	{ value: "pl", label: "pl" },
];

const CLOSE_DELAY_MS = 120;

export default function ModalSettings({ openArchive }: ModalSettingsProps) {
	const { language, changeLanguage } = useLanguage();
	const { toggleTheme } = useTheme();

	const { windowSize, breakpoints } = useDeviceDetect();
	const isDesktop = windowSize.width >= breakpoints.lg;

	const [openMenuLanguage, setOpenMenuLanguage] = useState(false);

	const wrapperRef = useRef<HTMLDivElement>(null);
	const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const selected = LANGUAGE_OPTIONS.find(o => o.value === language);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
				setOpenMenuLanguage(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// clear timer when unmounting
	useEffect(() => {
		return () => {
			if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
		};
	}, []);

	// mobile, tablet
	const handleClick = () => {
		if (!isDesktop) setOpenMenuLanguage(prev => !prev);
	};

	// desktop
	const handleMouseEnter = () => {
		if (!isDesktop) return;
		if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
		setOpenMenuLanguage(true);
	};

	const handleMouseLeave = () => {
		if (!isDesktop) return;
		closeTimerRef.current = setTimeout(() => setOpenMenuLanguage(false), CLOSE_DELAY_MS);
	};

	return (
		<div>
			<div className="flex flex-col gap-3 items-center">
				<button onClick={openArchive}>
					<IconOpenArchive />
				</button>
				<button onClick={toggleTheme} className="text-left">
					<IconTheme />
				</button>
				<div
					ref={wrapperRef}
					className="relative"
					onClick={handleClick}
					onMouseEnter={handleMouseEnter}
					onMouseLeave={handleMouseLeave}
				>
					<div className="sekuya-regular" lang="en">
						<div className="cursor-pointer rounded-md bg-black text-white py-2 px-3 border border-white">
							{selected?.label ?? language}
							<span> | ▼</span>
						</div>

						<div
							className={`absolute top-9 right-0 mt-1 bg-black text-white border border-white rounded-md shadow-lg z-10
							transition-all duration-150 origin-top-right
							${openMenuLanguage ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
						>
							{LANGUAGE_OPTIONS.map((opt) => (
								<div
									key={opt.value}
									onClick={(e) => {
										e.stopPropagation();
										changeLanguage(opt.value);
										setOpenMenuLanguage(false);
									}}
									className={`cursor-pointer px-3 py-2
									${opt.value === language ? "font-bold" : ""}
									hover:bg-white hover:text-black transition-colors
									`}
								>
									{opt.label}
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}