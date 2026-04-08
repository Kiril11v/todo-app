import { useState, useRef, useEffect, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import ModalSettings from "../modalSettings/ModalSettings";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../context/translations";
import logoIcon from "../../assets/logo-todo.svg";
import menuBurgerIcon from "../../assets/menu-burger.svg";
import IconSettings from "../../icons/IconSettings";
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
                  <IconSettings rotate={rotate}/>
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