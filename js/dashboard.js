// 1. Array of default students (initial count agar storage empty ho)
const defaultStudents = [
  { roll: "CSE21B001" },
  { roll: "CSE21B014" },
  { roll: "ECE22B008" },
  { roll: "CSE22B032" },
  { roll: "IT21B019" },
  { roll: "CSE23B045" }
];

// 2. LocalStorage se students data fetch karna
let storedStudents = JSON.parse(localStorage.getItem("ums_students"));

// Agar localStorage me data nahi hai, toh default count use karenge
if (!storedStudents) {
  storedStudents = defaultStudents;
}

// 3. Metric card par total count show karna
const countElement = document.getElementById("totalStudentsCount");
if (countElement) {
  countElement.innerText = storedStudents.length;
}