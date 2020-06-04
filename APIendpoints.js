const express = require('express');			//npm install express

const app = express();
const root = 'D:/dev';

app.get('/api', (req, res) =>{
    res.json({
        message: 'Welcome to the api'
    });
});

app.post('/api/posts', (req, res) => {
    res.json({
        message: 'Post created...'
    });
});

/*app.get('/sftsfa', (req, res) => {
   res.sendFile('./sftsfa/sftsfa.github.io/index.html', {root}); 
});*/ // local test only

app.listen(5180, () => console.log('node testing server instance started on port 5180'));