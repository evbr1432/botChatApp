//FIXME: Figure out what match, set, and getEnvironmentData do
const { match } = require('assert')
//need the express package
const express = require('express')
const app = express()
const http = require('http')
const { set } = require('express/lib/application')
const path = require ('path')
const { getEnvironmentData } = require('worker_threads')
//Server setup
//const server = require('http').Server(app)
const server = http.createServer(app)
const PORT = 5000
//Socket IO setup 
const io = require('socket.io')(server)
//Database init
const Datastore = require('nedb')
const adminUser = "Admin"
//+ forces unix timestamp
let unixTimeNow = +new Date();
//A set to track how many users are connected
let socketsConnected = new Set()

//Express options
app.use(express.json({ limit: '1mb'}))
app.use(express.static(path.join(__dirname, "public")))

//setup db and load
const database = new Datastore('database/database.db');
database.loadDatabase();

//Socket connection check
io.on('connect', onConnected)

//FIXME: Error checking? 
server.listen(PORT, () => console.log('Listening on port '+ PORT))
//API call to get chat history (needed to load old message when returning)
app.get('/api', (request, response) => {
    let period=request.query.period
    //console.log(period)
    const daysAgoMsecs = convertPeriod(period)
    //database.find({ dateTime: { $gt : fiveDaysago}},(err, dbOutput) => {
    //find data from less than $period days ago and sort it based on when it was sent
    database.find({"dateTime": { $gt: daysAgoMsecs }}).sort({ dateTime: 1 }).exec(function (err, output) {
    if (err) {
        console.log("Failed to get history from DB") + err
        response.end()
        return
    }
        response.json({Output: output})
    })
})

//Converts days to unix timestamp
function convertPeriod(period){
    let periodMsecs = period * 24 * 60 * 60 * 1000
    let DaysAgoMsecs = unixTimeNow - periodMsecs
    return DaysAgoMsecs
}

//Client connects (Most interactions happen here)
function onConnected(socket) {
    //log ID for accounting
    console.log(socket.id)
    //Add socket to "connected" set
    socketsConnected.add(socket.id)
    //first emit how many others are connected
    io.emit('bots-connected', socketsConnected.size)
    //if disconnected, remove from set and log
    socket.on('disconnect', function() {
        console.log('Socket Disconnected', socket.id)
        socketsConnected.delete(socket.id)
        //emit new size of set
        io.emit('bots-connected', socketsConnected.size)
    })

    //User has set their username, check if it's new
    socket.on('username', function(username) {
        //select all usernames from tables, store in array
        database.count({ name: username }, function (err, count) {
            if (err) {
                console.log("Could not check if user is new (DB Error):" + err)
                response.end();
                return;
            }
                // if username is new, send new user mesage (count is 0)
                if (!count) {
                    const newUserMessage = buildNewUserMessage(username)
                    //console.log(newUserMessage)
                    socket.emit('new-user-message', newUserMessage)
                }
            })
    })

    //new message recived from user
    socket.on('message', function(data) {
            //add to DB to keep history
            addToDb(data)
            //broadcast to everyone except the client that sent it
            socket.broadcast.emit('chat-message', data)
    })

    //One or more other users are clicking or typing. 
    socket.on('user-activity', function(data){
        //broadcast to everyone except the persn doing it
        socket.broadcast.emit('user-activity', data)
    })

}

//basic add line-item to DB (JSON)
function addToDb(data) {
    database.insert(data) 
}

//Generate a new user message
function buildNewUserMessage(username) {
    welcomeMessage = "Welcome to RoboChat," + username + ". Type \\help for commands."
    let nowTime = +new Date()
    const newUserMessage = {
        name: adminUser,
        message: welcomeMessage,
        dateTime: nowTime,
        pitch: 0.1,
        speed: 100
    }
    return newUserMessage
}
