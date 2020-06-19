const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const { addUser, removeUser, getUser, getUsersInRoom, getLocalPlayers } = require('./utils/users')

const app = express()

const server = http.createServer(app)

const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirPath = path.join(__dirname, '../public')

app.use(express.static(publicDirPath))

io.on("connection", (socket) => {
    socket.on("join", ({ isOnline, username, room }, callback) => {
        const { error, user, canBegin } = addUser({ id: socket.id, isOnline, username, room })
        
        if (error) {
            return callback(error)
        }
        
        if (user.isOnline) {
            socket.join(room)
            socket.emit("message", `Welcome, ${username}!`)
            socket.broadcast.to(user.room).emit("message", `${username} has joined!`)
            io.in(user.room).emit("roomData", {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
            
            if (canBegin) {
                socket.emit("chance", false)
                socket.broadcast.to(user.room).emit("chance", true)
            }

            callback()
        } else {
            socket.emit("message", "Welcome to Pentago!")
            socket.emit("roomData", {
                room: "local",
                users: user.localPlayers
            })
            socket.emit("chance", true)
        }
    })

    socket.on("disconnect", () => {
        const user = removeUser(socket.id)

        if (user) {
            if (user.isOnline) {
                io.to(user.room).emit("message", `${user.username} has left!`)
                io.in(user.room).emit("roomData", {
                    room: user.room,
                    users: getUsersInRoom(user.room)
                })
            }
        }
    })

    socket.on("placeMarble", (spaceID) => {
        const user = getUser(socket.id)
        
        if (user.isOnline) {
            io.to(user.room).emit("placingMarble", spaceID)
        } else {
            socket.emit("placingMarble", spaceID)
        }
    })

    socket.on("rotate", (rotateArgs) => {
        const user = getUser(socket.id)
        
        if (user.isOnline) {
            io.to(user.room).emit("rotating", rotateArgs)
            socket.emit("chance", false)
            socket.broadcast.to(user.room).emit("chance", true)
        } else {
            socket.emit("rotating", rotateArgs)
        }
    })

    socket.on("requestNewGame", () => {
        const user = getUser(socket.id)
        
        if (user.isOnline) {
            io.in(user.room).emit("setupNewGame")
        } else {
            socket.emit("setupNewGame")
        }
    })

    socket.on("newGame", (winningColor) => {
        const user = getUser(socket.id)

        if (user.isOnline) {
            user.wins = user.color === winningColor ? user.wins + 1 : user.wins
            
            user.color = user.color === "white" ? "black" : "white"
            
            if (user.color === "white") {
                socket.emit("chance", true)
            } else {
               socket.emit("chance", false)
            }

            setTimeout(() => {
                io.in(user.room).emit("roomData", {
                    room: user.room,
                    users: getUsersInRoom(user.room)
                })
            }, 1500)
        } else {
            if (user.localPlayers[0].color === winningColor) {
                user.localPlayers[0].wins = user.localPlayers[0].wins + 1
            } else {
                user.localPlayers[1].wins = user.localPlayers[1].wins + 1
            }

            if (user.localPlayers[0].color === "white") {
                user.localPlayers[0].color = "black"
                user.localPlayers[1].color = "white"
            } else {
                user.localPlayers[0].color = "white"
                user.localPlayers[1].color = "black"
            }
            
            socket.emit("roomData", {
                room: "local",
                users: user.localPlayers
            })
            socket.emit("chance", true)
        }
    })
})

server.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})