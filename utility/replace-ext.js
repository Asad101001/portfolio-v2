import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            if (!['node_modules', '.git', '.vercel', 'dist', 'npm-cache', 'refactor'].includes(f)) {
                walkDir(dirPath, callback);
            }
        } else {
            if (f.match(/\.(html|css|js)$/)) {
                callback(dirPath);
            }
        }
    });
}

walkDir('.', (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    // We want to replace .png and .jpg with .webp, but wait! What if it's og-image.webp? og-image might need to stay png for some social sites, but let's just replace all and we can manually fix if needed. Actually, Twitter and FB support webp. But let's replace \.png and \.jpg with \.webp except in the script itself.
    if (content.includes('.webp') || content.includes('.webp')) {
        // Regex to replace .png and .jpg with .webp (case insensitive)
        let newContent = content.replace(/\.(png|jpg)(['")?])/gi, '.webp$2');
        if (newContent !== content) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`Replaced in ${filePath}`);
        }
    }
});
