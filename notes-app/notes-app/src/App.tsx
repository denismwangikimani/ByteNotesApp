import "./App.css";

const App = () => {
  return (
    <div className="AppContainer">
      {/* Add a form here containing input field and textarea both are 
      required so that the user has to input things and a submit button*/}
      <form className="note-form">
        <input placeholder="Title" required />
        <textarea placeholder="Content" rows={10} required />

        <button type="submit">Add Note</button>
      </form>

      {/* Add a div here to display the notes to the right using css grid*/}
      <div className="notes-grid">
        <div className="notes-items">
          <div className="notes-header">
            <button>x</button>
          </div>
          <h2>Note Title</h2>
          <p>Note Content</p>
        </div>
      </div>
    </div>
  );
};

export default App;
