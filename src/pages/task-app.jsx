import React, { useEffect, useState, useRef } from "react"
import { socketService, SOCKET_EMIT_SEND_MSG } from '../services/socket.service'
import { useDispatch, useSelector } from "react-redux"
import { loadBoards, setFilter } from "../store/board/board.action"
import { loadUsers, updateUser } from "../store/user/user.actions"
import { loadUpdates } from "../store/update/update.action"
import { SideNav } from '../cmps/side-nav.jsx'
import { BoardHeader } from "../cmps/board-header"
import { saveBoard, removeBoard } from '../store/board/board.action'
import { ExtendedSideNav } from '../cmps/extended-side-nav.jsx'
import { taskService } from "../services/task.service"
import { boardService } from "../services/board.service"
import { useNavigate, useParams } from "react-router-dom"
import { Outlet } from 'react-router-dom'
import { useEffectUpdate } from "../hooks/useEffectUpdate"
import { groupService } from "../services/group.service"

import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service'

export const TasksApp = () => {


    const [board, setBoard] = useState(null)
    const [isKanban, setIsKanban] = useState(false)
    const { boards } = useSelector((storeState) => storeState.boardModule)
    const { filterBy } = useSelector((storeState) => storeState.boardModule)
    const { users, user } = useSelector((storeState) => storeState.userModule)
    const { updates } = useSelector((storeState) => storeState.userModule)
    const dispatch = useDispatch()
    const navigate = useNavigate();
    const { boardId } = useParams()

    useEffect(() => {
        dispatch(loadUsers())
        dispatch(loadBoards(filterBy))
        socketService.on('newBoardUpdate', onBoardUpdate)
        socketService.emit('registerToBoardUpdates', boardId)

        return () => {
            socketService.off('newBoardUpdate', onBoardUpdate)
        }
    }, [])

    useEffectUpdate(() => {
        dispatch(loadUpdates())
        loadBoard()
    }, [boards])

    const onBoardUpdate = (board) => {
        setBoard(board)
    }

    const loadBoard = async () => {
        let currBoard
        if (boards.length === 0) onAddBoard()
        else if (boardId && boardService.isIdOk(boardId, boards)) currBoard = boardService.isIdOk(boardId, boards)
        else currBoard = boards[0]
        if (currBoard) {
            if (isKanban) navigate(`/board/${currBoard._id}/kanban`)
            else navigate(`/board/${currBoard._id}`)
        } else return navigate('/board')
        const filteredBoard = boardService.filterBoard(currBoard, filterBy)
        setBoard(filteredBoard)
    }

    const onAddTask = async (task, groupId) => {
        const newBoard = await taskService.addTask(board, task, groupId)
        updateBoard(newBoard)
    }

    const onAddGroup = (group) => {
        showSuccessMsg('Group added successfully!')
        board.groups.push(group)
        updateBoard(board)
    }

    const onAddBoard = async (board = { title: 'First Board' }) => {
        let newUser = { ...user }
        let newBoard = boardService.makeBoard(newUser)
        newBoard.title = board.title
        newBoard.members.push(newUser)
        dispatch(saveBoard(newBoard))
    }

    const updateBoard = (newBoard) => {
        socketService.emit('boardUpdate', newBoard)
        setBoard(newBoard)
        dispatch(saveBoard(newBoard))
    }

    const onDeleteBoard = (boardId) => {
        dispatch(removeBoard(boardId))
        navigate(`/board`)
    }

    const onRemoveGroup = (groupId) => {
        const groupIdx = board.groups.findIndex(group => group.id === groupId)
        board.groups.splice(groupIdx, 1)
        showSuccessMsg('Group removed successfully!')
        updateBoard(board)
    }

    const updateTask = (updateTask, groupId) => {
        const newBoard = boardService.taskUpdate(updateTask, groupId, board)
        updateBoard(newBoard)
    }

    const updateGroup = (newGroup) => {
        const newBoard = boardService.groupUpdate(newGroup, board)
        updateBoard(newBoard)
    }

    const onFilter = (filterBy) => {
        // dispatch(setFilter(filterBy))
    }

    const openBoard = (board) => {
        setBoard(board)
        navigate(board._id)
    }

    const removeTask = (taskId, groupId) => {
        const newBoard = { ...board }
        const groupIdx = newBoard.groups.findIndex(group => group.id === groupId)
        const taskIdx = newBoard.groups[groupIdx].tasks.findIndex(task => task.id === taskId)
        newBoard.groups[groupIdx].tasks.splice(taskIdx, 1)
        let statusColIdxs = []
        newBoard.groups[groupIdx].columns.forEach((col, idx) => {
            if (col.type === 'status') statusColIdxs.push(idx)
        })
        const group = { ...newBoard.groups[groupIdx] }
        const progressBars = groupService.getProgress(group)
        newBoard.groups[groupIdx].progress = progressBars
        showSuccessMsg('Task removed successfully!')
        updateBoard(newBoard)
    }

    const updateTaskDate = (updateDate, groupId, board) => {
        const newBoard = boardService.taskUpdate(updateDate, groupId, board)
        updateBoard(newBoard)
    }

    const boardChange = (board) => {
        setBoard(board)
        navigate(`/board/${board._id}`)
    }

    if (!boards.length) return <h1>Loading...</h1>
    return <section className="task-main-container">
        <div className="board-container-left">
            <SideNav />
            <ExtendedSideNav board={board} boardChange={boardChange} updateBoard={updateBoard} openBoard={openBoard} boards={boards} onAddBoard={onAddBoard} onDeleteBoard={onDeleteBoard} />
        </div>

        <div className="board-container-right">
            <div className="main-app flex-column">
                <BoardHeader setIsKanban={setIsKanban} updateBoard={updateBoard} users={users} onFilter={onFilter} onAddTask={onAddTask} onAddGroup={onAddGroup} board={board} />
                <Outlet context={{ board, updates, updateBoard, removeTask, onAddTask, onRemoveGroup, updateTask, updateGroup, updateTaskDate }} />
            </div>
        </div>
    </section>
}




