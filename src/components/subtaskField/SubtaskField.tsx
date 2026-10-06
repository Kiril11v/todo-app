import { Field } from "react-final-form";
import { translations } from "../../context/translations";
import { useLanguage } from "../../hooks/useLanguage";
import { validateSubtask, type SubtaskValidationError } from "../../utils/validation";
import type { SubtaskFields } from "../../pages/inbox/Inbox";

interface SubtaskFieldProps {
    name: string;
    index: number;
    fields: SubtaskFields;
}

function SubtaskField({ name, index, fields }: SubtaskFieldProps) {
    const { language } = useLanguage();
    const t = translations[language];

    const number = (fields.length ?? 0) - index;
    
    return (
        <div className="flex flex-col gap-2">
            <Field<string> name={`${name}.title`} validate={validateSubtask}>
                {({ input, meta }) => (
                    <div className="flex flex-col">
                        <input
                            {...input}
                            type="text"
                            className="input-style my-5 subtask-style"
                            autoComplete="off"
                            placeholder={t.subtaskPlaceholder(number)}
                        />

                        <div className="flex justify-center items-center relative mb-3">
                            <div className="absolute">
                                {meta.error && meta.submitFailed && (
                                    <span className="text-red-500">{t[meta.error as SubtaskValidationError]}</span>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </Field>

            {/* delete subtask */}
            <div>
                <button
                type="button"
                onClick={() => fields.remove(index)}
                className="text-red-60 px-3 py-2 rounded-lg error-border"
                >
                    {t.deleteSubtask}
                </button>
            </div> 
        </div>
    );
}

export default SubtaskField;