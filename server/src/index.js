const http = require('http');
const mongoose = require('mongoose');
const app = require("./app")
const { PORT, MONGODB_URI} = require("./config/constant");
const logger = require('./config/logger');
const sockerServer = require("./socket-server")


//port
const port = PORT || 3000;
const server = http.createServer(app);

function onListening() {
    logger.info(`Server live and active on port ${port}`);
}

function onError(error) {
    if (error.syscall !== 'listen') throw error;
    const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

    switch (error.code) {
        case 'EACCES':
            logger.error(bind + ' requires elevated privileges');
            process.exit(1);
        case 'EADDRINUSE':
            logger.error(bind + ' is already in use');
            process.exit(1);
        default: throw error;
    }
}

server.on('error', onError);
server.on('listening', onListening);



// connect to MongoDB and listen for server connection
mongoose.connect(MONGODB_URI)
    .then(() => {
    sockerServer(server);
    logger.info('Connected to socket server successfully');
    })
    .then(() => {
    logger.info('Connected to database successfully');
    server.listen(port);
    })
    .catch((error) => {
    logger.error('Error connecting to database:', error);
    });

module.exports = server