import fs from 'fs';

const content = fs.readFileSync('c:/Users/Admin/Downloads/Safety wallet website/src/app/pages/Scanner.tsx', 'utf8');
const lines = content.split('\n');

const stack = [];
const tagRegex = /<(\/)?([a-zA-Z0-9\.]+)/g;

lines.forEach((line, i) => {
  let match;
  while ((match = tagRegex.exec(line)) !== null) {
    const isClosing = !!match[1];
    const tagName = match[2];
    
    // Ignore self-closing logic for now, just count everything that isn't explicitly self-closing or a known non-block tag
    if (tagName === 'img' || tagName === 'br' || tagName === 'hr' || tagName === 'input' || tagName === 'Scan' || tagName === 'Shield' || tagName === 'AlertTriangle' || tagName === 'CheckCircle' || tagName === 'Info' || tagName === 'History' || tagName === 'WalletIcon' || tagName === 'Clock' || tagName === 'Loader2') continue;

    if (isClosing) {
      if (stack.length === 0) {
        console.log(`[L${i + 1}] Unexpected closing tag </${tagName}>`);
      } else {
        const last = stack.pop();
        if (last.tag !== tagName) {
          console.log(`[L${i + 1}] Mismatch! Opened <${last.tag}> at line ${last.line}, closed with </${tagName}>`);
        }
      }
    } else {
      if (!line.includes('/>') || line.indexOf('/>') < line.indexOf('<' + tagName)) {
         stack.push({ tag: tagName, line: i + 1 });
      }
    }
  }
});

stack.forEach(s => {
  console.log(`[L${s.line}] Unclosed tag <${s.tag}>`);
});
