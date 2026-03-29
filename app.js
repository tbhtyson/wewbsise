const fs = require('fs');
const COUNTER_FILE = './count.json';

function getViews() {
  try { return JSON.parse(fs.readFileSync(COUNTER_FILE)).views; }
  catch { return 0; }
}
function incrementViews() {
  const views = getViews() + 1;
  fs.writeFileSync(COUNTER_FILE, JSON.stringify({ views }));
  return views;
}

let pageViews = getViews();

const express = require('express');

const app = express();
const PORT = 3000;

app.use((req, res, next) => {
  if (req.method === 'GET' && req.path === '/') {
  incrementViews();
  pageViews = getViews();
  }
  next();
});

app.get('/api/views', (req, res) => {
  res.json({ views: pageViews });
});

app.use(express.static('public'));


app.listen(PORT, (error) =>{
	if(!error)
    console.log("Server is Successfully Running and App is listening on port "+ PORT);
	else 
    console.log("Error occurred, server can't start", error);
});


