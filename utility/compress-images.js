import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const dirs = [
    'public',
    'public/certs',
    'public/projects'
];

async function compressImages() {
    console.log('🖼️ Starting image compression...');
    let totalSaved = 0;

    for (const dir of dirs) {
        const fullDir = path.resolve(dir);
        if (!fs.existsSync(fullDir)) continue;

        const files = fs.readdirSync(fullDir);
        for (const file of files) {
            if (file.match(/\.(png|jpe?g)$/i)) {
                const inputPath = path.join(fullDir, file);
                const originalSize = fs.statSync(inputPath).size;
                const outName = file.replace(/\.(png|jpe?g)$/i, '.webp');
                const outputPath = path.join(fullDir, outName);

                try {
                    await sharp(inputPath)
                        .webp({ quality: 80 })
                        .toFile(outputPath);
                    
                    const newSize = fs.statSync(outputPath).size;
                    const saved = originalSize - newSize;
                    totalSaved += saved;

                    console.log(`✅ Compressed ${file} -> ${outName} (Saved ${(saved / 1024 / 1024).toFixed(2)} MB)`);
                    
                    // delete original if successful to keep repo clean
                    fs.unlinkSync(inputPath);
                } catch (e) {
                    console.error(`❌ Failed to compress ${file}:`, e.message);
                }
            }
        }
    }
    
    console.log(`\n🎉 Done! Total space saved: ${(totalSaved / 1024 / 1024).toFixed(2)} MB`);
}

compressImages();
