const fs = require('fs');
const path = require('path');

function searchFiles(dir, queries) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!fullPath.includes('node_modules') && !fullPath.includes('.next') && !fullPath.includes('.git')) {
        searchFiles(fullPath, queries);
      }
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      queries.forEach(q => {
        if (content.toLowerCase().includes(q.toLowerCase())) {
          console.log(`FOUND "${q}" in ${fullPath}`);
        }
      });
    }
  }
}

searchFiles(path.join(__dirname, 'app'), ['Criar um produto digital', 'O que inclui', 'Academias', '€']);
searchFiles(path.join(__dirname, 'components'), ['Criar um produto digital', 'O que inclui', 'Academias', '€']);
