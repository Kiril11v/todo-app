import { memo } from "react";

import { useLanguage } from "../../hooks/useLanguage";

import { translations } from "../../context/translations";

import type { Task } from "../../types/task";
import type { SubtaskGroup } from "../../types/subtask";

import ButtonDelete from "../buttonDelete/ButtonDelete";

import RestoreButtonIcon from "../../icons/IconRestoreButton";
import IconImageTask from "../../icons/IconImageTask";

interface TaskArchiveItemProps {
  task: Task;
  index: number;
  subtasks: SubtaskGroup | undefined;
  isRestoring: boolean;
  onRestore: (id: string) => void;
  onOpenImage: (src: string) => void;
  isLocked: boolean;
  isDeleting: boolean;
  onDelete: (id: string) => void;
}

function TaskArchiveItem({
  task,
  index,
  subtasks,
  isRestoring,
  onRestore,
  onOpenImage,
  isLocked,
  isDeleting,
  onDelete,
}: TaskArchiveItemProps) {
  const { language } = useLanguage();
  const t = translations[language];
  
  const imageUrl = task.image_url;

  return (
    <li className="border-2 text-left p-3 archive-border relative">
      <div className="flex justify-between items-start gap-2">
        <div>
          <div className="mt-3 lg:m-0">
            <span className="text-left pr-1">{index + 1}.</span>
            <span className="break-words-hyphens">{task.title}</span>
          </div>
          {subtasks && subtasks.items.length > 0 && (
            <>
              <h6 className="sekuya-regular mt-1">{t.archiveSubtasks}</h6>
              <ul>
                {subtasks.items.map((sub) => (
                  <li key={sub.id} className="break-words-hyphens flex gap-2">
                    <span>✔</span>
                    <span>{sub.title}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-2">
          {task.archived_at && (
            <div className="absolute lg:static left-5 top-1">
              <p className="text-sm text-gray-600">
                {t.dateArchivedTask}{" "}
                {new Date(task.archived_at).toLocaleDateString(language)}
              </p>
            </div>
          )}

          {imageUrl && (
            <button
              type="button"
              className="style-btn"
              onClick={() => onOpenImage(imageUrl)}
            >
              <IconImageTask />
            </button>
          )}

          <button 
            type="button"
            className="style-btn"
            onClick={() => onRestore(task.id)}>
            <RestoreButtonIcon isRestoring={isRestoring} />
          </button>

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

export default memo(TaskArchiveItem);