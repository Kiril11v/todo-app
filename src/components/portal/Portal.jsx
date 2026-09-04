import { createPortal } from "react-dom";

function Portal({ children }) {
    const container = document.getElementById("portal-root");
    return createPortal(children, container);
}

export default Portal;