export function formatDate(obj: Date|null) {
    if (!obj) {
        return null;
    }
    return obj.toLocaleString();
};