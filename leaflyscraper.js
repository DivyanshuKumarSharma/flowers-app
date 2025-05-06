import puppeteer from 'puppeteer';

async function getStrainInfo(slug) {
  const url = `https://www.leafly.com/strains/${slug}`;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  let jsonData = null;

  page.on('response', async (response) => {
    const req = response.request();
    const resUrl = req.url();

    if (resUrl.includes('/api/strain/v2/public/')) {
      try {
        const json = await response.json();
        jsonData = json;
      } catch (e) {
        console.error('JSON parse error:', e.message);
      }
    }
  });

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });
    await new Promise(resolve => setTimeout(resolve, 3000)); // <-- Fixed delay
    

    await browser.close();

    if (!jsonData) {
      throw new Error('Failed to capture strain data from API.');
    }

    const {
      name,
      category,
      thc,
      description,
      effects,
    } = jsonData;

    return {
      name: name || slug,
      type: category || '',
      thc: thc?.formatted || '',
      description: description || '',
      effects: effects?.primary?.map((e) => e.label) || [],
      url,
    };
  } catch (err) {
    console.error('Scraping error:', err.message);
    await browser.close();
    return null;
  }
}

const strain = process.argv[2] || 'blue-dream';
getStrainInfo(strain).then(console.log);
