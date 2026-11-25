/**
 * University Management System - Dashboard Module
 * Pure Vanilla JavaScript implementation for:
 * - Dynamic live date greeting in header pill badge
 * - Synchronized Total Students metric count from localStorage
 */

(function () {
  'use strict';

  var STORAGE_KEY = 'ums_students';

  var DEFAULT_STUDENTS = [
    { roll: 'CSE21B001', name: 'Ananya Sharma', branch: 'CSE - Sem 6', email: 'ananya.sharma@uni.edu', status: "Dean's List", avatar: 'images/student-1.jpg' },
    { roll: 'CSE21B014', name: 'Rahul Mehta', branch: 'CSE - Sem 6', email: 'rahul.mehta@uni.edu', status: 'Regular', avatar: 'images/student-2.jpg' },
    { roll: 'ECE22B008', name: 'Priya Nair', branch: 'ECE - Sem 4', email: 'priya.nair@uni.edu', status: 'Regular', avatar: 'images/student-3.jpg' },
    { roll: 'CSE22B032', name: 'Arjun Patel', branch: 'CSE - Sem 4', email: 'arjun.patel@uni.edu', status: 'Pending', avatar: 'images/student-4.jpg' },
    { roll: 'IT21B019', name: 'Sneha Reddy', branch: 'IT - Sem 6', email: 'sneha.reddy@uni.edu', status: "Dean's List", avatar: 'images/student-5.jpg' },
    { roll: 'CSE23B045', name: 'Vikram Singh', branch: 'CSE - Sem 2', email: 'vikram.singh@uni.edu', status: 'Regular', avatar: 'images/student-6.jpg' }
  ];

  /**
   * Update header pill badge with accurate current date and semester info
   */
  function updateHeaderPillDate() {
    var heroNotice = document.getElementById('heroNotice') || document.querySelector('.hero-notice');
    if (!heroNotice) return;

    var now = new Date();
    var weekday = now.toLocaleDateString('en-US', { weekday: 'long' });
    var month = now.toLocaleDateString('en-US', { month: 'short' });
    var day = now.getDate();

    // Formatted as: "Thursday, Oct 29 · Odd Semester 2025-26"
    heroNotice.textContent = weekday + ', ' + month + ' ' + day + ' \u00B7 Odd Semester 2025-26';
  }

  /**
   * Update "Total Students" metric card count from localStorage
   */
  function updateTotalStudentsMetric() {
    var countEl = document.getElementById('totalStudentsCount');

    // If ID is not present, find the metric card with label "Total Students"
    if (!countEl) {
      var cards = document.querySelectorAll('.metric-card');
      for (var i = 0; i < cards.length; i++) {
        var label = cards[i].querySelector('.label');
        if (label && label.textContent.trim().toLowerCase() === 'total students') {
          countEl = cards[i].querySelector('.value');
          break;
        }
      }
    }

    if (!countEl) return;

    var stored = localStorage.getItem(STORAGE_KEY);
    var count = DEFAULT_STUDENTS.length;

    if (stored === null) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STUDENTS));
      count = DEFAULT_STUDENTS.length;
    } else {
      try {
        var parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          count = parsed.length;
        }
      } catch (e) {
        console.error('Error parsing ums_students on dashboard:', e);
      }
    }

    countEl.textContent = count.toLocaleString();
  }

  /**
   * Keep synchronized across browser tabs
   */
  window.addEventListener('storage', function (e) {
    if (e.key === STORAGE_KEY) {
      updateTotalStudentsMetric();
    }
  });

  /**
   * Initialize dashboard enhancements
   */
  function init() {
    updateHeaderPillDate();
    updateTotalStudentsMetric();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
