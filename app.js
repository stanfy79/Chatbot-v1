import axios from "axios";

const chatbotConversation = document.getElementById('chatbot-conversation');
const submitbtn = document.getElementById("submit-info");


submitbtn.addEventListener("click", () => {
    document.querySelector(".profile-info-container").style.display = "none";
});
    
    
    const userInputs = "How to learn solana";
    
    
const messages = [
    { role: "system", content: "You are a helpful teacher that generate contents like courses, leasons, and articles to help users learn. use the personal information the user provide to generate personalized contents" },
    { role: "user", content: userInputs }
];
try {
    // Sending a POST request to the backend using Axios
    const response = await axios.post('http://localhost:3000/api/chat', {
        messages: messages
    });
    
    const data = response.data;
    console.log(data);
    
} catch (error) {
    console.error('Error:', error);
}

const newSpeechBubble = document.createElement('div')
const newSpeechBubbleText = document.createElement('div')
newSpeechBubble.classList.add('leasons-ai-container')
newSpeechBubbleText.classList.add('leasons-ai-text')
chatbotConversation.appendChild(newSpeechBubble)
chatbotConversation.appendChild(newSpeechBubbleText)
newSpeechBubbleText.textContent = "MVP"

chatbotConversation.scrollTop = chatbotConversation.scrollHeight


// Function to render current time
function renderCurrentTime() {
    const renderTime = document.querySelector(".supportTime");
    setInterval(() => {
        const date = new Date();
        const hour = date.getHours().toString().padStart(2, '0');
        const minute = date.getMinutes().toString().padStart(2, '0');
        const second = date.getSeconds().toString().padStart(2, '0');
        renderTime.textContent = `${hour} : ${minute} : ${second}`;
    }, 1000); // Update every second
}
renderCurrentTime();