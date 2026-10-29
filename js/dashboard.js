// 1. Array of default students (fallback records when storage is empty)
const defaultStudents = [
  { roll: "CSE21B001" },
  { roll: "CSE21B014" },
  { roll: "ECE22B008" },
  { roll: "CSE22B032" },
  { roll: "IT21B019" },
  { roll: "CSE23B045" }
];

// 2. Retrieve student records from localStorage
let storedStudents = JSON.parse(localStorage.getItem("ums_students"));

// Fall back to default student records if localStorage is uninitialized
if (!storedStudents) {
  storedStudents = defaultStudents;
}

// 3. Update the total student count on the dashboard metric card
const countElement = document.getElementById("totalStudentsCount");
if (countElement) {
  countElement.innerText = storedStudents.length;
}