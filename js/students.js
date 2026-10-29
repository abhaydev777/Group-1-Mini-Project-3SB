// ==========================================
// 1. DEFAULT DATA (Fallback records when page is opened for the first time)
// ==========================================
const initialStudents = [
  { roll: "CSE21B001", name: "Ananya Sharma", image: "images/student-1.jpg", branch: "CSE - Sem 6", email: "ananya.sharma@uni.edu", status: "Dean's List" },
  { roll: "CSE21B014", name: "Rahul Mehta", image: "images/student-2.jpg", branch: "CSE - Sem 6", email: "rahul.mehta@uni.edu", status: "Regular" },
  { roll: "ECE22B008", name: "Priya Nair", image: "images/student-3.jpg", branch: "ECE - Sem 4", email: "priya.nair@uni.edu", status: "Regular" },
  { roll: "CSE22B032", name: "Arjun Patel", image: "images/student-4.jpg", branch: "CSE - Sem 4", email: "arjun.patel@uni.edu", status: "Pending" },
  { roll: "IT21B019", name: "Sneha Reddy", image: "images/student-5.jpg", branch: "IT - Sem 6", email: "sneha.reddy@uni.edu", status: "Dean's List" },
  { roll: "CSE23B045", name: "Vikram Singh", image: "images/student-6.jpg", branch: "CSE - Sem 2", email: "vikram.singh@uni.edu", status: "Regular" }
];

// Check localStorage: load existing records or initialize with default data
let students = JSON.parse(localStorage.getItem("ums_students"));
if (!students) {
  students = initialStudents;
  localStorage.setItem("ums_students", JSON.stringify(students));
}

// State variable for tracking edits (null = Add mode, roll string = Edit mode)
let editingRollNumber = null;

// ==========================================
// 2. DOM ELEMENT SELECTORS
// ==========================================
const tableBody = document.querySelector("tbody");
const searchInput = document.getElementById("studentSearch");
const branchFilter = document.getElementById("branchFilter");
const statusFilter = document.getElementById("statusFilter");
const countLabel = document.getElementById("studentCountLabel");
const headerCountMeta = document.getElementById("headerCountMeta");

