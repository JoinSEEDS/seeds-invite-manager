import Handlebars from 'handlebars';
import MarkdownIt from 'markdown-it';

export function compileMarkdown(obj: any) {
    if(!obj){
        return "";
    }
    return new MarkdownIt().render(obj);
};