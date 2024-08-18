const express = require('express')
const app = express()
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const cors = require('cors')

const port = process.env.PORT || 5000



// middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://scic-task-ten.web.app"
    ],
    credentials: true,
  })
);
app.use(express.json())

// mongodb here.....

// llll
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1kmrgvs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


// Create a MongoClient with a MongoClientOption object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    //  all collection here......
    const productsCollection = client.db('proShopDB').collection('products')
    const usersCollection = client.db('proShopDB').collection('users')

    // user api

    app.put('/user/api/create', async (req, res) => {
      try {
        const user = req.body
        const query = { email: user?.email }
        const isExist = await usersCollection.findOne(query)
        if (isExist) {
          return res.json({
            message: "user alredy exist"
          })
        } else {
          const options = { upsert: true }
          const updateDoc = {
            $set: {
              ...user,
              timestamp: Date.now(),
            },
          }
          const result = await usersCollection.updateOne(query, updateDoc, options)
          res.send(result)
        }
      }
      catch (error) {
        return res.json({
          message: "user alredy exist.."
        })
      }
    })




    //all products get mongoDB
    app.get('/all-products', async (req, res) => {
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);
      const sort = req.query.sort;
      const search = req.query.search || '';
      const categoryData = req.query.category;
      const band = req.query.band;
      const rangData = parseInt(req.query.range);



      let sortCriteria = {};
      if (sort === 'asc') {
        sortCriteria.price = 1
      }
      else if (sort === 'dsc') {
        sortCriteria.price = -1;
      }
      else if (sort === 'date-added') {
        sortCriteria.creationDate = -1;
      }

      // Create a search filter if a search query is provided
      let searchFilter = {};
      if (search) {
        searchFilter = {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { bandName: { $regex: search, $options: 'i' } },
            { category: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
          ]
        };
      }


      // create a filter by catery name
      if (categoryData) {
        searchFilter.category = { $regex: categoryData, $options: 'i' }
      }

      //  Creat a filter by bandName
      if (band) {
        searchFilter.bandName = { $regex: band, $options: 'i' };
      }

      // Creat a rang by number
      if (rangData) {
        searchFilter.price = { $lte: rangData };
      }

      const result = await productsCollection.find(searchFilter).sort(sortCriteria).skip((page - 1) * size).limit(size).toArray()
      res.send(result)

    })



    app.get('/counts', async (req, res) => {
      const search = req.query.search || '';
      const categoryData = req.query.category;
      const band = req.query.band;
      const rangData = parseInt(req.query.range);

      let searchFilter = {};
      // search
      if (search) {
        searchFilter = {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { bandName: { $regex: search, $options: 'i' } },
            { category: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
          ]
        };
      }

      //  category
      if (categoryData) {
        searchFilter.category = { $regex: categoryData, $options: 'i' }
      }

      // bandName
      if (band) {
        searchFilter.bandName = { $regex: band, $options: 'i' };
      }

      // rang number
      if (rangData) {
        searchFilter.price = { $lte: rangData };
      }

      const count = await productsCollection.countDocuments(searchFilter)
      res.send({ count })
    })

    await client.db("admin").command({ ping: 1 });
    console.log("successfully connected to MongoDB!");
  } finally {

  }
}
run().catch(console.dir);





app.get('/', (req, res) => {
  res.send('proShope server')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})