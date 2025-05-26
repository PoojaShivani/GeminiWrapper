document.addEventListener('DOMContentLoaded', () => {
    const messagesContainer = document.getElementById('messages-container');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    async function sendMessage() { // Make it async to use await for fetch
        const messageText = userInput.value.trim();

        if (messageText === '') {
            return;
        }

        // Display user message
        const userMessageDiv = document.createElement('div');
        userMessageDiv.classList.add('message', 'user-message');
        userMessageDiv.textContent = messageText;
        messagesContainer.appendChild(userMessageDiv);
        userInput.value = ''; // Clear input after getting text
        scrollToBottom();

        // Optional: Display a "Bot is thinking..." message
        const thinkingMessageDiv = document.createElement('div');
        thinkingMessageDiv.classList.add('message', 'bot-message', 'thinking'); // Add a 'thinking' class for potential specific styling
        thinkingMessageDiv.textContent = 'Gemini is thinking...';
        messagesContainer.appendChild(thinkingMessageDiv);
        scrollToBottom();

        try {
            const response = await fetch('http://localhost:5000/api/chat', { // Ensure this URL is correct
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: messageText }),
            });

            // Remove the "thinking" message
            if (messagesContainer.contains(thinkingMessageDiv)) {
                messagesContainer.removeChild(thinkingMessageDiv);
            }

            if (!response.ok) {
                // If response is not OK, try to parse error from backend or use statusText
                let errorData;
                try {
                    errorData = await response.json();
                } catch (e) {
                    // Not a JSON error response from backend
                }
                const errorMessageText = errorData && errorData.error ? errorData.error : `Error: ${response.status} ${response.statusText}`;
                throw new Error(errorMessageText);
            }

            const data = await response.json();
            const botReply = data.reply;

            // Display bot response
            const botMessageDiv = document.createElement('div');
            botMessageDiv.classList.add('message', 'bot-message');
            botMessageDiv.textContent = botReply;
            messagesContainer.appendChild(botMessageDiv);
            scrollToBottom();

        } catch (error) {
            console.error('Error sending message to bot:', error);
            
            // Ensure "thinking" message is removed even if an error occurred after it was added
            if (messagesContainer.contains(thinkingMessageDiv)) {
                 messagesContainer.removeChild(thinkingMessageDiv);
            }

            // Display error message in chat
            const errorMessageDiv = document.createElement('div');
            errorMessageDiv.classList.add('message', 'bot-message', 'error-message'); // Add an 'error-message' class for styling
            errorMessageDiv.textContent = `Sorry, something went wrong: ${error.message}`;
            messagesContainer.appendChild(errorMessageDiv);
            scrollToBottom();
        }
    }

    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
});
