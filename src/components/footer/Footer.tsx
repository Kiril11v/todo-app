import { NavLink } from "react-router-dom";
import type { ReactNode } from "react";

import { useLanguage } from "../../hooks/useLanguage";

import { translations } from "../../context/translations";

import IconGitHub from "../../icons/IconGitHub";
import IconLinkedIn from "../../icons/IconLinkedIn";
import IconGmail from "../../icons/IconGmail";
import IconTelegram from "../../icons/IconTelegram";
import IconLogo from "../../icons/IconLogo";

import "./footer.css";

interface NavItem {
  to: string;
  label: string;
}

interface SocialLink {
  href: string;
  icon: ReactNode;
}

const SOCIAL_LINKS: SocialLink[] = [
  { href: "mailto:kudkiril@gmail.com", icon: <IconGmail /> },
  { href: "https://t.me/Kiril11_2001", icon: <IconTelegram /> },
  {
    href: "https://www.linkedin.com/in/kiril-kud-3b4644334/",
    icon: <IconLinkedIn />,
  },
  { href: "https://github.com/Kiril11v/todo-app", icon: <IconGitHub /> },
];

function Footer() {
  const { language } = useLanguage();
  const t = translations[language];

  const navItems: NavItem[] = [
    { to: "/", label: t.inbox },
    { to: "/tasks", label: t.tasks },
    { to: "/done", label: t.done },
    { to: "/archive", label: t.archive },
  ];

  return (
    <footer>
      <ul className="text-color-footer flex sm:flex-row flex-col items-center justify-center gap-4 mt-3">
        <li>
          <NavLink
            className="flex items-center gap-1 hover:scale-105 transition-transform"
            to="/"
            state={{ instant: true }}
          >
            <IconLogo />
            <span className="font-semibold">ToDo</span>
          </NavLink>
        </li>
        {navItems.map(({ to, label }) => (
          <li key={to}>
            <NavLink to={to} state={{ instant: true }} className="footer-item">
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
      <div className=" flex justify-center my-2">
        <span className="flex items-center gap-3">
          {SOCIAL_LINKS.map(({ href, icon }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="footer-item"
            >
              {icon}
            </a>
          ))}
        </span>
      </div>
      <div className="text-[var(--text-footer)]">
        <span>© 2026 Kyrylo Kud. </span>
        <span>Built with React & Redux</span>
      </div>
    </footer>
  );
}

export default Footer;
