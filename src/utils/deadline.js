export function toDateInputValue(d) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

export function isTaskFailed(task, now) {
    if (task.failed) return true;
    if (!task.deadline) return false;
    return task.deadline < toDateInputValue(now);
}

export function formatDeadline(dateStr) {
    const [yyyy, mm, dd] = dateStr.split("-");
    return `${dd}.${mm}.${yyyy}`;
}