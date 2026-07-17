import ExcelJS from 'exceljs';

/**
 * Build and download the output Excel workbook.
 * Output contains ONLY: Business Name, Phone Number, Business Type, Generated Message
 *
 * @param {Array<{ businessName: string, phone: string, businessType: string, message: string }>} rows
 * @param {string} [filename]
 */
export async function exportToExcel(rows, filename = 'leads_with_messages.xlsx') {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'AI Lead Message Generator';
  wb.created = new Date();

  const ws = wb.addWorksheet('Messages');

  // Define columns
  ws.columns = [
    { header: 'Business Name', key: 'businessName', width: 28 },
    { header: 'Phone Number', key: 'phone', width: 18 },
    { header: 'Business Type', key: 'businessType', width: 22 },
    { header: 'Generated Message', key: 'message', width: 80 },
  ];

  // Bold header row
  const headerRow = ws.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE8F0FE' },
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

  // Freeze header row
  ws.views = [{ state: 'frozen', ySplit: 1 }];

  // Add data rows
  rows.forEach((row) => {
    const dataRow = ws.addRow({
      businessName: row.businessName || '',
      phone: row.phone || '',
      businessType: row.businessType || '',
      message: row.message || '',
    });

    // Wrap message text
    dataRow.getCell('message').alignment = { wrapText: true, vertical: 'top' };
    dataRow.height = 60;
  });

  // Auto-fit columns (ExcelJS doesn't have true auto-fit, so we compute based on content)
  ws.columns.forEach((col) => {
    let maxLen = col.header?.length || 10;
    col.eachCell({ includeEmpty: false }, (cell) => {
      const len = String(cell.value || '').length;
      if (len > maxLen) maxLen = len;
    });
    // Cap width between 12 and 80
    col.width = Math.min(Math.max(maxLen + 2, 12), 80);
  });

  // Download
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
