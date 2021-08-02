import { Request, ResponseToolkit, ResponseObject, ServerRoute } from "@hapi/hapi";

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
    try {
        data = (request.payload as Person);
        people.push(data);
        return h.redirect("/people");
    } catch (err) {
        console.error("Caught error", err);
        return h.view("addPerson", { person: data })
    }
}

export const peopleRoutes: ServerRoute[] = [
  { method: "GET", path: "/people", handler: showPeople },
  { method: "GET", path: "/people/add", handler: addPersonGet },
  { method: "POST", path: "/people/add", handler: addPersonPost }  
];