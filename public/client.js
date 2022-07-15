//Socket init to socketIO
const socket = io()

const username = getUserName()
//number of bots connected
const botsConnected = document.getElementById('bots-connected')
//All sent messages fall here
const chatContainer = document.getElementById('chat-container')
//Message input and send container
const userInputContainer = document.getElementById('user-input-container')
//Message input form alone
const messageInput = document.getElementById('message-input')
//Get the name to display above chat window
let nameTitle = document.getElementById('name-input')
nameTitle.textContent = `${username}`
//Set who sends command and welcome messages
let adminUser = "Admin"

//Elements to play audio
//Upon send, play sound
const sentMessageTone = new Audio('/laser_sound.m4a')
//Audio to speak message
let audioElement = document.getElementById('audio')
//Init isPlaying to make sure we can check t/f later
let isPlaying = false

//Pitch and speed defs
let pitchSlider = document.getElementById('voice-pitch')
let speedSlider = document.getElementById('voice-speed')
//set the initial value to the default slider value
let pitch = pitchSlider.value
let speed = speedSlider.value
//Slider bars check changes on slider
pitchSlider.oninput = function () {
    pitch = pitchSlider.value
}
speedSlider.oninput = function () {
    speed = speedSlider.value
}

function getUserName() {
    let username = prompt("Please Enter a Username", "Your Name")
    if (username == null){
        username = prompt("Please Enter a Username", "Your Name")
    }
    //Server will check if this is a new user
    socket.emit('username', username)
    return username
}

//Insert the history of chats from a resonable time ago
chatLog()
function chatLog() {
    //5 days seems resonable
    const chatHistoryPeriod = 5
    getData(chatHistoryPeriod)

    //have to wait for response from async function
    .then(response => {
        //parse respone of JSON
        for (let value of Object.values(response)) {
            for (let entry of Object.values(value)) {
                //checking that messages go to the correct side
                if (entry.name === username){
                     addMessageToUI(true,entry)
                }
                else {
                     addMessageToUI(false,entry)
                }
            }
        }
     })
     .catch(error => {
        console.log("Error in getting Chat Log: " + error )
     })
 }

//API call to the server (returns DB data in JSON)
async function getData(period) {
    const response = await fetch(`/api?period=${period}`);
    const data = await response.json();
    //console.log(data)
    return data
}

//lets user hear what they've typed in the voice set by sliders
function testSpeak() {
    //Nothing typed, don't do anything
    if (messageInput.value === '') return
    //get pitch/speed from sliders. speak call requies these to be resobled. 
    let exec_pitch=Function("return " + pitch)()
    let exec_speed=Function("return " + speed)()
    //speak('hey', {speed: 5, pitch: 100} )
    //send message, speed, and pitch to speak method
    speak(messageInput.value, {speed: exec_speed, pitch: exec_pitch})
}

//Listen for submit button then send message
userInputContainer.addEventListener('submit', function(e){
    e.preventDefault()
    sendMessage()
})

function sendMessage() {
    if (messageInput.value === '') return 
    //play send message tone regardless of cmd or not
    sentMessageTone.play()
    //+ hear forces unix timestamp (easier to work with)
    nowTime = +new Date()
    
    //set data from user and package it in JSON
    const data = {
            name: username,
            message: messageInput.value,
            dateTime: nowTime,
            pitch: pitch,
            speed: speed
        }
    //Check if this is a command
    if (((data.message)[0]).match(/\\/) == null) {
        //This is not a command message, send it to the server
        //console.log(data)
        socket.emit('message', data)
    }
    else{
        //This is a command, don't send to others
        cmdData = commandHelper(data)
        //add command message to UI
        addMessageToUI(false, cmdData)
        //Download chat history
        if (cmdData.period > 0) {
            getData(cmdData.period)
            //Async function
            .then(response => {
                   const dbData = response
                   //console.log(dbData)
                   downloadObjectAsJson(dbData, "Download")
               })
               .catch(error => {
                  console.log("Error in getting downloadable file: " + error )
            })

        }
    }
    //FIXME: WHY CANT I MOVE THIS UP BEFORE THE CMD MESSAGE!?!?!
    //add your message to chat container 
    addMessageToUI(true, data)
    //reset input box to be empty
    messageInput.value = ''
}

