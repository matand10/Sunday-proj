import { storageService } from './async-storage.service'
import { httpService } from './http.service'
import { store } from '../store/store'
// import { socketService, SOCKET_EVENT_USER_UPDATED, SOCKET_EMIT_USER_WATCH } from './socket.service'
import { showSuccessMsg } from '../services/event-bus.service'

const STORAGE_KEY_LOGGEDIN_USER = 'loggedinUser'
// var gWatchedUser = null;

export const userService = {
    login,
    logout,
    signup,
    getLoggedinUser,
    saveLocalUser,
    getUsers,
    getById,
    remove,
    update,
    checkGuestMode,
    checkBoardMember,
    checkBoardUsers
}

window.userService = userService


function getUsers() {
    // return storageService.query('user')
    return httpService.get(`user`)
}

function onUserUpdate(user) {
    // showSuccessMsg(`This user ${user.fullname} just got updated from socket, new score: ${user.score}`)
    store.dispatch({ type: 'SET_WATCHED_USER', user })
}

async function getById(userId) {
    // const user = await storageService.get('user', userId)
    const user = await httpService.get(`user/${userId}`)
    // gWatchedUser = user;

    // socketService.emit(SOCKET_EMIT_USER_WATCH, userId)
    // socketService.off(SOCKET_EVENT_USER_UPDATED, onUserUpdate)
    // socketService.on(SOCKET_EVENT_USER_UPDATED, onUserUpdate)

    return user
}
function remove(userId) {
    // return storageService.remove('user', userId)
    return httpService.delete(`user/${userId}`)
}

async function update(user) {
    // await storageService.put('user', user)
    user = await httpService.put(`user/${user._id}`, user)
    // Handle case in which admin updates other user's details
    if (getLoggedinUser()._id === user._id) saveLocalUser(user)
    return user;
}

async function login(userCred) {
    // const users = await storageService.query('user')
    // const user = users.find(user => user.username === userCred.username)
    try {
        const user = await httpService.post('auth/login', userCred)
        if (user) {
            // socketService.login(user._id)
            return saveLocalUser(user)
        }
    } catch (err) {
        console.log(err)
    }
}
async function signup(userCred) {
    try {
        // const user = await storageService.post('user', userCred)
        const user = await httpService.post('auth/signup', userCred)
        // socketService.login(user._id)
        return saveLocalUser(user)
    } catch (err) {
        console.log(err)
    }
}

function logout() {
    sessionStorage.removeItem(STORAGE_KEY_LOGGEDIN_USER)
    // socketService.logout()
    return httpService.post('auth/logout')
}


function saveLocalUser(user) {
    sessionStorage.setItem(STORAGE_KEY_LOGGEDIN_USER, JSON.stringify(user))
    return user
}

function getLoggedinUser() {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY_LOGGEDIN_USER))
}

function loadUserBoard(boards, user) {
    if (!user) user = { _id: 'guest_id' }
    const userBoard = boards.find(board => {
        return board.members.find(member => member._id === user._id)
    })
    return userBoard
}

function checkGuestMode(user) {
    if (!user) user = { username: 'Guest' }
    return user
}

function checkBoardMember(board, user) {
    console.log(board);
    if (!board) return
    return board.members.every(member => member._id === user._id)
}

function checkBoardUsers(users, board) {
    return users.filter(user => {
        return board.members.find(member => member._id !== user._id)
    })
}

// ;(async ()=>{
//     await userService.signup({fullname: 'Puki Norma', username: 'user1', password:'123',score: 10000, isAdmin: false})
//     await userService.signup({fullname: 'Master Adminov', username: 'admin', password:'123', score: 10000, isAdmin: true})
//     await userService.signup({fullname: 'Muki G', username: 'muki', password:'123', score: 10000})
// })()



