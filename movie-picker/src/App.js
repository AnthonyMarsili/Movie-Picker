import logo from './logo.svg';
import './App.css';
import React, { useEffect, useState } from 'react'
import Amplify, { API, graphqlOpeartion } from 'aws-amplify';
import { createTodo } from './graphql/mutations'
import { listTodos } from './graphql/queries'
import { withAuthenticator } from '@aws-amplify/ui-react'

import awsExports from "./aws-exports";
Amplify.configure(awsExports);

const initialState = { name: '', description: ''}

const App = () => { /* app is a function */
  const [formState, setFormState] = useState(initialState) /* our new state variable is formState. We give it the value of the initialState */
  const [todos, setTodos] = useState([]) /* another new state variable is todos. We give it the value of any empty set */
  /* todos will always hold the list of todo items and it can be updated by using setTodos */

  useEffect(() => {  /* after the render, the useEffect hook is called and invokes the fetchTodos function */
    fetchTodos()
  }, [])

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value }) // make the next formState be what it was, plus the new key value
  }

  async function fetchTodos() {
    try {
      const todoData = await API.graphql(graphqlOpeartion(listTodos))
      const todos = todoData.data.listTodos.itmes
      setTodos(todos) // once the data is returned, the items array is passed into the setTodos to update the local state

    } catch (err) { console.log('error fetching todos') }
  }

  async function addTodo() {
    try {
      if (!formState.name || !formState.description)
        return
      const todo = { ...formState } // get the values in the formState (name, description) pair
      setTodos([...todos, todo]) // add that todo to the list of current todos
      setFormState(initialState) // make the form state be the inital state
      await API.graphql(graphqlOpeartion(createTodo, {input: todo})) // add a todo to the db with that (name, desc) pair
    } catch (err) { console.log('error creating todo:', err) }
  }

  return (
    <div style = {styles.container}>
      <h2>Test App</h2>
      <input
        onChange = {event => setInput('name', event.target.value)}
        style = {styles.input}
        value = {formState.name}
        placeholder = "Name"
      />
      <input
        onChange = {event => setInput('description', event.target.value)}
        style = {styles.input}
        value = {formState.description}
        placeholder = "Description"
      />
      <button style = {styles.button} onClick = {addTodo}>Create Todo</button>

      {
        todos.map((todo, index) => (
          <div key={todo.id ? todo.id : index} style={styles.todo}>
              <p style={styles.todoName}>{todo.name}</p>
              <p style={styles.todoDescription}>{todo.description}</p>
          </div>
        ))
      }
    </div>
  )
}

const styles = {
  container: { width: 400, margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 20 },
  todo: {  marginBottom: 15 },
  input: { border: 'none', backgroundColor: '#ddd', marginBottom: 10, padding: 8, fontSize: 18 },
  todoName: { fontSize: 20, fontWeight: 'bold' },
  todoDescription: { marginBottom: 0 },
  button: { backgroundColor: 'black', color: 'white', outline: 'none', fontSize: 18, padding: '12px 0px' }
}

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

export default withAuthenticator(App)
