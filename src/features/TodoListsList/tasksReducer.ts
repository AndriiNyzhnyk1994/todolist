import { Dispatch } from "redux"
import { AddTodoListActionType, RemoveTodoListActionType, SetTodoListsActionType, addTodoListAC, removeTodoListAC, setTodoListsAC } from "./todoListsReducer"
import { TasksStateType } from "../../app/AppWithRedux"
import { TaskPriorities, TaskStatuses, TaskType, UpdateTaskModelType, tasksAPI } from "../../api/todoListAPI"
import { AppRootStateType } from "../../app/store"



export const tasksReducer = (state: TasksStateType = {}, action: ActionType) => {
    switch (action.type) {
        case "REMOVE-TASK":
            return {
                ...state,
                [action.todoListId]: state[action.todoListId].filter(t => t.id !== action.taskId)
            }
        case "ADD-TASK":
            return {
                ...state,
                [action.todoListId]: [action.task, ...state[action.todoListId]]
            }
        case "UPDATE-TASK":
            return {
                ...state,
                [action.todoListId]: state[action.todoListId].map(t => t.id === action.taskId
                    ? { ...t, ...action.model } : t)
            }
        case "ADD-TODOLIST": return { [action.todoList.id]: [], ...state }
        case "REMOVE-TODOLIST": {
            let stateCopy = { ...state }
            delete stateCopy[action.todoListId]
            return stateCopy
        }
        case "SET-TODOLISTS": {
            let stateCopy = { ...state }
            action.todoLists.forEach(tl => {
                stateCopy[tl.id] = []
            })
            return stateCopy
        }
        case "SET-TASKS": return { ...state, [action.todoListId]: action.tasks }
        default: return state
    }
}

// ACTIONS
export const removeTaskAC = (todoListId: string, taskId: string) => {
    return { type: "REMOVE-TASK", todoListId, taskId } as const
}
export const addTaskAC = (todoListId: string, task: TaskType) => {
    return { type: "ADD-TASK", todoListId, task } as const
}
export const updateTaskAC = (todoListId: string, taskId: string, model: UpdateTaskModelType) => {
    return { type: "UPDATE-TASK", todoListId, taskId, model } as const
}
export const setTasksAC = (todoListId: string, tasks: TaskType[]) => {
    return { type: "SET-TASKS", todoListId, tasks } as const
}

// THUNKS
export const getTasksTC = (todoId: string) => (dispatch: Dispatch<ActionType>) => {
    tasksAPI.getTasks(todoId)
        .then(res => {
            dispatch(setTasksAC(todoId, res.data.items))
        })
}

export const removeTaskTC = (todoId: string, taskId: string) => (dispatch: Dispatch<ActionType>) => {
    tasksAPI.deleteTask(todoId, taskId)
        .then(res => {
            dispatch(removeTaskAC(todoId, taskId))
        })
}

export const addTaskTC = (todoId: string, title: string) => (dispatch: Dispatch<ActionType>) => {
    tasksAPI.addTask(todoId, title)
        .then(res => {
            dispatch(addTaskAC(todoId, res.data.data.item))
        })
}

export const updateTaskTC = (todoId: string, taskId: string, domainModel: UpdateDomainTaskModelType) =>
    (dispatch: Dispatch<ActionType>, getState: () => AppRootStateType) => {
        const task = getState().tasks[todoId].find((t) => t.id === taskId)
        // getState - второй параметр thunk функции. 
        // Это метод, который возвращает весь rootState (тудулисты и таски)
        if (task) {
            const model: UpdateTaskModelType = {
                deadline: task.deadline,
                description: task.description,
                priority: task.priority,
                startDate: task.startDate,
                title: task.title,
                status: task.status,
                ...domainModel
            }
            tasksAPI.updateTask(todoId, taskId, model)
                .then(res => {
                    dispatch(updateTaskAC(todoId, taskId, model))
                })
        }
    }


// TYPES
type ActionType =
    | ReturnType<typeof addTaskAC>
    | ReturnType<typeof removeTaskAC>
    | ReturnType<typeof updateTaskAC>
    | ReturnType<typeof setTasksAC>
    | RemoveTodoListActionType
    | AddTodoListActionType
    | SetTodoListsActionType

export type TaskDomainType = TaskType

export type UpdateDomainTaskModelType = {
    deadline?: string
    description?: string
    priority?: TaskPriorities
    startDate?: string
    status?: TaskStatuses
    title?: string
}