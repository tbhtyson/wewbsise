// get and update views func
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const COUNTER_FILE = './count.json';
const GUESTS_FILE = './guest.json';
const bcrypt = require('bcrypt');
const HASHED_PASSWORD = '$2b$10$uVvt0wxUvf56LvAPgqjkD.ucYrpIXEw5qGjze.sDjQfOQ1aex2Lym'; // paste your hash here
app.use(cors({
  origin: 'https://username.neocities.org', // ← exact value from step 1
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));

// Explicitly handle preflight OPTIONS requests
app.options('*', cors());
// make file if nonexistent
if (!fs.existsSync(GUESTS_FILE)) {
  fs.writeFileSync(GUESTS_FILE, '[]');
}

function getViews() {
  try { return JSON.parse(fs.readFileSync(COUNTER_FILE)).views; }
  catch { return 0; }
}
function incrementViews() {
  const views = getViews() + 1;
  fs.writeFileSync(COUNTER_FILE, JSON.stringify({ views }));
  return views;
}

let pageViews = getViews(); // set the view count

// get reviews & such


// Read entries from file
function readEntries() {
  try {
    const content = fs.readFileSync(GUESTS_FILE, 'utf8').trim();
    if (!content) return []; // file is empty
    return JSON.parse(content);
  } catch {
    return [];
  }
}
// Write entries to file
function writeEntries(entries) {
  fs.writeFileSync(GUESTS_FILE, JSON.stringify(entries, null, 2));
}

// boilerplate for this

const express = require('express');

const app = express();
const PORT = 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// take in a get request to increase view counter

app.use((req, res, next) => {
  if (req.method === 'GET' && req.path === '/') {
  incrementViews();
  pageViews = getViews(); // so that no view count discrepancy
  }
  next();
});

app.get('/api/views', (req, res) => {
  res.json({ views: pageViews }); // mm, yes, an api JUST FOR SIMPLE ASS VIEWS
});

app.get('/api/entries', (req, res) => {
  const entries = readEntries();
  res.json([...entries].reverse()); // reverse ordered guestbook entries
});

// oh good god, please let this work

app.post('/api/entries', (req, res) => {
  const { name, message } = req.body;
  if (!name || !message) { 
    return res.status(400).json({ error: 'Name and message are required.' });
  }
  if (name.trim().length > 100) {
    return res.status(400).json({ error: "Name must be 100 characters or fewer." });
  }
  if (message.trim().length > 500) {
    return res.status(400).json({ error: "Message must be 500 characters or fewer." });
  }
  const entries = readEntries();
  const entry = {
    id: Date.now(), // use timestamp as ID so it's always unique
    name: name.trim(),
    message: message.trim(),
    date: new Date().toISOString(),
  };

  entries.push(entry);
  writeEntries(entries);
  res.status(201).json(entry);
});

//delete entries?

app.delete("/api/entries/:id", async (req, res) => {
  const { password } = req.body;

  const match = await bcrypt.compare(password, HASHED_PASSWORD);
  if (!match) {
    return res.status(401).json({ error: 'Incorrect password.' });
  }

  const id = parseInt(req.params.id, 10);
  let entries = readEntries();
  const index = entries.findIndex(e => e.id === id);

  if (index === -1) return res.status(404).json({ error: 'Entry not found.' });

  entries.splice(index, 1);
  writeEntries(entries);
  res.status(204).send();
});

app.use(express.static('public'));


app.listen(PORT, (error) =>{
	if(!error)
    console.log("Server is Successfully Running and App is listening on port "+ PORT);
	else 
    console.log("Error occurred, server can't start", error);
});


