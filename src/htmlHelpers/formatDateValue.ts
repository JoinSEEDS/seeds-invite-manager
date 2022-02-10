export function formatDateValue(obj: Date|null) {
    if (!obj) {
        return null;
    }
    return obj.toISOString().slice(0,16);
};