import Handlebars from 'handlebars';

Handlebars.registerHelper('toJSON', function(obj: any) {
    return JSON.stringify(obj, null, 3);
});