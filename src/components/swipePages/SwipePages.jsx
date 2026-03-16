import React from 'react';
import { useSwipeable } from 'react-swipeable';
import { useLocation, useNavigate } from "react-router-dom";
import { div } from 'framer-motion/client';

const pages = ["/", "/tasks", "/done"];

const SwipePages = ({ children }) => {
    const navigate = useNavigate(); // transition slide without refresh
    const location = useLocation(); // current slide

    const currentIndex = pages.indexOf(location.pathname);

    const handlers = useSwipeable({
        onSwipedLeft: () => {
            if (currentIndex >= 0 && currentIndex < pages.length - 1) {
                const nextPagePath = pages[currentIndex + 1]
                navigate(nextPagePath);
            }
        },
        onSwipedRight: () => {
            if (currentIndex > 0) {
                const prevPagePath = pages[currentIndex - 1]
                navigate(prevPagePath);
            }
        },
        preventScrollX: true,
        trackMouse: true
    });

    return (
        <div {...handlers}>
            {children}
        </div>
    )
}
    
export default SwipePages;