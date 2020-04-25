const users = []

const addUser = ({ id, username, room }) => {
    // clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // validate the data
    if (!username || !room){
        return {
            error: "Username and room are required"
        }
    }

    // get existing players of room
    const usersInRoom = getUsersInRoom(room)

    // check if room already has 2 players
    if (usersInRoom.length === 2) {
        return {
            error: "There are already 2 players in this room!"
        }
    }

    // check for existing user
    const existingUser = users.find((user) => user.room === room && user.username === username)

    // validate username
    if (existingUser){
        return {
            error: "Username is taken!"
        }
    }

    // set white or black user
    console.log(usersInRoom, usersInRoom.length)
    let color = usersInRoom.length === 0? "white" : "black"

    // store user
    const user = { id, username, room, color }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if (index !== -1){
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUsersInRoom = (room) => {
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}