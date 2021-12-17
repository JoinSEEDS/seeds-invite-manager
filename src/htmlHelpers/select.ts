export function select(selected: any, option: any) {
    if(!selected || !option){
        return null;
    }
    return (selected == option) ? 'selected="selected"' : '';
}