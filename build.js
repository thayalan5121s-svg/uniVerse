const fs = require('fs');
const path = require('path');

const files = [
  'js/supabaseClient.js',
  'js/mockData.js',
  'js/state.js',
  'js/api.js',
  'js/router.js',
  'js/views/landing.js',
  'js/views/signup.js',
  'js/views/dashboard.js',
  'js/views/newComplaint.js',
  'js/views/complaintDetail.js',
  'js/views/chatbot.js',
  'js/views/adminDashboard.js',
  'js/views/adminAnalytics.js',
  'js/views/adminComplaintDetail.js',
  'js/views/staffDashboard.js',
  'js/views/staffComplaintDetail.js',
  'js/app.js'
];

let bundle = `/**\n * CampusCare Bundled Script\n * Auto-generated bundle for zero-config file:// and http:// browser compatibility\n */\n(function() {\n  'use strict';\n\n`;

for (const file of files) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, 'utf8');

  // Strip imports
  content = content.replace(/^import\s+[^;]+;\r?\n?/gm, '');

  // Strip exports (export function -> function, export const -> const, export default ...)
  content = content.replace(/^export\s+(async\s+function|function|class|const|let|var)\s+/gm, '$1 ');
  content = content.replace(/^export\s+default\s+[^;]+;\r?\n?/gm, '');
  content = content.replace(/^export\s*\{[^}]*\};?\r?\n?/gm, '');

  bundle += `\n/* --- ${file} --- */\n` + content + '\n';
}

bundle += '\n})();\n';

fs.writeFileSync(path.join(__dirname, 'js/bundle.js'), bundle, 'utf8');
console.log('Successfully rebuilt js/bundle.js');
