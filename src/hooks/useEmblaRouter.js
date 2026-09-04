import { useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';

const ROUTES = ['/', '/tasks', '/done'];

export const useEmblaRouter = () => {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: false,
        align: 'start',
        skipSnaps: false,
        duration: 25,
    });

    const location = useLocation();
    const navigate = useNavigate();
    const isSyncingFromRoute = useRef(false);

    const currentIndex = ROUTES.indexOf(location.pathname);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        if (isSyncingFromRoute.current) {
            isSyncingFromRoute.current = false;
            return;
        }
        const selectedIndex = emblaApi.selectedScrollSnap();
        const path = ROUTES[selectedIndex];
        if (path && path !== location.pathname) {
            navigate(path, { state: { instant: true } });
        }
    }, [emblaApi, location.pathname, navigate]);

    useEffect(() => {
        if (!emblaApi) return;
        emblaApi.on('select', onSelect);
        return () => emblaApi.off('select', onSelect);
    }, [emblaApi, onSelect]);

    useEffect(() => {
        if (!emblaApi || currentIndex === -1) return;
        if (emblaApi.selectedScrollSnap() !== currentIndex) {
            isSyncingFromRoute.current = true;
            emblaApi.scrollTo(currentIndex);
        }
    }, [emblaApi, currentIndex]);

    const goToIndex = useCallback((index) => {
        if (index >= 0 && index < ROUTES.length) {
            navigate(ROUTES[index]);
        }
    }, [navigate]);

    const goNext = () => goToIndex(currentIndex + 1);
    const goPrev = () => goToIndex(currentIndex - 1);

    const canGoPrev = currentIndex > 0;
    const canGoNext = currentIndex !== -1 && currentIndex < ROUTES.length - 1;

    return { emblaApi, emblaRef, goNext, goPrev, canGoPrev, canGoNext };
};