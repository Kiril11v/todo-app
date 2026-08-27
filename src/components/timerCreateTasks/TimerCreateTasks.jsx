import { Field } from "react-final-form";
import { useState, useRef, useEffect, useMemo } from "react";

import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../context/translations";

import Calendar from "react-calendar"
import "react-calendar/dist/Calendar.css";
import "./timerCreateTasks.css"

import IconClockActive from "../../icons/IconClockActive";
import IconClockInactive from "../../icons/iconClockInactive";

import {formatDeadline, toDateInputValue } from "../../utils/deadline";

function TimerIcon({ isSet }) {
    return isSet ? <IconClockActive /> : <IconClockInactive />
}

function dateStrToDate(dateStr) {
    if (!dateStr) return null;
    const [yyyy, mm, dd] = dateStr.split("-").map(Number);
    return new Date(yyyy, mm - 1, dd);
}

const localeMap = {
    en: "en-US",
    pl: "pl-PL",
    ua: "uk-UA",
};

// name — имя поля в форме, значение будет ISO-строкой даты или null
export default function TimerCreateTasks({ name = "deadline", t }) {
    const [open, setOpen] = useState(false);
    const [dateStr, setDateStr] = useState("");
    const [now, setNow] = useState(() => new Date());
    const popupRef = useRef(null);

    // language
    const { language } = useLanguage();
    const calendarLocale = localeMap[language];

    // close on click outside the popup
    useEffect(() => {
        if (!open) return;
        const onClickOutside = (e) => {
            if (popupRef.current && !popupRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, [open]);

    const todayStr = useMemo(() => toDateInputValue(now), [now]);
    const todayDate = useMemo(() => dateStrToDate(todayStr), [todayStr]);

    const isPast = dateStr ? dateStr < todayStr : false;
    const isValid = Boolean(dateStr) && !isPast;

    return (
        <Field name={name}>
            {({ input }) => {
                const isSet = Boolean(input.value);

                const openPopup = () => {
                    setDateStr(input.value || toDateInputValue(new Date()));
                    setNow(new Date());
                    setOpen(true);
                };

                const handleCalendarChange = (value) => {
                    setDateStr(toDateInputValue(value));
                };

                const handleApply = () => {
                    if (!isValid) return;
                    input.onChange(dateStr);
                    setOpen(false);
                };

                const handleClear = () => {
                    setDateStr("");
                    input.onChange(null);
                    setOpen(false);
                };

                return (
                    <div className="relative flex flex-col items-center mb-8">
                        <button
                            type="button"
                            className="transition-colors btn-timer"
                            onClick={() => (open ? setOpen(false) : openPopup())}
                            aria-label="set deadline"
                        >
                            <TimerIcon isSet={isSet} />
                        </button>

                        {open && (
                            <div
                                ref={popupRef}
                                className="deadline-popup absolute top-12 z-20 w-64 sm:w-auto ubuntu-regular"
                            >
                                <p className="text-neutral-500 mb-1">
                                    {t.date_title}
                                </p>

                                <Calendar
                                onChange={handleCalendarChange}
                                value={dateStr ? dateStrToDate(dateStr) : null}
                                minDate={todayDate}
                                minDetail="month"
                                className="deadline-calendar"
                                locale={calendarLocale}
                                prev2Label={null}
                                next2Label={null}
                                />

                                <div className="mt-2 min-h-[1rem] text-xs">
                                    {isPast && (
                                        <span className="text-red-500">
                                            {t?.pastDate ?? "дата не может быть в прошлом"}
                                        </span>
                                    )}
                                </div>

                                <div className="mt-2 flex justify-between gap-2">
                                    <button
                                        type="button"
                                        onClick={handleClear}
                                        className="flex-1 rounded-xl border-2 style-btn border-neutral-300 px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-50 hover:text-black"
                                    >
                                        {t.clear}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleApply}
                                        disabled={!isValid}
                                        className="flex-1 rounded-xl border-2 style-btn border-neutral-300 px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-50 hover:text-black"
                                    >
                                        {t.save}
                                    </button>
                                </div>
                            </div>
                        )}

                        {isSet && (
                            <span className="absolute top-11 text-md text-neutral-500">
                                {formatDeadline(input.value)}
                            </span>
                        )}
                    </div>
                );
            }}
        </Field>
    );
}