// Modal elements
const modal = document.getElementById("addStudentModal");
const openModalBtn = document.getElementById("openAddModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelModalBtn = document.getElementById("cancelModalBtn");
const studentForm = document.getElementById("addStudentForm");
const modalTitle = document.getElementById("modalTitle");

// Form inputs
const inputRoll = document.getElementById("studentRoll");
const inputName = document.getElementById("studentName");
const inputBranch = document.getElementById("studentBranch");
const inputEmail = document.getElementById("studentEmail");
const inputStatus = document.getElementById("studentStatus");

// ==========================================
// 3. TABLE DISPLAY FUNCTION (READ)
// ==========================================
function renderTable() {
  // Retrieve current values from search and filter inputs
  const searchValue = searchInput.value.toLowerCase();
  const selectedBranch = branchFilter.value;
  const selectedStatus = statusFilter.value;

  tableBody.innerHTML = "";
  let displayedCount = 0;

  for (let i = 0; i < students.length; i++) {
    const student = students[i];

    // Evaluate filter criteria against student records
    const matchSearch = student.name.toLowerCase().includes(searchValue) || 
                        student.roll.toLowerCase().includes(searchValue) ||
                        student.branch.toLowerCase().includes(searchValue);

    const matchBranch = selectedBranch === "" || student.branch.includes(selectedBranch);
    const matchStatus = selectedStatus === "" || student.status === selectedStatus;

    if (matchSearch && matchBranch && matchStatus) {
      displayedCount++;

      // Determine badge styling classes based on academic standing
      let badgeClass = "badge-blue badge-regular";
      if (student.status === "Dean's List") {
        badgeClass = "badge-green badge-deans";
      } else if (student.status === "Pending") {
        badgeClass = "badge-amber badge-pending";
      }

      // Fallback avatar image if student has no profile picture
      const studentImage = student.image || "images/student-1.jpg";

      // Construct table row HTML structure
      const rowHTML = `
        <tr>
          <td>${student.roll}</td>
          <td>
            <div class="person-cell">
              <img class="person-thumb" src="${studentImage}" alt="">
              <span>${student.name}</span>
            </div>
          </td>
          <td>${student.branch}</td>
          <td>${student.email}</td>
          <td><span class="badge ${badgeClass}">${student.status}</span></td>
          <td>
            <div class="action-buttons">
              <button type="button" class="btn-edit" onclick="openEditModal('${student.roll}')">Edit</button>
              <button type="button" class="btn-delete" onclick="deleteStudent('${student.roll}')">Remove</button>
            </div>
          </td>
        </tr>
      `;
      tableBody.innerHTML += rowHTML;
    }
  }

  // Update showing count labels dynamically
  countLabel.innerText = `Showing ${displayedCount} of ${students.length} registered students`;
  if (headerCountMeta) {
    headerCountMeta.innerHTML = `Showing <strong>${displayedCount}</strong> of <strong>${students.length}</strong> registered students`;
  }
}

// ==========================================
// 4. DELETE FUNCTION (DELETE)
// ==========================================
function deleteStudent(roll) {
  if (confirm("Are you sure you want to remove this student?")) {
    // Filter out and remove the selected student from the array
    students = students.filter(function(s) {
      return s.roll !== roll;
    });

    // Update localStorage and refresh the table display
    localStorage.setItem("ums_students", JSON.stringify(students));
    renderTable();
  }
}

// ==========================================
// 5. MODAL OPEN / CLOSE LOGIC
// ==========================================
function openAddModal() {
  editingRollNumber = null;
  modalTitle.innerText = "Add New Student";
  studentForm.reset();
  inputRoll.removeAttribute("readonly");
  modal.style.display = "flex";
}

function openEditModal(roll) {
  editingRollNumber = roll;
  modalTitle.innerText = "Edit Student Details";

  // Locate the existing student record to pre-populate form fields
  let studentToEdit = null;
  for (let i = 0; i < students.length; i++) {
    if (students[i].roll === roll) {
      studentToEdit = students[i];
      break;
    }
  }

  if (studentToEdit) {
    inputRoll.value = studentToEdit.roll;
    inputRoll.setAttribute("readonly", true); // Roll number serves as unique primary key, lock as readonly during edit
    inputName.value = studentToEdit.name;
    inputBranch.value = studentToEdit.branch;
    inputEmail.value = studentToEdit.email;
    inputStatus.value = studentToEdit.status;
    modal.style.display = "flex";
  }
}

function closeModal() {
  modal.style.display = "none";
}

// ==========================================
// 6. FORM SUBMISSION HANDLER (CREATE / UPDATE)
// ==========================================
studentForm.addEventListener("submit", function(event) {
  event.preventDefault(); // Prevent default browser form submission and page reload

  if (editingRollNumber) {
    // EDIT MODE: Update existing student record matching active roll number
    for (let i = 0; i < students.length; i++) {
      if (students[i].roll === editingRollNumber) {
        students[i].name = inputName.value;
        students[i].branch = inputBranch.value;
        students[i].email = inputEmail.value;
        students[i].status = inputStatus.value;
        break;
      }
    }
  } else {
    // ADD MODE: Validate that roll number is unique to avoid duplicates
    for (let i = 0; i < students.length; i++) {
      if (students[i].roll.toLowerCase() === inputRoll.value.toLowerCase()) {
        alert("A student with this Roll Number already exists!");
        return;
      }
    }

    // Construct new student record object
    const newStudent = {
      roll: inputRoll.value,
      name: inputName.value,
      image: "images/student-2.jpg", // Default placeholder image
      branch: inputBranch.value,
      email: inputEmail.value,
      status: inputStatus.value
    };

    students.push(newStudent);
  }

  // Persist updated records to localStorage and re-render UI
  localStorage.setItem("ums_students", JSON.stringify(students));
  closeModal();
  renderTable();
});

// ==========================================
// 7. EVENT LISTENERS
// ==========================================
openModalBtn.addEventListener("click", openAddModal);
closeModalBtn.addEventListener("click", closeModal);
cancelModalBtn.addEventListener("click", closeModal);

// Real-time search and filter event listeners
searchInput.addEventListener("input", renderTable);
branchFilter.addEventListener("change", renderTable);
statusFilter.addEventListener("change", renderTable);

// Initial table render on page load
renderTable();