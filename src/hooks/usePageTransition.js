import { useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';

const ROUTES = ['/', '/tasks', '/done'];

const getDirection = (fromPath, toPath, instant) => {
    if (instant) return 0;
    const from = ROUTES.indexOf(fromPath);
    const to = ROUTES.indexOf(toPath);
    if ( from === -1 || to === -1) return 1;
    return to > from ? 1 : -1;
};

export const pageVariants = {
    enter: (direction) => direction === 0 
        ? {x: 0, opacity: 1, position: 'absolute', width: '100%'}
        : {x: direction > 0 ? '100%' : '-100%', opacity: 0, position: 'absolute', width: '100%' },
    center: {
        x: 0,
        opacity: 1,
        position: 'relative',
        width: '100%',
    },
    exit: (direction) => direction === 0
        ? {x: 0, opacity: 1, position: 'absolute', width: '100%'}
        : {x: direction > 0 ? '-100%' : '100%', opacity: 0, position: 'absolute', width: '100%'}, 
};

export const getPageTransition = direction => ({
    type: 'tween',
    ease: [0.4, 0, 0.2, 1],
    duration: direction === 0 ? 0 : 0.35,
});

export const usePageTransition = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const prevPath = useRef(location.pathname);
    const instant = location.state?.instant;
    const direction = getDirection(prevPath.current, location.pathname, instant);

    useEffect(() => {
    window.scrollTo({ top: 0, behavior: instant ? 'auto' : 'smooth' });
    prevPath.current = location.pathname;
    }, [location.pathname]);

    const currentIndex = ROUTES.indexOf(location.pathname);
    const canGoPrev = currentIndex > 0;
    const canGoNext = currentIndex !== -1 && currentIndex < ROUTES.length - 1;

    const goToIndex = (index) => {
        if (index >=0 && index < ROUTES.length) {
            navigate(ROUTES[index]);
        }
    }

    const goNext = () => goToIndex(currentIndex + 1);
    const goPrev = () => goToIndex(currentIndex - 1);
        
    const swipeHandlers = useSwipeable({
        onSwipedLeft: goNext,
        onSwipedRight: goPrev,
        preventScrollOnSwipe: false,
        delta: 80,
    });

    return { location, direction, swipeHandlers, goNext, goPrev, canGoPrev, canGoNext };
};