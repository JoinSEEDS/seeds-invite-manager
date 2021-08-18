import Handlebars from 'handlebars';
import MarkdownIt from 'markdown-it';

export function compileMarkdown(obj: any) {
    return new MarkdownIt().render(obj);
};