/**
 * NOTES MODULE
 * Create, edit, and delete notes
 * Stores data in local storage
 */

const STORAGE_KEY = 'dws_notes';

export function initNotes(container) {
    if (!container) {
        console.warn('Notes container not found');
        return;
    }

    let notes = loadNotes();
    let editingId = null;

    // Create the main structure
    const notesCard = document.createElement('div');
    notesCard.className = 'notes-widget';
    notesCard.innerHTML = `
        <div class="notes-widget-inner">
            <div class="notes-widget-label">Notes</div>
            <div class="notes-input-section">
                <textarea id="notes-input" class="notes-input" placeholder="Write a note..."></textarea>
                <button id="save-note-btn" class="notes-save-btn">Save</button>
            </div>
            <div class="notes-list" id="notes-list"></div>
        </div>
    `;

    container.innerHTML = '';
    container.appendChild(notesCard);

    const textarea = notesCard.querySelector('#notes-input');
    const saveBtn = notesCard.querySelector('#save-note-btn');
    const notesList = notesCard.querySelector('#notes-list');

    /**
     * Load notes from local storage
     */
    function loadNotes() {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    }

    /**
     * Save notes to local storage
     */
    function saveNotes() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    }

    /**
     * Render all notes
     */
    function renderNotes() {
        notesList.innerHTML = '';

        if (notes.length === 0) {
            notesList.innerHTML = '<div class="notes-empty">No notes yet. Create one!</div>';
            return;
        }

        // Sort by newest first
        const sorted = [...notes].sort((a, b) => new Date(b.created) - new Date(a.created));

        sorted.forEach(note => {
            const noteItem = document.createElement('div');
            noteItem.className = 'note-item';

            const preview = note.text.substring(0, 50) + (note.text.length > 50 ? '...' : '');
            const createdDate = new Date(note.created).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            noteItem.innerHTML = `
                <div class="note-item-content">
                    <div class="note-item-preview">${escapeHtml(preview)}</div>
                    <div class="note-item-date">${createdDate}</div>
                </div>
                <div class="note-item-actions">
                    <button class="note-edit-btn" data-id="${note.id}" title="Edit">✎</button>
                    <button class="note-delete-btn" data-id="${note.id}" title="Delete">✕</button>
                </div>
            `;

            // Edit button handler
            const editBtn = noteItem.querySelector('.note-edit-btn');
            editBtn.addEventListener('click', () => {
                startEdit(note.id, note.text);
            });

            // Delete button handler
            const deleteBtn = noteItem.querySelector('.note-delete-btn');
            deleteBtn.addEventListener('click', () => {
                deleteNote(note.id);
            });

            // Click to view/edit
            const previewEl = noteItem.querySelector('.note-item-preview');
            previewEl.addEventListener('click', () => {
                startEdit(note.id, note.text);
            });

            notesList.appendChild(noteItem);
        });
    }

    /**
     * Add a new note
     */
    function addNote() {
        const text = textarea.value.trim();
        if (!text) {
            alert('Please write something!');
            return;
        }

        const newNote = {
            id: Date.now(),
            text: text,
            created: new Date().toISOString()
        };

        notes.push(newNote);
        saveNotes();
        textarea.value = '';
        cancelEdit();
        renderNotes();
        textarea.focus();
    }

    /**
     * Start editing a note
     */
    function startEdit(id, currentText) {
        editingId = id;
        textarea.value = currentText;
        textarea.focus();
        textarea.select();
        saveBtn.textContent = 'Update';
        saveBtn.classList.add('note-update-mode');
    }

    /**
     * Save edited note
     */
    function updateNote() {
        if (!editingId) return;

        const text = textarea.value.trim();
        if (!text) return;

        const note = notes.find(n => n.id === editingId);
        if (note) {
            note.text = text;
            saveNotes();
        }

        cancelEdit();
        renderNotes();
    }

    /**
     * Cancel editing
     */
    function cancelEdit() {
        editingId = null;
        textarea.value = '';
        saveBtn.textContent = 'Save';
        saveBtn.classList.remove('note-update-mode');
    }

    /**
     * Delete a note
     */
    function deleteNote(id) {
        if (confirm('Delete this note?')) {
            notes = notes.filter(n => n.id !== id);
            saveNotes();
            if (editingId === id) {
                cancelEdit();
            }
            renderNotes();
        }
    }

    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Save button handler
     */
    saveBtn.addEventListener('click', () => {
        if (editingId) {
            updateNote();
        } else {
            addNote();
        }
    });

    /**
     * Ctrl+Enter to save
     */
    textarea.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            if (editingId) {
                updateNote();
            } else {
                addNote();
            }
        }
        if (e.key === 'Escape' && editingId) {
            cancelEdit();
        }
    });

    // Initial render
    renderNotes();

    return {
        destroy() {
            // Cleanup if needed
        },
        addNote(text) {
            textarea.value = text;
            addNote();
        }
    };
}
