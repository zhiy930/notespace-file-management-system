<script setup>
import { ref, computed, onMounted } from "vue";
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

/* GENERAL STATE*/

const activePage = ref("home");

/* FOLDER STATE */

const folders = ref([]);
const selectedFolder = ref("all");

const showFolderModal = ref(false);
const newFolderName = ref("");
const creatingFolder = ref(false);
const folderError = ref("");

/* TO-DO STATE*/

const todos = ref([]);
const todosLoading = ref(false);
const todosError = ref("");

const showTodoModal = ref(false);

const newTodoTitle = ref("");
const newTodoFolderId = ref("");
const newTodoDueDate = ref("");

const creatingTodo = ref(false);
const todoFormError = ref("");

/* Edit To-Do State */

const showEditTodoModal = ref(false);
const editingTodo = ref(null);

const editTodoTitle = ref("");
const editTodoFolderId = ref("");
const editTodoDueDate = ref("");

const updatingTodo = ref(false);
const editTodoError = ref("");

const todoSearch = ref("");

const filteredTodos = computed(() => {
  const keyword = todoSearch.value
    .trim()
    .toLowerCase();

  if (!keyword) {
    return todos.value;
  }

  return todos.value.filter((todo) =>
    todo.title.toLowerCase().includes(keyword)
  );
});

/*NOTES STATE*/

const notes = ref([]);
const loading = ref(true);
const error = ref("");
const search = ref("");
const folderSearch = ref("");

/*CREATE NOTE STATE*/

const newFolderId = ref("");
const showModal = ref(false);
const newTitle = ref("");
const newContent = ref("");
const saving = ref(false);
const formError = ref("");

/* EDIT NOTE STATE*/

const editFolderId = ref("");
const showEditModal = ref(false);
const editingNote = ref(null);
const editTitle = ref("");
const editContent = ref("");
const updating = ref(false);
const editError = ref("");

/* DELETE NOTE STATE*/

const showDeleteModal = ref(false);
const noteToDelete = ref(null);
const deleting = ref(false);
const deleteError = ref("");

/* FETCH NOTES*/

const fetchTodos = async () => {
  todosLoading.value = true;
  todosError.value = "";

  try {
    const response = await fetch(
      `${API_URL}/api/todos`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch tasks");
    }

    const data = await response.json();

    todos.value = data.sort((a, b) => {

      // Pinned tasks first
      if (Number(a.pinned) !== Number(b.pinned)) {
        return Number(b.pinned) - Number(a.pinned);
      }

      // Newest tasks first
      return Number(b.id) - Number(a.id);
    });

  } catch (err) {
    todosError.value = err.message;

  } finally {
    todosLoading.value = false;
  }
};


const fetchFolders = async () => {
  try {
    const response = await fetch(
      `${API_URL}/api/folders`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch folders");
    }

    folders.value = await response.json();

  } catch (err) {
    console.error(err);
  }
};

const fetchNotes = async () => {
  loading.value = true;
  error.value = "";

  try {
    const response = await fetch(
      `${API_URL}/api/notes`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch notes");
    }

    notes.value = await response.json();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

/* SEARCH NOTES*/

const filteredNotes = computed(() => {
  const keyword = search.value.toLowerCase().trim();

  return notes.value.filter((note) => {

    const matchesSearch =
      note.title.toLowerCase().includes(keyword) ||
      note.content.toLowerCase().includes(keyword);

    const matchesFolder =
      selectedFolder.value === "all" ||
      Number(note.folder_id) === Number(selectedFolder.value);

    return matchesSearch && matchesFolder;
  });
});

/* OPEN EDIT TO-DO*/

const openEditTodoModal = (todo) => {
  editingTodo.value = todo;

  editTodoTitle.value = todo.title;
  editTodoFolderId.value = todo.folder_id || "";
  editTodoDueDate.value = todo.due_date || "";

  editTodoError.value = "";
  showEditTodoModal.value = true;
};

/* UPDATE TO-DO*/

const updateTodo = async () => {
  editTodoError.value = "";

  if (!editTodoTitle.value.trim()) {
    editTodoError.value = "Please enter a task title.";
    return;
  }

  if (!editingTodo.value) {
    return;
  }

  updatingTodo.value = true;

  try {
    const response = await fetch(
      `${API_URL}/api/todos/${editingTodo.value.id}`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          title: editTodoTitle.value.trim(),
          folder_id: editTodoFolderId.value || null,
          due_date: editTodoDueDate.value || null,

          // Keep its current completion status
          completed: Boolean(editingTodo.value.completed)
        })
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update task");
    }

    await fetchTodos();

    showEditTodoModal.value = false;
    editingTodo.value = null;

  } catch (err) {
    editTodoError.value = err.message;

  } finally {
    updatingTodo.value = false;
  }
};

/* CURRENT FOLDER NAME*/

const currentFolderName = computed(() => {
  if (selectedFolder.value === "all") {
    return "Notes";
  }

  const folder = folders.value.find(
    (folder) =>
      Number(folder.id) ===
      Number(selectedFolder.value)
  );

  return folder
    ? folder.name
    : "Notes";
});

/* FORMAT DATE*/

const formatDate = (date) => {
  if (!date) return "";

  const utcDate = date.includes("T")
    ? date
    : date.replace(" ", "T") + "Z";

  return new Date(utcDate).toLocaleString("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
};

/*CREATE NOTE*/

const createNote = async () => {
  formError.value = "";

  if (
    !newTitle.value.trim() ||
    !newContent.value.trim()
  ) {
    formError.value =
      "Please enter both a title and content.";

    return;
  }

  saving.value = true;

  try {
    const response = await fetch(
      `${API_URL}/api/notes`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          title: newTitle.value.trim(),
          content: newContent.value.trim(),
          folder_id: newFolderId.value || null
        })
      }
    );

    if (!response.ok) {
      throw new Error("Failed to create note");
    }

    await fetchNotes();

    newTitle.value = "";
    newContent.value = "";
    newFolderId.value = "";

    showModal.value = false;

  } catch (err) {
    formError.value = err.message;

  } finally {
    saving.value = false;
  }
};

