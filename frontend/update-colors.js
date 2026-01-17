// Update color class names to simple format
const fs = require('fs');

const files = [
  './components/ui/Button.tsx',
  './components/ui/Input.tsx',
  './components/ui/Card.tsx',
  './app/login/page.tsx',
  './app/signup/page.tsx',
];

const replacements = [
  // Background colors
  { from: /bg-bg-primary/g, to: 'bg-dark-primary' },
  { from: /bg-bg-secondary/g, to: 'bg-dark-secondary' },
  { from: /bg-bg-elevated/g, to: 'bg-dark-elevated' },
  { from: /bg-background-primary/g, to: 'bg-dark-primary' },
  { from: /bg-background-secondary/g, to: 'bg-dark-secondary' },
  { from: /bg-background-elevated/g, to: 'bg-dark-elevated' },
  
  // Text colors
  { from: /text-text-primary/g, to: 'text-light-primary' },
  { from: /text-text-secondary/g, to: 'text-light-secondary' },
  { from: /text-text-muted/g, to: 'text-light-muted' },
  
  // Border colors
  { from: /border-text-muted/g, to: 'border-light-muted' },
  
  // Accent colors
  { from: /ring-accent-blue/g, to: 'ring-blue-accent' },
  { from: /text-accent-blue/g, to: 'text-blue-accent' },
  { from: /bg-accent-blue/g, to: 'bg-blue-accent' },
  { from: /border-accent-blue/g, to: 'border-blue-accent' },
  
  // Input
  { from: /bg-input-bg/g, to: 'bg-input-light' },
];

files.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    let updated = false;
    
    replacements.forEach(({ from, to }) => {
      if (from.test(content)) {
        content = content.replace(from, to);
        updated = true;
      }
    });
    
    if (updated) {
      fs.writeFileSync(file, content);
      console.log(`✓ Updated: ${file}`);
    } else {
      console.log(`- Skipped: ${file} (no changes needed)`);
    }
  } catch (err) {
    console.error(`✗ Error updating ${file}:`, err.message);
  }
});

console.log('\n✅ Color class names updated to simple format!');
