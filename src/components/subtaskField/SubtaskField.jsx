import { Field } from "react-final-form";

function SubtaskField({ name, index, fields, validateSubtask, t, withDelay }) {
    
    return (
        <div className="mb-5">
            <Field name={`${name}.title`} validate={validateSubtask}>
                {({ input, meta }) => (
                    <div className="flex flex-col">
                        <input
                            {...input}
                            type="text"
                            className="bg-amber-300 input-style my-5 subtask-style"
                            autoComplete="off"
                            placeholder={t.subtaskPlaceholder(index + 1)}
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
            <button
                type="button"
                onClick={withDelay(() => fields.remove(index))}
                className="text-red-60 px-3 py-2 rounded-lg error-border"
            >
                {t.deleteSubtask}
            </button>
        </div>
    );
}

export default SubtaskField;