/**
 * University Management System - Attendance Module
 * Pure Vanilla JavaScript implementation for:
 * - Dynamic table rendering from localStorage
 * - Automatic attendance percentage calculation
 *     Attendance % = (Classes Attended / Classes Held) x 100
 * - Automatic eligibility status (Eligible / Shortage Alert) using the 75% policy
 * - Live statistics cards (total, eligible, shortage)
 * - Search by name or roll number + eligibility filter
 * - Update attendance (Edit modal with validation) saved to localStorage
 * - Student list stays in sync with the Students module (read-only)
 *
 * Author: Abhishek Tomar
 */

(function () {
  'use strict';

  // Storage keys
  var ATTENDANCE_KEY = 'ums_attendance';   // owned by this module
  var STUDENTS_KEY = 'ums_students';       // owned by the Students module (read only here)

  // Minimum attendance required for exam eligibility (from the Department Attendance Policy box)
  var MIN_PERCENTAGE = 75;

  // Default attendance records, same numbers as the original static table
  var DEFAULT_ATTENDANCE = {
    'CSE21B001': { held: 48, attended: 46 },
    'CSE21B014': { held: 48, attended: 41 },
    'ECE22B008': { held: 45, attended: 39 },
    'CSE22B032': { held: 48, attended: 33 },
    'IT21B019': { held: 46, attended: 43 },
    'CSE23B045': { held: 42, attended: 30 }
  };

  // Fallback student list, used only if the Students page has never been opened
  var DEFAULT_STUDENTS = [
    { roll: 'CSE21B001', name: 'Ananya Sharma', avatar: 'images/student-1.jpg' },
    { roll: 'CSE21B014', name: 'Rahul Mehta', avatar: 'images/student-2.jpg' },
    { roll: 'ECE22B008', name: 'Priya Nair', avatar: 'images/student-3.jpg' },
    { roll: 'CSE22B032', name: 'Arjun Patel', avatar: 'images/student-4.jpg' },
    { roll: 'IT21B019', name: 'Sneha Reddy', avatar: 'images/student-5.jpg' },
    { roll: 'CSE23B045', name: 'Vikram Singh', avatar: 'images/student-6.jpg' }
  ];

  // In-memory data
  var students = [];       // list of students (from Students module)
  var attendance = {};     // { rollNumber: { held: number, attended: number } }

  // Roll number of the student currently being edited, or null
  var currentEditingRoll = null;

  /**
   * Safe HTML string escaping
   */
  function escapeHtml(str) {
    if (!str && str !== 0) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Generate 2-letter initials for avatar placeholder
   */
  function getInitials(name) {
    if (!name) return 'ST';
    var parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  /**
   * Render student avatar (image or initials placeholder)
   */
  function renderAvatarHtml(student) {
    if (student.avatar) {
      return '<img class="person-thumb" src="' + escapeHtml(student.avatar) + '" alt="" onerror="this.style.display=\'none\'; if(this.nextElementSibling){this.nextElementSibling.style.display=\'inline-flex\';}">' +
             '<div class="person-thumb person-avatar-placeholder" style="display:none;">' + getInitials(student.name) + '</div>';
    }
    return '<div class="person-thumb person-avatar-placeholder">' + getInitials(student.name) + '</div>';
  }

  /**
   * Load the student list written by the Students module.
   * This module never writes to it.
   */
  function loadStudents() {
    var stored = localStorage.getItem(STUDENTS_KEY);
    if (stored === null) {
      return DEFAULT_STUDENTS.slice();
    }
    try {
      var parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {
      console.error('Error parsing ums_students from localStorage:', e);
    }
    return DEFAULT_STUDENTS.slice();
  }

  /**
   * Load attendance records from localStorage or initialize with defaults
   */
  function loadAttendance() {
    var stored = localStorage.getItem(ATTENDANCE_KEY);
    if (stored === null) {
      localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(DEFAULT_ATTENDANCE));
      return JSON.parse(JSON.stringify(DEFAULT_ATTENDANCE));
    }
    try {
      var parsed = JSON.parse(stored);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {
      console.error('Error parsing ums_attendance from localStorage:', e);
    }
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(DEFAULT_ATTENDANCE));
    return JSON.parse(JSON.stringify(DEFAULT_ATTENDANCE));
  }

  /**
   * Persist attendance records to localStorage
   */
  function persistAttendance() {
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(attendance));
  }

  /**
   * Get classes held / attended for a roll number (0 / 0 if no record yet)
   */
  function getRecord(roll) {
    var record = attendance[roll];
    if (!record) {
      return { held: 0, attended: 0 };
    }
    return { held: Number(record.held) || 0, attended: Number(record.attended) || 0 };
  }

  /**
   * Attendance Percentage = (Classes Attended / Classes Held) x 100
   * Returns null when no classes have been held (avoids dividing by zero).
   */
  function calculatePercentage(held, attended) {
    if (held <= 0) return null;
    return (attended / held) * 100;
  }

  /**
   * Eligibility rule: percentage must be at least MIN_PERCENTAGE
   * Returns 'eligible', 'shortage', or 'pending' (no classes held yet)
   */
  function getEligibility(percentage) {
    if (percentage === null) return 'pending';
    return percentage >= MIN_PERCENTAGE ? 'eligible' : 'shortage';
  }

  /**
   * Get formatted eligibility badge markup (reuses existing badge classes)
   */
  function getStatusBadge(status) {
    if (status === 'eligible') {
      return '<span class="badge badge-green">Eligible</span>';
    }
    if (status === 'shortage') {
      return '<span class="badge badge-red">Shortage Alert</span>';
    }
    return '<span class="badge badge-gray">Not Updated</span>';
  }

  /**
   * Build one display row object per student (record + calculated fields)
   */
  function buildRows() {
    return students.map(function (s) {
      var record = getRecord(s.roll);
      var percentage = calculatePercentage(record.held, record.attended);
      return {
        student: s,
        held: record.held,
        attended: record.attended,
        percentage: percentage,
        status: getEligibility(percentage)
      };
    });
  }

  /**
   * Update the three statistics cards (always based on ALL students, not filtered)
   */
  function updateStats(rows) {
    var eligibleCount = 0;
    var shortageCount = 0;

    for (var i = 0; i < rows.length; i++) {
      if (rows[i].status === 'eligible') eligibleCount++;
      if (rows[i].status === 'shortage') shortageCount++;
    }

    var totalEl = document.getElementById('totalStudentsStat');
    var eligibleEl = document.getElementById('eligibleStudentsStat');
    var shortageEl = document.getElementById('shortageStudentsStat');

    if (totalEl) totalEl.textContent = rows.length;
    if (eligibleEl) eligibleEl.textContent = eligibleCount;
    if (shortageEl) shortageEl.textContent = shortageCount;
  }

  /**
   * Update "Showing X of Y students" label
   */
  function updateCountLabel(showingCount, totalCount) {
    var label = document.getElementById('attendanceCountLabel');
    if (label) {
      label.textContent = 'Showing ' + showingCount + ' of ' + totalCount + ' students';
    }
  }

  /**
   * Apply search text and eligibility filter to the rows
   */
  function getFilteredRows(rows) {
    var searchInput = document.getElementById('attendanceSearch');
    var statusSelect = document.getElementById('attendanceStatusFilter');

    var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var statusFilter = statusSelect ? statusSelect.value : '';

    return rows.filter(function (r) {
      var matchesSearch = !query ||
        (r.student.name && r.student.name.toLowerCase().indexOf(query) !== -1) ||
        (r.student.roll && r.student.roll.toLowerCase().indexOf(query) !== -1);

      var matchesStatus = !statusFilter || r.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  /**
   * Render rows in the attendance table
   */
  function renderTable(list) {
    var tbody = document.querySelector('.table-wrap table tbody');
    if (!tbody) return;

    if (!list || list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 32px 16px; color: #64748b; font-weight: 500;">No attendance records found matching your filters.</td></tr>';
      return;
    }

    var html = '';
    for (var i = 0; i < list.length; i++) {
      var r = list[i];
      var percentText = r.percentage === null ? 'N/A' : r.percentage.toFixed(1) + '%';

      html += '<tr data-roll="' + escapeHtml(r.student.roll) + '">' +
        '<td>' + escapeHtml(r.student.roll) + '</td>' +
        '<td>' +
          '<div class="person-cell">' +
            renderAvatarHtml(r.student) +
            '<span>' + escapeHtml(r.student.name) + '</span>' +
          '</div>' +
        '</td>' +
        '<td>' + r.held + '</td>' +
        '<td>' + r.attended + '</td>' +
        '<td>' + percentText + '</td>' +
        '<td>' + getStatusBadge(r.status) + '</td>' +
        '<td>' +
          '<div class="action-buttons">' +
            '<button type="button" class="btn-edit" data-roll="' + escapeHtml(r.student.roll) + '" title="Update attendance">Update</button>' +
          '</div>' +
        '</td>' +
      '</tr>';
    }

    tbody.innerHTML = html;
  }

  /**
   * Recalculate everything and re-render the whole page view
   */
  function refreshView() {
    var rows = buildRows();
    var filtered = getFilteredRows(rows);
    renderTable(filtered);
    updateStats(rows);
    updateCountLabel(filtered.length, rows.length);
  }

  /**
   * Setup search and filter listeners
   */
  function initControls() {
    var searchInput = document.getElementById('attendanceSearch');
    var statusSelect = document.getElementById('attendanceStatusFilter');

    if (searchInput) {
      searchInput.addEventListener('input', refreshView);
    }
    if (statusSelect) {
      statusSelect.addEventListener('change', refreshView);
    }
  }

  /**
   * Close the update modal and reset state
   */
  function closeModal() {
    var modal = document.getElementById('attendanceModal');
    var form = document.getElementById('attendanceForm');
    if (!modal) return;

    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    if (form) {
      form.reset();
    }
    currentEditingRoll = null;
  }

  /**
   * Open the update modal pre-filled with a student's current attendance
   */
  function openEditModal(roll) {
    var student = null;
    for (var i = 0; i < students.length; i++) {
      if (students[i].roll === roll) {
        student = students[i];
        break;
      }
    }
    if (!student) return;

    var modal = document.getElementById('attendanceModal');
    var rollInput = document.getElementById('attendanceRoll');
    var nameInput = document.getElementById('attendanceName');
    var heldInput = document.getElementById('classesHeld');
    var attendedInput = document.getElementById('classesAttended');
    if (!modal) return;

    var record = getRecord(roll);
    currentEditingRoll = roll;

    if (rollInput) rollInput.value = student.roll;
    if (nameInput) nameInput.value = student.name;
    if (heldInput) heldInput.value = record.held;
    if (attendedInput) attendedInput.value = record.attended;

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');

    if (heldInput) heldInput.focus();
  }

  /**
   * Validate the form values. Returns an error message, or '' if valid.
   */
  function validateAttendance(heldText, attendedText) {
    if (heldText === '' || attendedText === '') {
      return 'Please fill in both Classes Held and Classes Attended.';
    }

    var held = Number(heldText);
    var attended = Number(attendedText);

    if (!Number.isInteger(held) || !Number.isInteger(attended)) {
      return 'Please enter whole numbers only.';
    }
    if (held < 1) {
      return 'Total Classes Held must be at least 1.';
    }
    if (attended < 0) {
      return 'Classes Attended cannot be negative.';
    }
    if (attended > held) {
      return 'Classes Attended cannot be greater than Total Classes Held.';
    }
    return '';
  }

  /**
   * Setup edit button clicks (event delegation) and modal form handling
   */
  function initModal() {
    var tbody = document.querySelector('.table-wrap table tbody');
    var modal = document.getElementById('attendanceModal');
    var form = document.getElementById('attendanceForm');
    var closeBtn = document.getElementById('closeAttendanceModalBtn');
    var cancelBtn = document.getElementById('cancelAttendanceModalBtn');

    // One listener on tbody handles every Update button, even after re-render
    if (tbody) {
      tbody.addEventListener('click', function (e) {
        var btn = e.target.closest ? e.target.closest('.btn-edit') : null;
        if (btn) {
          openEditModal(btn.getAttribute('data-roll'));
        }
      });
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    if (modal) {
      // Click on the dark background closes the modal
      modal.addEventListener('click', function (e) {
        if (e.target === modal) closeModal();
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
        closeModal();
      }
    });

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!currentEditingRoll) return;

        var heldText = document.getElementById('classesHeld').value.trim();
        var attendedText = document.getElementById('classesAttended').value.trim();

        var errorMessage = validateAttendance(heldText, attendedText);
        if (errorMessage) {
          alert(errorMessage);
          return;
        }

        attendance[currentEditingRoll] = {
          held: Number(heldText),
          attended: Number(attendedText)
        };
        persistAttendance();
        closeModal();
        refreshView();
      });
    }
  }

  /**
   * Keep in sync with other tabs / the Students module
   */
  window.addEventListener('storage', function (e) {
    if (e.key === STUDENTS_KEY) {
      students = loadStudents();
      refreshView();
    } else if (e.key === ATTENDANCE_KEY) {
      attendance = loadAttendance();
      refreshView();
    }
  });

  /**
   * Initialization
   */
  function init() {
    students = loadStudents();
    attendance = loadAttendance();
    initControls();
    initModal();
    refreshView();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
