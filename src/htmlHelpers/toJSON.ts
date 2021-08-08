import Handlebars from 'handlebars';

export function toJSON(obj: any) {
    return JSON.stringify(obj, null, 3);
};