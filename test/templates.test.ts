import { Server } from "@hapi/hapi";
import { describe, it, beforeEach, afterEach } from "mocha";
import { expect } from "chai";
import { parse } from "node-html-parser";

import { init } from "../src/server";

const personData = { name: "Sherlock Holmes", age: 32 }

describe.only("server handles people", async () => {
	let server: Server;

	beforeEach((done) => {
		init().then(s => { server = s; done(); });
	})
	afterEach((done) => {
		server.stop().then(() => done());
	});

	it("can see existing people", async () => {
		const res = await server.inject({
			method: "get",
			url: "/people"
		});
		expect(res.statusCode).to.equal(200);
		expect(res.payload).to.not.be.null;
		const html = parse(res.payload);
		const people = html.querySelectorAll("li.person-entry");
		expect(people.length).to.equal(2);
	});

	it("can show 'add person' page", async () => {
		const res = await server.inject({
			method: "get",
			url: "/people/add"
		});
		expect(res.statusCode).to.equal(200);
	});

	it("can add a person and they show in the list", async () => {
		let res = await server.inject({
			method: "post",
			url: "/people/add",
			payload: personData
		});
		expect(res.statusCode).to.equal(302);
		expect(res.headers.location).to.equal("/people");

		res = await server.inject({
			method: "get",
			url: "/people"
		});
		expect(res.statusCode).to.equal(200);
		expect(res.payload).to.not.be.null;
		const html = parse(res.payload);
		const people = html.querySelectorAll("li.person-entry");
		expect(people.length).to.equal(3);
	});
})