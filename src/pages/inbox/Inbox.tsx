import { useCallback, useEffect, useState, type MouseEvent } from "react";
import { Form, Field } from "react-final-form";
import  { FieldArray, type FieldArrayRenderProps } from "react-final-form-arrays";
import type { FormApi } from "final-form";
import arrayMutators from "final-form-arrays";
import { nanoid } from "@reduxjs/toolkit";

import { createTaskRequest } from "../../store/taskSlice"
import { useAppSelector, useAppDispatch } from "../../store/hooks";

import { translations } from "../../context/translations";

import { useImageAttachment } from "../../hooks/useImageAttachment";
import { useLanguage } from "../../hooks/useLanguage"

import { validateTask, type TaskValidationError } from "../../utils/validation";

import PopupCreated from "../../components/popupCreated/PopupCreated"
import PopupLimit from "../../components/popupLimit/PopupLimit"
import SubtaskField from "../../components/subtaskField/SubtaskField";
import TimerCreateTasks from "../../components/timerCreateTasks/TimerCreateTasks";
import ImagePreview from "../../components/imagePreview/ImagePreview";
import Portal from "../../components/portal/Portal";

import addSubtaskIcon from "../../assets/add-subTask-icon.svg";
import IconAttachImage from "../../icons/IconAttachImage";
import "./inbox.css"

const POPUP_DURATION_MS = 3000;
const MAX_TASKS = 20;
const MAX_SUBTASKS = 10;

export interface SubtaskFormItem {
    id: string;
    title: string;
}

interface InboxFormValues {
    task: string;
    deadline?: string | null;
    subtasks?: SubtaskFormItem[];
}

type PopupType = "limit" | "created" | null;
export type SubtaskFields = FieldArrayRenderProps<SubtaskFormItem, HTMLElement>["fields"];

function Inbox() {
    const dispatch = useAppDispatch();
    const [popup, setPopup] = useState<PopupType>(null);
    const tasksCount = useAppSelector((state) => state.tasks.tasks.length);

    const {
        imageFile,
        imagePreview,
        fileInputRef,
        handleImageChange,
        handleRemoveImage,
        resetFormOnly,
    } = useImageAttachment();

    // language
    const { language } = useLanguage();
    const t = translations[language];

    // check task and subtask
    const onSubmit = useCallback((values: InboxFormValues, form: FormApi<InboxFormValues>) => {
        if(tasksCount >= MAX_TASKS) {
            setPopup("limit");
            return;
        }

        const subtasks = (values.subtasks || [])
            .map(s => typeof s.title === "string" ? s.title.trim() : "")
            .filter(title => title.length > 0)
            .map(title => ({ title }))
            .reverse();

        const tempId = `temp_${nanoid()}`;

        dispatch(createTaskRequest({
            tempId,
            title: values.task.trim(),
            subtasks,
            imageFile,
            imagePreview,
            deadline: values.deadline ?? null
        }));

        setPopup("created");
        resetFormOnly();
        form.reset();
    }, [tasksCount, dispatch, imageFile, imagePreview, resetFormOnly]);

    // timer popups
    useEffect(() => {
        if (!popup) return;
        const timer = setTimeout(() => setPopup(null), POPUP_DURATION_MS);
        return () => clearTimeout(timer);
    }, [popup]);

    const handleAddSubtasks = useCallback((fields: SubtaskFields, e: MouseEvent<HTMLButtonElement>) => {
        if ((fields.length ?? 0) >= MAX_SUBTASKS) return;

        fields.unshift({ 
            title: "", 
            id: nanoid()
        });

        const icon = e.currentTarget.querySelector<HTMLElement>(".add-btn-icon");
        if (!icon) return;

        icon.classList.remove("spin");
        void icon.offsetWidth;
        icon.classList.add("spin");
    }, []);

    return (
        <div className="ubuntu-regular relative inbox-text">
            {popup && (
                <Portal>
                    <div 
                        className="fixed inset-0 bg-black/40 z-40" 
                        onClick={() => setPopup(null)} 
                    />
                    {popup === "limit" && <PopupLimit onClose={() => setPopup(null)} />}
                    {popup === "created" && <PopupCreated onClose={() => setPopup(null)} />}
                </Portal>
            )}
            
            <h1 className="sekuya-regular mb-5 text-4xl sm:text-5xl">
                {t.inbox}
            </h1>

            <Form<InboxFormValues> onSubmit={onSubmit} mutators={{ ...arrayMutators }} render={({ handleSubmit, form, submitting, pristine }) => (
                    <form onSubmit={handleSubmit}>
                        <Field<string> name="task" validate={validateTask}>
                            {({ input, meta }) => (
                                <div className="flex flex-col">
                                    <input {...input} type="text" placeholder={t.newTask} 
                                    className="input-style task-style" autoComplete="off"
                                    />
                                    <div className="relative flex items-center justify-center">
                                        <div className="mt-1 top-1 absolute">
                                            {meta.error && meta.submitFailed && (
                                                <span className="text-red-500">{t[meta.error as TaskValidationError]}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Field>
                        <div className="flex justify-between mt-10">
                            {/* btn clear */}
                            <button 
                                type="button" 
                                className="btn-style btn-clear ml-2"
                                onClick={() => {
                                    form.reset();
                                    handleRemoveImage();
                                }} 
                                disabled={(pristine || submitting) && !imageFile}>{t.clear}
                            </button>
                            {/* btn save */}
                            <button type="submit"
                                className="btn-style btn-save mr-2"
                            >
                                {t.save}
                            </button>
                        </div>
                        <div className="mb-5 mt-2 relative">
                            <h6 className="sekuya-regular">{t.timer}</h6>
                            <TimerCreateTasks name="deadline" />
                        </div>
                        <FieldArray<SubtaskFormItem> name="subtasks">
                            {({ fields }) => (
                                <div className="relative task-block">
                                    <div className=" w-full">
                                        <span className="sekuya-regular">{t.subtask}</span>
                                        {/* btn add subtask */}
                                        <div className="flex flex-col items-center text-center gap-6 mt-2">
                                            <button className="add-btn" type="button" onClick={(e) => handleAddSubtasks(fields, e)}>
                                                <img src={addSubtaskIcon} className="add-btn-icon" alt="" />
                                            </button>
                                        </div>
                                        <div className="relative h-45 overflow-y-auto no-scrollbar scroll-fade">
                                            {fields.map((name, index) => (
                                                <SubtaskField
                                                    key={fields.value[index]?.id ?? index}
                                                    name={name}
                                                    index={index}
                                                    fields={fields}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </FieldArray>
                    </form>
                )}
            />
            <div className="flex flex-col items-center justify-center mt-3 mb-40 relative gap-2">
                <p className="sekuya-regular">{t.image}</p>
                <input 
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                />
                <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="attach-image"
                >
                    <IconAttachImage />
                </button>

                <ImagePreview 
                    imagePreview={imagePreview}
                    handleRemoveImage={handleRemoveImage}
                />
            </div>
        </div>
    );
}

export default Inbox;