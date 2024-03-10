//var
const nameInput = document.getElementById('nameInput');
const hobbyInput = document.getElementById('hobbyInput');
const submitButton = document.getElementById('submitButton');
const loadingSpinner = document.getElementById('loadingSpinner');
const responseHider = document.getElementById('responseHider');
const responseContainer = document.getElementById('responseContainer'); // Zorg ervoor dat je responseContainer definieert

// Array to store messageHistory
const messageHistory = [];



async function sendChatMessage(name, hobby, conversationHistory) {
    try {
        const response = await fetch('http://localhost:8000/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: `Schrijf een Sinterklaas gedicht voor ${name} die van ${hobby} houdt.`,
                conversationHistory,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const responseData = await response.json();
        return responseData.response;
    } catch (error) {
        throw new Error(`Error sending chat message: ${error.message}`);
    }
}

async function retrieveMessage() {
    submitButton.disabled = true;
    loadingSpinner.style.display = 'block';
    submitButton.style.display = 'none';

    const name = nameInput.value;
    const hobby = hobbyInput.value;

    try {
        const response = await sendChatMessage(name, hobby, messageHistory);
        console.log('Received response from server:', response);

        if (response && response.kwargs && response.kwargs.content) { // Update hier
            responseHider.style.display = 'block';

            // Create container for new input and response
            const container = document.createElement('div');
            container.classList.add('mt-4');

            // Create input textbox with role
            const userInputBox = document.createElement('textarea');
            userInputBox.classList.add('p-4', 'border', 'rounded-md', 'w-full', 'mt-4');
            userInputBox.style.width = '100%';
            userInputBox.value = `User: ${name}, ${hobby}`; // User role
            userInputBox.readOnly = true;
            userInputBox.rows = userInputBox.value.split('\n').length;

            // Create response textbox with role
            const responseBox = document.createElement('textarea');
            responseBox.classList.add('p-4', 'border', 'rounded-md', 'w-full', 'mt-4');
            responseBox.style.width = '100%';
            responseBox.value = `AI Response: ${response.kwargs.content}`; // AI Response role
            responseBox.readOnly = true;
            responseBox.rows = responseBox.value.split('\n').length;

            // Create textbox for user response
            const userResponseInput = document.createElement('textarea');
            userResponseInput.classList.add('p-4', 'border', 'rounded-md', 'w-full', 'mt-4');
            userResponseInput.style.width = '100%';
            userResponseInput.placeholder = 'Type your response here...';

            // Create new submitbutton
            const submitResponseButton = document.createElement('button');
            submitResponseButton.classList.add('h-10', 'mt-4', 'px-6', 'py-2', 'text-white', 'rounded-md', 'bg-green-500');
            submitResponseButton.innerText = 'Submit Response';
            submitResponseButton.onclick = async () => {
                await submitUserResponse(name, hobby, userResponseInput.value, responseBox, userResponseInput);
            };

            // Appendings
            container.appendChild(userInputBox);
            container.appendChild(responseBox);
            container.appendChild(userResponseInput);
            container.appendChild(submitResponseButton);
            responseContainer.appendChild(container);

        } else {
            // Error message for response box
            const errorMessage = document.createElement('textarea');
            errorMessage.classList.add('p-4', 'border', 'rounded-md', 'w-full', 'mt-4');
            errorMessage.style.width = '100%';
            errorMessage.value = 'No valid response content found.';
            responseContainer.appendChild(errorMessage);
        }
    } catch (error) {
        console.error('Error sending chat message:', error);
        alert(`Error sending message: ${error.message}`);
    } finally {
        submitButton.disabled = false;
        submitButton.style.display = 'inline-block';
        loadingSpinner.style.display = 'none';
        nameInput.value = '';
        hobbyInput.value = '';
    }
}
function generateUniqueId() {
    return Math.random().toString(36).substr(2, 9); // Generate random token
}

async function submitUserResponse(name, hobby, userResponse, responseBox, userResponseInput) {
    try {
        // Combine conversation history with the new user response
        const conversationHistory = [...messageHistory, { user: userResponse }];


        // Sending new question to server


        const questionId = generateUniqueId(); // generate ID
        // send question to server with new ID
        const requestData = {
            name,
            hobby,
            userResponse,
            conversationHistory,
            questionId
        };
        const response = await fetch('http://localhost:8000/submit-response', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
            query: `Je bent een behulpzame robot die vragen kan beantwoorden`,
            conversationHistory,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Handle server response
        const responseData = await response.json();
        console.log('Received response from server:', responseData);

        // Update the response box
        if (responseData.message) {
            responseBox.value = `Server Response: ${responseData.message}`;
        } else {
            responseBox.value = 'No valid response content found.';
        }

        // Clearuser response input
        userResponseInput.value = '';

        // Add new question and response to the message history
        messageHistory.push({ user: `User: ${name}, ${hobby}` });
        messageHistory.push({ bot: responseData });

    } catch (error) {
        console.error('Error submitting user response:', error);
        alert(`Error submitting response: ${error.message}`);
    }
}