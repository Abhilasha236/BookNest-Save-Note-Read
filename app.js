const searchBox = document.getElementById("search-box");
const resultsDiv = document.getElementById("results");
const bookList = document.getElementById("book-list");
const myBooks = document.getElementById("my-books");
const showListBtn = document.getElementById("show-list-btn");

const modal = new bootstrap.Modal(document.getElementById('bookModal'));
let selectedIndex = null;

function loadMyBooks() {
  bookList.innerHTML = "";
  const books = JSON.parse(localStorage.getItem("myBooks")) || [];

  if (books.length === 0) {
    const li = document.createElement("li");
    li.className = "list-group-item text-center text-light";
    li.innerText = "📭 Your book list is empty.";
    bookList.appendChild(li);
    return;
  }

  books.forEach((book, index) => {
    const li = document.createElement("li");
    li.className = "list-group-item text-white d-flex justify-content-between align-items-center";
    li.innerHTML = `
      <span>${book.title}</span>
      <i class="bi bi-pencil-square fs-5" role="button" onclick="openModal(${index})"></i>
    `;
    bookList.appendChild(li);
  });
}


function openModal(index) {
  const books = JSON.parse(localStorage.getItem("myBooks")) || [];
  const book = books[index];
  selectedIndex = index;

  document.getElementById("modalTitle").innerText = book.title;
  document.getElementById("modalAuthor").innerText = book.author || "Unknown";
  document.getElementById("modalImage").src = book.thumbnail || "";
  document.getElementById("modalNotes").value = book.notes || "";
  document.getElementById("modalPublisher").innerText = book.publisher || "N/A";
  document.getElementById("modalDate").innerText = book.publishedDate || "-";
  document.getElementById("modalRating").innerText = book.rating ? `${book.rating}⭐ (${book.ratingsCount || 0})` : "Not rated";
  document.getElementById("modalDescription").innerText = book.description || "No description available.";
  document.getElementById("modalPreview").href = book.previewLink || "#";

  modal.show();
}

function showAlert(msg, className) {
  const div = document.createElement("div");
  div.className = `alert alert-${className} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3 w-75 text-center`;
  div.role = "alert";
  div.innerHTML = `
    ${msg}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;

  document.body.appendChild(div);

  setTimeout(() => {
    div.remove();
  }, 3000);
}


document.getElementById("modalDelete").addEventListener("click", () => {
  const books = JSON.parse(localStorage.getItem("myBooks")) || [];
  books.splice(selectedIndex, 1);
  localStorage.setItem("myBooks", JSON.stringify(books));
  modal.hide();
  loadMyBooks();
  showAlert("❌ Book removed from your list.", "danger");
});

document.getElementById("modalSave").addEventListener("click", () => {
  const books = JSON.parse(localStorage.getItem("myBooks")) || [];
  books[selectedIndex].notes = document.getElementById("modalNotes").value;
  localStorage.setItem("myBooks", JSON.stringify(books));
  modal.hide();
  loadMyBooks();
  showAlert("✍️ Notes updated successfully!", "info");
});

function addToList(book) {
  const books = JSON.parse(localStorage.getItem("myBooks")) || [];
  const exists = books.some(b => b.title === book.title && b.author === book.author);
  if (!exists) {
    books.push(book);
    localStorage.setItem("myBooks", JSON.stringify(books));

    //alert("Book added to your list!");
    showAlert("✅ Book added to your list!", "success");
  } else {
    showAlert("⚠️ Book already in your list!", "warning");
  }
}

searchBox.addEventListener("input", function (e) {
  const query = e.target.value.trim();
  if (query.length < 3) {
    resultsDiv.innerHTML = "";
    return;
  }
  fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}`)
    .then(res => res.json())
    .then(data => {
      resultsDiv.innerHTML = "";
      (data.items || []).forEach(item => {
        const info = item.volumeInfo;
        const div = document.createElement("div");
        div.className = "book-card animate__animated animate__fadeInDown";
        div.innerHTML = `
              <img src="${(info.imageLinks?.thumbnail || '')}" class="img-fluid mb-2" alt="cover">
              <h6>${info.title}</h6>
              <p style="font-size: 0.9em">${(info.authors || []).join(", ")}</p>
              <button class="btn btn-sm btn-outline-light" onclick='addToList({ 
                title: "${info.title.replace(/"/g, '')}", 
                author: "${(info.authors?.[0] || '').replace(/"/g, '')}", 
                thumbnail: "${info.imageLinks?.thumbnail || ''}",
                publisher: "${info.publisher || ''}",
                publishedDate: "${info.publishedDate || ''}",
                rating: ${info.averageRating || null},
                ratingsCount: ${info.ratingsCount || 0},
                description: "${(info.description || '').replace(/"/g, '').replace(/\n/g, ' ').slice(0, 300)}",
                previewLink: "${info.previewLink || ''}"
              })'>Add to My List</button>
            `;
        resultsDiv.appendChild(div);
      });
    });
});

showListBtn.addEventListener("click", () => {
  myBooks.style.display = myBooks.style.display === "none" ? "block" : "none";
  loadMyBooks();
});