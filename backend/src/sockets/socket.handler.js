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

    // Join user-specific room for targeted notifications and direct messages
    socket.on('join', (userId) => {
      if (userId) {
        socket.join(userId);
        console.log(`User ${userId} joined their personal socket room`);
      }
    });

    // Join a specific Club Channel room
    socket.on('join_club_channel', (clubId) => {
      if (clubId) {
        const roomName = `club_${clubId}`;
        socket.join(roomName);
        console.log(`Socket ${socket.id} joined club channel room: ${roomName}`);
      }
    });

    // Leave a specific Club Channel room
    socket.on('leave_club_channel', (clubId) => {
      if (clubId) {
        const roomName = `club_${clubId}`;
        socket.leave(roomName);
        console.log(`Socket ${socket.id} left club channel room: ${roomName}`);
      }
    });

    // Live typing indicator
    socket.on('typing', ({ roomType, targetId, senderName, isTyping }) => {
      if (roomType === 'club') {
        socket.to(`club_${targetId}`).emit('user_typing', {
          senderName,
          isTyping,
          targetId
        });
      } else if (roomType === 'direct') {
        socket.to(targetId).emit('user_typing', {
          senderName,
          isTyping,
          senderId: socket.userId || null
        });
      }
    });

    // Send new message event
    socket.on('send_chat_message', (messageData) => {
      if (messageData.message_type === 'club_channel' && messageData.club_id) {
        // Broadcast to all users in the club channel room (including sender)
        io.to(`club_${messageData.club_id}`).emit('new_chat_message', messageData);
      } else if (messageData.message_type === 'direct' && messageData.receiver_id) {
        // Send to receiver room and sender room
        io.to(messageData.receiver_id).emit('new_chat_message', messageData);
        if (messageData.sender_id) {
          io.to(messageData.sender_id).emit('new_chat_message', messageData);
        }
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket client disconnected: ${socket.id}`);
    });
  });

  ioInstance = io;
  return io;
};

const sendNotificationToUser = (userId, notification) => {
  if (ioInstance && userId) {
    ioInstance.to(userId).emit('notification', notification);
  }
};

const broadcastNotification = (notification) => {
  if (ioInstance) {
    ioInstance.emit('notification', notification);
  }
};

const emitNewMessage = (message) => {
  if (!ioInstance) return;
  if (message.message_type === 'club_channel' && message.club_id) {
    ioInstance.to(`club_${message.club_id}`).emit('new_chat_message', message);
  } else if (message.message_type === 'direct' && message.receiver_id) {
    ioInstance.to(message.receiver_id).emit('new_chat_message', message);
    if (message.sender_id) {
      ioInstance.to(message.sender_id).emit('new_chat_message', message);
    }
  }
};

module.exports = {
  initSocket,
  sendNotificationToUser,
  broadcastNotification,
  emitNewMessage
};
