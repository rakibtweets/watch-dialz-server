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

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ytnhs.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ytnhs.mongodb.net/`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function run() {
  try {
    await client.connect();
    const database = client.db('watch-Shop');
    const watchesCollection = database.collection('watches');
    const myBuyingWatchCollection = database.collection('myBuyingWatch');
    const usersCollection = database.collection('users');
    const userReviewCollection = database.collection('reviews');

    // console.log('Database connected successfully');

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

    // DeleteProducts API
    app.delete('/deleteProduct/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await watchesCollection.deleteOne(query);
      res.send(result);
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
    app.delete('/deleteOrders/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await myBuyingWatchCollection.deleteOne(query);
      res.send(result);
    });

    //manage All Orders api
    app.get('/manageAllOrders', async (req, res) => {
      const cusor = myBuyingWatchCollection.find({});
      const result = await cusor.toArray();
      res.send(result);
    });

    // UPDATE mange Booking api
    app.put('/manageAllOrders/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const updatedOrder = req.body;
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: updatedOrder.status
        }
      };
      const result = await myBuyingWatchCollection.updateOne(
        query,
        updateDoc,
        options
      );
      res.send(result);
    });

    // post user
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });

    // update user to database

    app.put('/users', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    //get admin
    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === 'admin') {
        isAdmin = true;
      }
      res.send({ admin: isAdmin });
    });

    // make an user admin
    app.put('/users/admin', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: 'admin' } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    //get all users reviews
    app.get('/user/review', async (req, res) => {
      const cursor = userReviewCollection.find({});
      const result = await cursor.toArray();
      res.json(result);
    });

    // user review post
    app.post('/user/review', async (req, res) => {
      const review = req.body;
      const result = await userReviewCollection.insertOne(review);
      res.json(result);
    });
  } finally {
    //   await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Watch Dialz server running');
});

app.listen(port, () => {
  console.log('Running server on port', port);
});
