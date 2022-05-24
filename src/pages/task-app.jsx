import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { loadBoards } from "../store/group/group.action"
import { MainBoard } from '../cmps/main-board.jsx'
import { SideNav } from '../cmps/side-nav.jsx'



export const TasksApp = () => {
    const { boards } = useSelector((storeState) => storeState.boardModule)
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(loadBoards())
    }, [])


    if (!boards.length) return <h1>Loading...</h1>

    return <section className="task-main-container">
        <div className="board-container-left">
            <SideNav />
        </div>
        <div className="board-container-right">
            {/* Header */}
            {/* filter */}
            <MainBoard board={boards[0]} />
        </div>
    </section>
}