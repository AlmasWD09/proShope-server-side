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
        ""
      ],
      credentials: true,
    })
  );
app.use(express.json())

// mongodb here.....


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1kmrgvs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
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
 
//all products get mongoDB
app.get('/all-products', async (req, res) => {
const page = parseInt(req.query.page) || 1;
const size = parseInt(req.query.size)-1 || 0;
  const result = await productsCollection.find().skip(page*size).limit(size).toArray()
  res.send(result)
})

app.get('/counts',async(req,res)=>{
  const count = await productsCollection.countDocuments()
  res.send({count})
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