import { Routes, Route} from 'react-router-dom';
import { useTheme } from './context/ThemeContext';

import Header from './components/header/Header';
import Inbox from './pages/inbox/Inbox';
import Tasks from './pages/tasks/Tasks';
import Done from './pages/done/Done';
import Archive from './components/archive/Archive';
import Footer from './components/footer/Footer';

import './App.css'

function App() {
    const { theme } = useTheme();

    return (
        <div className={theme === "light" ? "light-theme" : "dark-theme"}>
            <Header  />
            <Routes>
                <Route index element={<Inbox />} />
                <Route path='/tasks' element={<Tasks />} />
                <Route path='/done' element={<Done />} />
                <Route path='/archive' element={<Archive />} />
            </Routes>
            <Footer />
        </div>   
    );
}

export default App;

