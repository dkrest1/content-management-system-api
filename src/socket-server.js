const { Server } = require('socket.io');
const { JWT_SECRET } = require('./config/constant');
const { validateToken } = require('./utils/helper.util');
const UserModel = require('./models/user.model');
const logger = require('./config/logger');

const sockerServer = async function (appServer) {
  const io = new Server(appServer, {
    cors: {
      origin: '*'
    }
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    try {

      const payload = await validateToken(token, JWT_SECRET);

      if (!payload) socket.disconnect(true);

      const { sub, role } = payload;
    
      if(role !== 'admin') {
        socket.emit('error', 'Unauthorized');
        socket.disconnect(true);
        next();
      }

      const user = await UserModel.findById(sub);

      if (!user) {
        socket.emit('error', 'User not found');
        socket.disconnect(true);
        next();

      };

      socket._id = sub;
      socket.username = user.username;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        // Handle JWT expired error here
        socket.emit('error', 'Token expired');
        socket.disconnect(true);
      } else {
        // Handle other errors
        logger.error(error);
        socket.disconnect(true);
      }
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

    socket.on('upgrade-user', async (email, cb) => {
      try {
        const user = await UserModel.findOne({ email });

        if(!user) {
          cb(new Error('user not found'));
        }

        user.userRole = 'admin';

        await user.save();

        cb(null, `User with ${email} upgraded to admin successfully`);
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