/*OPEN EDIT MODAL*/

const openEditModal = (note) => {
  editingNote.value = note;

  editTitle.value = note.title;
  editContent.value = note.content;
  editFolderId.value = note.folder_id || "";

  editError.value = "";

  showEditModal.value = true;
};

/* UPDATE NOTE*/

const updateNote = async () => {
  editError.value = "";

  if (
    !editTitle.value.trim() ||
    !editContent.value.trim()
  ) {
    editError.value =
      "Please enter both a title and content.";

    return;
  }

  if (!editingNote.value) {
    return;
  }

  updating.value = true;

  try {
    const response = await fetch(
      `${API_URL}/api/notes/${editingNote.value.id}`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          title: editTitle.value.trim(),
          content: editContent.value.trim(),
          folder_id: editFolderId.value || null
        })
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update note");
    }

    await fetchNotes();

    showEditModal.value = false;
    editingNote.value = null;

  } catch (err) {
    editError.value = err.message;

  } finally {
    updating.value = false;
  }
};

/* OPEN DELETE MODAL */

const openDeleteModal = (note) => {
  noteToDelete.value = note;

  deleteError.value = "";

  showDeleteModal.value = true;
};

/* DELETE NOTE*/

const deleteNote = async () => {
  if (!noteToDelete.value) {
    return;
  }

  deleting.value = true;
  deleteError.value = "";

  try {
    const response = await fetch(
      `${API_URL}/api/notes/${noteToDelete.value.id}`,
      {
        method: "DELETE"
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete note");
    }

    await fetchNotes();

    showDeleteModal.value = false;
    noteToDelete.value = null;

  } catch (err) {
    deleteError.value = err.message;

  } finally {
    deleting.value = false;
  }
};

const createFolder = async () => {
  folderError.value = "";

  if (!newFolderName.value.trim()) {
    folderError.value = "Please enter a folder name.";
    return;
  }

  creatingFolder.value = true;

  try {
    const response = await fetch(
      `${API_URL}/api/folders`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          name: newFolderName.value.trim()
        })
      }
    );

    if (!response.ok) {
      throw new Error("Failed to create folder");
    }

    await fetchFolders();

    newFolderName.value = "";
    showFolderModal.value = false;

  } catch (err) {
    folderError.value = err.message;

  } finally {
    creatingFolder.value = false;
  }
};

/* CREATE TO-DO*/

const createTodo = async () => {
  todoFormError.value = "";

  if (!newTodoTitle.value.trim()) {
    todoFormError.value = "Please enter a task title.";
    return;
  }

  creatingTodo.value = true;

  try {
    const response = await fetch(
      `${API_URL}/api/todos`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          title: newTodoTitle.value.trim(),
          folder_id: newTodoFolderId.value || null,
          due_date: newTodoDueDate.value || null
        })
      }
    );

    if (!response.ok) {
      throw new Error("Failed to create task");
    }

    await fetchTodos();

    newTodoTitle.value = "";
    newTodoFolderId.value = "";
    newTodoDueDate.value = "";

    showTodoModal.value = false;

  } catch (err) {
    todoFormError.value = err.message;

  } finally {
    creatingTodo.value = false;
  }
};

/* TO-DO HELPERS*/

const getFolderName = (folderId) => {
  const folder = folders.value.find(
    (folder) =>
      Number(folder.id) === Number(folderId)
  );

  return folder
    ? folder.name
    : "Uncategorized";
};


const formatTodoDate = (date) => {
  if (!date) {
    return "";
  }

  return new Date(
    `${date}T00:00:00`
  ).toLocaleDateString("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
};

/* TOGGLE TO-DO*/

const toggleTodo = async (todo) => {
  try {
    const response = await fetch(
      `${API_URL}/api/todos/${todo.id}`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          title: todo.title,
          folder_id: todo.folder_id,
          due_date: todo.due_date,
          completed: !Boolean(todo.completed)
        })
      }
    );

    if (!response.ok) {
      const data = await response.json();

      throw new Error(
        data.error || "Failed to update task"
      );
    }

    await fetchTodos();

  } catch (err) {
    console.error("Toggle task error:", err);

    todosError.value = err.message;
  }
};

/* Pin To-Do */

const togglePinTodo = async (todo) => {
  try {
    const response = await fetch(
      `${API_URL}/api/todos/${todo.id}/pin`,
      {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          pinned: !Boolean(todo.pinned)
        })
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update pin");
    }

    await fetchTodos();

  } catch (err) {
    console.error("Pin task error:", err);
  }
};

/* DELETE TO-DO*/

const deleteTodo = async (todo) => {
  const confirmed = window.confirm(
    `Delete "${todo.title}"?`
  );

  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch(
      `${API_URL}/api/todos/${todo.id}`,
      {
        method: "DELETE"
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete task");
    }

    await fetchTodos();

  } catch (err) {
    todosError.value = err.message;
  }
};

/* CALENDAR STATE*/

const calendarDate = ref(new Date());
const selectedDate = ref(null);

/* CALENDAR*/

const calendarTitle = computed(() => {
  return calendarDate.value.toLocaleDateString("en-MY", {
    month: "long",
    year: "numeric"
  });
});


const calendarDays = computed(() => {
  const year = calendarDate.value.getFullYear();
  const month = calendarDate.value.getMonth();

  const firstDay = new Date(year, month, 1).getDay();

  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  const days = [];

  // Empty spaces before the first day
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Actual days
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(
      new Date(year, month, day)
    );
  }

  return days;
});

const previousMonth = () => {
  calendarDate.value = new Date(
    calendarDate.value.getFullYear(),
    calendarDate.value.getMonth() - 1,
    1
  );

  selectedDate.value = null;
};


