import React from 'react';
import { connect } from "react-redux";
import dotsMenu from '../assets/img/side-nav/ds-menu.svg'
import { PanelInput } from '../cmps/panel-input.jsx'
import { UpdateList } from '../cmps/update-list'
import { addUpdate, removeUpdate } from '../store/update/update.action'


export class _SidePanel extends React.Component {

    state = {
        isModalOpen: true,
        isInputClicked: false,
        users: this.props.users,
        user: this.props.user,
    }

    componentDidMount() {
        this.setState({ updates: this.props.updates })
    }

    deleteUpdate = (updateId, updateIdx) => {
        const { group, taskIdx } = this.props
        group.tasks[taskIdx].comments.splice(updateIdx, 1)
        this.props.updateGroup(group)
        this.props.removeUpdate(updateId)
    }

    closeModal = () => {
        this.props.onCloseModal()
    }

    onUpdate = async (update) => {
        const { group, taskIdx } = this.props
        const addedUpdate = await this.props.addUpdate(update)
        group.tasks[taskIdx].comments.push(addedUpdate)
        this.props.updateGroup(group)
    }

    toggleInput = (value) => {
        this.setState((prevState) => ({ ...prevState, isInputClicked: value }))
    }


    render() {
        const { statusRef, user, updates } = this.props
        const { isModalOpen, isInputClicked, users } = this.state
        const { task } = this.props.modal

        return <section onClick={() => this.toggleInput(false)} ref={statusRef}>
            {/* <button className="side-panel-btn" onClick={this.toggleModal}>Open Modal</button> */}
            <div className="side-panel-modal" style={{ left: isModalOpen ? '0px' : '3000px' }}>
                <div className="modal-content">
                    <div className="side-panel-title">
                        <div className="close-action-wrapper">
                            <span className="close-side-panel" onClick={() => this.closeModal()}>&times;</span>
                        </div>
                        <div className="side-panel-header-container">
                            <div className="side-panel-title-wrapper">
                                <h1>{task.title}</h1>
                            </div>
                            <div className="panel-subscribers-wrapper">
                                <span>Members icon</span>
                                <span>|</span>
                                <div className="ds-menu-side-panel"><img src={dotsMenu} alt="dots-menu-logo" /></div>
                            </div>
                        </div>

                        <div className="side-panel-nav-wrapper">
                            <div className="side-panel-nav-container">
                                <div className="side-panel-nav-item">
                                    <button className="panel-nav-button"><span>Update</span></button>
                                </div>
                            </div>
                        </div>

                        <div className="main-update-container">
                            <div className="new-post-side-panel">
                                <PanelInput toggleInput={this.toggleInput} task={task} user={user} addUpdate={addUpdate} onUpdate={this.onUpdate} isInputClicked={isInputClicked} />
                            </div>
                            <div className="main-update-list-container">
                                {task.comments.map((update, idx) => {
                                    return <div key={update._id}>
                                        <UpdateList updateIdx={idx} deleteUpdate={this.deleteUpdate} users={users} task={task} update={update} />
                                    </div>
                                })}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>

    }
}


function mapStateToProps(state) {
    return {
        users: state.userModule.users,
        user: state.userModule.user,
        updates: state.updateModule.updates
    }
}

const mapDispatchToProps = {
    addUpdate,
    removeUpdate
}

export const SidePanel = connect(
    mapStateToProps, mapDispatchToProps
)(_SidePanel)