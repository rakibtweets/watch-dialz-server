const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ytnhs.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db('watch-Shop');
    const watchesCollection = database.collection('watches');
    const myBuyingWatchCollection = database.collection('myBuyingWatch');

    //GET API for all watch products
    app.get('/allWatches', async (req, res) => {
      const cursor = watchesCollection.find({});
      const watches = await cursor.toArray();
      res.json(watches);
    });

    //GET Watch details
    app.get('/watch/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await watchesCollection.findOne(query);
      res.json(result);
    });

    // POST api for add products

    app.post('/allWatches', async (req, res) => {
      const watches = req.body;
      const result = await watchesCollection.insertOne(watches);
      res.json(result);
    });

    //GET ai fot my order list
    app.get('/myBuyingList/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const cursor = myBuyingWatchCollection.find(query);
      const result = await cursor.toArray();
      res.json(result);
    });

    //POST api for my buying list
    app.post('/myBuyingList/:email', async (req, res) => {
      const email = req.params.email;
      const myBookingInfo = req.body;
      const result = await myBuyingWatchCollection.insertOne(myBookingInfo);
      res.json(result);
    });

    // DELETE MyBooking api
    app.delete('/deleteMyBooking/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await myBuyingWatchCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
    //   await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Watch shop server running');
});

app.listen(port, () => {
  console.log('Running server on port', port);
});