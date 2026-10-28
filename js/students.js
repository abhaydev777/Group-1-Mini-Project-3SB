/**
 * University Management System - Students Module
 * Pure Vanilla JavaScript implementation for:
 * - Dynamic table rendering from localStorage
 * - Real-time filtering across search input, branch, and academic status
 * - Full CRUD operations:
 *    - Create (Add Student modal with optional Base64 photo upload)
 *    - Read (Roster table rendering with image/initials avatars)
 *    - Update (Edit Student modal pre-filling and updating)
 *    - Delete (Remove button with localStorage sync)
 * - Modal management with image preview and state reset
 */

(function () {
  'use strict';

  var STORAGE_KEY = 'ums_students';

  // Default 6 mock students representing existing university records
  var DEFAULT_STUDENTS = [
    {
      roll: 'CSE21B001',
      name: 'Ananya Sharma',
      branch: 'CSE - Sem 6',
      email: 'ananya.sharma@uni.edu',
      status: "Dean's List",
      avatar: 'images/student-1.jpg'
    },
    {
      roll: 'CSE21B014',
      name: 'Rahul Mehta',
      branch: 'CSE - Sem 6',
      email: 'rahul.mehta@uni.edu',
      status: 'Regular',
      avatar: 'images/student-2.jpg'
    },
    {
      roll: 'ECE22B008',
      name: 'Priya Nair',
      branch: 'ECE - Sem 4',
      email: 'priya.nair@uni.edu',
      status: 'Regular',
      avatar: 'images/student-3.jpg'
    },
    {
      roll: 'CSE22B032',
      name: 'Arjun Patel',
      branch: 'CSE - Sem 4',
      email: 'arjun.patel@uni.edu',
      status: 'Pending',
      avatar: 'images/student-4.jpg'
    },
    {
      roll: 'IT21B019',
      name: 'Sneha Reddy',
      branch: 'IT - Sem 6',
      email: 'sneha.reddy@uni.edu',
      status: "Dean's List",
      avatar: 'images/student-5.jpg'
    },
    {
      roll: 'CSE23B045',
      name: 'Vikram Singh',
      branch: 'CSE - Sem 2',
      email: 'vikram.singh@uni.edu',
      status: 'Regular',
      avatar: 'images/student-6.jpg'
    }
  ];

  // In-memory list of students
  var students = [];

  // Track editing state: holds the roll number of the student currently being edited, or null
  var currentEditingRoll = null;

  // Track uploaded Base64 photo data (or existing avatar URL), or empty string
  var currentAvatarData = '';

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
   * Generate 2-letter initials for student avatar placeholder
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
   * Get formatted status badge markup
   */
  function getStatusBadge(status) {
    var trimmed = (status || '').trim();
    if (trimmed === "Dean's List") {
      return '<span class="badge badge-green badge-deans">Dean\'s List</span>';
    } else if (trimmed === 'Regular') {
      return '<span class="badge badge-blue badge-regular">Regular</span>';
    } else if (trimmed === 'Pending') {
      return '<span class="badge badge-amber badge-pending">Pending</span>';
    }
    return '<span class="badge badge-gray">' + escapeHtml(trimmed) + '</span>';
  }

  /**
   * Load students from localStorage or initialize with defaults
   */
  function loadStudents() {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored === null) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STUDENTS));
      return DEFAULT_STUDENTS.slice();
    }
    try {
      var parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return DEFAULT_STUDENTS.slice();
    } catch (e) {
      console.error('Error parsing ums_students from localStorage:', e);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STUDENTS));
      return DEFAULT_STUDENTS.slice();
    }
  }

  /**
   * Persist students to localStorage
   */
  function persistStudents() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  }

  /**
   * Render student avatar (image or initial placeholder)
   */
  function renderAvatarHtml(student) {
    if (student.avatar) {
      return '<img class="person-thumb" src="' + escapeHtml(student.avatar) + '" alt="' + escapeHtml(student.name) + '" onerror="this.style.display=\'none\'; if(this.nextElementSibling){this.nextElementSibling.style.display=\'inline-flex\';}">' +
             '<div class="person-thumb person-avatar-placeholder" style="display:none;">' + getInitials(student.name) + '</div>';
    }
    return '<div class="person-thumb person-avatar-placeholder">' + getInitials(student.name) + '</div>';
  }

  /**
   * Update count indicators on page
   */
  function updateCountLabels(showingCount) {
    var totalCount = students.length;
    var countLabel = document.getElementById('studentCountLabel');
    if (countLabel) {
      countLabel.textContent = 'Showing ' + showingCount + ' of ' + totalCount + ' registered students';
    }

    var headerCountMeta = document.getElementById('headerCountMeta');
    if (headerCountMeta) {
      headerCountMeta.innerHTML = 'Showing <strong>' + showingCount + '</strong> of <strong>' + totalCount + '</strong> registered students';
    }
  }

  /**
   * Render rows in the student records table
   */
  function renderTable(list) {
    var tbody = document.querySelector('.table-wrap table tbody');
    if (!tbody) return;

    if (!list || list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 32px 16px; color: #64748b; font-weight: 500;">No student records found matching your filters.</td></tr>';
      updateCountLabels(0);
      return;
    }

    var html = '';
    for (var i = 0; i < list.length; i++) {
      var s = list[i];
      html += '<tr data-roll="' + escapeHtml(s.roll) + '">' +
        '<td>' + escapeHtml(s.roll) + '</td>' +
        '<td>' +
          '<div class="person-cell">' +
            renderAvatarHtml(s) +
            '<span>' + escapeHtml(s.name) + '</span>' +
          '</div>' +
        '</td>' +
        '<td>' + escapeHtml(s.branch) + '</td>' +
        '<td>' + escapeHtml(s.email) + '</td>' +
        '<td>' + getStatusBadge(s.status) + '</td>' +
        '<td>' +
          '<div class="action-buttons">' +
            '<button type="button" class="btn-edit" data-roll="' + escapeHtml(s.roll) + '" title="Edit student">' +
              'Edit' +
            '</button>' +
            '<button type="button" class="btn-delete" data-roll="' + escapeHtml(s.roll) + '" title="Remove student">' +
              'Remove' +
            '</button>' +
          '</div>' +
        '</td>' +
      '</tr>';
    }

    tbody.innerHTML = html;
    updateCountLabels(list.length);
  }

  /**
   * Filter students based on current controls
   */
  function getFilteredStudents() {
    var searchInput = document.getElementById('studentSearch');
    var branchSelect = document.getElementById('branchFilter');
    var statusSelect = document.getElementById('statusFilter');

    var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var branch = branchSelect ? branchSelect.value.trim() : '';
    var status = statusSelect ? statusSelect.value.trim() : '';

    return students.filter(function (s) {
      var matchesSearch = !query ||
        (s.name && s.name.toLowerCase().indexOf(query) !== -1) ||
        (s.roll && s.roll.toLowerCase().indexOf(query) !== -1) ||
        (s.branch && s.branch.toLowerCase().indexOf(query) !== -1);

      var matchesBranch = !branch ||
        (s.branch && s.branch.toUpperCase().indexOf(branch.toUpperCase()) !== -1);

      var matchesStatus = !status ||
        (s.status && s.status.toLowerCase() === status.toLowerCase());

      return matchesSearch && matchesBranch && matchesStatus;
    });
  }

  /**
   * Re-filter and re-render the view
   */
  function refreshView() {
    var filtered = getFilteredStudents();
    renderTable(filtered);
  }

  /**
   * Setup controls listeners
   */
  function initControls() {
    var searchInput = document.getElementById('studentSearch');
    var branchSelect = document.getElementById('branchFilter');
    var statusSelect = document.getElementById('statusFilter');

    if (searchInput) {
      searchInput.addEventListener('input', refreshView);
    }
    if (branchSelect) {
      branchSelect.addEventListener('change', refreshView);
    }
    if (statusSelect) {
      statusSelect.addEventListener('change', refreshView);
    }
  }

  /**
   * Helper to set modal avatar preview
   */
  function setAvatarPreview(avatarUrl, initials) {
    var previewImg = document.getElementById('avatarPreview');
    var initialsEl = document.getElementById('avatarInitialsPreview');

    if (!previewImg || !initialsEl) return;

    if (avatarUrl) {
      previewImg.src = avatarUrl;
      previewImg.style.display = 'block';
      initialsEl.style.display = 'none';
    } else {
      previewImg.style.display = 'none';
      previewImg.src = 'images/avatar-default.png';
      initialsEl.style.display = 'flex';
      initialsEl.textContent = initials || 'PIC';
    }
  }

  /**
   * Open modal in "Add New Student" mode
   */
  function openAddModal() {
    currentEditingRoll = null;
    currentAvatarData = '';

    var modal = document.getElementById('addStudentModal');
    var form = document.getElementById('addStudentForm');
    var modalTitle = document.getElementById('modalTitle') || (modal ? modal.querySelector('.modal-header h3') : null);
    var saveBtn = document.getElementById('saveStudentBtn');
    var rollInput = document.getElementById('studentRoll');
    var avatarInput = document.getElementById('studentAvatarInput');

    if (!modal) return;

    if (form) {
      form.reset();
      form.removeAttribute('data-edit-id');
    }

    if (avatarInput) {
      avatarInput.value = '';
    }

    setAvatarPreview('', 'PIC');

    if (modalTitle) {
      modalTitle.textContent = 'Add New Student';
    }
    if (saveBtn) {
      saveBtn.textContent = 'Save Student';
    }

    if (rollInput) {
      rollInput.readOnly = false;
      rollInput.disabled = false;
    }

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');

    if (rollInput) {
      rollInput.focus();
    }
  }

  /**
   * Open modal in "Edit Student Details" mode
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

    currentEditingRoll = student.roll;

    var modal = document.getElementById('addStudentModal');
    var form = document.getElementById('addStudentForm');
    var modalTitle = document.getElementById('modalTitle') || (modal ? modal.querySelector('.modal-header h3') : null);
    var saveBtn = document.getElementById('saveStudentBtn');

    var rollInput = document.getElementById('studentRoll');
    var nameInput = document.getElementById('studentName');
    var branchInput = document.getElementById('studentBranch');
    var emailInput = document.getElementById('studentEmail');
    var statusInput = document.getElementById('studentStatus');
    var avatarInput = document.getElementById('studentAvatarInput');

    if (form) {
      form.setAttribute('data-edit-id', student.roll);
    }

    if (avatarInput) {
      avatarInput.value = '';
    }

    // Pre-fill existing avatar or fallback to initials
    if (student.avatar) {
      currentAvatarData = student.avatar;
      setAvatarPreview(student.avatar);
    } else {
      currentAvatarData = '';
      setAvatarPreview('', getInitials(student.name));
    }

    if (modalTitle) {
      modalTitle.textContent = 'Edit Student Details';
    }
    if (saveBtn) {
      saveBtn.textContent = 'Save Changes';
    }

    if (rollInput) {
      rollInput.value = student.roll;
      rollInput.readOnly = true;
    }
    if (nameInput) {
      nameInput.value = student.name;
    }
    if (branchInput) {
      branchInput.value = student.branch;
    }
    if (emailInput) {
      emailInput.value = student.email;
    }
    if (statusInput) {
      statusInput.value = student.status;
    }

    if (modal) {
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
    }

    if (nameInput) {
      nameInput.focus();
    }
  }

  /**
   * Close modal and reset state to default Add mode
   */
  function closeModal() {
    var modal = document.getElementById('addStudentModal');
    var form = document.getElementById('addStudentForm');
    var modalTitle = document.getElementById('modalTitle') || (modal ? modal.querySelector('.modal-header h3') : null);
    var saveBtn = document.getElementById('saveStudentBtn');
    var rollInput = document.getElementById('studentRoll');
    var avatarInput = document.getElementById('studentAvatarInput');

    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    }

    if (form) {
      form.reset();
      form.removeAttribute('data-edit-id');
    }

    if (avatarInput) {
      avatarInput.value = '';
    }

    currentAvatarData = '';
    setAvatarPreview('', 'PIC');

    if (modalTitle) {
      modalTitle.textContent = 'Add New Student';
    }
    if (saveBtn) {
      saveBtn.textContent = 'Save Student';
    }

    if (rollInput) {
      rollInput.readOnly = false;
      rollInput.disabled = false;
    }

    currentEditingRoll = null;
  }

  /**
   * Setup row actions (Delete & Edit) via delegated click
   */
  function initTableActions() {
    var tbody = document.querySelector('.table-wrap table tbody');
    if (!tbody) return;

    tbody.addEventListener('click', function (e) {
      // Delete handler
      var deleteBtn = e.target.closest('.btn-delete');
      if (deleteBtn) {
        var rollToDelete = deleteBtn.getAttribute('data-roll');
        if (!rollToDelete) return;

        students = students.filter(function (s) {
          return s.roll !== rollToDelete;
        });

        persistStudents();
        refreshView();
        return;
      }

      // Edit handler
      var editBtn = e.target.closest('.btn-edit');
      if (editBtn) {
        var rollToEdit = editBtn.getAttribute('data-roll');
        if (!rollToEdit) return;
        openEditModal(rollToEdit);
      }
    });
  }

  /**
   * Setup Modal dialog listeners and student submission (Add / Edit)
   */
  function initModal() {
    var modal = document.getElementById('addStudentModal');
    var openBtn = document.getElementById('openAddModalBtn');
    var closeBtn = document.getElementById('closeModalBtn');
    var cancelBtn = document.getElementById('cancelModalBtn');
    var form = document.getElementById('addStudentForm');
    var avatarInput = document.getElementById('studentAvatarInput');
    var nameInput = document.getElementById('studentName');

    if (!modal) return;

    // Handle avatar file selection & live conversion to Base64
    if (avatarInput) {
      avatarInput.addEventListener('change', function (e) {
        var file = e.target.files && e.target.files[0];
        if (!file) return;

        if (file.type && !file.type.match(/^image\//)) {
          alert('Please select a valid image file.');
          avatarInput.value = '';
          return;
        }

        var reader = new FileReader();
        reader.onload = function (event) {
          currentAvatarData = event.target.result;
          setAvatarPreview(currentAvatarData);
        };
        reader.readAsDataURL(file);
      });
    }

    // Dynamic initials preview when typing full name in case no custom photo is chosen
    if (nameInput) {
      nameInput.addEventListener('input', function () {
        if (!currentAvatarData) {
          setAvatarPreview('', getInitials(nameInput.value) || 'PIC');
        }
      });
    }

    if (openBtn) {
      openBtn.addEventListener('click', openAddModal);
    }
    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }
    if (cancelBtn) {
      cancelBtn.addEventListener('click', closeModal);
    }

    modal.addEventListener('click', function (e) {
      if (e.target === modal) {
        closeModal();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();

        var rollEl = document.getElementById('studentRoll');
        var nameEl = document.getElementById('studentName');
        var branchEl = document.getElementById('studentBranch');
        var emailEl = document.getElementById('studentEmail');
        var statusEl = document.getElementById('studentStatus');

        var roll = rollEl ? rollEl.value.trim() : '';
        var name = nameEl ? nameEl.value.trim() : '';
        var branch = branchEl ? branchEl.value.trim() : '';
        var email = emailEl ? emailEl.value.trim() : '';
        var status = statusEl ? statusEl.value.trim() : 'Regular';

        if (!name || !branch || !email || (!currentEditingRoll && !roll)) {
          alert('Please fill out all required fields.');
          return;
        }

        // EDIT MODE: Update existing student
        if (currentEditingRoll) {
          var updated = false;
          for (var i = 0; i < students.length; i++) {
            if (students[i].roll === currentEditingRoll) {
              students[i].name = name;
              students[i].branch = branch;
              students[i].email = email;
              students[i].status = status;
              // If user selected a new photo, update it; otherwise retain existing avatar
              if (currentAvatarData) {
                students[i].avatar = currentAvatarData;
              }
              updated = true;
              break;
            }
          }

          if (updated) {
            persistStudents();
            closeModal();
            refreshView();
          }
          return;
        }

        // ADD MODE: Check for duplicate roll number
        var duplicate = students.some(function (s) {
          return s.roll && s.roll.toLowerCase() === roll.toLowerCase();
        });

        if (duplicate) {
          alert('A student with Roll Number "' + roll + '" already exists.');
          return;
        }

        var newStudent = {
          roll: roll,
          name: name,
          branch: branch,
          email: email,
          status: status,
          avatar: currentAvatarData || ''
        };

        students.push(newStudent);
        persistStudents();
        closeModal();
        refreshView();
      });
    }
  }

  /**
   * Listen for multi-tab storage sync
   */
  window.addEventListener('storage', function (e) {
    if (e.key === STORAGE_KEY) {
      students = loadStudents();
      refreshView();
    }
  });

  /**
   * Initialization
   */
  function init() {
    students = loadStudents();
    initControls();
    initTableActions();
    initModal();
    refreshView();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
