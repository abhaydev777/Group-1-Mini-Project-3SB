

(function () {
  "use strict";

  const STUDENT_STORAGE_KEY = "ums_students";
  const FEE_STORAGE_KEY = "ums_fee_records";

  let students = [];
  let selectedStudent = null;

  

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



  const DEFAULT_FEE_RECORDS = {
    CSE21B001: {
      academicYear: "2026-27",
      totalFees: 145000,
      transactions: [
        {
          id: "REC1001",
          description: "Tuition Fee - Installment 1",
          date: "2026-07-15",
          amount: 75000,
          mode: "Online",
          status: "Paid"
        },
        {
          id: "REC1002",
          description: "Tuition Fee - Installment 2",
          date: "2026-11-10",
          amount: 70000,
          mode: "Online",
          status: "Paid"
        }
      ]
    },

    CSE21B014: {
      academicYear: "2026-27",
      totalFees: 145000,
      transactions: [
        {
          id: "REC2001",
          description: "Tuition Fee - Installment 1",
          date: "2026-07-18",
          amount: 75000,
          mode: "Online",
          status: "Paid"
        },
        {
          id: "REC2002",
          description: "Tuition Fee - Installment 2",
          date: "2026-11-15",
          amount: 40000,
          mode: "UPI",
          status: "Paid"
        }
      ]
    },

    ECE22B008: {
      academicYear: "2026-27",
      totalFees: 130000,
      transactions: [
        {
          id: "REC3001",
          description: "Tuition Fee - Installment 1",
          date: "2026-07-20",
          amount: 65000,
          mode: "Online",
          status: "Paid"
        },
        {
          id: "REC3002",
          description: "Tuition Fee - Installment 2",
          date: "2026-11-20",
          amount: 30000,
          mode: "UPI",
          status: "Paid"
        }
      ]
    },

    CSE22B032: {
      academicYear: "2026-27",
      totalFees: 130000,
      transactions: [
        {
          id: "REC4001",
          description: "Tuition Fee - Installment 1",
          date: "2026-07-25",
          amount: 50000,
          mode: "Online",
          status: "Paid"
        }
      ]
    },

    IT21B019: {
      academicYear: "2026-27",
      totalFees: 140000,
      transactions: [
        {
          id: "REC5001",
          description: "Tuition Fee - Installment 1",
          date: "2026-07-17",
          amount: 70000,
          mode: "Online",
          status: "Paid"
        },
        {
          id: "REC5002",
          description: "Tuition Fee - Installment 2",
          date: "2026-11-12",
          amount: 70000,
          mode: "UPI",
          status: "Paid"
        }
      ]
    },

    CSE23B045: {
      academicYear: "2026-27",
      totalFees: 120000,
      transactions: [
        {
          id: "REC6001",
          description: "Tuition Fee - Installment 1",
          date: "2026-07-28",
          amount: 60000,
          mode: "Online",
          status: "Paid"
        }
      ]
    }
  };

  function getElement(id) {
    return document.getElementById(id);
  }

  function setText(id, value) {
    const element = getElement(id);

    if (element) {
      element.textContent = value;
    }
  }

  function formatCurrency(amount) {
    return "INR " + Number(amount || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 0
    });
  }

  function formatDate(dateString) {
    if (!dateString) {
      return "—";
    }

    const date = new Date(dateString + "T00:00:00");

    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }

  function getCurrentDate() {
    return new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (char) {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      };

      return entities[char];
    });
  }



  function loadStudents() {
    try {
      const saved = localStorage.getItem(STUDENT_STORAGE_KEY);

      if (saved === null) {
        localStorage.setItem(
          STUDENT_STORAGE_KEY,
          JSON.stringify(DEFAULT_STUDENTS)
        );

        return DEFAULT_STUDENTS.map(function (student) {
          return { ...student };
        });
      }

      const parsed = JSON.parse(saved);

      if (!Array.isArray(parsed)) {
        throw new Error("Invalid student data.");
      }

      return parsed.filter(function (student) {
        return student && student.roll && student.name;
      });

    } catch (error) {
      console.error("Student data error:", error);

      showMessage(
        "Student data load nahi ho saka. Students page check karo.",
        true
      );

      return [];
    }
  }


  function loadFeeRecords() {
    try {
      const saved = localStorage.getItem(FEE_STORAGE_KEY);

      if (saved === null) {
        localStorage.setItem(
          FEE_STORAGE_KEY,
          JSON.stringify(DEFAULT_FEE_RECORDS)
        );

        return JSON.parse(JSON.stringify(DEFAULT_FEE_RECORDS));
      }

      const parsed = JSON.parse(saved);

      if (!parsed || typeof parsed !== "object") {
        throw new Error("Invalid fee data.");
      }

      return parsed;

    } catch (error) {
      console.error("Fee records error:", error);

      return JSON.parse(JSON.stringify(DEFAULT_FEE_RECORDS));
    }
  }

  let feeRecords = loadFeeRecords();

  function saveFeeRecords() {
    try {
      localStorage.setItem(
        FEE_STORAGE_KEY,
        JSON.stringify(feeRecords)
      );
    } catch (error) {
      console.error("Could not save fee records:", error);
    }
  }

  function getStudentFeeRecord(student) {
    if (!student) {
      return {
        academicYear: "2026-27",
        totalFees: 0,
        transactions: []
      };
    }

    if (!feeRecords[student.roll]) {
      feeRecords[student.roll] = {
        academicYear: "2026-27",
        totalFees: 0,
        transactions: []
      };

      saveFeeRecords();
    }

    const record = feeRecords[student.roll];

    if (!Array.isArray(record.transactions)) {
      record.transactions = [];
    }

    return record;
  }



  function showMessage(message, isError) {
    const element = getElement("searchMessage");

    if (!element) {
      return;
    }

    element.textContent = message;
    element.style.color = isError ? "#b91c1c" : "#15803d";
  }



  function updateSuggestions() {
    const datalist = getElement("studentSuggestions");

    if (!datalist) {
      return;
    }

    datalist.innerHTML = students.map(function (student) {
      return (
        '<option value="' +
        escapeHTML(student.roll) +
        '">' +
        escapeHTML(student.name) +
        "</option>"
      );
    }).join("");
  }

  function handleSearch(event) {
    if (event) {
      event.preventDefault();
    }

    const input = getElement("studentSearch");
    const query = input ? input.value.trim().toLowerCase() : "";

    if (!query) {
      showMessage("Student name ya roll number enter karo.", true);
      return;
    }

    students = loadStudents();
    updateSuggestions();

    const matches = students.filter(function (student) {
      return (
        String(student.roll).toLowerCase().includes(query) ||
        String(student.name).toLowerCase().includes(query)
      );
    });

    if (matches.length === 0) {
      showMessage("no matching student found", true);
      return;
    }

    if (matches.length > 1) {
      const exactMatch = matches.find(function (student) {
        return (
          String(student.roll).toLowerCase() === query ||
          String(student.name).toLowerCase() === query
        );
      });

      if (!exactMatch) {
        showMessage(
          "Multiple students mile. Complete name ya roll number enter karo.",
          true
        );

        return;
      }

      selectStudent(exactMatch);

      showMessage("Student found: " + exactMatch.name, false);
      return;
    }

    selectStudent(matches[0]);

    showMessage(
      "Student found: " + matches[0].name +
      " (" + matches[0].roll + ")",
      false
    );
  }



  function selectStudent(student) {
    selectedStudent = student;

    setText("selectedStudentName", student.name);
    setText("selectedStudentRoll", student.roll);

    renderFeeDetails();
  }



  function renderFeeDetails() {
    if (!selectedStudent) {
      return;
    }

    const record = getStudentFeeRecord(selectedStudent);
    const totalFees = Number(record.totalFees) || 0;

    const paidAmount = record.transactions
      .filter(function (transaction) {
        return String(transaction.status).toLowerCase() === "paid";
      })
      .reduce(function (sum, transaction) {
        return sum + (Number(transaction.amount) || 0);
      }, 0);

    const pendingAmount = Math.max(totalFees - paidAmount, 0);

    const isCleared =
      totalFees > 0 &&
      pendingAmount === 0;

    setText("selectedStudentName", selectedStudent.name);
    setText("selectedStudentRoll", selectedStudent.roll);
    setText("selectedAcademicYear", record.academicYear || "2026-27");

    setText("totalFees", formatCurrency(totalFees));
    setText("paidAmount", formatCurrency(paidAmount));

    setText(
      "duesStatus",
      pendingAmount === 0 && totalFees > 0
        ? "No Pending Dues"
        : "Pending: " + formatCurrency(pendingAmount)
    );

    setText(
      "clearanceStatus",
      isCleared ? "Full Clearance Granted" : "Clearance Pending"
    );

    setText(
      "examEligibility",
      isCleared ? "Eligible for Exams" : "Not Cleared for Exams"
    );

    const duesBadge = getElement("duesStatus");

    if (duesBadge) {
      duesBadge.className =
        "badge " + (isCleared ? "badge-green" : "badge-amber");
    }

    const eligibilityBadge = getElement("examEligibility");

    if (eligibilityBadge) {
      eligibilityBadge.className =
        "badge " + (isCleared ? "badge-blue" : "badge-amber");
    }

    renderTransactions(record.transactions);
  }

  

  function renderTransactions(transactions) {
    const tableBody = getElement("feeTableBody");
    const noTransactions = getElement("noTransactions");

    if (!tableBody) {
      return;
    }

    if (!transactions || transactions.length === 0) {
      tableBody.innerHTML = "";

      if (noTransactions) {
        noTransactions.hidden = false;
      }

      return;
    }

    if (noTransactions) {
      noTransactions.hidden = true;
    }

    tableBody.innerHTML = transactions.map(function (transaction) {
      const isPaid =
        String(transaction.status).toLowerCase() === "paid";

      return `
        <tr>
          <td>${escapeHTML(transaction.id || "—")}</td>
          <td>${escapeHTML(transaction.description || "Fee Payment")}</td>
          <td>${escapeHTML(formatDate(transaction.date))}</td>
          <td>${escapeHTML(formatCurrency(transaction.amount))}</td>
          <td>${escapeHTML(transaction.mode || "—")}</td>
          <td>
            <span class="badge ${isPaid ? "badge-green" : "badge-amber"}">
              ${escapeHTML(transaction.status || "Pending")}
            </span>
          </td>
        </tr>
      `;
    }).join("");
  }



  function getPDFDocument() {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      alert(
        "PDF library load nahi hui. Internet connection check karke page reload karo."
      );

      return null;
    }

    return new window.jspdf.jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true
    });
  }


  function drawPageBorder(doc) {
    const pageWidth = 210;
    const pageHeight = 297;

    doc.setDrawColor(25, 55, 95);
    doc.setLineWidth(0.8);
    doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

    doc.setDrawColor(180, 190, 205);
    doc.setLineWidth(0.25);
    doc.rect(11, 11, pageWidth - 22, pageHeight - 22);
  }



  function drawPDFHeader(doc, title, subtitle) {
    drawPageBorder(doc);

    doc.setTextColor(25, 55, 95);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);

    doc.text("UNIVERSITY MANAGEMENT SYSTEM", 105, 25, {
      align: "center"
    });

    doc.setTextColor(70, 80, 95);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    doc.text("STUDENT ACCOUNTS DEPARTMENT", 105, 32, {
      align: "center"
    });

    doc.setDrawColor(25, 55, 95);
    doc.setLineWidth(0.8);
    doc.line(22, 37, 188, 37);

    doc.setTextColor(25, 55, 95);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);

    doc.text(title, 105, 49, {
      align: "center"
    });

    doc.setTextColor(95, 105, 120);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    doc.text(subtitle, 105, 55, {
      align: "center"
    });

    doc.setTextColor(35, 35, 35);
  }

  

  function drawSectionHeading(doc, title, y) {
    doc.setFillColor(235, 240, 247);
    doc.roundedRect(20, y - 5, 170, 9, 1.5, 1.5, "F");

    doc.setTextColor(25, 55, 95);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);

    doc.text(title, 24, y + 1);

    doc.setTextColor(35, 35, 35);
  }



  function drawDetailRow(doc, label, value, y) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(95, 105, 120);

    doc.text(label, 25, y);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(35, 35, 35);

    doc.text(String(value ?? "—"), 75, y);
  }

  

  function calculatePaidAmount(record) {
    return record.transactions
      .filter(function (transaction) {
        return String(transaction.status).toLowerCase() === "paid";
      })
      .reduce(function (sum, transaction) {
        return sum + (Number(transaction.amount) || 0);
      }, 0);
  }


  function drawStudentDetails(doc, record, startY) {
    drawSectionHeading(doc, "STUDENT INFORMATION", startY);

    drawDetailRow(doc, "Student Name", selectedStudent.name, startY + 13);
    drawDetailRow(doc, "Roll Number", selectedStudent.roll, startY + 22);
    drawDetailRow(doc, "Branch / Semester", selectedStudent.branch || "—", startY + 31);
    drawDetailRow(doc, "Academic Year", record.academicYear || "2026-27", startY + 40);

    return startY + 50;
  }

 

  function drawFeeSummary(doc, record, startY) {
    const totalFees = Number(record.totalFees) || 0;
    const paidAmount = calculatePaidAmount(record);
    const pendingAmount = Math.max(totalFees - paidAmount, 0);

    drawSectionHeading(doc, "FEE ACCOUNT SUMMARY", startY);

    const boxY = startY + 8;
    const boxWidth = 53;
    const boxHeight = 25;

    const boxes = [
      {
        x: 22,
        label: "TOTAL FEES",
        value: formatCurrency(totalFees)
      },
      {
        x: 78.5,
        label: "PAID AMOUNT",
        value: formatCurrency(paidAmount)
      },
      {
        x: 135,
        label: "PENDING DUES",
        value: formatCurrency(pendingAmount)
      }
    ];

    boxes.forEach(function (box) {
      doc.setDrawColor(205, 213, 224);
      doc.setLineWidth(0.35);
      doc.roundedRect(box.x, boxY, boxWidth, boxHeight, 2, 2, "S");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 110, 125);

      doc.text(box.label, box.x + boxWidth / 2, boxY + 8, {
        align: "center"
      });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(25, 55, 95);

      doc.text(box.value, box.x + boxWidth / 2, boxY + 18, {
        align: "center"
      });
    });

    return {
      nextY: boxY + boxHeight + 12,
      totalFees: totalFees,
      paidAmount: paidAmount,
      pendingAmount: pendingAmount
    };
  }

  

  function drawDemoNotice(doc, y) {
   
  }

  

  function drawPDFFooter(doc) {
    doc.setDrawColor(205, 213, 224);
    doc.setLineWidth(0.3);
    doc.line(20, 269, 190, 269);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(90, 100, 115);

    doc.text("University Management System", 20, 276);

    doc.text("Generated on: " + getCurrentDate(), 190, 276, {
      align: "right"
    });

    doc.setFontSize(7);

    doc.text(
      "Prepared from the fee records available in this system.",
      105,
      283,
      { align: "center" }
    );

    doc.setTextColor(35, 35, 35);
  }

  

  function downloadCertificate() {
    if (!selectedStudent) {
      alert("Please search and select a student first.");
      return;
    }

    const doc = getPDFDocument();

    if (!doc) {
      return;
    }

    const record = getStudentFeeRecord(selectedStudent);

    drawPDFHeader(
      doc,
      "FEE ACCOUNT STATEMENT",
      "Student Fee Account Summary"
    );

    drawStudentDetails(doc, record, 68);

    const summary = drawFeeSummary(doc, record, 126);

    const statusY = summary.nextY + 3;

    drawSectionHeading(doc, "ACCOUNT STATUS", statusY);

    const isCleared =
      summary.totalFees > 0 &&
      summary.pendingAmount === 0;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);

    doc.setTextColor(
      isCleared ? 25 : 160,
      isCleared ? 115 : 75,
      isCleared ? 65 : 35
    );

    doc.text(
      isCleared ? "NO OUTSTANDING DUES" : "CLEARANCE PENDING",
      25,
      statusY + 14
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(65, 75, 90);

    const statusDescription = isCleared
      ? "The recorded fee amount has been paid according to the data available in this system."
      : "Outstanding dues remain or the fee record is incomplete.";

    doc.text(statusDescription, 25, statusY + 22, {
      maxWidth: 160
    });

  
    const signY = 232;

    doc.setDrawColor(120, 130, 145);
    doc.setLineWidth(0.4);

    doc.line(25, signY, 82, signY);
    doc.line(128, signY, 185, signY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(70, 80, 95);

    doc.text("Accounts Officer", 53.5, signY + 6, {
      align: "center"
    });

    doc.text("Authorized Signatory", 156.5, signY + 6, {
      align: "center"
    });

    drawDemoNotice(doc, 250);
    drawPDFFooter(doc);

    doc.save("Fee_Account_Statement_" + selectedStudent.roll + ".pdf");
  }



  function drawReceiptTableHeader(doc, y) {
    doc.setFillColor(25, 55, 95);
    doc.rect(20, y - 5, 170, 10, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);

    doc.text("RECEIPT ID", 23, y + 1);
    doc.text("DATE", 52, y + 1);
    doc.text("DESCRIPTION", 78, y + 1);
    doc.text("AMOUNT", 153, y + 1);
    doc.text("STATUS", 178, y + 1);

    doc.setTextColor(35, 35, 35);
  }

 

  function drawReceiptRows(doc, transactions, startY) {
    let y = startY;

    if (!transactions.length) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);

      doc.text("No fee transactions recorded.", 25, y + 5);

      return y + 12;
    }

    transactions.forEach(function (transaction, index) {
      if (y > 255) {
        doc.addPage();
        drawPageBorder(doc);
        y = 25;
      }

      if (index % 2 === 0) {
        doc.setFillColor(247, 249, 252);
        doc.rect(20, y - 5, 170, 10, "F");
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(40, 45, 55);

      doc.text(String(transaction.id || "—").slice(0, 15), 23, y + 1);
      doc.text(formatDate(transaction.date), 52, y + 1);

      const description = String(
        transaction.description || "Fee Payment"
      );

      doc.text(description.slice(0, 32), 78, y + 1);

      doc.text(formatCurrency(transaction.amount), 153, y + 1);

      const status = String(transaction.status || "Pending");

      doc.setTextColor(
        status.toLowerCase() === "paid" ? 20 : 160,
        status.toLowerCase() === "paid" ? 115 : 75,
        status.toLowerCase() === "paid" ? 65 : 35
      );

      doc.text(status.slice(0, 12), 178, y + 1);

      doc.setTextColor(40, 45, 55);

      y += 10;
    });

    return y;
  }

  

  function downloadReceipts() {
    if (!selectedStudent) {
      alert("Please search and select a student first.");
      return;
    }

    const doc = getPDFDocument();

    if (!doc) {
      return;
    }

    const record = getStudentFeeRecord(selectedStudent);

    drawPDFHeader(
      doc,
      "FEE TRANSACTION STATEMENT",
      "Recorded Payments and Transaction History"
    );

    drawStudentDetails(doc, record, 65);

    const summary = drawFeeSummary(doc, record, 120);

    let tableY = summary.nextY + 3;

    drawSectionHeading(doc, "TRANSACTION HISTORY", tableY);

    tableY += 12;

    drawReceiptTableHeader(doc, tableY);

    tableY += 11;

    tableY = drawReceiptRows(
      doc,
      record.transactions,
      tableY
    );

    if (tableY > 245) {
      doc.addPage();
      drawPageBorder(doc);
      tableY = 25;
    }

    const paidAmount = calculatePaidAmount(record);

    doc.setDrawColor(190, 200, 215);
    doc.line(20, tableY + 3, 190, tableY + 3);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(25, 55, 95);

    doc.text("TOTAL PAID", 115, tableY + 12);

    doc.text(
      formatCurrency(paidAmount),
      188,
      tableY + 12,
      { align: "right" }
    );

    const noticeY = Math.min(tableY + 20, 248);

    drawDemoNotice(doc, noticeY);

    if (noticeY + 20 < 265) {
      drawPDFFooter(doc);
    }

    doc.save("Fee_Receipts_" + selectedStudent.roll + ".pdf");
  }


  window.addEventListener("storage", function (event) {
    if (event.key === STUDENT_STORAGE_KEY) {
      students = loadStudents();
      updateSuggestions();

      if (!selectedStudent) {
        return;
      }

      const updatedStudent = students.find(function (student) {
        return student.roll === selectedStudent.roll;
      });

      if (updatedStudent) {
        selectedStudent = updatedStudent;
        renderFeeDetails();
      } else {
        selectedStudent = null;

        setText("selectedStudentName", "No student selected");
        setText("selectedStudentRoll", "—");
        setText("selectedAcademicYear", "—");
        setText("totalFees", "INR 0");
        setText("paidAmount", "INR 0");
        setText("duesStatus", "No Student Selected");
        setText("clearanceStatus", "Not Available");
        setText("examEligibility", "Not Available");

        const tableBody = getElement("feeTableBody");

        if (tableBody) {
          tableBody.innerHTML = "";
        }

        const noTransactions = getElement("noTransactions");

        if (noTransactions) {
          noTransactions.hidden = false;
        }
      }
    }

    if (event.key === FEE_STORAGE_KEY) {
      feeRecords = loadFeeRecords();

      if (selectedStudent) {
        renderFeeDetails();
      }
    }
  });



  function init() {
    students = loadStudents();
    updateSuggestions();

    const searchForm = getElement("studentSearchForm");

    if (searchForm) {
      searchForm.addEventListener("submit", handleSearch);
    }

    const certificateButton = getElement("downloadCertificate");

    if (certificateButton) {
      certificateButton.addEventListener("click", downloadCertificate);
    }

    const receiptsButton = getElement("downloadReceipts");

    if (receiptsButton) {
      receiptsButton.addEventListener("click", downloadReceipts);
    }

    const defaultStudent =
      students.find(function (student) {
        return student.roll === "CSE21B001";
      }) || students[0];

    if (defaultStudent) {
      selectStudent(defaultStudent);
    } else {
      setText("selectedStudentName", "No student selected");
      setText("selectedStudentRoll", "—");
      setText("selectedAcademicYear", "—");
      setText("totalFees", "INR 0");
      setText("paidAmount", "INR 0");
      setText("clearanceStatus", "Not Available");
      setText("examEligibility", "Not Available");

      const tableBody = getElement("feeTableBody");

      if (tableBody) {
        tableBody.innerHTML = "";
      }

      const noTransactions = getElement("noTransactions");

      if (noTransactions) {
        noTransactions.hidden = false;
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();