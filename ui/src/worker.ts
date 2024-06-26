import { read, utils } from 'xlsx';

console.log('hello from service worker');

self.addEventListener('message', async (event) => {
  console.log('service worker was pinged');

  if (event.data.type === 'file') {
    const file = event.data.file;
    const fileData = await file.arrayBuffer();

    const workbook = read(fileData);
    const sheets: {
      sheetName: string;
      data: Record<string, string | number | boolean | null>[];
    }[] = [];
    workbook.SheetNames.forEach((sheetName) => {
      sheets.push({
        sheetName,
        data: utils.sheet_to_json(workbook.Sheets[sheetName]),
      });
    });
    if (workbook.SheetNames.length > 0) {
      // Send the data back to the original client
      self.postMessage({
        type: 'fileResponse',
        dfilename: file.name,
        workbook,
        sheets,
      });
    } else postMessage('ERROR!');
  }
});
