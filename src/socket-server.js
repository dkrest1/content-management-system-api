const { Server } = require('socket.io');
const { JWT_SECRET } = require('./config/constant');
const { validateToken } = require('./utils/helper.util');
const UserModel = require('./models/user.model');
const logger = require('./config/logger');

const sockerServer = async function (appServer) {
  const io = new Server(appServer);

  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    const payload = validateToken(token, JWT_SECRET);

    if (!payload) socket.disconnect(true);

    const id = payload._id;

    try {
      const user = await UserModel.findById(id);

      if (!user) socket.disconnect(true);

      socket._id = id;
      socket.fullname = user.name;
      next();
    } catch (error) {
      logger.error(error);
      return socket.disconnect(true);
    }
  });

  // get people online
  const onlineUsers = new Map();
  io.on('connection', async (socket) => {
    if (!socket._id) return socket.disconnect(true);

    // socket client join the online connection
    onlineUsers.set(socket._id, socket.id);

    const roomSockets = await io.in(socket._id).fetchSockets();
    const all = roomSockets.map((client) => client.id);

    if (!all.includes(socket._id)) {
      socket.join(socket._id);
    }

    socket.on('get-users', async (cb) => {
      try {
        const users = await UserModel.find();

        cb(null, users);
      } catch (error) {
        logger.error(error);
        cb(new Error('Internal server error'));
      }
    });

    socket.on('disconnect', async () => {
      onlineUsers.delete(socket._id);
    });
  });

  io.on('error', (error) => {
    throw new Error(error);
  });
};

module.exports = sockerServer;




// for the socket server
//  admin - get all users
// admin - upgrade a user to admin
// the payload has to contain the userRole
