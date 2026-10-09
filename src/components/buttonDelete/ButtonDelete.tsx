import IconRecycleBin from "../../icons/IconRecycleBin"
import './buttonDelete.css';

interface ButtonDeleteProps {
    onDelete: () => void;
    isLocked: boolean;
    isShaking: boolean;
    className?: string;
}

function ButtonDelete({ onDelete, isLocked, isShaking, className = "style-btn" }: ButtonDeleteProps) {
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