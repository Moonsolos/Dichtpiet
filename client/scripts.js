const nameInput = document.getElementById('nameInput');
const hobbyInput = document.getElementById('hobbyInput');
const submitButton = document.getElementById('submitButton');
const loadingSpinner = document.getElementById('loadingSpinner');
const responseText = document.getElementById('responseText');
const responseHider = document.getElementById('responseHider');

async function sendChatMessage(name, hobby) {
    try {
        const response = await fetch('http://localhost:8000/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: `Schrijf een Sinterklaas gedicht voor ${name} die van ${hobby} houdt.` }),
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
        const response = await sendChatMessage(name, hobby);
        console.log('Received response from server:', response);

        if (response && response.kwargs.content) {
            responseHider.style.display = 'block';

            // Create a new container for the user input and response pair
            const container = document.createElement('div');
            container.classList.add('mt-4'); // Add margin at the top

            // Create new user input textbox with role
            const userInputBox = document.createElement('textarea');
            userInputBox.classList.add('p-4', 'border', 'rounded-md', 'w-full', 'mt-4');
            userInputBox.style.width = '100%'; // Set width to 100% of the parent container
            userInputBox.value = `User: ${name}, ${hobby}`; // Adding user role
            userInputBox.readOnly = true;
            userInputBox.rows = userInputBox.value.split('\n').length; // Set rows based on number of lines

            // Create new response textbox with role
            const responseBox = document.createElement('textarea');
            responseBox.classList.add('p-4', 'border', 'rounded-md', 'w-full', 'mt-4');
            responseBox.style.width = '100%'; // Set width to 100% of the parent container
            responseBox.value = `AI Response: ${response.kwargs.content}`; // Adding AI response role
            responseBox.readOnly = true;
            responseBox.rows = responseBox.value.split('\n').length; // Set rows based on number of lines

            // Append new textboxes to the response container
            container.appendChild(userInputBox);
            container.appendChild(responseBox);
            responseContainer.appendChild(container);

        } else {
            responseText.value = 'No valid response content found.';
        }

    } catch (error) {
        console.error('Error sending chat message:', error);
        alert(`Error sending message: ${error.message}`);
    } finally {
        submitButton.disabled = false;
        submitButton.style.backgroundColor = 'rgb(59 130 246)';
        loadingSpinner.style.display = 'none';
        submitButton.style.display = 'inline-block';
        nameInput.value = '';
        hobbyInput.value = '';
    }
}
