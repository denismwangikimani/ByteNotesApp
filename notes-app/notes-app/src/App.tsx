import "./App.css";
import { useState } from "react";

interface Notes {
  id: number;
  title: string;
  content: string;
}

const App = () => {
  // Create a state variable (6 dummy notes using useState) to store the notes
  const [notes, setNotes] = useState<Notes[]>([
    {
      id: 1,
      title: "Note 1",
      content: "test test test for note 1",
    },
    {
      id: 2,
      title: "Note 2",
      content: "test test test for note 2",
    },
    {
      id: 3,
      title: "Note 3",
      content: "test test test for note 3",
    },
    {
      id: 4,
      title: "Note 4",
      content: "test test test for note 4",
    },
    {
      id: 5,
      title: "Note 5",
      content: "test test test for note 5",
    },
    {
      id: 6,
      title: "Note 6",
      content: "test test test for note 6",
    },
  ]);

  return (
    <div className="app-container">
      {/* Add a form here containing input field and textarea both are 
      required so that the user has to input things and a submit button*/}
      <form className="note-form">
        <input placeholder="Title" required />
        <textarea placeholder="Content" rows={10} required />

        <button type="submit">Add Note</button>
      </form>

      {/* Add a div here to display the notes to the right using css grid*/}
      <div className="notes-grid">
        {/* Map over the notes state variable and display each note */}
        {notes.map((note) => (
          <div className="notes-items">
            <div className="notes-header">
              <button>x</button>
            </div>
            <h2>{note.title}</h2>
            <p>{note.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