function addMessageToUI(isOwnMessage, data) {
    //Message sent, other user is finished, clear the notifications
    clearActivityNotification()
    //only display local timestrings
    data.dateTime = new Date(data.dateTime).toLocaleString()
    //console.log(data.message)
    const element = 
        `
        <li class="${isOwnMessage ? "message-right" : "message-left"}">
            <p class="message">
                ${data.message}
                 <button type="button" class="mediaButton" onclick="playUIMessage('${data.message}','${data.pitch}','${data.speed}')">▶️</button>
                 <button type="button" class="mediaButton" onclick="stopAllMessages()">⏹</button>
                <span>
                 ${data.name}
                 <button type="button" class="bButton" onclick="bigB()">🅱️</button>
                 ${data.dateTime}
                </span>
            </p>
        </li>
        `
    chatContainer.innerHTML += element
    //Every time we add a message, scroll to botttom
    scrollToBottom()
}

//play the respective message using the play button
function playUIMessage(data, messagePitch, messageSpeed) {
      speak(data, {pitch: messagePitch, speed: messageSpeed})
}

//Long messages or annoying spam can be stoped with any stop button
function stopAllMessages() {
    //document.querySelectorAll('audio').pause()
    document.querySelectorAll('audio').forEach(el => el.pause());
}
//speak(data, {pitch: messagePitch, speed: messageSpeed})

 function bigB () {
    pitch = Math.floor(Math.random() * 200);
    speed = Math.floor(Math.random() * 100);
    //console.log(pitch, speed)
    speak('b', {pitch: Function("return " + pitch)()}, {speed: Function("return " + speed)()})
 }

//Scroll to bottom when you send a message so you don't get stuck at top
function scrollToBottom() {
    chatContainer.scrollTo(0, chatContainer.scrollHeight)
}

//Command message Functions

//FIXME: processing commands could be better. Maybe dynamically printed in help?
function commandHelper(orgMessageData) {
    let adminMessage = ''
    //Grab the cmd string to match on
    let cmd = orgMessageData.message
    //init the period as 0 (to change or error check later)
    let historyPeriod = 0

    switch((cmd))
    {
        case "\\help":
            adminMessage = `Help: <br> \\help <br> Download Your Chat History: <br> \\get10DayHistory <br> \\get&#60NUM&#62DayHistory`
            break
        case cmd.match(/\\get\d+DayHistory/)?.input:
            historyPeriod = cmd.match(/\d+/)[0]
            //Pull from DB
            adminMessage = "Getting " + historyPeriod + " days of history"
            break
        default:
            adminMessage = "BZZZTTT invalid command"
            break
    }

    const adminMessageData = {
        name: adminUser,
        message: adminMessage,
        dateTime: orgMessageData.dateTime,
        period: historyPeriod,
        pitch: 0.1,
        speed: 100
    }
    return adminMessageData
}

//FIXME: Learn how this works
function downloadObjectAsJson(exportObj, exportName){
    //console.log(exportObj)
    let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    let downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function clearActivityNotification() {
    document.querySelectorAll('li.user-feedback').forEach(element => {
        element.parentNode.removeChild(element)
    })
}

//Temporary other user notification event listeners

//When another user clicks on the message form
messageInput.addEventListener('focus', function(e){
    socket.emit('user-activity', {
        activity: `🦾 ${username} is preparing`
    })
})
//another user started typing
messageInput.addEventListener('keypress', function(e){
    socket.emit('user-activity', {
        activity: `🦾 ${username} is composing`
    })
})
//another user clicked off input window, cut the feedback
messageInput.addEventListener('blur', function(e){
    socket.emit('user-activity', {
        activity: ""
    })
})

//Socket Connections

//Someone elses message arrived at server, display
socket.on('chat-message', function(data){
    //play new message. (Could be spammy)
    speak(data.message, {pitch: data.pitch, speed: data.speed})
    //speak(data.message)
    addMessageToUI(false, data)
})
//Server sees a new ueser, add new user message
socket.on('new-user-message', function(data){
    addMessageToUI(false, data)
})
//display how many users are connected 
socket.on('bots-connected', (data) => {
    botsConnected.innerHTML = `Connected Bots: ${data}`
})

//when another user does something
socket.on('user-activity', function(data){
    //clear is there already
    clearActivityNotification()
    const element = 
    `
    <li class="user-feedback">
        <p class="user-activity" id="user-activity">
            ${data.activity}
        </p>
    </li>
    `
    chatContainer.innerHTML += element
})
