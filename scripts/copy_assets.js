const fs = require('fs');
const path = require('path');

const srcFiles = [
    { src: 'C:\\Users\\Asad\\.gemini\\antigravity\\brain\\d9e45e8f-5e6a-4e08-b545-da515e3d2db6\\media__1774344713549.png', dest: 'legalease-arch.png' },
    { src: 'C:\\Users\\Asad\\.gemini\\antigravity\\brain\\d9e45e8f-5e6a-4e08-b545-da515e3d2db6\\media__1774345048989.png', dest: 'legalease-hero.png' },
    { src: 'C:\\Users\\Asad\\.gemini\\antigravity\\brain\\d9e45e8f-5e6a-4e08-b545-da515e3d2db6\\media__1774345100130.png', dest: 'legalease-qa.png' },
    { src: 'C:\\Users\\Asad\\.gemini\\antigravity\\brain\\d9e45e8f-5e6a-4e08-b545-da515e3d2db6\\media__1774345463587.png', dest: 'legalease-report.png' }
];

const destDir = path.join(__dirname, '..', 'public', 'images');

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

srcFiles.forEach(f => {
    try {
        if (fs.existsSync(f.src)) {
            fs.copyFileSync(f.src, path.join(destDir, f.dest));
            console.log(`Copied ${f.dest}`);
        } else {
            console.warn(`Source not found: ${f.src}`);
        }
    } catch (e) {
        console.error(`Failed to copy ${f.dest}:`, e);
    }
});
