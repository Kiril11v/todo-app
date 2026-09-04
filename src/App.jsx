import { useTheme } from './context/ThemeContext';

import { Route, Routes } from 'react-router-dom';

import Header from './components/header/Header';
import Inbox from './pages/inbox/Inbox';
import Tasks from './pages/tasks/Tasks';
import Done from './pages/done/Done';
import Archive from './components/archive/Archive';
import Footer from './components/footer/Footer';

import { useEmblaRouter } from './hooks/useEmblaRouter';
import { useEmblaAutoHeight } from './hooks/useEmblaAutoHeight';

import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { loadTasksRequest } from './store/taskSlice';

import './app.css';

function App() {
    const dispatch = useDispatch();
    const { emblaApi, emblaRef, goNext, goPrev, canGoPrev, canGoNext } = useEmblaRouter();
    const height = useEmblaAutoHeight(emblaApi);

    useEffect(() => {
        dispatch(loadTasksRequest());
    }, []);

    return (
        <>
            <Header onPrev={goPrev} onNext={goNext} canGoPrev={canGoPrev} canGoNext={canGoNext} />
            <Routes>
                <Route 
                    path='/archive'
                    element={<Archive />}
                />
                <Route 
                    path='*'
                    element={
                        <div className="embla app-wrapper"
                            ref={emblaRef}
                            style={height ? { height: `${height}px` } : undefined}
                            >
                                <div className="embla__container">
                                    <div className="embla__slide"><Inbox /></div>
                                    <div className="embla__slide"><Tasks /></div>
                                    <div className="embla__slide"><Done /></div>
                                </div>
                            </div>
                    }
                />
            </Routes>
            <Footer />
        </>
    );
}

export default App;