import { NavLink, useNavigate } from "react-router-dom";
import { useRef } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../context/translations";
import { useAnimatedDelay } from "../../hooks/useAnimatedDelay";

import logoIcon from "../../assets/logo-todo.svg";
import IconOpenArchive from "../../icons/IconOpenArchive";
import IconGitHub from "../../icons/IconGitHub";
import IconLinkedIn from "../../icons/IconLinkedIn";
import IconGmail from "../../icons/IconGmail";
import IconTelegram from "../../icons/IconTelegram";
import IconLogo from "../../icons/IconLogo"

import "./footer.css";

function Footer() {
    const { language } = useLanguage();
    const t = translations[language];

    const { ref: tabRef, trigger: tabTrigger } = useAnimatedDelay('clickTab', 350);

    return (
        <footer>
                <ul className="flex sm:flex-row flex-col items-center justify-center gap-4 mt-3">
                    <li>
                        <NavLink className="flex items-center gap-1 hover:scale-105 transition-transform" to="/" state={{ instant: true }}>
                            <IconLogo />
                            <span className="font-semibold text-[var(--text)]">ToDo</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/" state={{ instant: true }} className="footer-item">
                            {t.inbox}
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/tasks" state={{ instant: true }} className="footer-item" >
                            {t.tasks}
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/done" state={{ instant: true }} className="footer-item">
                            {t.done}
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/archive" state={{ instant: true }} className="footer-item">
                            {t.archive}
                        </NavLink>
                    </li>
                </ul>
                <div className=" flex justify-center my-2">
                    <span className="flex items-center gap-3">
                        <a href="mailto:kudkiril@gmail.com" target="_blank" rel="noreferrer" className="footer-item"><IconGmail /></a>
                        <a href="https://t.me/Kiril11_2001" target="_blank" rel="noreferrer" className="footer-item"><IconTelegram /></a>
                        <a href="https://www.linkedin.com/in/kiril-kud-3b4644334/" target="_blank" rel="noreferrer" className="footer-item"><IconLinkedIn /></a>
                        <a href="https://github.com/Kiril11v/todo-app" target="_blank" rel="noreferrer" className="footer-item"><IconGitHub /></a>
                    </span>
                </div>
                <div className="text-[var(--text-footer)]">
                    <span>© 2026 Kyrylo Kud. </span>
                    <span>Built with React & Redux</span>
                </div>
        </footer>
    )
}

export default Footer;