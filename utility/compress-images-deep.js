import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            if (f !== 'node_modules' && f !== '.git' && f !== '.vercel' && f !== 'dist') {
                walkDir(dirPath, callback);
            }
        } else {
            callback(path.join(dir, f));
        }
    });
}

async function compressAll() {
    console.log('🖼️ Starting deep image compression...');
    let totalSaved = 0;

    walkDir('.', async (filePath) => {
        if (filePath.match(/\.(png|jpe?g)$/i)) {
            const originalSize = fs.statSync(filePath).size;
            const outName = filePath.replace(/\.(png|jpe?g)$/i, '.webp');
            
            try {
                await sharp(filePath)
                    .webp({ quality: 80 })
                    .toFile(outName);
                
                const newSize = fs.statSync(outName).size;
                const saved = originalSize - newSize;
                totalSaved += saved;

                console.log(`✅ Compressed ${path.basename(filePath)} -> ${path.basename(outName)} (Saved ${(saved / 1024 / 1024).toFixed(2)} MB)`);
                
                fs.unlinkSync(filePath);
            } catch (e) {
                console.error(`❌ Failed to compress ${filePath}:`, e.message);
            }
        }
    });
    
    // Wait for event loop to empty
    setTimeout(() => {
        console.log(`\n🎉 Done! Total space saved: ${(totalSaved / 1024 / 1024).toFixed(2)} MB`);
    }, 2000);
}

compressAll();
