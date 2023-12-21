const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

require("dotenv").config();

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URL;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const taskCollection = client.db("taskDB").collection("tasks");

    // Create a single new task
    app.post("/tasks", async (req, res) => {
      const task = req.body;
      const result = await taskCollection.insertOne(task);
      console.log(
        `${result.insertedCount} documents were inserted with the _id: ${result.insertedId}`
      );
      res.json(result);
    });

    // Read all tasks
    app.get("/tasks", async (req, res) => {
      const cursor = taskCollection.find({});
      const tasks = await cursor.toArray();
      res.send(tasks);
    });

    // Read a single task
    app.get("/task/:id", async (req, res) => {
      const id = req.params.id;
      const task = await taskCollection.findOne({ _id: ObjectId(id) });
      res.json(task);
    });

    // Update a single task
    app.patch("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      const updatedTask = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          name: updatedTask.name,
          description: updatedTask.description,
          status: updatedTask.status,
        },
      };
      const result = await taskCollection.updateOne(filter, updateDoc, options);
      console.log(
        `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`
      );
      res.json(result);
    });

    // Delete a single task
    app.delete("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await taskCollection.deleteOne(query);
      console.log(`${result.deletedCount} document(s) was/were deleted.`);
      res.json(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("productDB").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("api is running");
});

app.listen(port, () => {
  console.log(`App running on http://localhost:${port}`);
});
