import { memo } from "react";

import ButtonDelete from "../buttonDelete/ButtonDelete.jsx";

import IconSaveToArchive from "../../icons/IconSaveToArchive";
import IconImageTask from "../../icons/IconImageTask";

function TaskDoneItem({
    task,
    index,
    subtasks,
    t,
    isArchiving,
    onArchive,
    onOpenImage,
    onDelete,
    isLocked,
    isDeleting,
}) {
    return (
        <li className="border-2 flex flex-col p-4 pl-1 shadow-sm space-y-1 done-border relative">
            <div className="flex justify-between items-start mt-2 lg:mt-0">
                <div className="flex flex-col gap-2">
                    <div className="flex">
                        <svg className="w-6 h-6 shrink-0 done-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="8" fill="currentColor" fillOpacity="0.24"/>
                            <path d="M8.5 11L10.7929 13.2929C11.1834 13.6834 11.8166 13.6834 12.2071 13.2929L19.5 6"
                            stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                        </svg>
                        <span>{index + 1}.</span>
                        <h3 className=" text-left ml-1 mb-2 break-words-hyphens">{task.title}</h3>
                    </div>
                    {subtasks?.items?.length > 0 && (
                    <div className="text-left ml-1">
                        <h6 className="sekuya-regular">{t.doneSubtasks}</h6>
                        <ul>
                            {subtasks.items.map((sub, subIndex) => (
                            <li key={sub.id} className="break-words-hyphens">
                                <div className="flex">
                                    <p className="whitespace-nowrap">✔ {subIndex + 1}.</p>
                                    <p className="ml-1">{sub.title}</p>
                                </div>
                            </li>
                            ))}
                        </ul>
                    </div>
                    )}
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mb-2 sm:m-0  justify-center items-center">
                    {task.completed_at && (
                        <div className="absolute lg:static left-5 top-1">
                            <p className="text-sm text-green-800">{t.dateCompletedTask}: {new Date(task.completed_at).toLocaleDateString("pl-PL")}</p>
                        </div>
                    )}
                    {/* btn image */}
                    {task.image_url && (
                        <button className="style-btn" onClick={() => onOpenImage(task.image_url)}>
                            <IconImageTask />
                        </button>
                    )}
                    {/* btn save to archive */}
                    <button className="style-btn " onClick={() => onArchive(task.id)}>
                        <IconSaveToArchive isArchiving={isArchiving} />
                    </button>
                    {/* btn delete */}
                    <ButtonDelete
                        onDelete={() => onDelete(task.id)}
                        isLocked={isLocked}
                        isShaking={isDeleting}
                    />
                </div>
            </div>
        </li>
    );
}

export default memo(TaskDoneItem);