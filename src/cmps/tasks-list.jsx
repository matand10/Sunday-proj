import { utilService } from "../services/util.service";
import { FaChevronCircleDown, FaCaretDown } from 'react-icons/fa'
import { TaskMenu } from './task-menu';

import { useEffect, useRef, useState } from 'react';
import { StatusModal } from '../modal/status-modal'
import { SidePanel } from "./side-panel"
import { useParams } from "react-router-dom";
import { Calendar } from '../modal/calendar'

// export const TasksList = ({ task, boardId, backgroundColor, onHandleRightClick, menuRef, updateTask, group, board }) => {
// export const TasksList = ({ task, backgroundColor, onHandleRightClick, menuRef, group, board, removeTask }) => {
export const TasksList = ({ task, backgroundColor, onHandleRightClick, menuRef, updateTask, group, board, removeTask }) => {
    const [modal, setModal] = useState({})
    const [arrowTask, setArrowTask] = useState({})
    const [updateIsClick, setUpdateIsClick] = useState({})
    const [taskUpdate, setTaskUpdate] = useState(task)
    const [modalPos, setModalPos] = useState({ x: null, y: null })
    const [isStatusActive, setIsStatusActive] = useState(false)
    const [isDateClick, setIsDateClick] = useState({})
    let statusRef = useRef()
    const { boardId } = useParams()

    useEffect(() => {
        updateTask(taskUpdate, group.id, board)
        setUpdateIsClick({})
    }, [taskUpdate])


    const onOpenMenu = (params) => {
        setArrowTask(params)
    }

    const handleChange = ({ target }) => {
        document.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault()
                const value = target.value
                const field = target.name
                setTaskUpdate((prevTask) => ({ ...prevTask, [field]: value }))
            }
        })
    }

    useEffect(() => {
        document.addEventListener("mousedown", (event) => {
            if (!statusRef.current?.contains(event.target)) {
                setIsStatusActive(false)
                setUpdateIsClick({})
            }
        })
    })

    const toggleStatus = (ev, value) => {
        const x = ev.pageX
        const y = ev.pageY
        setModalPos({ x: x, y: y })
        setIsStatusActive(value)
    }

    const changeStatus = (status) => {
        task.status = status
        updateTask(task, group.id, board)
        setIsStatusActive(false)
    }

    const onUpdateTask = (ev, params) => {
        ev.stopPropagation()
        setUpdateIsClick(params)
    }

    const onOpenModal = () => {
        setModal(prevState => ({ ...prevState, boardId: boardId, task: task }))
    }

    const onCloseModal = () => {
        setModal({ boardId: null })
    }

    const onUpdateDate = (params) => {

        setIsDateClick(params)
    }


    return <section className="task-row-component" onContextMenu={(ev) => onHandleRightClick(ev, task, true)} ref={menuRef}>
        <div className="task-row-wrapper">
            <div className="task-row-title">
                <div className="task-title-cell-component" onClick={() => onOpenModal({ boardId: board._id, groupId: group.id, task: task })}>
                    <div className="task-arrow-div" onClick={(event) => onOpenMenu({ taskId: task.id, groupId: group.id, board: board })} ><FaCaretDown className="task-arrow" /></div>
                    <div className="left-indicator-cell" style={{ backgroundColor }}></div>
                    <div className="task-title-content" >
                        {(updateIsClick.boardId && updateIsClick.groupId === group.id && updateIsClick.task.id === task.id) ?
                            <div className="title-update-input">
                                <input type="text" defaultValue={task.title} onChange={handleChange} name="title" onClick={(event) => (event.stopPropagation())} ref={menuRef} />
                            </div>
                            :
                            <div className="task-title-cell">
                                <div>
                                    {task.title}
                                </div>
                                <div>
                                    <button onClick={(event) => onUpdateTask(event, { boardId: board._id, groupId: group.id, task: task })} className="edit-button">Edit</button>
                                </div>
                            </div>
                        }
                    </div>
                </div>
                <div className="task-row-items">
                    <div className="flex-row-items">{task.assignedTo.map(user => user.fullname)}</div>
                    <div className="flex-row-items status" style={{ backgroundColor: task.status.color }} onClick={(ev) => toggleStatus(ev, true)}>{task.status.title}</div>


                    <div className="flex-row-items" onClick={() => onUpdateDate({ boardId: board._id, groupId: group.id, task: task })}>{task.archivedAt ? utilService.getCurrTime(task.archivedAt) : ''}</div>

                    {/* <div className="flex-row-items status" onClick={(ev) => toggleStatus(ev, true)} style={{ backgroundColor: task.status.color }}>{task.status.title}</div>
                    <div className="flex-row-items">{utilService.getCurrTime(task.archivedAt)}</div> */}
                </div>
            </div>
            {arrowTask.board && arrowTask.groupId === group.id && arrowTask.taskId === task.id && <TaskMenu removeTask={removeTask} arrowTask={arrowTask} onOpenMenu={onOpenMenu} />}
        </div >
        {isStatusActive && <StatusModal changeStatus={changeStatus} task={task} statusRef={statusRef} modalPos={modalPos} />}
        {modal.boardId && <SidePanel modal={modal} onCloseModal={onCloseModal} onOpenModal={onOpenModal} />}
        {/* {isDateClick && <Calendar />} */}
    </section >
}

