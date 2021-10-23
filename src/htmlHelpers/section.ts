export function section(this: any, name:any, options: any) {
    if (!this._sections) {
        this._sections = {};
    }
    this._sections[name] = options.fn(this); 
    return null;
};