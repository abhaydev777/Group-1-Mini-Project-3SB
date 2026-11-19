(function () {
  "use strict";

  const STUDENT_STORAGE_KEY = "ums_students";

  const DEFAULT_STUDENTS = [
    {
      roll: "CSE21B001",
      name: "Ananya Sharma",
      branch: "CSE - Sem 6",
      email: "ananya.sharma@uni.edu",
      status: "Dean's List"
    },
    {
      roll: "CSE21B014",
      name: "Rahul Mehta",
      branch: "CSE - Sem 6",
      email: "rahul.mehta@uni.edu",
      status: "Regular"
    },
    {
      roll: "ECE22B008",
      name: "Priya Nair",
      branch: "ECE - Sem 4",
      email: "priya.nair@uni.edu",
      status: "Regular"
    },
    {
      roll: "CSE22B032",
      name: "Arjun Patel",
      branch: "CSE - Sem 4",
      email: "arjun.patel@uni.edu",
      status: "Pending"
    },
    {
      roll: "IT21B019",
      name: "Sneha Reddy",
      branch: "IT - Sem 6",
      email: "sneha.reddy@uni.edu",
      status: "Dean's List"
    },
    {
      roll: "CSE23B045",
      name: "Vikram Singh",
      branch: "CSE - Sem 2",
      email: "vikram.singh@uni.edu",
      status: "Regular"
    }
  ];

  

  function init() {
    const table = document.getElementById("examTable");
    const downloadButton = document.getElementById("downloadAdmitCard");
    const downloadMessage = document.getElementById("downloadMessage");

    initExamTools(table);
    initAdmitCard(downloadButton, downloadMessage);
  }

  
  
  

  function getRegisteredStudents() {
    try { 
      const storedData = localStorage.getItem(STUDENT_STORAGE_KEY);
      
      
      
      if (storedData === null) {
        localStorage.setItem(
          STUDENT_STORAGE_KEY,
          JSON.stringify(DEFAULT_STUDENTS)
        );

        return DEFAULT_STUDENTS;
      }

      const students = JSON.parse(storedData);

      if (!Array.isArray(students)) {
        throw new Error("Student records have an invalid format.");
      }

      return students;

    } catch (error) {
      console.error("Unable to read registered students:", error);

      throw new Error(
        "Student records load nahi ho rahe. Students section check karo."
      );
    }
  }

  
  
  

  function normalizeName(value) {
    return String(value || "")
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase();
  }

  function normalizeEnrollment(value) {
    return String(value || "")
      .trim()
      .replace(/\s+/g, "")
      .toUpperCase();
  }

  
  
  

  function validateStudent(studentName, enrollmentNumber) {
    const students = getRegisteredStudents();

    const enteredName = normalizeName(studentName);
    const enteredEnrollment = normalizeEnrollment(enrollmentNumber);

    if (!enteredName || !enteredEnrollment) {
      throw new Error(
        "Both the student name and enrollment number are required."
      );
    }

    
    const matchedStudent = students.find(function (student) {
      return (
        student &&
        normalizeEnrollment(student.roll) === enteredEnrollment
      );
    });

    
    if (!matchedStudent) {
      throw new Error(
        "Invalid enrollment number! This is not in regestered Student."
      );
    }

    
    if (normalizeName(matchedStudent.name) !== enteredName) {
      throw new Error(
        "Student name and enrollment number not match.Check Details."
      );
    }

    
    return matchedStudent;
  }

  
  
  

  function initExamTools(table) {
    if (!table || !table.tBodies.length) {
      return;
    }

    if (document.getElementById("examSearch")) {
      return;
    }

    const tableContainer = table.closest(".table-wrap");

    if (!tableContainer) {
      return;
    }

    const toolbar = document.createElement("div");
    toolbar.className = "exam-fee-toolbar";

    
    const searchLabel = document.createElement("label");
    searchLabel.className = "module-search-label";
    searchLabel.htmlFor = "examSearch";
    searchLabel.appendChild(document.createTextNode("Search exams "));

    const search = document.createElement("input");
    search.type = "search";
    search.id = "examSearch";
    search.placeholder = "Subject, course code, room...";
    search.setAttribute("aria-label", "Search exams");

    searchLabel.appendChild(search);

    
    const filterLabel = document.createElement("label");
    filterLabel.className = "module-filter-label";
    filterLabel.htmlFor = "examStatusFilter";
    filterLabel.appendChild(document.createTextNode("Status "));

    const filter = document.createElement("select");
    filter.id = "examStatusFilter";
    filter.setAttribute("aria-label", "Filter exam status");

    const filterOptions = [
      { value: "all", text: "All exams" },
      { value: "upcoming", text: "Upcoming" },
      { value: "completed", text: "Completed" }
    ];

    filterOptions.forEach(function (item) {
      const option = document.createElement("option");

      option.value = item.value;
      option.textContent = item.text;

      filter.appendChild(option);
    });

    filterLabel.appendChild(filter);

    
    const count = document.createElement("span");
    count.id = "examResultCount";
    count.className = "module-result-count";
    count.setAttribute("aria-live", "polite");

    
    const printButton = document.createElement("button");
    printButton.type = "button";
    printButton.className = "btn btn-secondary";
    printButton.id = "printExamSchedule";
    printButton.textContent = "Print Schedule";

    toolbar.appendChild(searchLabel);
    toolbar.appendChild(filterLabel);
    toolbar.appendChild(count);
    toolbar.appendChild(printButton);

    tableContainer.parentNode.insertBefore(toolbar, tableContainer);

    function updateResults() {
      const query = search.value.trim().toLowerCase();
      const selectedStatus = filter.value;

      let visibleCount = 0;

      Array.from(table.tBodies[0].rows).forEach(function (row) {
        const rowText = row.textContent.toLowerCase();

        const statusCell = row.cells[row.cells.length - 1];

        const rowStatus = statusCell
          ? statusCell.textContent.trim().toLowerCase()
          : "";

        const matchesSearch = rowText.includes(query);

        const matchesStatus =
          selectedStatus === "all" ||
          rowStatus === selectedStatus;

        const shouldShow = matchesSearch && matchesStatus;

        row.hidden = !shouldShow;

        if (shouldShow) {
          visibleCount++;
        }
      });

      count.textContent =
        "Showing " +
        visibleCount +
        " of " +
        table.tBodies[0].rows.length +
        " exams";
    }

    search.addEventListener("input", updateResults);
    filter.addEventListener("change", updateResults);

    printButton.addEventListener("click", function () {
      window.print();
    });

    updateResults();
  }

  
  
  

  function initAdmitCard(button, message) {
    if (!button) {
      console.error("Admit card download button not found.");
      return;
    }

    button.addEventListener("click", function () {
      try {
        
        if (!window.jspdf || !window.jspdf.jsPDF) {
          throw new Error(
            "The PDF library failed to load. Please check your internet connection and refresh the page."
          );
        }

        
        const enteredName = window.prompt(
          "Enter your registered student name:"
        );

        if (enteredName === null) {
          return;
        }

        if (!enteredName.trim()) {
          throw new Error("Student name is required.");
        }

        
        const enteredEnrollment = window.prompt(
          "Enter your registered enrollment number:"
        );

        if (enteredEnrollment === null) {
          return;
        }

        if (!enteredEnrollment.trim()) {
          throw new Error(
            "Enrollment number is required."
          );
        }

        
        
        const student = validateStudent(
          enteredName,
          enteredEnrollment
        );

        
        

        const jsPDF = window.jspdf.jsPDF;
        const pdf = new jsPDF("p", "mm", "a4");

        if (typeof pdf.autoTable !== "function") {
          throw new Error(
            "The PDF table plugin failed to load. Please refresh the page and try again."
          );
        }

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const margin = 15;
        const contentWidth = pageWidth - margin * 2;

        
        pdf.setFillColor(247, 249, 252);
        pdf.rect(0, 0, pageWidth, pageHeight, "F");

        
        pdf.setFillColor(28, 55, 100);
        pdf.rect(0, 0, pageWidth, 39, "F");

        pdf.setTextColor(255, 255, 255);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(17);

        pdf.text(
          "UNIVERSITY MANAGEMENT SYSTEM",
          pageWidth / 2,
          13,
          { align: "center" }
        );

        pdf.setFontSize(13);

        pdf.text(
          "EXAMINATION ADMIT CARD",
          pageWidth / 2,
          23,
          { align: "center" }
        );

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);

        pdf.text(
          "Odd Semester 2026-27",
          pageWidth / 2,
          31,
          { align: "center" }
        );

        
        let y = 53;

        pdf.setTextColor(28, 55, 100);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);

        pdf.text("STUDENT DETAILS", margin, y);

        y += 5;

        
        pdf.setDrawColor(210, 218, 230);
        pdf.setFillColor(255, 255, 255);

        pdf.roundedRect(
          margin,
          y,
          contentWidth,
          27,
          2,
          2,
          "FD"
        );

        
        pdf.setTextColor(60, 70, 85);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);

        pdf.text("Student Name:", margin + 4, y + 9);

        pdf.setFont("helvetica", "normal");

        pdf.text(
          pdf.splitTextToSize(student.name, contentWidth - 55),
          margin + 48,
          y + 9
        );

        pdf.setFont("helvetica", "bold");

        pdf.text("Enrollment Number:", margin + 4, y + 20);

        pdf.setFont("helvetica", "normal");

        pdf.text(
          pdf.splitTextToSize(student.roll, contentWidth - 55),
          margin + 48,
          y + 20
        );

        
        y += 37;

        pdf.setTextColor(28, 55, 100);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);

        pdf.text("EXAMINATION CENTER", margin, y);

        y += 5;

        pdf.setFillColor(255, 255, 255);
        pdf.setDrawColor(210, 218, 230);

        pdf.roundedRect(
          margin,
          y,
          contentWidth,
          15,
          2,
          2,
          "FD"
        );

        pdf.setTextColor(60, 70, 85);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);

        pdf.text(
          "Block C, Main Examination Hall",
          margin + 4,
          y + 9
        );

        
        y += 24;

        pdf.setTextColor(28, 55, 100);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);

        pdf.text("EXAMINATION TIMETABLE", margin, y);

        const table = document.getElementById("examTable");
        const timetableRows = [];

        if (table && table.tBodies.length) {
          Array.from(table.tBodies[0].rows).forEach(function (row) {
            timetableRows.push([
              row.cells[0].textContent.trim(),
              row.cells[1].textContent.trim(),
              row.cells[2].textContent.trim(),
              row.cells[3].textContent.trim(),
              row.cells[4].textContent.trim(),
              row.cells[5].textContent.trim()
            ]);
          });
        }

        pdf.autoTable({
          startY: y + 5,

          head: [[
            "Date & Day",
            "Shift / Time",
            "Course",
            "Subject",
            "Room",
            "Status"
          ]],

          body: timetableRows,

          theme: "grid",

          margin: {
            left: margin,
            right: margin
          },

          styles: {
            font: "helvetica",
            fontSize: 7,
            cellPadding: 2,
            overflow: "linebreak",
            textColor: [45, 55, 70],
            lineColor: [215, 222, 232],
            lineWidth: 0.2
          },

          headStyles: {
            fillColor: [28, 55, 100],
            textColor: [255, 255, 255],
            fontStyle: "bold"
          },

          alternateRowStyles: {
            fillColor: [242, 246, 251]
          }
        });

        
        let finalY = pdf.lastAutoTable.finalY + 10;

        if (finalY > pageHeight - 35) {
          pdf.addPage();
          finalY = 20;
        }

        pdf.setTextColor(28, 55, 100);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);

        pdf.text("IMPORTANT INSTRUCTIONS", margin, finalY);

        finalY += 7;

        pdf.setTextColor(60, 70, 85);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);

        const instructions = [
          "1. Carry your university identity card along with this admit card.",
          "2. Reach the examination center at least 30 minutes early.",
          "3. Electronic devices are prohibited unless explicitly permitted."
        ];

        instructions.forEach(function (instruction) {
          const lines = pdf.splitTextToSize(
            instruction,
            contentWidth
          );

          if (finalY + lines.length * 4 > pageHeight - 20) {
            pdf.addPage();
            finalY = 20;
          }

          pdf.text(lines, margin, finalY);

          finalY += lines.length * 4 + 2;
        });

        
        const totalPages = pdf.internal.getNumberOfPages();

        for (let page = 1; page <= totalPages; page++) {
          pdf.setPage(page);

          pdf.setDrawColor(210, 218, 230);

          pdf.line(
            margin,
            pageHeight - 13,
            pageWidth - margin,
            pageHeight - 13
          );

          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(7);
          pdf.setTextColor(110, 120, 135);

          pdf.text(
            "University Management System | Page " +
              page +
              " of " +
              totalPages,
            pageWidth / 2,
            pageHeight - 7,
            { align: "center" }
          );
        }

        const safeEnrollment = student.roll.replace(
          /[^a-zA-Z0-9_-]/g,
          "_"
        );

        pdf.save("Admit_Card_" + safeEnrollment + ".pdf");

        showMessage(
          message,
          "Student verified successfully. Admit card PDF download started.",
          false
        );

      } catch (error) {
        console.error("Admit card validation/generation error:", error);

        showMessage(
          message,
          error.message || "Unable to generate the admit card.",
          true
        );

        window.alert(
          error.message || "Unable to generate the admit card."
        );
      }
    });
  }

 

  function showMessage(element, text, isError) {
    if (!element) {
      return;
    }

    element.textContent = text;

    element.style.color = isError
      ? "#dc2626"
      : "#15803d";

    element.style.fontWeight = "600";
  }



  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();