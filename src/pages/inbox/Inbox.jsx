import { Form, Field } from "react-final-form"
import  { FieldArray } from "react-final-form-arrays"
import { useDispatch, useSelector } from "react-redux"
import { createTaskRequest } from "../../store/taskSlice"
import arrayMutators from "final-form-arrays";
import PopupCreated from "../../components/popupCreated/PopupCreated"
import PopupLimit from "../../components/popupLimit/PopupLimit"
import SubtaskField from "../../components/subtaskField/SubtaskField";
import addSubtaskIcon from "../../assets/add-subTask-icon.svg";
import { useCallback, useEffect, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../context/translations";
import { useTaskValidation } from "../../hooks/useTaskValidation";
import "./Inbox.css"

function Inbox() {
    const dispatch = useDispatch();

    const tasks = useSelector((state) => state.tasks.tasks);

    const [showLimitPopup, setShowLimitPopup] = useState(false);
    const [showCreatedPopup, setShowCreatedPopup] = useState(false);

    // language
    const { language } = useLanguage();
    const t = translations[language];

    // validation
    const { validateTask, validateSubtask } = useTaskValidation(t);

    // timer click btn
    const withDelay = useCallback(
        (callback, delay = 200) => () => setTimeout(callback, delay), []);

    // check task and subtask
    const onSubmit = useCallback((values, form) => {
        if(tasks.length >= 15) {
            setShowLimitPopup(true);
            return;
        };

        const subtasks = (values.subtasks || [])
            .map((s) => ({ ...s, title: s.title?.trim() }))
            .filter((s) => s.title);

       dispatch(
            createTaskRequest({
                id: Date.now(),
                title: values.task.trim(),
                subtasks,
            })
       );

        setShowCreatedPopup(true);
        form.reset();
    }, [tasks.length, dispatch]);

    // timer popups
    useEffect(() => {
        if (!showLimitPopup && !showCreatedPopup) return;

        const timerPopup = setTimeout(() => {
            setShowLimitPopup(false);
            setShowCreatedPopup(false);
        }, 5000);

        return () => clearTimeout(timerPopup)
    }, [showLimitPopup, showCreatedPopup]);

    const handleAddSubtasks = useCallback((fields, e) => {
        if(fields.length >= 10) return;

        fields.push({ title: "" });

        const icon = e.currentTarget.querySelector(".add-btn-icon");
        if (!icon) return;

        icon.classList.remove("spin");
        void icon.offsetWidth;
        icon.classList.add("spin");
    }, []);

    return (
        <div className="ubuntu-regular relative">
            {/* background popup */}
            {(showLimitPopup || showCreatedPopup) && (
                <div
                    className="fixed inset-0 bg-black/40 z-40"
                    onClick={() => {
                        setShowLimitPopup(false);
                        setShowCreatedPopup(false);
                    }}
                />
            )}

            {/* pop-up limit tasks */}
            {showLimitPopup && <PopupLimit onClose={() => setShowLimitPopup(false)} />}

            {/* pop-up create tasks */}
            {showCreatedPopup && <PopupCreated onClose={() => setShowCreatedPopup(false)} />}
            
            <h1 lang={language === "ua" ? "uk" : "en"} className="sekuya-regular mb-5 text-4xl sm:text-5xl">
                {t.inbox}
            </h1>

            <Form onSubmit={onSubmit} mutators={{ ...arrayMutators }} render={({ handleSubmit, form, submitting, pristine }) => (
                    <form onSubmit={handleSubmit}>
                        <Field name="task" validate={validateTask}>
                            {({ input, meta }) => (
                                <div className="flex flex-col">
                                    <input {...input} type="text" placeholder={t.newTask} 
                                    className="bg-amber-300 text-black input-style task-style" autoComplete="off"
                                    />
                                    <div className="relative flex items-center justify-center">
                                        <div className="mt-1 top-1 absolute">
                                            {meta.error && meta.submitFailed && (
                                                <span className="text-red-500">{t[meta.error]}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Field>
                        <div className="flex justify-between mt-10">
                            {/* btn clear */}
                            <button type="reset" 
                                className="btn-style btn-clear"
                                onClick={withDelay(() => form.reset())} 
                                disabled={pristine || submitting}>{t.clear}
                            </button>
                            {/* btn save */}
                            <button type="submit"
                                className="btn-style btn-save"
                            >
                                {t.save}
                            </button>
                        </div>
                        <FieldArray name="subtasks">
                            {({ fields }) => (
                                <div className="relative">
                                    <div className=" w-full absolute top-15">
                                        <span className="sekuya-regular">{t.subtask}</span>

                                        {fields.map((name, index) => (
                                            <SubtaskField
                                                key={name}
                                                name={name}
                                                index={index}
                                                fields={fields}
                                                validateSubtask={validateSubtask}
                                                t={t}
                                                withDelay={withDelay}
                                            />
                                        ))}
                                    </div>

                                    {/* btn add subtask */}
                                    <div className="flex flex-col items-center text-center gap-6 mt-10">
                                        <button className="add-btn" type="button" onClick={(e) => handleAddSubtasks(fields, e)}>
                                            <img src={addSubtaskIcon} className="add-btn-icon" alt="" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </FieldArray>
                    </form>
                )}
            />
        </div>
    );
}

export default Inbox;