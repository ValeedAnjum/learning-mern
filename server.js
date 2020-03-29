const express = require('express');
const app = express();

app.get('/',(req,res) => res.send('Its Mean API is Running'));

const PORT = process.env.PORT || 5000;

app.listen(PORT,() => console.log(`Servser Started On Port ${PORT}`));