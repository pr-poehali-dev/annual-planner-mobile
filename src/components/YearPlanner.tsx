import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

const MONTHS = [
  "Январь", "Февраль", "Март", "Апрель",
  "Май", "Июнь", "Июль", "Август",
  "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

type PlannerData = Record<string, Record<string, string[]>>;

const load = (): PlannerData => {
  try {
    return JSON.parse(localStorage.getItem("planner") || "{}");
  } catch {
    return {};
  }
};

const YearPlanner = () => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [events, setEvents] = useState<PlannerData>(load);
  const [editing, setEditing] = useState<number | null>(null);
  const [value, setValue] = useState("");
  const [confirm, setConfirm] = useState<{ month: number; idx: number; text: string } | null>(null);

  const touch = useRef({ x: 0, y: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const didMount = useRef(false);

  useEffect(() => {
    localStorage.setItem("planner", JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    if (editing !== null) inputRef.current?.focus();
  }, [editing]);

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      setTimeout(() => {
        document.getElementById(`m-${now.getMonth()}`)?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    }
  }, []);

  const changeYear = (dir: number) => {
    setEditing(null);
    setValue("");
    setYear((y) => y + dir);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touch.current.x;
    const dy = Math.abs(e.changedTouches[0].clientY - touch.current.y);
    if (Math.abs(dx) > 90 && dy < 50) {
      changeYear(dx < 0 ? 1 : -1);
    }
  };

  const addEvent = (month: number) => {
    if (!value.trim()) return;
    const k = String(year);
    const m = String(month);
    setEvents((prev) => ({
      ...prev,
      [k]: { ...prev[k], [m]: [...(prev[k]?.[m] || []), value.trim()] },
    }));
    setValue("");
    setEditing(null);
  };

  const removeEvent = (month: number, idx: number) => {
    const k = String(year);
    const m = String(month);
    setEvents((prev) => {
      const list = [...(prev[k]?.[m] || [])];
      list.splice(idx, 1);
      return { ...prev, [k]: { ...prev[k], [m]: list } };
    });
  };

  const get = (m: number) => events[String(year)]?.[String(m)] || [];
  const isCurrent = (m: number) => m === now.getMonth() && year === now.getFullYear();

  return (
    <div className="planner-root">
      <div className="planner-header">
        <button onClick={() => changeYear(-1)} className="planner-arrow">
          <Icon name="ChevronLeft" size={20} />
        </button>
        <span key={year} className="planner-year">{year}</span>
        <button onClick={() => changeYear(1)} className="planner-arrow">
          <Icon name="ChevronRight" size={20} />
        </button>
      </div>

      <div
        className="planner-scroll"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div key={year} className="planner-content">
          {MONTHS.map((name, i) => {
            const items = get(i);
            const current = isCurrent(i);

            return (
              <div
                key={i}
                id={`m-${i}`}
                className={`planner-card ${current ? "planner-card--current" : ""}`}
              >
                <div className="planner-card-header">
                  <span className={`planner-month ${current ? "planner-month--current" : ""}`}>
                    {name}
                  </span>
                  {items.length > 0 && (
                    <span className="planner-count">{items.length}</span>
                  )}
                </div>

                <div className="planner-events">
                  {items.map((text, ei) => (
                    <div key={ei} className={`planner-event ${current ? "planner-event--current" : ""}`}>
                      <span className="planner-event-text">{text}</span>
                      <button
                        onClick={() => setConfirm({ month: i, idx: ei, text })}
                        className="planner-event-delete"
                      >
                        <Icon name="X" size={14} />
                      </button>
                    </div>
                  ))}

                  {editing === i ? (
                    <input
                      ref={inputRef}
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addEvent(i);
                        if (e.key === "Escape") {
                          setEditing(null);
                          setValue("");
                        }
                      }}
                      onBlur={() => {
                        if (value.trim()) addEvent(i);
                        else {
                          setEditing(null);
                          setValue("");
                        }
                      }}
                      placeholder="Событие..."
                      className="planner-input"
                    />
                  ) : (
                    <button
                      onClick={() => {
                        setEditing(i);
                        setValue("");
                      }}
                      className="planner-add"
                    >
                      <Icon name="Plus" size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {confirm && (
        <div className="planner-overlay" onClick={() => setConfirm(null)}>
          <div className="planner-dialog" onClick={(e) => e.stopPropagation()}>
            <p className="planner-dialog-text">
              Удалить «{confirm.text}»?
            </p>
            <div className="planner-dialog-actions">
              <button
                className="planner-dialog-btn planner-dialog-btn--cancel"
                onClick={() => setConfirm(null)}
              >
                Отмена
              </button>
              <button
                className="planner-dialog-btn planner-dialog-btn--delete"
                onClick={() => {
                  removeEvent(confirm.month, confirm.idx);
                  setConfirm(null);
                }}
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default YearPlanner;