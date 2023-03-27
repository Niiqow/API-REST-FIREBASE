const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');

const app = express();
const port = 3000;

const cors = require('cors');

// Add this line before your routes
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const serviceAccount = require('./firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://tasks-82b44-default-rtdb.firebaseio.com/'
});

const db = admin.firestore();

app.get('/api/tasks', async (req, res) => {
  try {
    const snapshot = await db.collection('tasks').get();
    const tasks = [];
    snapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() });
    });
    res.send(tasks);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const { nota } = req.body;
    const result = await db.collection('tasks').add({
      nota,
      estado: 0
    });
    res.send({ id: result.id });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});


app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nota, estado } = req.body;
    const taskRef = db.collection('tasks').doc(id);
    await taskRef.update({ nota, estado });
    res.send({ id });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('tasks').doc(id).delete();
    res.send({ id });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
});


app.listen(port, () => {
  console.log(`API listening at http://localhost:${port}`);
});
