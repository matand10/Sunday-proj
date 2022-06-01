import React, { useEffect, useState, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { loadBoards, setFilter } from "../store/board/board.action"
import { loadUsers, updateUser } from "../store/user/user.actions"
import { SideNav } from '../cmps/side-nav.jsx'
import { BoardHeader } from "../cmps/board-header"
import { saveBoard, removeBoard } from '../store/board/board.action'
import { ExtendedSideNav } from '../cmps/extended-side-nav.jsx'
import { taskService } from "../services/task.service"
import { boardService } from "../services/board.service"
import { useNavigate, useParams } from "react-router-dom"
import { Outlet } from 'react-router-dom'
import { userService } from "../services/user.service"
import ReactDOM from "react-dom"

export const TasksApp = () => {
    const [board, setBoard] = useState(null)
    const { boards } = useSelector((storeState) => storeState.boardModule)
    const { filterBy } = useSelector((storeState) => storeState.boardModule)
    const { users, user } = useSelector((storeState) => storeState.userModule)
    const [isMake, setIsMake] = useState(false)
    const dispatch = useDispatch()
    const navigate = useNavigate();
    const { boardId } = useParams()
    const ref = useRef(null)

    useEffect(() => {
        dispatch(loadUsers())
        dispatch(loadBoards(filterBy))
    }, [])

    useEffect(() => {
        console.log(boards);
        if (board && board._id === boardId) return
        if (!boards.length > 0) return
        if (boardId && (boardService.isIdOk(boardId, boards))) loadBoard()
        else {
            navigate(`/board/${boards[0]._id}`)
        }
    }, [boardId])

    useEffect(() => {
        if (board) return
        // if (board && !board._id) {
        //     let newBoard = { ...board }
        //     newBoard._id = boardId
        //     setBoard(newBoard)
        //     return
        // }
        if (boards.length > 0) {
            if (boardId && (boardService.isIdOk(boardId, boards))) loadBoard()
            else {
                setBoard(boards[0])
                navigate(`/board/${boards[0]._id}`)
            }
        }
    }, [boards])


    // useEffect(() => {
    //     if (board) return
    //     if (boards.length > 0) {
    //         if (boardService.isIdOk(boardId, boards) && boards._id) {
    //             loadBoard()
    //             return
    //         } else if (boards[0]._id) {
    //             setBoard(boards[0])
    //             navigate(`/board/${boards[0]._id}`)
    //             return
    //         }
    //     }
    // }, [boards])

    // useEffect(() => {
    //     if (boards.length === 0) {
    //         setIsMake(true)
    //     }
    // }, [boards])

    // useEffect(() => {
    //     if (isMake) {
    //         onAddBoard()
    //     }
    // }, [isMake])

    const loadBoard = async () => {
        const currBoard = await boardService.getById(boardId)
        console.log(currBoard);
        const filteredBoard = boardService.filterBoard(currBoard, filterBy)
        setBoard(filteredBoard)
    }

    const onAddTask = async (task, groupId) => {
        const newBoard = await taskService.addTask(board, task, groupId)
        console.log('newBoard', newBoard)
        dispatch(saveBoard(newBoard))
    }

    const onAddGroup = (group) => {
        board.groups.push(group)
        dispatch(saveBoard(board))
    }

    const onAddBoard = async (board = { title: 'First Board' }) => {
        let newUser = { ...user }
        let newBoard = boardService.makeBoard(newUser)
        newBoard.title = board.title
        newBoard._id = await boardService.save(newBoard)
        newBoard.members.push(newUser)
        dispatch(updateUser(newUser))
        navigate(`/board/${newBoard._id}`)
        setBoard(newBoard)
    }

    const onDeleteBoard = (boardId) => {
        dispatch(removeBoard(boardId))
        setBoard(null)
        navigate(`/board`)
    }

    const updateBoard = (updatedBoard) => {
        dispatch(saveBoard(updatedBoard))
        setBoard(updatedBoard)
    }

    const onRemoveGroup = (groupId) => {
        const groupIdx = board.groups.findIndex(group => group.id === groupId)
        board.groups.splice(groupIdx, 1)
        dispatch(saveBoard(board))
    }

    const updateTask = (updateTask, groupId) => {
        const newBoard = boardService.taskUpdate(updateTask, groupId, board)
        dispatch(saveBoard(newBoard))
    }

    const updateGroup = (newdGroup) => {
        const newBoard = boardService.groupUpdate(newdGroup, board)
        dispatch(saveBoard(newBoard))
    }

    const onFilter = (filterBy) => {
        dispatch(setFilter(filterBy))
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
        dispatch(saveBoard(newBoard))
    }

    const updateTaskDate = (updateDate, groupId, board) => {
        const newBoard = boardService.taskUpdate(updateDate, groupId, board)
        dispatch(saveBoard(newBoard))
    }

    const boardChange = (board) => {
        setBoard(board)
        navigate(`/board/${board._id}`)
    }


    
    if (!boards.length) return <h1>Loading...</h1>
    // if (!boards.length) return <div style={{ width: 100 + '%', height: 0, paddingBottom: 56 + '%', position: 'relative' }}><iframe ref={ref} src="https://giphy.com/embed/jAYUbVXgESSti" style={{ width: 50 + '%', height: 50 + '%', position: 'absolute', frameBorder: 0 }} className="giphy-embed" allowFullScreen /></div>
    return <section className="task-main-container">
        <div className="board-container-left">
            <SideNav />
        </div>
        <div className="board-container-right">
            <ExtendedSideNav board={board} boardChange={boardChange} updateBoard={updateBoard} openBoard={openBoard} boards={boards} onAddBoard={onAddBoard} onDeleteBoard={onDeleteBoard} />
            <div className="main-app flex-column">
                <BoardHeader updateBoard={updateBoard} users={users} onFilter={onFilter} onAddTask={onAddTask} onAddGroup={onAddGroup} board={board} />
                <Outlet context={{ board, updateBoard, removeTask, onAddTask, onRemoveGroup, updateTask, updateGroup, updateTaskDate }} />
            </div>
        </div>
    </section>
}




