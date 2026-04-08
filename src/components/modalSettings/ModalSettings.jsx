import { useDeviceDetect } from "use-device-detect";
import { useState, useEffect, useRef } from "react";
import { useLanguage } from "../../context/LanguageContext"
import IconOpenArchive from "../../icons/IconOpenArchive";
import IconTheme from "../../icons/IconTheme";

export default function ModalSettings({ openArchive, toggleTheme, theme }) {
	const { language, changeLanguage } = useLanguage();

	const options = [
		{value: "en", label: "en" },
		{value: "ua", label: "ua" },
		{value: "pl", label: "pl" },
	];

	const selected = options.find(o => o.value === language);

	const { isDesktop } = useDeviceDetect();

	const [openMenuLanguage, setOpenMenuLanguage] = useState(false);

	const wrapperRef = useRef(null);
	
	useEffect(() => {
		const handleClickOutside = (e) => {
			if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
				setOpenMenuLanguage(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// mobile, tablet
	const handleClick = () => {
		if (!isDesktop) setOpenMenuLanguage(prev => !prev);
	}
	// desktop
	const handleMouseEnter = () => {
		setOpenMenuLanguage(true);
	}

	const handleMouseLeave = () => {
			setTimeout(() => setOpenMenuLanguage(false), 120);
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
			<div ref={wrapperRef} className="relative" onClick={handleClick}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}>
					<div>
						<div
						className="cursor-pointer rounded-md bg-black text-white py-2 px-3 border border-white"
						>
							{selected.label}
							<span> | ▼</span>
						</div>

						<div
						className={`absolute top-9 right-0 mt-1 bg-black text-white border border-white rounded-md shadow-lg z-10
						transition-all duration-150 origin-top-right
						${openMenuLanguage ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
						>
								{options.map((opt) => (
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