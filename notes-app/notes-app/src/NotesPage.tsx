import "./App.css";
import React, { useState, useEffect } from "react";

// Define the type 'Note'
type Note = {
  id: number;
  title: string;
  content: string;
};

const NotesPage = () => {
  // Create a state variable (6 dummy notes using useState) to store the notes
  const [notes, setNotes] = useState<Note[]>([]);

  /*we need to create two state variables to store the title and content of the note*/
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  //fetch JWT token from local storage
  const token = localStorage.getItem("token");
  console.log(token);

  /*Create a handleAddNote function to handle the form submission.
  we specify the parameter type as React.FormEvent to satisfy TypeScript's typing requirement*/
  const handleAddNote = async (event: React.FormEvent) => {
    //event.preventDefault(); // Prevent the page from refreshing when submitting the form

    //we will save new notes to the server using the fetch API and a POST request
    const response = await fetch("http://localhost:5000/api/notes", {
      method: "POST",
      //we will set the headers to specify the content type as JSON
      headers: {
        "Content-Type": "application/json",
        //we will also include the JWT token in the Authorization header to authenticate the user
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, content }),
    });

    //we will convert the response from the server to JSON format so as to display the new note
    const newNote = await response.json();

    try {
      // Ensure notes is an array before updating it
      setNotes([newNote, ...notes]);

      // Clear the input fields
      setTitle("");
      setContent("");
    } catch (error) {
      console.log(error);
    }
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
  const handleUpdateNote = async (event: React.FormEvent) => {
    // Prevent the page from refreshing when submitting the form
    //event.preventDefault();

    //if the note is not selected, we will return early from the function to prevent the code from executing further.
    if (!selectedNote) return;

    try {
      //we will send a PUT request to the server to update the note with the matching id
      const response = await fetch(
        `http://localhost:5000/api/notes/${selectedNote.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            //we will also include the JWT token in the Authorization header to authenticate the user
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title, content }),
        }
      );

      //we will convert the response from the server to JSON format so as to display the updated note
      const updateNote = await response.json();

      //After that, we utilize the (updateNotesList) map function to generate a new array of notes, replacing the selected note with our updated note where the id matches.
      const updateNotesList = notes.map((note) =>
        note.id === selectedNote.id ? updateNote : note
      );

      //The updated array is then set to our state using the setNotes function. Finally, we reset our title, content, and selectedNote state values to their initial states.
      setNotes(updateNotesList);
      setTitle("");
      setContent("");
      setSelectedNote(null);
    } catch (error) {
      console.log(error);
    }
  };

  //We'll also implement a simple handleCancel function to reset our form and selected note when the user decides not to proceed with an update
  const handleCancel = () => {
    setTitle("");
    setContent("");
    setSelectedNote(null);
  };

  //we will implement the deleteNote function to remove a note from the notes state variable when the user clicks the delete button.
  const deleteNote = async (event: React.MouseEvent, noteId: number) => {
    //prevent the page from restarting when clicked
    event.stopPropagation();

    try {
      //we will use the fetch API to send a DELETE request to the server to delete the note with the matching id
      await fetch(`http://localhost:5000/api/notes/${noteId}`, {
        method: "DELETE",
        headers: {
          //we will also include the JWT token in the Authorization header to authenticate the user
          Authorization: `Bearer ${token}`,
        },
      });

      //we will use the filter function to create a new array of notes that exclude the note with the matching id
      const updatedNotes = notes.filter((note) => note.id !== noteId);

      //we will update the notes state variable with the new array of notes
      setNotes(updatedNotes);
    } catch (error) {
      console.log(error);
    }
  };

  //useEffect hook to fetch notes from the server and update the notes state variable
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/notes", {
          headers: {
            //we will also include the JWT token in the Authorization header to authenticate the user
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        // Log the fetched data
        console.log("Fetched notes:", data);

        // Ensure the data is an array of notes

        setNotes(data.notes);
      } catch (e) {
        console.log(e);
      }
    };

    fetchNotes();
  }, [token]);


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
        {notes?.map((note) => (
          //we will add an onClick event listener to each note to call the handleNoteClick function when the user clicks on a note.
          <div
            className="notes-items"
            key={note.id}
            onClick={() => handleNoteClick(note)}
          >
            <div className="notes-header">
              <button onClick={(event) => deleteNote(event, note.id)}>x</button>
            </div>
            <h2>{note.title}</h2>
            <p>{note.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Export the NotesPage 
export default NotesPage;
