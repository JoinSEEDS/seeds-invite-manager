import { Request, ResponseToolkit, ResponseObject, ServerRoute } from "@hapi/hapi";
import Handlebars from "handlebars";

import Joi from "joi";
const ValidationError = Joi.ValidationError;

const schema = Joi.object({
    name: Joi.string().required(),
    age: Joi.number().required()
});

type Person = {
    name: string;
    age: number;
}

const people: Person[] = [
    { name: "Sophie", age: 37 },
    { name: "Dan", age: 42 }
];

async function showPeople(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
    return h.view("people.hbs", { people: people });
}

async function addPersonGet(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
    let data = ({} as Person);
    return h.view("addPerson", { person: data });
}

async function addPersonPost(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
    let data = ({} as Person);
    console.log(request.payload);
    data = (request.payload as Person);
    console.log(data);
    const o = schema.validate(data, { stripUnknown: true });
    if (o.error) {
        console.error(o.error);
        const errors: { [key: string]: string } = {};
        if (o.error instanceof ValidationError && o.error.isJoi) {
            for (const detail of o.error.details) {
                errors[detail.context!.key!] = detail.message;
            }
        } else {
            console.error("error", o.error, "adding person");
        }
        console.log("returning a view");
        return h.view("addPerson", { person: data, errorsA: errors, errorsJSON: JSON.stringify(errors) })
    }
    try {        
        data = (o.value as Person);
        people.push(data);
        return h.redirect("/people");
    } 
    catch (err) {
        console.error(err);
        throw err;
    }
}

async function removePersonGet(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
    people.splice(request.params.id, 1);

    return h.redirect("/people");
}

export const peopleRoutes: ServerRoute[] = [
  { method: "GET", path: "/people", handler: showPeople },
  { method: "GET", path: "/people/add", handler: addPersonGet },
  { method: "POST", path: "/people/add", handler: addPersonPost },
  { method: "GET", path: "/people/remove/{id}", handler: removePersonGet }
];