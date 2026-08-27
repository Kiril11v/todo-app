import { Routes, Route } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from './context/ThemeContext';

import Header from './components/header/Header';
import Inbox from './pages/inbox/Inbox';
import Tasks from './pages/tasks/Tasks';
import Done from './pages/done/Done';
import Archive from './components/archive/Archive';
import Footer from './components/footer/Footer';

import { usePageTransition, pageVariants, getPageTransition } from './hooks/usePageTransition';

import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { loadTasksRequest } from './store/taskSlice';

import './app.css';
import 'simplebar-react/dist/simplebar.min.css';

function App() {
    const { theme } = useTheme();
    const dispatch = useDispatch();
    const { location, direction, swipeHandlers, goNext, goPrev, canGoPrev, canGoNext } = usePageTransition();

    useEffect(() => {
        dispatch(loadTasksRequest());
    }, []);

    return (
        <>
            <Header  onPrev={goPrev} onNext={goNext} canGoPrev={canGoPrev} canGoNext={canGoNext}/>
            <div style={{position: 'relative', overflow: 'hidden' }} {...swipeHandlers}>
                <AnimatePresence mode="popLayout" custom={direction}>
                    <motion.div
                        key={location.pathname}
                        custom={direction}
                        variants={pageVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={getPageTransition(direction)}
                        style={{ width: '100%' }} 
                    >
                        <Routes location={location}>
                            <Route index element={<Inbox />} />
                            <Route path='/tasks' element={<Tasks />} />
                            <Route path='/done' element={<Done />} />
                            <Route path="/archive" element={<Archive />} />
                        </Routes>
                    </motion.div>
                </AnimatePresence>

            </div>
            <Footer />
        </>
    );
}

export default App;