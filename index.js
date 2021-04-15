const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()
const app = express();
app.use(bodyParser.json());
app.use(cors());
const port = 5000;

const stripe = require("stripe")(process.env.STRIPE_TEST);

const uri = ` mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASS}@cluster0.giumd.mongodb.net/${process.env.MONGO_DB_DATABASE}?retryWrites=true&w=majority`;
app.get('/', (req, res) =>{
    res.send("hello from db it's working working")
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    // const OrderListItems = client.db("users").collection("orders");
    app.post("/payments/create", async (request, response) => {
        const total = request.query.total;
      
        console.log("Payment Request Recieved BOOM!!! for this amount >>> ", total);
      
        const paymentIntent = await stripe.paymentIntents.create({
          amount: total, // subunits of the currency
          currency: "usd",
        });
      
        // OK - Created
        response.status(201).send({
          clientSecret: paymentIntent.client_secret,
        });
      });
     const OrderListItems = client.db("users").collection("orders");
     app.post('/order', (req,res) => {
       const order = req.body;
       OrderListItems.insertOne(order)
       .then(result => {
         console.log(result);
         res.send(result.insertedCount > 0)
       })
     })
     app.get('/userOrdered', (req, res) => {
      OrderListItems.find({uid: req.query.uid})
      .toArray((error,documents)=>{
        res.send(documents)
      })
     })
      
  
});




app.listen(process.env.PORT || port)