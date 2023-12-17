const http = require('http');
const express = require('express'); 
const mongoose = require('mongoose');
const helmet = require('helmet');
const passport = require("passport")
const cors = require('cors');
const { PORT, MONGODB_URI, NODE_ENV } = require("./config/constant");
const HttpException = require('./middlewares/http-exception');
const httpStatus = require('http-status');
const { errorConverter, errorHandler } = require('./config/error-handler');
const { successHandler, failureHandler } = require('./config/morgan');
const logger = require('./config/logger');
const sockerServer = require("./socket-server")
const authRoutes = require("./routes/auth.route");
const userRoutes = require("./routes/user.route");
const postRoutes = require("./routes/post.route");
const categoryRoutes = require("./routes/category.route");
const initialize = require("./middlewares/passport")


const app = express();

//log the respoonse of the http request
if(NODE_ENV !== 'test') {
    app.use(successHandler);
    app.use(failureHandler);
}

app.use(helmet());
app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

//passport
initialize(passport)

//routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/categories", categoryRoutes);

//listen for a 404 error
app.use((_req, _res, next) => {
    next(new HttpException(httpStatus.NOT_FOUND, "Not Found")); 
});
app.use(errorConverter)
app.use(errorHandler)

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
        sockerServer(server)
        logger.info('Connected to socket server successfully')

    })
    .then(() => {
        logger.info('Connected to database successfully');
        server.listen(port);
    })
    .catch((error) => {
        logger.error('Error connecting to database:', error);
    });