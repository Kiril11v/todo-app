import { Field } from "react-final-form";
import { useState, useRef, useEffect, useMemo } from "react";
import Calendar from "react-calendar";

import { translations, type Language } from "../../context/translations";
import { useLanguage } from "../../hooks/useLanguage";

import { formatDeadline, toDateInputValue } from "../../utils/deadline";

import IconClockActive from "../../icons/IconClockActive";
import IconClockInactive from "../../icons/IconClockInactive";

import "react-calendar/dist/Calendar.css";
import "./timerCreateTasks.css";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface TimerCreateTasksProps {
  name?: string;
}

interface TimerIconProps {
  isSet: boolean;
}

const localeMap: Record<Language, string> = {
  en: "en-US",
  pl: "pl-PL",
  ua: "uk-UA",
};

function TimerIcon({ isSet }: TimerIconProps) {
  return isSet ? <IconClockActive /> : <IconClockInactive />;
}

function dateStrToDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const [yyyy, mm, dd] = dateStr.split("-").map(Number);
  return new Date(yyyy, mm - 1, dd);
}

// name ISO-data or null
export default function TimerCreateTasks({
  name = "deadline",
}: TimerCreateTasksProps) {
  const [open, setOpen] = useState(false);
  const [dateStr, setDateStr] = useState("");
  const [now, setNow] = useState(() => new Date());
  const popupRef = useRef<HTMLDivElement>(null);

  // language
  const { language } = useLanguage();
  const t = translations[language];
  const calendarLocale = localeMap[language];

  // close on click outside the popup
  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const todayStr = useMemo(() => toDateInputValue(now), [now]);
  const todayDate = useMemo(
    () => dateStrToDate(todayStr) ?? undefined,
    [todayStr],
  );

  const isPast = dateStr ? dateStr < todayStr : false;
  const isValid = Boolean(dateStr) && !isPast;

  return (
    <Field<string | null> name={name}>
      {({ input }) => {
        const deadline = input.value || null;
        const isSet = deadline !== null;

        const openPopup = () => {
          setDateStr(deadline ?? toDateInputValue(new Date()));
          setNow(new Date());
          setOpen(true);
        };

        const handleCalendarChange = (value: Value) => {
          if (value instanceof Date) {
            setDateStr(toDateInputValue(value));
          }
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
                <p className="text-neutral-500 mb-1">{t.date_title}</p>

                <Calendar
                  onChange={handleCalendarChange}
                  value={dateStrToDate(dateStr)}
                  minDate={todayDate}
                  minDetail="month"
                  className="deadline-calendar"
                  locale={calendarLocale}
                  prev2Label={null}
                  next2Label={null}
                />

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

            {deadline && (
              <span className="absolute top-11 text-md text-neutral-500">
                {formatDeadline(deadline)}
              </span>
            )}
          </div>
        );
      }}
    </Field>
  );
}
