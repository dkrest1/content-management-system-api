const http = require('http');
const express = require('express'); 
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const { PORT, MONGODB_URI } = require("./config/constant.config");

const app = express();

//port
const port = PORT || 3000;
const server = http.createServer(app);

app.use(helmet());
app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }));


function onListening() {
    console.log(`server live and active on port ${port}`);
}

function onError(error) {
    if (error.syscall !== 'listen') throw error;
    const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

    switch (error.code) {
        case 'EACCES':
            console.log(bind + ' requires elevated privileges');
            process.exit(1);
        case 'EADDRINUSE':
            console.log(bind + ' is already in use');
            process.exit(1);
        default: throw error;
    }
}

server.on('error', onError);
server.on('listening', onListening);

// listen for a 404 error
app.use((_req, _res, next) => {
    next('Not found'); 
});

// connect to MongoDB and listen for server connection
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Connected to database successfully');
        server.listen(port);
    })
    .catch((error) => {
        console.error('Error connecting to database:', error);
    });