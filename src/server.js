import express from 'express';
const app = express();
const port = process.env.PORT || 5656;
// routes go here

app.get('/api/users', (req, res) => {
  res.json([
    {
      id: 1,
      name: "Ruxandra"
    },
    {
      id: 2,
      title: "Borja"
    }
  ])
})

app.listen(port, () => {
  console.log(`http://localhost:${port}`)
})