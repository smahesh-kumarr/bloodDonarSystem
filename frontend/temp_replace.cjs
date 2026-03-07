const fs = require('fs');
const path = 'c:/Users/mahes/OneDrive/Documents/Desktop/BloodDonarSystem/frontend/src/App.jsx';
let content = fs.readFileSync(path, 'utf8');

// Replace the <nav> block
content = content.replace(/<nav className="bg-white shadow">[\s\S]*?<\/nav>/, '');

// Insert <Navbar /> after <ToastContainer ... />
content = content.replace(
  /<ToastContainer\s+position="top-right"\s+autoClose=\{3000\}\s+hideProgressBar=\{false\}\s*\/>/,
  '<ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />\n        <Navbar />'
);

fs.writeFileSync(path, content, 'utf8');