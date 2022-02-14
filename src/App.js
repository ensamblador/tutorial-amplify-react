/* src/App.js */
import React, { useEffect, useState } from 'react'
import Amplify, { API, graphqlOperation } from 'aws-amplify'
import { createTodo } from './graphql/mutations'
import { listTodos } from './graphql/queries'
import { onCreateTodo } from './graphql/subscriptions';

import awsExports from "./aws-exports";
Amplify.configure(awsExports);

const initialState = { name: '', description: '' }



/* const subscription = API.graphql(
  graphqlOperation(onCreateTodo)
).subscribe({
  next: ({ provider, value }) => {
    //console.log({ provider, value })
    console.log(value.data.onCreateTodo)
  },
  error: error => console.warn(error)
})

 */

const App = () => {
  const [formState, setFormState] = useState(initialState)
  const [todos, setTodos] = useState([])
  const [firstTime, setFirstTime] = useState(true)

  useEffect(() => {
    if (firstTime) {
      fetchTodos()
      setFirstTime(false)
      subscribeToTodos()
    }
  }, [firstTime])

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value })
  }

  function subscribeToTodos () {

    API.graphql(
      graphqlOperation(onCreateTodo)
    ).subscribe({
      next: ({ provider, value }) => {
        //console.log({ provider, value })
        console.log([...todos, value.data.onCreateTodo] )
        setTodos(todos => [...todos, value.data.onCreateTodo])
      },
      //error: error => console.warn(error)
    });
    
  } 

  async function fetchTodos() {
    try {
      const todoData = await API.graphql(graphqlOperation(listTodos))
      const todos = todoData.data.listTodos.items
      setTodos(todos)
    } catch (err) { console.log('error fetching todos') }
  }


  async function addTodo() {
    try {
      if (!formState.name || !formState.description) return
      const todo = { ...formState }
      // setTodos([...todos, todo])
      setFormState(initialState)
      await API.graphql(graphqlOperation(createTodo, { input: todo }))
    } catch (err) {
      console.log('error creating todo:', err)
    }
  }

  return (
    <div style={styles.container}>
      <h2>Amplify Todos</h2>
      <input
        onChange={event => setInput('name', event.target.value)}
        style={styles.input}
        value={formState.name}
        placeholder="Name"
      />
      <input
        onChange={event => setInput('description', event.target.value)}
        style={styles.input}
        value={formState.description}
        placeholder="Description"
      />
      <button style={styles.button} onClick={addTodo}>Crear TODO</button>
      {
        todos.map((todo, index) => (
          <div key={todo.id ? todo.id : index} style={styles.todo}>
            <p style={styles.todoName}>{todo.name}: {todo.description}</p>
          </div>
        ))
      }
    </div>
  )
}

const styles = {
  container: { width: 400, margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 5 },
  todo: { padding:2,  marginBottom: 5, backgroundColor: 'aliceblue' },
  input: { border: 'none', backgroundColor: '#ddd', marginBottom: 10, padding: 8, fontSize: 14 },
  todoName: { fontSize: 12 },
  todoDescription: { marginBottom: 0 },
  button: { backgroundColor: 'black', color: 'white', outline: 'none', fontSize: 18, padding: '12px 0px' }
}

export default App