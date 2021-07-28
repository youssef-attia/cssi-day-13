let googleUserId;

window.onload = (event) => {
  // Use this to retain user state between html pages.
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      console.log('Logged in as: ' + user.displayName);
      googleUserId = user.uid;
      getNotes(googleUserId);
    } else {
      // If not logged in, navigate back to login page.
      window.location = 'index.html';
    };
  });
};

const getNotes = (userId) => {
  const notesRef = firebase.database().ref(`users/${userId}`);
  notesRef.on('value', (snapshot) => {
    const data = snapshot.val();
    renderDataAsHtml(data);
  });
};

const renderDataAsHtml = (data) => {
    let cards = ``;
    let modifiedData = Object.fromEntries(Object.entries(data).sort(function(a,b) {
        var x = a[1].title.toLowerCase();
        var y = b[1].title.toLowerCase();
        return x < y ? -1 : x > y ? 1 : 0;
    }));

  for (const noteItem in modifiedData) {
    const note = data[noteItem];
    cards += createCard(note, noteItem)
  };
  document.querySelector('#app').innerHTML = cards;
};

const createCard = (note, noteId) => {
  return `
    <div class="column is-one-quarter">
      <div class="card">
        <header class="card-header">
          <p class="card-header-title">${note.title}</p>
        </header>
        <div class="card-content">
          <div class="content">${note.text}</div>
        </div>
        <footer class="card-footer">
            <a id="${noteId}" href="#" class="card-footer-item"
                onclick="deleteNote('${noteId}')">
                Delete
            </a>
            <a id="${noteId}" class="card-footer-item" onclick="editNote('${noteId}')">
               Edit
            </a>
        </footer>
      </div>
    </div>
  `;
}

const deleteNote = (noteId) => {
    if(confirm("Are you sure you want to delete this note?")){
        //OUR ATTEMPT AT DOING THE SPICY ONE
        // let noteDetails;
        // const notesRef = firebase.database().ref(`users/${googleUserId}/${noteId}`);
        // notesRef.on('value', (snapshot) => {
        //     const data = snapshot.val();
        //     console.log(data)
        //     const noteEdits = {
        //         labels: [...data.labels, "archived"]
        //     };
        
        //     firebase.database().ref(`users/${googleUserId}/${noteId}`).update(noteEdits);
        // });
        firebase.database().ref(`users/${googleUserId}/${noteId}`).remove();
    } else {
        alert("Deletion cancelled!");
    }
}
const editNote = (noteId) => {
    const editNoteModal = document.querySelector('#editNoteModal');
    const notesRef = firebase.database().ref(`users/${googleUserId}`);

    notesRef.on('value', (snapshot) => {
        const data = snapshot.val();
        const noteDetails = data[noteId];
        document.querySelector('#editTitleInput').value = noteDetails.title;
        document.querySelector('#editTextInput').value = noteDetails.text;
        document.querySelector('#editTextId').value = noteId;
    });
    editNoteModal.classList.toggle('is-active');

}

const saveEditedNote = () => {
    const noteTitle = document.querySelector("#editTitleInput").value;
    const noteText = document.querySelector("#editTextInput").value;
    const noteId = document.querySelector("#editTextId").value;
    const noteEdits = {
        title: noteTitle,
        text: noteText,
    };

    firebase.database().ref(`users/${googleUserId}/${noteId}`).update(noteEdits);
    closeEditedNote();
}

const closeEditedNote = () => {
    editNoteModal = document.querySelector('#editNoteModal').classList.toggle('is-active');
}