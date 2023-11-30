import { initializeApp } from 'firebase/app'
import { getDatabase, ref, push, get, remove } from 'firebase/database'
import { Configuration, OpenAIApi } from 'openai'
import { process } from './env'

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)
const appSettings = { databaseURL: 'https://safiny-bot-default-rtdb.europe-west1.firebasedatabase.app/' }
const app = initializeApp(appSettings)
const database = getDatabase(app)
const conversationInDb = ref(database)
const chatbotConversation = document.getElementById('chatbot-conversation')

const instructionObj = 
/*Update the content property's value to change the chatbot's personality. */
    {
        role: 'system',
        content: 'the'
    }

function commands() {
    const the = this.getAttribute('data-command')
    console.log(the)
}

var chatbotTypes = document.querySelectorAll('.chatbot-type-list');
for (var i = 0, len = chatbotTypes.length; i < len; i++) {
    chatbotTypes[i].onclick = commands;
}
 
document.addEventListener('submit', (e) => {
    e.preventDefault()
    const userInput = document.getElementById('user-input')
    push(conversationInDb, {
        role: 'user',
        content: userInput.value
    })
    fetchReply()
    const newSpeechBubble = document.createElement('div')
    newSpeechBubble.classList.add('speech', 'speech-human')
    chatbotConversation.appendChild(newSpeechBubble)
    newSpeechBubble.textContent = userInput.value
    userInput.value = ''
    chatbotConversation.scrollTop = chatbotConversation.scrollHeight
})

async function fetchReply() {
    get(conversationInDb).then(async (snapshot) => {
        if (snapshot.exists()) {
            const conversationArr = Object.values(snapshot.val())
            conversationArr.unshift(instructionObj)
            const response = await openai.createChatCompletion({
                model: 'gpt-3.5-turbo',
                messages: conversationArr,
                presence_penalty: 1,
                frequency_penalty: 0.6
            })

             push(conversationInDb, (response.data.choices[0].message))
             renderTypewriterText(response.data.choices[0].message.content)
        }
        else {
            console.log('No data available')
        }

    })
}


function renderTypewriterText(text) {
    const newSpeechBubble = document.createElement('div')
    newSpeechBubble.classList.add('speech', 'speech-ai', 'blinking-cursor')
    chatbotConversation.appendChild(newSpeechBubble)
    let i = 0
    const interval = setInterval(() => {
        newSpeechBubble.textContent += text.slice(i-1, i)
        if (text.length === i) {
            clearInterval(interval)
            newSpeechBubble.classList.remove('blinking-cursor')
        }
        i++
        chatbotConversation.scrollTop = chatbotConversation.scrollHeight
    }, 10)
}

document.getElementById('clear-btn').addEventListener("click",() => {
    remove(conversationInDb)
    chatbotConversation.innerHTML = '<div class="speech speech-ai">How can I help you?</div>'
})

function renderConversationFromDb(){
    get(conversationInDb).then(async (snapshot)=>{
        if(snapshot.exists()) {
            Object.values(snapshot.val()).forEach(dbObj => {
                const newSpeechBubble = document.createElement('div')
                newSpeechBubble.classList.add(
                    'speech',
                    `speech-${dbObj.role === 'user' ? 'human' : 'ai'}`
                    )
                chatbotConversation.appendChild(newSpeechBubble)
                newSpeechBubble.textContent = dbObj.content
            })
            chatbotConversation.scrollTop = chatbotConversation.scrollHeight
        }
    })
}
renderConversationFromDb()

function renderCurrentTime() {
    const renderTime = document.querySelector(".supportTime");
    setInterval( () => {
        const date = new Date()
        const hour = date.getHours()
        const minute = date.getMinutes()
        const second = date.getSeconds()

        renderTime.textContent = hour + ' : ' + minute + ' : ' + second
    },100)
}
renderCurrentTime()

document.querySelector('.close-menu-container').addEventListener("click", () => {
    document.querySelector('.menu-container').classList.add('closing-menu')
})

document.querySelector('.chatbot-class-menu-btn').addEventListener("click", () => {
    document.querySelector('.menu-container').classList.remove('closing-menu')
})