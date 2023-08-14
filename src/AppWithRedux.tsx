import React, { useCallback, useEffect } from 'react';
import './App.css';
import { TodoList } from './Todolist';
import { AddItemForm } from './AddItemForm';

import { useAppDispatch, useAppSelector } from './store/store';
import {
  FilterValuesType, TodoListDomainType,
  addTodoListAC, addTodoListTC, changeTodoListFilterAC,
  changeTodoListTitleAC, getTodosTC, removeTodoListTC
} from './store/todoListsReducer';
import {
  addTaskTC, changeTaskStatusTC,
  removeTaskTC, changeTaskTitleTC
} from './store/tasksReducer';
import { TaskStatuses, TaskType } from './api/todoListAPI';


export type TasksStateType = {
  [key: string]: Array<TaskType>
}

function AppWithRedux() {
  // useAppSelector - is a custom hook based on built-in useSelector
  // with useAppSelector we reduced our types, moving AppRootStateType to store

  const todoLists = useAppSelector<Array<TodoListDomainType>>(state => state.todoLists)
  const tasks = useAppSelector<TasksStateType>(state => state.tasks)
  const dispatch = useAppDispatch()

  const addTodoList = useCallback((newTodoListTitle: string) => {
    dispatch(addTodoListTC(newTodoListTitle))
  }, [])

  const removeTodoList = useCallback((todoListId: string) => {
    dispatch(removeTodoListTC(todoListId))
  }, [])

  const removeTask = useCallback((todoListId: string, taskId: string) => {
    dispatch(removeTaskTC(todoListId, taskId))
  }, [])

  const changeFilterValue = useCallback((todoListId: string, value: FilterValuesType) => {
    const action = changeTodoListFilterAC(todoListId, value)
    dispatch(action)
  }, [])
  const addTask = useCallback((todoListId: string, newTaskTitle: string) => {
    dispatch(addTaskTC(todoListId, newTaskTitle))
    dispatch(getTodosTC())
  }, [])
  const changeTaskStatus = useCallback((todoListId: string, taskId: string, status: TaskStatuses) => {
    const action = changeTaskStatusTC(todoListId, taskId, status)
    dispatch(action)
  }, [])
  const changeTaskTitle = useCallback((todoListId: string, taskId: string, value: string) => {
    dispatch(changeTaskTitleTC(todoListId, taskId, value))
  }, [])
  const changeTodoListTitle = useCallback((todoListId: string, newTitle: string) => {
    const action = changeTodoListTitleAC(todoListId, newTitle)
    dispatch(action)
  }, [])

  useEffect(() => {
    dispatch(getTodosTC())
  }, [])

  return (
    <div className="App">
      <AddItemForm addItem={addTodoList} />
      {todoLists.map(tl => {
        return (
          <TodoList
            key={tl.id}
            id={tl.id}
            title={tl.title}
            filter={tl.filter}
            tasks={tasks[tl.id]}
            addTask={addTask}
            removeTask={removeTask}
            removeTodoList={removeTodoList}
            changeFilterValue={changeFilterValue}
            changeTaskStatus={changeTaskStatus}
            changeTaskTitle={changeTaskTitle}
            changeTodoListTitle={changeTodoListTitle}
          />
        )
      })}

    </div>
  );
}

export default AppWithRedux;
