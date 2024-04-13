const socketIo = require('socket.io');

function initSocketServer(server) {
  const io = socketIo(server);
  io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('joinRoom', ({ bookProjectId, userId }) => {
      socket.join(bookProjectId);
      console.log(`User ${userId} joined room ${bookProjectId}`);
    });

    socket.on('editContent', ({ bookProjectId, content, userId }) => {
      socket.to(bookProjectId).emit('contentChanged', { content, userId });
      console.log(`Content edited in project ${bookProjectId} by user ${userId}`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
}

module.exports = initSocketServer;