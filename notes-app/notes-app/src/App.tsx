import "./App.css";
import React, { useState } from "react";

// Define the type 'Note'
type Note = {
  id: number;
  title: string;
  content: string;
};

const App = () => {
  // Create a state variable (6 dummy notes using useState) to store the notes
  const [notes, setNotes] = useState<Note[]>([
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

  /*we need to create two state variables to store the title and content of the note*/
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  /*Create a handleAddNote function to handle the form submission.
  we specify the parameter type as React.FormEvent to satisfy TypeScript's typing requirement*/
  const handleAddNote = (event: React.FormEvent) => {
    event.preventDefault(); // Prevent the page from refreshing when submitting the form

    const newNote: Note = {
      id: notes.length + 1,
      title: title,
      content: content,
    };

    //we will use the setNotes function to update the notes state variable by adding the new note to the existing notes
    setNotes([newNote, ...notes]);

    // Clear the input fields after submitting the form
    setTitle("");
    setContent("");
  };

  //track selected note to enable the user to update it
  //This state variable will have a type of Note or null to account for the possibility that no note is selected. We'll initialize this state to null.
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  //create a function named handleNoteClick to handle the user's click event on a note and set the
  //selectedNote state variable to the clicked note and update the input fields with the selected note's title and content.
  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
  };

  //create a function named handleUpdateNote to handle the form submission when the user updates a note.
  const handleUpdateNote = (event: React.FormEvent) => {
    // Prevent the page from refreshing when submitting the form
    event.preventDefault();

    //if the note is not selected, we will return early from the function to prevent the code from executing further.
    if (!selectedNote) return;

    //we will create an updateNote object based on the selected notes id and update its title and content
    const updateNote: Note = {
      id: selectedNote.id,
      title: title,
      content: content,
    };

    //After that, we utilize the (updateNotesList) map function to generate a new array of notes, replacing the selected note with our updated note where the id matches.
    const updateNotesList = notes.map((note) =>
      note.id === selectedNote.id ? updateNote : note
    );

    //The updated array is then set to our state using the setNotes function. Finally, we reset our title, content, and selectedNote state values to their initial states.
    setNotes(updateNotesList);
    setTitle("");
    setContent("");
    setSelectedNote(null);
  };

  //We'll also implement a simple handleCancel function to reset our form and selected note when the user decides not to proceed with an update
  const handleCancel = () => {
    setTitle("");
    setContent("");
    setSelectedNote(null);
  };

  return (
    <div className="app-container">
      {/* Add a form where using the onSubmit we will call either handleUpdateNote function if the note is a selected note thats updated or the 
      handleAddNote function if its a new note*/}
      <form
        className="note-form"
        onSubmit={(event) =>
          selectedNote ? handleUpdateNote(event) : handleAddNote(event)
        }
      >
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Title"
          required
        ></input>
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Content"
          rows={10}
          required
        ></textarea>

        {/*if its a selected note, show the save and cancel buttons to save the updated note else show the addNote button to add the new note*/}
        {selectedNote ? (
          <div className="edit-buttons">
            <button type="submit">Save</button>
            <button onClick={handleCancel}>Cancel</button>
          </div>
        ) : (
          <button type="submit">Add Note</button>
        )}
      </form>

      {/* Add a div here to display the notes to the right using css grid*/}
      <div className="notes-grid">
        {/* Map over the notes state variable and display each note */}
        {notes.map((note) => (
          //we will add an onClick event listener to each note to call the handleNoteClick function when the user clicks on a note.
          <div
            className="notes-items"
            key={note.id}
            onClick={() => handleNoteClick(note)}
          >
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
