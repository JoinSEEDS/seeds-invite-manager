import Handlebars from 'handlebars';

export function passedStatusColor(obj: any) {
    switch(obj){
        case "Passed":
            return "success";
        case "Evaluate":
            return "info";
        default:
            return "secondary";
    }
};