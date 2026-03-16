import { useState, useRef, useEffect, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import ModalSettings from "../modalSettings/ModalSettings";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../context/translations";
import logoIcon from "../../assets/logo-todo.svg";
import menuBurgerIcon from "../../assets/menu-burger.svg";
import "./header.css";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [rotate, setRotate] = useState(false);

  const { theme, toggleTheme } = useTheme();
  const { language } = useLanguage();
  const t = translations[language];

  const menuRef = useRef(null);
  const modalRef = useRef(null);
  const settingsButtonRef = useRef(null);
  const buttonRef = useRef(null);

  const navigate = useNavigate();

  const closeAll = useCallback(() => {
    setMenuOpen(false);
    setModalOpen(false);
    setRotate(false);
  }, []);

  useEffect(() => {
    const  handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) &&
      buttonRef.current && !buttonRef.current.contains(event.target)) {
        setMenuOpen(false);
      }

      if (modalRef.current && !modalRef.current.contains(event.target) &&
      settingsButtonRef.current && !settingsButtonRef.current.contains(event.target)) {
        setModalOpen(false);
        setRotate(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
  <nav className={`fixed top-0 left-0 w-full bg-gray-800 shadow-xl sekuya-regular z-99 lang-${language}`}>
      <div className="flex justify-between text-gray-200 my-4 sm:my-1">
        <NavLink className="px-6 flex items-center gap-1 hover:scale-105 transition-transform text-white" to="/">
          <img src={logoIcon} alt="logo"/>
          <span className="font-semibold tracking-wide">ToDo</span>
        </NavLink>

        {/* Burger Menu */}
        <button 
        onClick={() => setMenuOpen((prev) => !prev)}
        ref={buttonRef}
        className="sm:hidden pr-10 transition-all duration-300 mt-1">
            <img src={menuBurgerIcon} alt="menu" />
        </button>

        {menuOpen && (
           <div className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
           onClick={() => setMenuOpen(false)}>
           </div> )}
        <ul ref={menuRef} onClick={(e) => e.stopPropagation()} 
          className={`flex-col sm:flex-row sm:flex gap-1 mr-2 items-center sm:bg-transparent rounded-md bg-emerald-100 text-black sm:text-white absolute sm:static top-17 right-0 duration-300 ease-in-out transition-all
          sm:opacity-100 sm:translate-y-0 sm:pointer-events-auto z-50 py-2
          ${menuOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"}`}>
            <li>
              <NavLink 
              to="/" 
              className="nav-item"
              onClick={closeAll}>
                {t.inbox}
              </NavLink>
            </li>
            <li>
              <NavLink 
              to="/tasks" 
              className="nav-item" 
              onClick={closeAll}>
                {t.tasks}
              </NavLink>
            </li>
            <li>
              <NavLink 
              to="/done"
              className="nav-item"
              onClick={closeAll}>
                {t.done}
              </NavLink>
            </li>
            {/* btn settings */}
            <li className="w-full">
              <div className="px-3 mt-1 p-2">
                <button 
                ref={settingsButtonRef} 
                className="cursor-pointer" 
                onClick={() => {
                  setModalOpen((prev) => !prev); 
                  setRotate((prev) => !prev);
                }}>
                    <svg className={`w-5 transition-transform duration-500 ease-out ${rotate ? "rotate-90" : "-rotate-90"}`}
                     fill="currentColor" viewBox="0 0 507.451 507.45" width="25" height="25" >
                      <path d="M440.813,280.5c0-7.65,2.55-15.3,2.55-25.5s0-17.85-2.55-25.5l53.55-43.35c5.1
                      -5.1,5.1-10.2,2.55-15.3l-51-89.25 c-2.55-2.55-7.649-5.1-15.3-2.55l-63.75,25.5c-12.75
                      -10.2-28.05-17.85-43.35-25.5l-10.2-66.3C315.863,5.1,308.212,0,303.113,0 h-102c-5.101,0
                      -12.75,5.1-12.75,10.2l-10.2,68.85c-15.3,5.1-28.05,15.3-43.35,25.5l-61.2-25.5c-7.65-2.55
                      -12.75,0-17.851,5.1 l-51,89.25c-2.55,2.55,0,10.2,5.1,15.3l53.55,40.8c0,7.65-2.55,15.3
                      -2.55,25.5s0,17.85,2.55,25.5l-53.55,43.35 c-5.1,5.101-5.1,10.2-2.55,15.301l51,89.25c2.55
                      ,2.55,7.649,5.1,15.3,2.55l63.75-25.5c12.75,10.2,28.05,17.85,43.35,25.5 l10.2,66.3c0,5.1,5.1
                      ,10.2,12.75,10.2h102c5.101,0,12.75-5.101,12.75-10.2l10.2-66.3c15.3-7.65,30.6-15.3,43.35-25.5l63.75
                      ,25.5 c5.101,2.55,12.75,0,15.301-5.101l51-89.25c2.55-5.1,2.55-12.75-2.551-15.3L440.813,280.5z M252.113
                      ,344.25 c-48.45,0-89.25-40.8-89.25-89.25s40.8-89.25,89.25-89.25s89.25,40.8,89.25,89.25S300.563,344.25
                      ,252.113,344.25z"/>
                    </svg>
                </button>
              </div>
         
              <div 
                ref={modalRef}
                className={`sm:absolute top-25 right-0 transition-all duration-500 ease-in-out
                ${modalOpen 
                ? "max-h-96 opacity-100 pointer-events-auto"
                : "max-h-0 opacity-0 pointer-events-none"}`}
              >
                <div>
                  <ModalSettings openArchive={() => {
                    navigate("/archive");
                    closeAll();
                    }}
                    toggleTheme={toggleTheme}
                    theme={theme}
                  />
                </div>
              </div>
            </li>
        </ul>
      </div>
    </nav>
  );
}

export default Header;