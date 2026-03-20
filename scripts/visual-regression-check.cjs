#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function readText(p){
  try { return fs.readFileSync(p,'utf8'); } catch(e){ return ''; }
}

function extractZFromCss(css){
  const m = css.match(/z-index\s*:\s*(\d+)/g) || [];
  const nums = m.map(s => parseInt(s.match(/(\d+)/)[1],10));
  return nums[0] || null;
}

function getGlobalModal(css){
  const m = css.match(/\.modal\s*\{[\s\S]*?z-index\s*:\s*(\d+)/m);
  return m ? parseInt(m[1],10) : null;
}

const results = {
  globalModal: null,
  globalBackdrop: null,
  commissionOverlay: null,
  studentModalBackdrop: null,
  studentModalDialog: null,
  studentModalContent: null
};

const idxCssPath = path.resolve('F:/Projects/Others/ERP360/frontend/src/index.css');
const idxCss = readText(idxCssPath);
results.globalModal = getGlobalModal(idxCss);
const mBackdrop = idxCss.match(/\.modal-backdrop\s*\{[^}]*z-index\s*:\s*(\d+)/m);
results.globalBackdrop = mBackdrop ? parseInt(mBackdrop[1],10) : null;

const commissionPath = path.resolve('F:/Projects/Others/ERP360/frontend/src/pages/services/unisync360/commission-packages/AddCommissionPackageModal.css');
const commissionCss = readText(commissionPath);
const mOverlay = commissionCss.match(/\.modal-overlay\s*\{[^}]*z-index\s*:\s*(\d+)/m);
results.commissionOverlay = mOverlay ? parseInt(mOverlay[1],10) : null;

const studentCssPath = path.resolve('F:/Projects/Others/ERP360/frontend/src/pages/services/unisync360/students/StudentModal.css');
const studentCss = readText(studentCssPath);
const mBackdropStudent = studentCss.match(/#studentModal::before\s*\{[^}]*z-index\s*:\s*(\d+)/m);
results.studentModalBackdrop = mBackdropStudent ? parseInt(mBackdropStudent[1],10) : null;
const mDialogStudent = studentCss.match(/#studentModal\s*\\.modal-dialog\s*\{[^}]*z-index\s*:\s*(\d+)/m);
results.studentModalDialog = mDialogStudent ? parseInt(mDialogStudent[1],10) : null;
const mContentStudent = studentCss.match(/#studentModal\\s*\\.modal-content\\s*\{[^}]*z-index\s*:\s*(\d+)/m);
results.studentModalContent = mContentStudent ? parseInt(mContentStudent[1],10) : null;

console.log('Visual Regression Check Summary:');
console.log('Global modal base:', results.globalModal);
console.log('Global backdrop:', results.globalBackdrop);
console.log('Commission overlay:', results.commissionOverlay);
console.log('StudentBackdrop:', results.studentModalBackdrop, 'Dialog:', results.studentModalDialog, 'Content:', results.studentModalContent);

let pass = true;
let notes = [];
if(results.globalModal == null) { pass = false; notes.push('Global modal base not found'); }
if(results.globalBackdrop == null) { pass = false; notes.push('Global backdrop not found'); }
if(results.commissionOverlay == null) { pass = false; notes.push('Commission overlay not found'); }
if(results.studentModalDialog == null || results.studentModalContent == null){ pass = false; notes.push('Student modal z-index not found'); }

if(results.globalModal != null && results.globalBackdrop != null){
  if(!(results.globalModal > results.globalBackdrop)){ pass = false; notes.push('Global modal base not above backdrop'); }
}
if(results.globalModal != null && results.commissionOverlay != null){
  if(!(results.globalModal > results.commissionOverlay)){ pass = false; notes.push('Global modal base not above commission overlay'); }
}
if(results.studentModalDialog != null && results.studentModalBackdrop != null){
  if(!(results.studentModalDialog > results.studentModalBackdrop)){ pass = false; notes.push('Student modal dialog not above its backdrop'); }
}

console.log('Status:', pass ? 'PASS' : 'FAIL');
notes.forEach(n => console.log('- ', n));
