const morgan = require("morgan");
const logger = require("./logger")
const {NODE_ENV} =   require("./constant")

morgan.token('message', (_req, res) => res.locals['errorMessage'] || '');

const getIPFormat = () => (NODE_ENV === 'production' ? ':remote-addr - ' : '');
const successResponseFormat = `${getIPFormat()}:method :url :status - :response-time ms`;
const errorResponseFormat = `${getIPFormat()}:method :url :status - :response-time ms - message: :message`;

const successHandler = morgan(successResponseFormat, {
    skip: (_req, res) => res.statusCode >= 400,
    stream: { write: (message) => logger.info(message.trim()) }
});

const failureHandler = morgan(errorResponseFormat, {
    skip: (_req, res) => res.statusCode < 400,
    stream: { write: (message) => logger.error(message.trim()) }
});

module.exports = {
    successHandler, 
    failureHandler 
};