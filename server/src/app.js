const express = require('express'); 
const helmet = require('helmet');
const passport = require("passport")
const cors = require('cors');
const { NODE_ENV } = require("./config/constant");
const HttpException = require('./middlewares/http-exception');
const httpStatus = require('http-status');
const { errorConverter, errorHandler } = require('./config/error-handler');
const { successHandler, failureHandler } = require('./config/morgan');
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

app.use((_req, res, next) => {
    res.header('Content-Type', 'application/json');
    next();
});

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


module.exports = app