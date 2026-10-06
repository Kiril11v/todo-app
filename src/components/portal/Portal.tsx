import type { ReactNode } from "react";
import { createPortal } from "react-dom";

interface PortalProps {
    children: ReactNode;
}

function Portal({ children }: PortalProps) {
    const container = document.getElementById("portal-root");

    if (!container) return null;

    return createPortal(children, container);
}

export default Portal;