const nextMonth = () => {
  calendarDate.value = new Date(
    calendarDate.value.getFullYear(),
    calendarDate.value.getMonth() + 1,
    1
  );

  selectedDate.value = null;
};

const isToday = (date) => {
  if (!date) return false;

  const today = new Date();

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const getLocalDateString = (date) => {
  if (!date) return "";

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};


const tasksForDate = (date) => {
  if (!date) return [];

  const dateString = getLocalDateString(date);

  return todos.value.filter(
    (todo) => todo.due_date === dateString
  );
};

const hasTasks = (date) => {
  return tasksForDate(date).length > 0;
};

const selectedDateTodos = computed(() => {
  if (!selectedDate.value) {
    return [];
  }

  return tasksForDate(selectedDate.value);
});

const selectedDateTitle = computed(() => {
  if (!selectedDate.value) {
    return "";
  }

  return selectedDate.value.toLocaleDateString(
    "en-MY",
    {
      weekday: "long",
      day: "numeric",
      month: "long"
    }
  );
});

/* Folder Management State */

const showEditFolderModal = ref(false);
const editingFolder = ref(null);

const editFolderName = ref("");
const updatingFolder = ref(false);
const editFolderError = ref("");

/* Open Edit Folder */

const openEditFolderModal = (folder) => {
  editingFolder.value = folder;
  editFolderName.value = folder.name;

  editFolderError.value = "";
  showEditFolderModal.value = true;
};

/* Update Folder */

const updateFolder = async () => {
  editFolderError.value = "";

  if (!editFolderName.value.trim()) {
    editFolderError.value = "Please enter a folder name.";
    return;
  }

  if (!editingFolder.value) {
    return;
  }

  updatingFolder.value = true;

  try {
    const response = await fetch(
      `${API_URL}/api/folders/${editingFolder.value.id}`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          name: editFolderName.value.trim()
        })
      }
    );

    if (!response.ok) {
      throw new Error("Failed to rename folder");
    }

    await fetchFolders();

    showEditFolderModal.value = false;
    editingFolder.value = null;

  } catch (err) {
    editFolderError.value = err.message;

  } finally {
    updatingFolder.value = false;
  }
};

/* Delete Folder */

const deleteFolder = async (folder) => {
  const confirmed = window.confirm(
    `Delete "${folder.name}"?\n\nNotes and tasks inside this folder will become Uncategorized.`
  );

  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch(
      `${API_URL}/api/folders/${folder.id}`,
      {
        method: "DELETE"
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete folder");
    }

    if (
      Number(selectedFolder.value) ===
      Number(folder.id)
    ) {
      selectedFolder.value = "all";
    }

    await Promise.all([
      fetchFolders(),
      fetchNotes(),
      fetchTodos()
    ]);

  } catch (err) {
    console.error("Delete folder error:", err);
  }
};

/* Pinned To-Dos */

const pinnedTodos = computed(() => {
  return todos.value.filter(
    (todo) =>
      Number(todo.pinned) === 1 &&
      Number(todo.completed) === 0
  );
});

/* Dashboard Statistics */

const totalNotes = computed(() => {
  return notes.value.length;
});

const openTasks = computed(() => {
  return todos.value.filter(
    (todo) => Number(todo.completed) === 0
  ).length;
});

const completedTasks = computed(() => {
  return todos.value.filter(
    (todo) => Number(todo.completed) === 1
  ).length;
});

const selectedFolderInfo = computed(() => {
  return folders.value.find(
    folder => Number(folder.id) === Number(selectedFolder.value)
  );
});

const folderNotes = computed(() => {
  const keyword = folderSearch.value
    .trim()
    .toLowerCase();

  return notes.value.filter((note) => {
    const belongsToFolder =
      Number(note.folder_id) === Number(selectedFolder.value);

    const matchesSearch =
      !keyword ||
      note.title.toLowerCase().includes(keyword) ||
      note.content.toLowerCase().includes(keyword);

    return belongsToFolder && matchesSearch;
  });
});

const folderTodos = computed(() => {
  const keyword = folderSearch.value
    .trim()
    .toLowerCase();

  return todos.value.filter((todo) => {
    const belongsToFolder =
      Number(todo.folder_id) === Number(selectedFolder.value);

    const matchesSearch =
      !keyword ||
      todo.title.toLowerCase().includes(keyword);

    return belongsToFolder && matchesSearch;
  });
});

/* INITIAL LOAD*/

onMounted(() => {
  fetchNotes();
  fetchFolders();
  fetchTodos()
});
</script>


