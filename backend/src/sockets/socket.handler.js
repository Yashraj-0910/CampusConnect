const socketIO = require('socket.io');

let ioInstance;

const initSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket client connected: ${socket.id}`);

    // Join user-specific room for targeted notifications
    socket.on('join', (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their socket room`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket client disconnected: ${socket.id}`);
    });
  });

  ioInstance = io;
  return io;
};

const sendNotificationToUser = (userId, notification) => {
  if (ioInstance) {
    ioInstance.to(userId).emit('notification', notification);
  }
};

const broadcastNotification = (notification) => {
  if (ioInstance) {
    ioInstance.emit('notification', notification);
  }
};

module.exports = {
  initSocket,
  sendNotificationToUser,
  broadcastNotification
};
