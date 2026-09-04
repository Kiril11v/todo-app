import { Field } from "react-final-form";

function SubtaskField({ name, index, fields, validateSubtask, onRemove, t }) {
    const number = fields.length - index
    
    return (
        <div className="flex flex-col gap-2">
            <Field name={`${name}.title`} validate={validateSubtask}>
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
                                    <span className="text-red-500">{t[meta.error]}</span>
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
                onClick={() => onRemove(fields, index)}
                className="text-red-60 px-3 py-2 rounded-lg error-border"
                >
                    {t.deleteSubtask}
                </button>
            </div> 
        </div>
    );
}

export default SubtaskField;