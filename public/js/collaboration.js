document.addEventListener('DOMContentLoaded', function () {
  const socket = io(); // {Ensure the server URL is correctly configured if not connecting to the same domain}
  const bookProjectIdElement = document.getElementById('bookProjectId');
  const userIdElement = document.getElementById('userId');

  // Check if elements exist to prevent TypeError
  if (!bookProjectIdElement || !userIdElement) {
    console.error('Book project ID or User ID element is missing.');
    return; // Exit the script if critical information is missing
  }

  const bookProjectId = bookProjectIdElement.value;
  const userId = userIdElement.value;

  if (!bookProjectId || !userId) {
    console.error('Book project ID or User ID is missing.');
    return; // Exit the script if critical information is missing
  }

  socket.emit('joinRoom', { bookProjectId, userId });

  console.log(`User ${userId} attempting to join room for project ${bookProjectId}.`);

  const contentField = document.getElementById('contentField');

  if (!contentField) {
    console.error('Content field element is missing.');
    return; // Exit the script if critical information is missing
  }

  contentField.addEventListener('input', () => {
    const content = contentField.value;
    socket.emit('editContent', { bookProjectId, content, userId });
    console.log(`User ${userId} editing content of project ${bookProjectId}.`);
  });

  socket.on('contentChanged', (content) => {
    contentField.value = content;
    console.log(`Content updated for project ${bookProjectId} by another user.`);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket.IO connection error:', error.message, error.stack);
  });
});