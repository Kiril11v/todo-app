import IconRecycleBin from "../../icons/IconRecycleBin"
import './buttonDelete.css';

function ButtonDelete({ onDelete, isLocked, isShaking, className = "style-btn" }) {
    return (
        <button
            className={className}
            disabled={isLocked}
            onClick={onDelete}
        >
            <IconRecycleBin isShaking={isShaking} />
        </button>
    );
}

export default ButtonDelete;