document.addEventListener('DOMContentLoaded', function() {
  // Placeholder for future AJAX functionality and SPA behavior implementation

  const aiQuestionInput = document.getElementById('aiQuestion');
  const saveIndicator = document.createElement('div');
  saveIndicator.innerText = 'All changes are saved';
  saveIndicator.style.display = 'none';
  document.body.appendChild(saveIndicator);

  const bookProjectIdElement = document.getElementById('bookProjectId');
  const userIdElement = document.getElementById('userId');

  // Check if elements exist to prevent TypeError
  const bookProjectId = bookProjectIdElement ? bookProjectIdElement.value : null;
  const userId = userIdElement ? userIdElement.value : null;

  if (!bookProjectId || !userId) {
    console.error('Book project ID or User ID is missing.');
    return; // Exit the script if critical information is missing
  }

  // Auto-save functionality
  setInterval(() => {
    const aiQuestion = aiQuestionInput.value;
    fetch('/auto-save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ aiQuestion, bookProjectId }),
    })
    .then(response => response.json())
    .then(data => {
      console.log("Auto-save successful:", data.message);
      saveIndicator.style.display = 'block';
      setTimeout(() => saveIndicator.style.display = 'none', 2000);
    })
    .catch(error => {
      console.error('Error during auto-save:', error.message, error.stack);
      saveIndicator.innerText = 'Error during auto-save. Check console for details.';
      saveIndicator.style.display = 'block';
      setTimeout(() => saveIndicator.style.display = 'none', 2000);
    });
  }, 300000); // 5 minutes interval for auto-save

  // Manual save functionality
  document.getElementById('manualSave').addEventListener('click', function() {
    const aiQuestion = aiQuestionInput.value;
    fetch('/manual-save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ aiQuestion, bookProjectId }),
    })
    .then(response => response.json())
    .then(data => {
      console.log("Manual save successful:", data.message);
      saveIndicator.innerText = 'Manually saved';
      saveIndicator.style.display = 'block';
      setTimeout(() => saveIndicator.style.display = 'none', 2000);
    })
    .catch(error => {
      console.error('Error during manual save:', error.message, error.stack);
      saveIndicator.innerText = 'Error during manual save. Check console for details.';
      saveIndicator.style.display = 'block';
      setTimeout(() => saveIndicator.style.display = 'none', 2000);
    });
  });
});