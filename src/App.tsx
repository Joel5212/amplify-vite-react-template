import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'

const client = generateClient<Schema>({

});

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

  useEffect(() => {
    const sub = client.models.Todo.observeQuery().subscribe({
      next: ({ items }) => {
        setTodos([...items]);
      },
    });

    return () => sub.unsubscribe();
  }, []);

  const createTodo = async () => {
    await client.models.Todo.create({
      content: window.prompt("Todo content?"),
      isDone: false
    })

    fetchTodos();
  }

  const fetchTodos = async () => {
    const { data: items } = await client.models.Todo.list();
    setTodos(items);
  };


  async function deleteNote(todo: { id: string }) {
    const newNotes = todos.filter((todo) => todo.id !== todo.id);
    setTodos(newNotes);

    try {
      await client.models.Todo.delete({ id: todo.id });
    } catch (err) {
      console.error("Error deleting todo:", err);
      fetchTodos(); // Re-fetch the list in case of failure to maintain consistency
    }
  }

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <main>
          <h1>{user?.signInDetails?.loginId}'s todos</h1>
          <button onClick={createTodo}>Add new todo</button>
          <ul>
            {todos.map((todo) => (
              <li
                key={todo.id}>{todo.content}
                <button onClick={() => deleteNote({ id: todo.id })}>Delete note</button></li>
            ))}
          </ul>
          <div>
            🥳 App successfully hosted. Try creating a new todo.
            <br />
            <a href="https://next-release-dev.d1ywzrxfkb9wgg.amplifyapp.com/react/start/quickstart/vite-react-app/#step-2-add-delete-to-do-functionality">
              Review next step of this tutorial.
            </a>
          </div>
          <button onClick={signOut}>Sign out</button>
        </main>)}
    </Authenticator>
  );
}

export default App;
