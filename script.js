import { BASE_URL } from './config.js';
import { refreshAccessTokenIfNeeded } from './auth.js';

const axiosJWT = axios.create();
axiosJWT.interceptors.request.use(async (config) => {
    const token = await refreshAccessTokenIfNeeded();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

const noteForm = document.getElementById('noteForm');
const inputAuthor = document.getElementById('inputAuthor');
const inputTitle = document.getElementById('inputTitle');
const inputNotes = document.getElementById('inputNotes');
const notesTable = document.getElementById('notesTable');

const backButton = document.getElementById('backButton');
if (backButton) {
    backButton.addEventListener('click', function () {
        window.history.back();
    });
}

if (notesTable) {
    const notesTableBody = document.getElementById('notesTable').getElementsByTagName('tbody')[0];
    async function fetchNotes() {
        try {
            const response = await axiosJWT.get(`${BASE_URL}/notes`);

            const notes = response.data;
            displayNotes(notes);
        } catch (error) {
            console.error('Error fetching notes:', error);
        }
    }


    // display notes
    function displayNotes(notes) {
        notesTableBody.innerHTML = '';
        notes.forEach(note => {
            const newRow = notesTableBody.insertRow();
            const authorCell = newRow.insertCell(0);
            const titleCell = newRow.insertCell(1);
            const noteCell = newRow.insertCell(2);
            const actionCell = newRow.insertCell(3);

            authorCell.textContent = note.author;
            titleCell.textContent = note.title;
            noteCell.textContent = note.notes;

            // Edit button
            const editButton = document.createElement('button');
            editButton.className = 'edit-button';
            editButton.textContent = 'Edit';
            editButton.onclick = function () {
                window.location.href = `edit-note.html?id=${note.id}`;
            };

            // Delete button
            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-button';
            deleteButton.textContent = 'Delete';
            deleteButton.onclick = function () {
                deleteNoteFromDB(note.id, newRow);
            };

            actionCell.appendChild(editButton);
            actionCell.appendChild(deleteButton);
        });
    }

    // delete
    async function deleteNoteFromDB(noteId, row) {
        try {
            const response = await axiosJWT.delete(`${BASE_URL}/delete-note/${noteId}`);
            if (response.status === 200) {
                row.remove();
                alert('Note deleted successfully!');
            } else {
                console.error('Failed to delete the note');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error deleting note');
        }
    }

    fetchNotes();
}

// Add a new note
if (noteForm) {
    noteForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const newNote = {
            author: inputAuthor.value,
            title: inputTitle.value,
            notes: inputNotes.value
        };

        try {
            const response = await axiosJWT.post(`${BASE_URL}/add-note`, newNote);
            inputAuthor.value = '';
            inputTitle.value = '';
            inputNotes.value = '';
            alert('Note added successfully!');
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Error adding note:', error);
            alert('Error adding note');
        }
    });
}

// edit logic
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const noteId = urlParams.get('id');


    if (noteId) {
        try {
            const response = await axiosJWT.get(`${BASE_URL}/note/${noteId}`);

            const note = response.data;
            document.getElementById('inputAuthor').value = note.author;
            document.getElementById('inputTitle').value = note.title;
            document.getElementById('inputNotes').value = note.notes;
            inputNotes.dispatchEvent(new Event('input'));

            // Handle form submission
            const editNoteForm = document.getElementById('editNoteForm');
            editNoteForm.addEventListener('submit', async (event) => {
                event.preventDefault();

                const updatedNote = {
                    author: document.getElementById('inputAuthor').value,
                    title: document.getElementById('inputTitle').value,
                    notes: document.getElementById('inputNotes').value
                };

                try {
                    await axiosJWT.put(`${BASE_URL}/edit-note/${noteId}`, updatedNote);
                    alert('Note edited successfully!');
                    window.location.href = 'index.html';
                } catch (error) {
                    console.error('Error updating note:', error);
                    alert('Error updating note');
                }
            });
        } catch (error) {
            console.error('Error fetching note:', error);
        }
    }
});

const textarea = document.getElementById('inputNotes');
if (textarea) {
    textarea.addEventListener('input', () => {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    });
}
