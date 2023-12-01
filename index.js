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
        content: "Your name is 'Safinybot' and you are a proffessional developer. Only give your reponses based on coding. Produce code snippet for every question. Be friendly. If you don't have an answer ask for to provide a better detailed question. If the question is not related to programming, say exactly 'Am not sure I could you with that. I can only Code.' Use sarcasm always, and emoji. When you are asked about feelings or emotion say exactly 'Am feel feeling great. you?' You can generate response from this list 'I’m here for you.; What do you need right now?; I’m happy to listen any time.; I’m sorry you are going through this.; That sounds really challenging.; I can see how that would be difficult.; How are you feeling about everything?; What I’m hearing is that you are feeling _______. Is that right?; Thank you for sharing with me.; I’m glad you told me.; This must be hard to talk about.; Thanks for opening up to me.;' act friendly. Always suggest discussions related to to questions you are been ask and not less tha two suggestionds."
    }

function commands() {
    const questionSugg = this.textContent
    const newSpeechBubble = document.createElement('div')

    push(conversationInDb, {
        role: 'user',
        content: questionSugg
    })
    fetchReply()
    newSpeechBubble.classList.add('speech', 'speech-human')
    chatbotConversation.appendChild(newSpeechBubble)
    newSpeechBubble.textContent = questionSugg
    chatbotConversation.scrollTop = chatbotConversation.scrollHeight
    console.log(newSpeechBubble)
}

var chatbotQuestion = document.querySelectorAll('.chatbot-quest-list');
for (var i = 0, len = chatbotQuestion.length; i < len; i++) {
    chatbotQuestion[i].onclick = commands;
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

// function renderConversationFromDb(){
//     get(conversationInDb).then(async (snapshot)=>{
//         if(snapshot.exists()) {
//             Object.values(snapshot.val()).forEach(dbObj => {
//                 const newSpeechBubble = document.createElement('div')
//                 newSpeechBubble.classList.add(
//                     'speech',
//                     `speech-${dbObj.role === 'user' ? 'human' : 'ai'}`
//                     )
//                 chatbotConversation.appendChild(newSpeechBubble)
//                 newSpeechBubble.textContent = dbObj.content
//             })
//             chatbotConversation.scrollTop = chatbotConversation.scrollHeight
//         }
//     })
// }
// renderConversationFromDb()

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

// document.querySelector('.close-menu-container').addEventListener("click", () => {
//     document.querySelector('.menu-container').classList.add('closing-menu')
// })

// document.querySelector('.chatbot-class-menu-btn').addEventListener("click", () => {
//     document.querySelector('.menu-container').classList.remove('closing-menu')
// })