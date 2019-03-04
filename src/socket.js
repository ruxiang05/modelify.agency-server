/* eslint-disable no-param-reassign */

const chatController = require('./controllers/chat');

module.exports = (socket, io, onlineUsers) => {
  socket.on('online', async (userId) => {
    socket.user = userId;
    onlineUsers[userId] = socket.id;
    const chats = await chatController.getChatsForId(userId);
    socket.join(chats);
  });
  socket.on('send_message', (data) => {
    io.in(data.room).emit('receive_message', data);
    chatController.addMessage(data);
  });

  socket.on('disconnect', () => {
    if (!socket.user) return;
    socket.adapter.rooms = {};
    delete onlineUsers[socket.user];
  });
};
