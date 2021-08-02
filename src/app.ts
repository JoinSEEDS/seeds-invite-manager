import express from 'express';

const app = express();
const port = 3000;

import { SimpleProduct } from "./models/SimpleProduct";

import {DocumentStore, IDocumentStore, IDocumentSession, IDocumentQuery, QueryOperator} from 'ravendb';
import DocumentConstructor from 'ravendb';

const store: IDocumentStore = new DocumentStore('http://localhost:8200', 'Seeds1');
store.conventions.registerEntityType(SimpleProduct);
let session: IDocumentSession;

store.initialize();


app.get('/', async (req, res) => {
    session = store.openSession();

    let product = new SimpleProduct(
        null, 'Random Act of Kindness'
      );
    
      await session.store<SimpleProduct>(product);
      await session.saveChanges();
      console.log(product instanceof SimpleProduct); // true
      //console.log(product!.id.includes('products/')); // true
    
      product = await session.load<SimpleProduct>('SimpleProducts/1-A');
      console.log(product instanceof SimpleProduct); // true
      console.log(product.id); // products/1-A

  res.send('Random act of kindness!');
});
app.listen(port,()=>{
    return console.log(`server is listening on ${port}`);
}).on("error",(err: any) => {
    if (err) {
      return console.error(err);
    }
});