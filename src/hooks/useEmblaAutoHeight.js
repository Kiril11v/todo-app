import { useState, useEffect, useCallback } from 'react';

export function useEmblaAutoHeight(emblaApi) {
    const [height, setHeight] = useState(0);

    const updateHeight = useCallback(() => {
        if (!emblaApi) return;
        const selectedIndex = emblaApi.selectedScrollSnap();
        const slideNode = emblaApi.slideNodes()[selectedIndex];
        if (slideNode) {
            setHeight(slideNode.offsetHeight);
        }
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;

        updateHeight();

        emblaApi.on('select', updateHeight);
        emblaApi.on('reInit', updateHeight);

        const resizeObserver = new ResizeObserver(() => {
            updateHeight();
        });

        emblaApi.slideNodes().forEach((slide) => {
            resizeObserver.observe(slide);
        });

        return () => {
            emblaApi.off('select', updateHeight);
            emblaApi.off('reInit', updateHeight);
            resizeObserver.disconnect();
        };
    }, [emblaApi, updateHeight]);

    return height;
}