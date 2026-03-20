#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function readText(p){
  try {
    return fs.readFileSync(p,'utf8');
  } catch(e){
    return '';
  }
}

function extract(css){
  // find all z-index declarations
  const re = /z-index\s*:\s*(\d+)\s*!?important?/g;
  const res = [];
  let m;
  while((m = re.exec(css)) !== null){
    res.push(parseInt(m[1],10));
  }
  return res;
}

function firstIntMatch(css){
  const arr = extract(css);
  return arr.length>0?arr[0]:null;
}

const results = {
  modalBaseGlobal: null,
  modalBackdropGlobal: null,
  commissionOverlay: null,
  studentModalBackdrop: null,
  studentModalDialog: null,
  studentModalContent: null,
  others: []
};

// 1. global modal/base from index.css
const idxCssPath = path.resolve('F:/Projects/Others/ERP360/frontend/src/index.css');
const idxCss = readText(idxCssPath);
const modalBase = /\.(modal|#studentModal|#studentModal)\s*\{[^]*?z-index\s*:\s*(\d+)/gims;
// simpler: search for .modal { z-index: ... }
const mModal = idxCss.match(/\.modal\s*\{[^]*?z-index\s*:\s*(\d+)/m);
results.modalBaseGlobal = mModal ? parseInt(mModal[1],10) : null;
const mBackdrop = idxCss.match(/\.modal-backdrop\s*\{[^]*?z-index\s*:\s*(\d+)/m);
results.modalBackdropGlobal = mBackdrop ? parseInt(mBackdrop[1],10) : null;

// 2. commission overlay
const commissionPath = path.resolve('F:/Projects/Others/ERP360/frontend/src/pages/services/unisync360/commission-packages/AddCommissionPackageModal.css');
const commissionCss = readText(commissionPath);
const mOverlay = commissionCss.match(/\.modal-overlay\s*\{[^]*?z-index\s*:\s*(\d+)/m);
results.commissionOverlay = mOverlay ? parseInt(mOverlay[1],10) : null;

// 3. student modal inlines
const studentModalPath = path.resolve('F:/Projects/Others/ERP360/frontend/src/pages/services/unisync360/students/StudentModal.jsx');
const studentJs = readText(studentModalPath);
const mStudentBackdrop = studentJs.match(/#studentModal::before\s*\{[^}]*z-index\s*:\s*(\d+)/m);
results.studentModalBackdrop = mStudentBackdrop ? parseInt(mStudentBackdrop[1],10) : null;
const mStudentDialog = studentJs.match(/#studentModal\s*\.modal-dialog\s*\{[^}]*z-index\s*:\s*(\d+)/m);
results.studentModalDialog = mStudentDialog ? parseInt(mStudentDialog[1],10) : null;
const mStudentContent = studentJs.match(/#studentModal\s*\.modal-content\s*\{[^}]*z-index\s*:\s*(\d+)/m);
results.studentModalContent = mStudentContent ? parseInt(mStudentContent[1],10) : null;

console.log('Visual Regression Check Summary:');
console.log('Modal base (global) z-index:', results.modalBaseGlobal);
console.log('Backdrop (global) z-index:', results.modalBackdropGlobal);
console.log('Commission overlay z-index:', results.commissionOverlay);
console.log('Student modal overlay/backdrop z-index:', results.studentModalBackdrop);
console.log('Student modal dialog/content z-index:', results.studentModalDialog, results.studentModalContent);

function ok(condition, message){
  return {ok: !!condition, message};
}

let pass = true;
let notes = [];
if(results.modalBaseGlobal == null){ pass = false; notes.push('Global modal base z-index not found'); }
if(results.modalBackdropGlobal == null){ pass = false; notes.push('Global modal backdrop z-index not found'); }
if(results.commissionOverlay == null){ pass = false; notes.push('Commission overlay z-index not found'); }
if(results.studentModalBackdrop == null || results.studentModalDialog == null || results.studentModalContent == null){ pass = false; notes.push('Student modal z-index values not found'); }

// Practical checks: modal should be > backdrop; global modal should be above commission overlay; student overlay lower than student dialog/content but both above backdrop
if(results.modalBaseGlobal != null && results.modalBackdropGlobal != null){
  if(!(results.modalBaseGlobal > results.modalBackdropGlobal)){
    pass = false; notes.push('Global modal base should be above backdrop');
  }
}
if(results.modalBaseGlobal != null && results.commissionOverlay != null){
  if(!(results.modalBaseGlobal > results.commissionOverlay)){
    pass = false; notes.push('Global modal base should be above commission overlay');
  }
}
if(results.studentModalDialog != null && results.studentModalBackdrop != null){
  // ensure dialog > backdrop
  if(!(results.studentModalDialog > results.studentModalBackdrop)){
    pass = false; notes.push('Student modal dialog should be above its backdrop');
  }
}

console.log('Status:', pass ? 'PASS' : 'FAIL');
if(!pass){
  console.log('Notes:');
  notes.forEach(n => console.log('- ', n));
}
