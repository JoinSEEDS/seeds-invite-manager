import { prefix } from './../infrastructure/routeManager'
export function checkPrefix(obj: string) : string {
    return prefix(obj);
};