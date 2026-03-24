const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // Desktop Viewport
    await page.setViewport({ width: 1440, height: 900 });
    
    console.log('Visiting Live Site...');
    await page.goto('https://legal-ease-ai-iota.vercel.app/', { waitUntil: 'networkidle2' });
    
    // Wait for animations/renders
    await new Promise(r => setTimeout(r, 2000));
    
    await page.screenshot({ path: 'images/legalease-live-1.png' });
    console.log('Saved Hero Image: images/legalease-live-1.png');

    // Scroll down to simulate usage or capture more content
    await page.evaluate(() => {
        window.scrollBy(0, document.body.scrollHeight / 2);
    });
    
    await new Promise(r => setTimeout(r, 2000));

    await page.screenshot({ path: 'images/legalease-live-2.png' });
    console.log('Saved Midpage Image: images/legalease-live-2.png');
    
    await browser.close();
  } catch(e) {
      console.error(e);
  }
})();
