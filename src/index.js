const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()

const server = http.createServer(app)

const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirPath = path.join(__dirname, '../public')

app.use(express.static(publicDirPath))

io.on("connection", (socket) => {
    console.log("New client!")

    socket.on("join", ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room }) 

        if (error) {
            return callback(error)
        }

        socket.join(room)
        socket.emit("message", `Welcome, ${username}!`)
        socket.broadcast.to(user.room).emit("message", `${username} has joined!`)
        io.to(user.room).emit("roomData", {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        
        console.log("color", user.color)
        if (user.color === "white") {
            console.log("t")
            socket.emit("chance", true)
        } else if (user.color === "black") {
            console.log("f")
            socket.emit("chance", false)
        }

        callback()
    })

    socket.on("disconnect", () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit("message", `${user.username} has left!`)
            io.to(user.room).emit("roomData", {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

    socket.on("placeMarble", (spaceID) => {
        const user = getUser(socket.id)
        io.to(user.room).emit("placingMarble", spaceID)
    })

    socket.on("rotate", (rotateArgs) => {
        const user = getUser(socket.id)
        io.to(user.room).emit("rotating", rotateArgs)

        socket.emit("chance", false)
        socket.broadcast.to(user.room).emit("chance", true)
    })
})

server.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})