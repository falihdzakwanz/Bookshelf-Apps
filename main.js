const books = [];
const RENDER_EVENT = 'render-book';

const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';

document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('inputBook');
    submitForm.addEventListener('submit', function (event) {
        addBook();
        event.preventDefault();
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});


function addBook() {
    const textTitle = document.getElementById('inputBookTitle').value;
    const textBookAuthor = document.getElementById('inputBookAuthor').value;
    const textPublicationYear = document.getElementById('inputBookYear').value;
    const isComplete = document.getElementById('inputBookIsComplete').checked;
    const generatedID = generateId();

    const year = parseInt(textPublicationYear);

    if (isNaN(year)) {
        alert('Year must be a number.');
        return;
    }

    const booksObject = generateBooksObject(generatedID, textTitle, textBookAuthor, year, isComplete);
    books.push(booksObject);
    document.getElementById('inputBookTitle').value = '';
    document.getElementById('inputBookAuthor').value = '';
    document.getElementById('inputBookYear').value = '';
    document.getElementById('inputBookIsComplete').checked = false;

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function generateId() {
    return +new Date();
}

function generateBooksObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year,
        isComplete
    }
}

document.addEventListener(RENDER_EVENT, function () {
    const incompleteBooks = document.getElementById('incompleteBookshelfList');
    incompleteBooks.innerHTML = '';

    const completeBooks = document.getElementById('completeBookshelfList');
    completeBooks.innerHTML = '';

    for (const bookItem of books) {
        const bookElement = makeBook(bookItem);
        if (!bookItem.isComplete) {
            incompleteBooks.append(bookElement);
        } else {
            completeBooks.append(bookElement);
        }
    }
});


function makeBook(booksObject) {
    const bookId = booksObject.id;

    const bookArticle = document.createElement('article');
    bookArticle.setAttribute('data-bookid', `book-${bookId}`);
    bookArticle.setAttribute('data-testid', 'bookItem');
    bookArticle.classList.add('book_item');

    const bookTitle = document.createElement('h3');
    bookTitle.innerText = booksObject.title;
    bookTitle.setAttribute('data-testid', 'bookItemTitle');

    const bookAuthor = document.createElement('p');
    bookAuthor.innerText = `Author  : ${booksObject.author}`;
    bookAuthor.setAttribute('data-testid', 'bookItemAuthor');

    const bookPublicationYear = document.createElement('p');
    bookPublicationYear.innerText = `Year  : ${booksObject.year}`;
    bookPublicationYear.setAttribute('data-testid', 'bookItemYear');


    bookArticle.append(bookTitle, bookAuthor, bookPublicationYear);

    const actionGroup = document.createElement('div');
    actionGroup.classList.add('action');

    if (booksObject.isComplete) {
        const undoImage = document.createElement('img');
        undoImage.setAttribute('src', 'assets/back-arrow.png');

        const undoButton = document.createElement('button');
        undoButton.setAttribute('data-testid', 'bookItemIncompleteButton');
        undoButton.append(undoImage);

        undoButton.addEventListener('click', function () {
            undoDoneReadBook(booksObject.id);
        });
        actionGroup.append(undoButton);
    } else {
        const checkImage = document.createElement('img');
        checkImage.setAttribute('src', 'assets/check.png')

        const checkButton = document.createElement('button');
        checkButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
        checkButton.append(checkImage);

        checkButton.addEventListener('click', function () {
            addDoneReadBook(booksObject.id);
        });
        actionGroup.append(checkButton);
    }

    const trashImage = document.createElement('img');
    trashImage.setAttribute('src', 'assets/trash-bin.png');

    const trashButton = document.createElement('button');
    trashButton.setAttribute('data-testid', 'bookItemDeleteButton');
    trashButton.append(trashImage);

    trashButton.addEventListener('click', function () {
        removeBook(booksObject.id);
    });

    const editImage = document.createElement('img');
    editImage.setAttribute('src', 'assets/pen.png');

    const editButton = document.createElement('button');
    editButton.setAttribute('data-testid', 'bookItemEditButton');
    editButton.append(editImage);

    editButton.addEventListener('click', function () {
        editBook(booksObject.id);
    });

    actionGroup.append(editButton, trashButton);
    bookArticle.append(actionGroup);
    return bookArticle;
}


function addDoneReadBook(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBook(bookId) {
    for (const book of books) {
        if (book.id === bookId) {
            return book;
        }
    }
    return null;
}

let confirmDeleteHandler = null;
let cancelDeleteHandler = null;

function removeBook(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    const deleteBookModal = document.getElementById('deleteBookModal');
    const confirmDeleteButton = document.getElementById('confirmDelete');
    const cancelDeleteButton = document.getElementById('cancelDelete');

    deleteBookModal.style.display = 'block';

    if (confirmDeleteHandler) {
        confirmDeleteButton.removeEventListener('click', confirmDeleteHandler);
    }

    confirmDeleteHandler = function () {
        books.splice(bookTarget, 1);
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
        deleteBookModal.style.display = 'none';
    }

    confirmDeleteButton.addEventListener('click', confirmDeleteHandler);

    if (cancelDeleteHandler) {
        cancelDeleteButton.removeEventListener('click', cancelDeleteHandler);
    }

    cancelDeleteHandler = function () {
        deleteBookModal.style.display = 'none';
    }

    cancelDeleteButton.addEventListener('click', cancelDeleteHandler);
}

function undoDoneReadBook(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function editBook(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    const modal = document.getElementById('editModal');
    const editedTitleInput = document.getElementById('editedTitle');
    const editedAuthorInput = document.getElementById('editedAuthor');
    const editedYearInput = document.getElementById('editedYear');
    const saveEditButton = document.getElementById('saveEdit');
    const cancelEditButton = document.getElementById('cancelEdit');

    editedTitleInput.value = bookTarget.title;
    editedAuthorInput.value = bookTarget.author;
    editedYearInput.value = bookTarget.year;

    modal.style.display = 'block';

    saveEditButton.addEventListener('click', function () {
        const editedYear = parseInt(editedYearInput.value);
        if (isNaN(editedYear)) {
            alert('Year must be a number.');
            return;
        }

        if (editedYear < 1850) {
            alert('Please enter a year greater than or equal to 1850.');
            return;
        }

        bookTarget.title = editedTitleInput.value || bookTarget.title;
        bookTarget.author = editedAuthorInput.value || bookTarget.author;
        bookTarget.year = editedYear || bookTarget.year;

        modal.style.display = 'none';

        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    });

    cancelEditButton.addEventListener('click', function () {
        modal.style.display = 'none';
    });

    const close = document.querySelector('.close');
    close.addEventListener('click', function () {
        modal.style.display = 'none';
    });

    window.addEventListener('click', function (event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}


function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }

    return -1;
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function isStorageExist() {
    if (typeof (Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

const searchButton = document.getElementById('searchSubmit');

searchButton.addEventListener('click', function () {
    const filter = document.getElementById('searchBookTitle').value;
    const bookList = document.querySelectorAll('.book_item');

    for (bookItem of bookList) {
        const book = bookItem.querySelector('h3').innerText;

        if (book.toString().toLowerCase().includes(filter.toString().toLowerCase())) {
            bookItem.style.display = 'block';
        } else {
            bookItem.style.display = 'none';
        }
    }
})

const mobileMenu = document.querySelector(".mobile-menu");
const nav = document.querySelector("nav");

mobileMenu.addEventListener("click", () => {
    nav.classList.toggle("nav-active");
});
