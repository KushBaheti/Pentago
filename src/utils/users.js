const users = []

const addUser = ({ id, isOnline, username, room }) => {
    
    let user = {}
    let color = "black"
    let canBegin = true
    let wins = 0

    if (isOnline) {
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
        if (usersInRoom.length === 0) {
            color = "white"
            canBegin = false
        }
        
        // store user
        user = { id, isOnline, username, room, color, wins }
    } else {
        user = { 
            id, 
            isOnline, 
            localPlayers: getLocalPlayers() 
        }
    }

    users.push(user)
    return { user, canBegin }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)
    if (index !== -1){
        const u = users.splice(index, 1)[0]
        console.log("removeUser user", u)
        return u
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUsersInRoom = (room) => {
    return users.filter((user) => user.room === room)
}

const getLocalPlayers = () => {
    return [
        {
            color: "white",
            id: "01",
            isOnline: false,
            room: "local",
            username: "batman",
            wins: 0
        },
        {
            color: "black",
            id: "02",
            isOnline: false,
            room: "local",
            username: "superman",
            wins: 0
        }
    ]
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
    getLocalPlayers
}