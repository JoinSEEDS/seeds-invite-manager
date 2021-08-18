import Handlebars from 'handlebars';

export function passedStatusColor(obj: any) {
    switch(obj){
        case "Passed":
            return "success";
        default:
            return "secondary";
    }
};