<template>

  <div class="app">

    <!-- Sidebar-->

    <aside class="sidebar">

      <!-- Logo -->

      <div class="logo">

        <div class="logo-icon">
          N
        </div>

        <div>
          <h1> {{ currentFolderName }}</h1>
          <span>My Workspace</span>
        </div>

      </div>


      <!-- Navigation -->

      <nav class="navigation">

        <button
          :class="{ active: activePage === 'home' }"
          @click="activePage = 'home'"
        >
          <span>⌂</span>
          Home
        </button>


        <button
          :class="{ active: 
          activePage === 'notes' &&
          selectedFolder === 'all'
          }"
          @click="
          activePage = 'notes';
          selectedFolder = 'all';"
        >
          <span>▤</span>
          Notes
        </button>


        <button
          :class="{ active: activePage === 'todos' }"
          @click="activePage = 'todos'"
        >
          <span>✓</span>
          To-Do
        </button>

      </nav>


      <!-- Folders -->

      <div class="folder-section">

        <div class="folder-heading">

          <span>
            FOLDERS
          </span>

          <button
            class="add-folder-button"
            title="Create folder"
            @click="showFolderModal = true"
          >
            +
          </button>

        </div>

        <div
          v-if="folders.length === 0"
          class="folder-placeholder"
        >
          No folders yet
        </div>

        <div
          v-else
          class="folder-list"
        >
          <div
            v-for="folder in folders"
            :key="folder.id"
            class="folder-row"
            :class="{
              active:
                activePage === 'notes' &&
                Number(selectedFolder) === Number(folder.id)
            }"
          >

            <!-- Folder Name -->

            <button
              class="folder-main"
              @click="
                selectedFolder = folder.id;
                activePage = 'folder';
              "
            >
              <span class="folder-icon">
                ♡
              </span>

              <span class="folder-name">
                {{ folder.name }}
              </span>
            </button>


            <!-- Folder Actions -->

            <div class="folder-actions">

              <button
                type="button"
                title="Rename folder"
                @click.stop="openEditFolderModal(folder)"
              >
                ✎
              </button>

              <button
                type="button"
                title="Delete folder"
                @click.stop="deleteFolder(folder)"
              >
                ×
              </button>

            </div>

          </div>
        </div>

      </div>


      <!-- Sidebar Footer -->

      <div class="sidebar-footer">

        <span>
          NoteSpace
        </span>

        <small>
          Stay organized.
        </small>

      </div>

    </aside>


    <!-- App Content-->

    <div class="app-content">


      <!-- Home Page-->

      <main
        v-if="activePage === 'home'"
        class="page"
      >      

        <!-- Page Header -->

        <div class="page-header">

          <div>

            <p class="eyebrow">
              MY WORKSPACE
            </p>

            <h1>
              Home
            </h1>

            <p class="page-description">
              Keep your notes, tasks and ideas in one place.
            </p>

          </div>

        </div>


        <!-- Welcome Card -->

        <section class="welcome-card">

          <div>

            <span class="welcome-label">
              WELCOME BACK
            </span>

            <h2>
              A quiet place for your thoughts.
            </h2>

            <p>
              Capture ideas, organize your notes and
              keep track of what needs to be done.
            </p>

          </div>


          <div class="welcome-decoration">
            ✦
          </div>

        </section>

        <!-- Pinned Tasks -->

        <div
          v-if="pinnedTodos.length > 0"
          class="home-pinned-section"
        >
          <div class="home-section-header">

            <div>
              <h2>📌 Pinned Tasks</h2>
              <p>Your most important tasks, kept close.</p>
            </div>

            <button
              class="view-all-button"
              @click="activePage = 'todos'"
            >
              View all →
            </button>

          </div>


          <div class="home-pinned-list">

            <div
              v-for="todo in pinnedTodos.slice(0, 3)"
              :key="todo.id"
              class="home-pinned-task"
            >

              <button
                class="todo-checkbox"
                :class="{ checked: Number(todo.completed) === 1 }"
                @click="toggleTodo(todo)"
                :title="
                  Number(todo.completed) === 1
                    ? 'Mark as incomplete'
                    : 'Mark as complete'
                "
              >
                <span v-if="Number(todo.completed) === 1">✓</span>
              </button>


              <div class="home-pinned-content">

                <span class="home-pinned-title">
                  {{ todo.title }}
                </span>

                <div class="home-pinned-meta">

                  <span v-if="todo.folder_id">
                    {{ getFolderName(todo.folder_id) }}
                  </span>

                  <span v-if="todo.due_date">
                    {{ formatDate(todo.due_date) }}
                  </span>

                </div>

              </div>


              <button
                class="home-pin-button"
                title="Unpin task"
                @click="togglePinTodo(todo)"
              >
                📌
              </button>

            </div>

          </div>
        </div>

          <!-- CALENDAR-->

        <section class="calendar-section">

          <div class="calendar-card">

            <!-- Calendar Header -->

            <div class="calendar-header">

              <button
                class="calendar-nav"
                @click="previousMonth"
              >
                ‹
              </button>

              <h2>
                {{ calendarTitle }}
              </h2>

              <button
                class="calendar-nav"
                @click="nextMonth"
              >
                ›
              </button>

            </div>


            <!-- Week Names -->

            <div class="calendar-weekdays">

              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>

            </div>


            <!-- Calendar Days -->

            <div class="calendar-grid">

              <div
                v-for="(date, index) in calendarDays"
                :key="index"
                class="calendar-cell"
              >

                <button
                  v-if="date"
                  class="calendar-day"
                  :class="{
                    today: isToday(date),

                    selected:
                      selectedDate &&
                      getLocalDateString(selectedDate) ===
                      getLocalDateString(date),

                    'has-task': hasTasks(date)
                  }"
                  @click="selectedDate = date"
                >

                  <span>
                    {{ date.getDate() }}
                  </span>

                  <span
                    v-if="hasTasks(date)"
                    class="task-dot"
                  ></span>

                </button>

              </div>

            </div>

          </div>


          <!-- Selected Date -->

          <div class="calendar-agenda">

            <template v-if="selectedDate">

              <p class="eyebrow">
                SCHEDULE
              </p>

              <h3>
                {{ selectedDateTitle }}
              </h3>


              <div
                v-if="selectedDateTodos.length === 0"
                class="calendar-empty"
              >
                Nothing due on this day.
              </div>


              <div
                v-for="todo in selectedDateTodos"
                :key="todo.id"
                class="calendar-task"
              >

                <button
                  class="home-todo-check"
                  :class="{ checked: todo.completed }"
                  @click="toggleTodo(todo)"
                >
                  {{ todo.completed ? "✓" : "" }}
                </button>

                <div>

                  <span
                    :class="{
                      'home-todo-completed':
                        todo.completed
                    }"
                  >
                    {{ todo.title }}
                  </span>

                  <small>
                    {{ getFolderName(todo.folder_id) }}
                  </small>

                </div>

              </div>

            </template>


            <template v-else>

              <div class="calendar-select-message">

                <span>✦</span>

                <p>
                  Select a date to see what's planned.
                </p>

              </div>

            </template>

          </div>

        </section>


        <!-- Dashboard -->

        <section class="dashboard-grid">


          <!-- Recent Notes -->

          <div class="dashboard-card">

            <div class="dashboard-card-header">

              <h3>
                Recent Notes
              </h3>

              <button
                @click="activePage = 'notes'"
              >
                View all
              </button>

            </div>


            <div
              v-if="notes.length === 0"
              class="mini-empty"
            >
              No notes yet.
            </div>


            <div
              v-for="note in notes.slice(0, 3)"
              :key="note.id"
              class="recent-note"
            >

              <div class="recent-note-icon">
                ▤
              </div>

              <div>

                <strong>
                  {{ note.title }}
                </strong>

                <span>
                  {{ formatDate(note.updated_at) }}
                </span>

              </div>

            </div>

          </div>


          <!-- Today's Tasks -->

          <div class="dashboard-card">

            <div class="dashboard-card-header">

              <h3>
                Tasks
              </h3>

              <button
                @click="activePage = 'todos'"
              >
                View all
              </button>

            </div>

            <div
              v-if="todos.length === 0"
              class="mini-empty"
            >
              No tasks yet.
            </div>

            <div
              v-for="todo in todos.slice(0, 4)"
              :key="todo.id"
              class="home-todo"
            >
              <button
                class="home-todo-check"
                :class="{ checked: todo.completed }"
                @click="toggleTodo(todo)"
              >
                {{ todo.completed ? "✓" : "" }}
              </button>

              <div>
                <span
                  :class="{
                    'home-todo-completed': todo.completed
                  }"
                >
                  {{ todo.title }}
                </span>

                <small v-if="todo.due_date">
                  {{ formatTodoDate(todo.due_date) }}
                </small>
              </div>
            </div>

          </div>

        </section>

      </main>
      <!-- Folder Page -->

      <main
        v-if="activePage === 'folder'"
        class="page"
      >
        <div class="page-header">
          <div>
            <p class="eyebrow">
              FOLDER
            </p>

            <h1>
              {{ selectedFolderInfo?.name || "Folder" }}
            </h1>

            <p class="page-description">
              Your notes and tasks in one place.
            </p>
          </div>
        </div>

        <!-- Folder Search -->
        <section class="toolbar">

          <div class="search-box">

            <span>
              ⌕
            </span>

            <input
              v-model="folderSearch"
              type="text"
              :placeholder="`Search in ${selectedFolderInfo?.name || 'folder'}...`"
            />

          </div>

          <div class="note-count">
            {{ folderNotes.length + folderTodos.length }}

            {{
              folderNotes.length + folderTodos.length === 1
                ? "item"
                : "items"
            }}
          </div>

        </section>

        <!-- NOTES -->

        <section class="folder-section">

          <div class="folder-section-header">
            <div>
              <p class="eyebrow">NOTES</p>
              <h2>Notes</h2>
            </div>

            <button
              class="folder-add-button"
              @click="
                newFolderId = selectedFolder;
                showModal = true;
              "
            >
              + New Note
            </button>
          </div>


          <div
            v-if="folderNotes.length === 0"
            class="folder-empty"
          >
            {{
              folderSearch.trim()
                ? "No matching notes found."
                : "No notes in this folder yet."
            }}
          </div>


          <div
            v-else
            class="notes-grid"
          >
            <article
              v-for="note in folderNotes"
              :key="note.id"
              class="note-card"
            >
              <div class="note-content">
                <h2>{{ note.title }}</h2>
                <p>{{ note.content }}</p>
              </div>

              <div class="note-footer">
                <span class="date">
                  {{ formatDate(note.updated_at) }}
                </span>

                <div class="actions">
                  <button
                    class="icon-button"
                    @click="openEditModal(note)"
                  >
                    ✎
                  </button>

                  <button
                    class="icon-button delete"
                    @click="openDeleteModal(note)"
                  >
                    🗑
                  </button>
                </div>
              </div>
            </article>
          </div>

        </section>


        <!-- TO-DOS -->

        <section class="folder-section">

          <div class="folder-section-header">
            <div>
              <p class="eyebrow">TASKS</p>
              <h2>To-Do</h2>
            </div>

            <button
              class="folder-add-button"
              @click="
                newTodoFolderId = selectedFolder;
                showTodoModal = true;
              "
            >
              + New Task
            </button>
          </div>


          <div
            v-if="folderTodos.length === 0"
            class="folder-empty"
          >
            No tasks in this folder yet.
          </div>


          <div
            v-else
            class="todo-list"
          >
            <article
              v-for="todo in folderTodos"
              :key="todo.id"
              class="todo-item"
              :class="{
                completed: todo.completed,
                pinned: Number(todo.pinned) === 1
              }"
            >

              <button
                class="todo-check"
                :class="{ checked: todo.completed }"
                @click="toggleTodo(todo)"
              >
                {{ todo.completed ? "✓" : "" }}
              </button>


              <div class="todo-details">
                <h3>{{ todo.title }}</h3>

                <div class="todo-meta">
                  <span v-if="todo.due_date">
                    Due {{ formatTodoDate(todo.due_date) }}
                  </span>
                </div>
              </div>


              <div class="todo-actions">

                <button
                  class="todo-pin"
                  :class="{ pinned: Boolean(todo.pinned) }"
                  @click="togglePinTodo(todo)"
                >
                  {{ Boolean(todo.pinned) ? "📌" : "♡" }}
                </button>

                <button
                  class="todo-edit"
                  @click="openEditTodoModal(todo)"
                >
                  ✎
                </button>

                <button
                  class="todo-delete"
                  @click="deleteTodo(todo)"
                >
                  🗑
                </button>

              </div>

            </article>
          </div>

        </section>

      </main>


      <!-- Notes Page-->

      <main
        v-if="activePage === 'notes'"
        class="page"
      >

        <!-- Notes Header -->

        <div class="page-header">

          <div>

            <p class="eyebrow">
              MY LIBRARY
            </p>

            <h1>
              Notes
            </h1>

            <p class="page-description">
              Capture ideas and keep everything organized.
            </p>

          </div>


          <button
            class="new-note-btn"
            @click="showModal = true"
          >
            <span>+</span>
            New Note
          </button>

        </div>


        <!-- Toolbar -->

        <section class="toolbar">

          <div class="search-box">

            <span>
              ⌕
            </span>

            <input
              v-model="search"
              type="text"
              placeholder="Search notes..."
            />

          </div>


          <div class="note-count">

            {{ notes.length }}

            {{
              notes.length === 1
                ? "note"
                : "notes"
            }}

          </div>

        </section>


        <!-- Loading -->

        <div
          v-if="loading"
          class="status"
        >
          Loading your notes...
        </div>


        <!-- Error -->

        <div
          v-else-if="error"
          class="status error"
        >
          {{ error }}
        </div>


        <!-- Empty Notes -->

        <div
          v-else-if="notes.length === 0"
          class="empty-state"
        >

          <div class="empty-icon">
            📝
          </div>

          <h2>
            No notes yet
          </h2>

          <p>
            Create your first note and start
            capturing your ideas.
          </p>

          <button
            class="empty-button"
            @click="showModal = true"
          >
            + Create Note
          </button>

        </div>


        <!-- No Search Results -->

        <div
          v-else-if="filteredNotes.length === 0"
          class="empty-state"
        >

          <div class="empty-icon">
            🔍
          </div>

          <h2>
            No notes found
          </h2>

          <p>
            Try searching for something else.
          </p>

        </div>


        <!-- Notes Grid -->

        <section
          v-else
          class="notes-grid"
        >

          <article
            v-for="note in filteredNotes"
            :key="note.id"
            class="note-card"
          >

            <!-- Note Content -->

            <div class="note-content">

              <h2>
                {{ note.title }}
              </h2>

              <p>
                {{ note.content }}
              </p>

            </div>


            <!-- Note Footer -->

            <div class="note-footer">

              <span class="date">
                {{ formatDate(note.updated_at) }}
              </span>


              <div class="actions">

                <!-- Edit -->

                <button
                  class="icon-button"
                  title="Edit note"
                  @click="openEditModal(note)"
                >
                  ✎
                </button>


                <!-- Delete -->

                <button
                  class="icon-button delete"
                  title="Delete note"
                  @click="openDeleteModal(note)"
                >
                  🗑
                </button>

              </div>

            </div>

          </article>

        </section>

      </main>


      <!-- To-Do Page-->

      <main
        v-if="activePage === 'todos'"
        class="page"
      >

        <div class="page-header">

          <div>

            <p class="eyebrow">
              MY TASKS
            </p>

            <h1>
              To-Do
            </h1>

            <p class="page-description">
              Keep track of the things that matter.
            </p>

          </div>


          <button 
           class="new-note-btn"
           @click="showTodoModal = true"
           >

            <span>
              +
            </span>

            New Task

          </button>

        </div>
        <!-- To-Do Search -->

        <section class="toolbar">
          <div class="search-box">
            <span>⌕</span>

            <input
              v-model="todoSearch"
              type="text"
              placeholder="Search tasks..."
            />
          </div>

          <div class="note-count">
            {{ filteredTodos.length }}
            {{ filteredTodos.length === 1 ? "task" : "tasks" }}
          </div>
        </section>


        <!-- Loading -->

        <div
          v-if="todosLoading"
          class="status"
        >
          Loading your tasks...
        </div>


        <!-- Error -->

        <div
          v-else-if="todosError"
          class="status error"
        >
          {{ todosError }}
        </div>


        <!-- Empty -->

        <section
          v-else-if="todos.length === 0"
          class="todo-placeholder"
        >

          <div class="todo-placeholder-icon">
            ✓
          </div>

          <h2>
            No tasks yet
          </h2>

          <p>
            Add your first task and start
            getting things done.
          </p>

        </section>

        <!-- No Search Results -->
        <section
          v-else-if="filteredTodos.length === 0"
          class="todo-placeholder"
        >
          <div class="todo-placeholder-icon">
            🔍
          </div>

          <h2>
            No tasks found
          </h2>

          <p>
            Try searching for something else.
          </p>
        </section>


        <!-- Task List -->

        <section
          v-else
          class="todo-list"
        >

          <article
            v-for="todo in filteredTodos"
            :key="todo.id"
            class="todo-item"
            :class="{
              completed: todo.completed,
              pinned: Number(todo.pinned) === 1
            }"
          >

            <button
              class="todo-check"
              :class="{ checked: todo.completed }"
              title="Toggle task"
              @click="toggleTodo(todo)"
            >
              {{ todo.completed ? "✓" : "" }}
            </button>


            <div class="todo-details">

              <h3>
                {{ todo.title }}
              </h3>

              <div class="todo-meta">

                <span v-if="todo.folder_id">
                  {{ getFolderName(todo.folder_id) }}
                </span>

                <span v-else>
                  Uncategorized
                </span>

                <span v-if="todo.due_date">
                  Due {{ formatTodoDate(todo.due_date) }}
                </span>

              </div>

            </div>

            <div class="todo-actions">

              <!-- Pin Task -->

              <button
                class="todo-pin"
                :class="{ pinned: Number(todo.pinned) === 1 }"
                :title="
                  Number(todo.pinned) === 1
                    ? 'Unpin task'
                    : 'Pin task'
                "
                @click="togglePinTodo(todo)"
              >
                📌
              </button>


              <!-- Edit Task -->

              <button
                class="todo-edit"
                title="Edit task"
                @click="openEditTodoModal(todo)"
              >
                ✎
              </button>


              <!-- Delete Task -->

              <button
                class="todo-delete"
                title="Delete task"
                @click="deleteTodo(todo)"
              >
                🗑
              </button>

            </div>

          </article>

        </section>

      </main>


      <!-- Create Note Modal-->

      <div
        v-if="showModal"
        class="modal-overlay"
        @click.self="showModal = false"
      >

        <div class="modal">


          <!-- Modal Header -->

          <div class="modal-header">

            <div>

              <h2>
                Create New Note
              </h2>

              <p>
                Capture what's on your mind.
              </p>

            </div>


            <button
              class="close-button"
              @click="showModal = false"
            >
              ×
            </button>

          </div>


          <!-- Create Form -->

          <form
            @submit.prevent="createNote"
          >


            <!-- Title -->

            <div class="form-group">

              <label for="title">
                Title
              </label>

              <input
                id="title"
                v-model="newTitle"
                type="text"
                placeholder="Enter note title..."
                maxlength="100"
              />

              <div class="character-count">
                {{ newTitle.length }}/100
              </div>

            </div>

            <div class="form-group">

            <label for="folder">
              Folder
            </label>

            <select
              id="folder"
              v-model="newFolderId"
            >
              <option value="">
                Uncategorized
              </option>

              <option
                v-for="folder in folders"
                :key="folder.id"
                :value="folder.id"
              >
                {{ folder.name }}
              </option>
            </select>

          </div>


            <!-- Content -->

            <div class="form-group">

              <label for="content">
                Content
              </label>

              <textarea
                id="content"
                v-model="newContent"
                placeholder="Write your note..."
                rows="7"
                maxlength="2000"
              ></textarea>

              <div class="character-count">
                {{ newContent.length }}/2000
              </div>

            </div>


            <!-- Error -->

            <p
              v-if="formError"
              class="form-error"
            >
              {{ formError }}
            </p>


            <!-- Buttons -->

            <div class="modal-actions">

              <button
                type="button"
                class="cancel-button"
                @click="showModal = false"
              >
                Cancel
              </button>


              <button
                type="submit"
                class="save-button"
                :disabled="
                  saving ||
                  !newTitle.trim() ||
                  !newContent.trim()
                "
              >

                {{
                  saving
                    ? "Saving..."
                    : "Create Note"
                }}

              </button>

            </div>

          </form>

        </div>

      </div>


      <!-- Edit Note Modal-->

      <div
        v-if="showEditModal"
        class="modal-overlay"
        @click.self="showEditModal = false"
      >

        <div class="modal">


          <!-- Header -->

          <div class="modal-header">

            <div>

              <h2>
                Edit Note
              </h2>

              <p>
                Make changes to your note.
              </p>

            </div>


            <button
              class="close-button"
              @click="showEditModal = false"
            >
              ×
            </button>

          </div>


          <!-- Edit Form -->

          <form
            @submit.prevent="updateNote"
          >


            <!-- Title -->

            <div class="form-group">

              <label for="edit-title">
                Title
              </label>

              <input
                id="edit-title"
                v-model="editTitle"
                type="text"
                placeholder="Enter note title..."
                maxlength="100"
              />

              <div class="character-count">
                {{ editTitle.length }}/100
              </div>

            </div>

            <div class="form-group">

            <label for="edit-folder">
              Folder
            </label>

            <select
              id="edit-folder"
              v-model="editFolderId"
            >
              <option value="">
                Uncategorized
              </option>

              <option
                v-for="folder in folders"
                :key="folder.id"
                :value="folder.id"
              >
                {{ folder.name }}
              </option>
            </select>

            </div>


            <!-- Content -->

            <div class="form-group">

              <label for="edit-content">
                Content
              </label>

              <textarea
                id="edit-content"
                v-model="editContent"
                placeholder="Write your note..."
                rows="7"
                maxlength="2000"
              ></textarea>

              <div class="character-count">
                {{ editContent.length }}/2000
              </div>

            </div>


            <!-- Error -->

            <p
              v-if="editError"
              class="form-error"
            >
              {{ editError }}
            </p>


            <!-- Buttons -->

            <div class="modal-actions">

              <button
                type="button"
                class="cancel-button"
                @click="showEditModal = false"
              >
                Cancel
              </button>


              <button
                type="submit"
                class="save-button"
                :disabled="
                  updating ||
                  !editTitle.trim() ||
                  !editContent.trim()
                "
              >

                {{
                  updating
                    ? "Saving..."
                    : "Save Changes"
                }}

              </button>

            </div>

          </form>

        </div>

      </div>


      <!-- Delete Confirmation-->

      <div
        v-if="showDeleteModal"
        class="modal-overlay"
        @click.self="showDeleteModal = false"
      >

        <div class="modal delete-modal">


          <div class="delete-icon">
            🗑️
          </div>


          <h2>
            Delete Note?
          </h2>


          <p class="delete-message">

            Are you sure you want to delete

            <strong>
              "{{ noteToDelete?.title }}"
            </strong>?

          </p>


          <p class="delete-warning">
            This action cannot be undone.
          </p>


          <p
            v-if="deleteError"
            class="form-error"
          >
            {{ deleteError }}
          </p>


          <div class="modal-actions delete-actions">


            <button
              type="button"
              class="cancel-button"
              :disabled="deleting"
              @click="showDeleteModal = false"
            >
              Cancel
            </button>


            <button
              type="button"
              class="delete-confirm-button"
              :disabled="deleting"
              @click="deleteNote"
            >

              {{
                deleting
                  ? "Deleting..."
                  : "Delete Note"
              }}

            </button>

          </div>

        </div>

      </div>
      <!-- Create Folder Modal-->

      <div
        v-if="showFolderModal"
        class="modal-overlay"
        @click.self="showFolderModal = false"
      >
        <div class="modal folder-modal">

          <div class="modal-header">

            <div>
              <h2>Create Folder</h2>

              <p>
                Organize your notes and tasks.
              </p>
            </div>

            <button
              class="close-button"
              @click="showFolderModal = false"
            >
              ×
            </button>

          </div>

          <form @submit.prevent="createFolder">

            <div class="form-group">

              <label for="folder-name">
                Folder Name
              </label>

              <input
                id="folder-name"
                v-model="newFolderName"
                type="text"
                maxlength="50"
                placeholder="e.g. Work, Personal, School..."
              />

              <div class="character-count">
                {{ newFolderName.length }}/50
              </div>

            </div>

            <p
              v-if="folderError"
              class="form-error"
            >
              {{ folderError }}
            </p>

            <div class="modal-actions">

              <button
                type="button"
                class="cancel-button"
                @click="showFolderModal = false"
              >
                Cancel
              </button>

              <button
                type="submit"
                class="save-button"
                :disabled="
                  creatingFolder ||
                  !newFolderName.trim()
                "
              >
                {{
                  creatingFolder
                    ? "Creating..."
                    : "Create Folder"
                }}
              </button>

            </div>

          </form>

        </div>
      </div>


    </div>

        <!-- Create To-Do Modal-->

        <div
          v-if="showTodoModal"
          class="modal-overlay"
          @click.self="showTodoModal = false"
        >
          <div class="modal">

            <div class="modal-header">
              <div>
                <h2>New Task</h2>
                <p>Add something you need to get done.</p>
              </div>

              <button
                class="close-button"
                @click="showTodoModal = false"
              >
                ×
              </button>
            </div>

            <form @submit.prevent="createTodo">

              <div class="form-group">
                <label for="todo-title">Task</label>

                <input
                  id="todo-title"
                  v-model="newTodoTitle"
                  type="text"
                  maxlength="150"
                  placeholder="What needs to be done?"
                />

                <div class="character-count">
                  {{ newTodoTitle.length }}/150
                </div>
              </div>

              <div class="form-group">
                <label for="todo-folder">Folder</label>

                <select
                  id="todo-folder"
                  v-model="newTodoFolderId"
                >
                  <option value="">
                    Uncategorized
                  </option>

                  <option
                    v-for="folder in folders"
                    :key="folder.id"
                    :value="folder.id"
                  >
                    {{ folder.name }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label for="todo-date">Due Date</label>

                <input
                  id="todo-date"
                  v-model="newTodoDueDate"
                  type="date"
                />
              </div>

              <p
                v-if="todoFormError"
                class="form-error"
              >
                {{ todoFormError }}
              </p>

              <div class="modal-actions">

                <button
                  type="button"
                  class="cancel-button"
                  @click="showTodoModal = false"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  class="save-button"
                  :disabled="
                    creatingTodo ||
                    !newTodoTitle.trim()
                  "
                >
                  {{
                    creatingTodo
                      ? "Creating..."
                      : "Create Task"
                  }}
                </button>

              </div>

            </form>

          </div>
        </div>
        

        <!-- Edit To-Do Modal-->

        <div
          v-if="showEditTodoModal"
          class="modal-overlay"
          @click.self="showEditTodoModal = false"
        >
          <div class="modal">

            <div class="modal-header">

              <div>
                <h2>Edit Task</h2>
                <p>Update your task details.</p>
              </div>

              <button
                class="close-button"
                @click="showEditTodoModal = false"
              >
                ×
              </button>

            </div>

            <form @submit.prevent="updateTodo">

              <div class="form-group">

                <label for="edit-todo-title">
                  Task
                </label>

                <input
                  id="edit-todo-title"
                  v-model="editTodoTitle"
                  type="text"
                  maxlength="150"
                  placeholder="What needs to be done?"
                />

                <div class="character-count">
                  {{ editTodoTitle.length }}/150
                </div>

              </div>

              <div class="form-group">

                <label for="edit-todo-folder">
                  Folder
                </label>

                <select
                  id="edit-todo-folder"
                  v-model="editTodoFolderId"
                >
                  <option value="">
                    Uncategorized
                  </option>

                  <option
                    v-for="folder in folders"
                    :key="folder.id"
                    :value="folder.id"
                  >
                    {{ folder.name }}
                  </option>
                </select>

              </div>

              <div class="form-group">

                <label for="edit-todo-date">
                  Due Date
                </label>

                <input
                  id="edit-todo-date"
                  v-model="editTodoDueDate"
                  type="date"
                />

              </div>

              <p
                v-if="editTodoError"
                class="form-error"
              >
                {{ editTodoError }}
              </p>

              <div class="modal-actions">

                <button
                  type="button"
                  class="cancel-button"
                  @click="showEditTodoModal = false"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  class="save-button"
                  :disabled="
                    updatingTodo ||
                    !editTodoTitle.trim()
                  "
                >
                  {{
                    updatingTodo
                      ? "Saving..."
                      : "Save Changes"
                  }}
                </button>

              </div>

            </form>

          </div>
        </div>

      <!-- Rename Folder Modal-->

      <div
        v-if="showEditFolderModal"
        class="modal-overlay"
        @click.self="showEditFolderModal = false"
      >
        <div class="modal">

          <div class="modal-header">

            <div>
              <h2>Rename Folder</h2>
              <p>Give your folder a new name.</p>
            </div>

            <button
              class="close-button"
              @click="showEditFolderModal = false"
            >
              ×
            </button>

          </div>


          <form @submit.prevent="updateFolder">

            <div class="form-group">

              <label for="edit-folder-name">
                Folder Name
              </label>

              <input
                id="edit-folder-name"
                v-model="editFolderName"
                type="text"
                maxlength="50"
                placeholder="Enter folder name..."
              />

              <div class="character-count">
                {{ editFolderName.length }}/50
              </div>

            </div>


            <p
              v-if="editFolderError"
              class="form-error"
            >
              {{ editFolderError }}
            </p>


            <div class="modal-actions">

              <button
                type="button"
                class="cancel-button"
                @click="showEditFolderModal = false"
              >
                Cancel
              </button>

              <button
                type="submit"
                class="save-button"
                :disabled="
                  updatingFolder ||
                  !editFolderName.trim()
                "
              >
                {{
                  updatingFolder
                    ? "Saving..."
                    : "Save Changes"
                }}
              </button>

            </div>

          </form>

        </div>
      </div>
        
    </div>
    <!-- END app-content -->
  

</template>