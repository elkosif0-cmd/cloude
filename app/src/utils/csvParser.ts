/**
 * محلل CSV آمن يدعم الفواصل المتعددة (فاصلة، فاصلة منقوطة، Tab) والنصوص العربية والرموز المقتبسة
 */
export function parseCSV(content: string): { headers: string[]; rows: Record<string, string>[] } {
  if (!content || !content.trim()) {
    return { headers: [], rows: [] };
  }

  // تنظيف BOM إذا وجد (UTF-8 BOM: \uFEFF)
  let cleanContent = content.replace(/^\uFEFF/, '');

  // اكتشاف الفاصل المناسب في السطر الأول
  const firstLine = cleanContent.split(/\r\n|\n|\r/)[0] || '';
  let delimiter = ',';
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semiCount = (firstLine.match(/;/g) || []).length;
  const tabCount = (firstLine.match(/\t/g) || []).length;

  if (semiCount > commaCount && semiCount > tabCount) {
    delimiter = ';';
  } else if (tabCount > commaCount && tabCount > semiCount) {
    delimiter = '\t';
  }

  // تقسيم الأسطر مع مراعاة علامات الاقتباس
  const lines: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < cleanContent.length; i++) {
    const char = cleanContent[i];
    const nextChar = cleanContent[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentCell += '"';
        i++; // تخطي الاقتباس المزدوج
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      currentRow.push(currentCell.trim());
      if (currentRow.some((c) => c !== '')) {
        lines.push(currentRow);
      }
      currentRow = [];
      currentCell = '';
    } else {
      currentCell += char;
    }
  }

  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((c) => c !== '')) {
      lines.push(currentRow);
    }
  }

  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = lines[0].map((h) => h.replace(/^["']|["']$/g, '').trim());
  const rows: Record<string, string>[] = [];

  for (let r = 1; r < lines.length; r++) {
    const rowObj: Record<string, string> = {};
    const cells = lines[r];
    for (let c = 0; c < headers.length; c++) {
      const headerKey = headers[c] || `col_${c}`;
      rowObj[headerKey] = (cells[c] || '').replace(/^["']|["']$/g, '').trim();
    }
    rows.push(rowObj);
  }

  return { headers, rows };
}

/**
 * تصدير آمن إلى CSV مع حماية Spreadsheet Injection وإضافة UTF-8 BOM لدعم اللغة العربية في إكسل
 */
export function exportToCSV(headers: { key: string; label: string }[], data: Record<string, any>[]): string {
  const sanitizeCell = (val: any): string => {
    if (val === null || val === undefined) return '';
    let str = String(val).trim();
    // حماية من حقن معادلات الإكسل (CSV Formula Injection)
    if (/^[=+\-@\t\r]/.test(str)) {
      str = "'" + str;
    }
    // معالجة الاقتباسات
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes(';')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerRow = headers.map((h) => sanitizeCell(h.label)).join(',');
  const dataRows = data.map((row) => headers.map((h) => sanitizeCell(row[h.key])).join(','));

  // \uFEFF يضمن فتح الملف بترميز UTF-8 العربي السليم في برنامج Microsoft Excel
  return '\uFEFF' + [headerRow, ...dataRows].join('\r\n');
}
