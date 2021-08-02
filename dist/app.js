"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SimpleProduct_1 = require("./models/SimpleProduct");
var ravendb_1 = require("ravendb");
var store = new ravendb_1.DocumentStore('http://localhost:8200', 'Seeds1');
store.conventions.registerEntityType(SimpleProduct_1.SimpleProduct);
var session;
store.initialize();
var server_1 = require("./server");
server_1.init().then(function () { return server_1.start(); });
// app.get('/', async (req, res) => {
//     session = store.openSession();
//     let product = new SimpleProduct(
//         null, 'Random Act of Kindness'
//       );
//       await session.store<SimpleProduct>(product);
//       await session.saveChanges();
//       console.log(product instanceof SimpleProduct); // true
//       //console.log(product!.id.includes('products/')); // true
//       product = await session.load<SimpleProduct>('SimpleProducts/1-A');
//       console.log(product instanceof SimpleProduct); // true
//       console.log(product.id); // products/1-A
//   res.send('Random act of kindness!');
// });
// app.listen(port,()=>{
//     return console.log(`server is listening on ${port}`);
// }).on("error",(err: any) => {
//     if (err) {
//       return console.error(err);
//     }
// });
