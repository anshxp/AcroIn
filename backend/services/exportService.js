import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

/**
 * Generate CSV from array of students
 * Includes only safe fields: name, enrollment number, department, year/semester, CGPA, skills, father name, father phone
 */
export const generateStudentCSV = (students) => {
  const includeInterest = students.some(s => s && s.interestDate);

  const headers = [
    'Name',
    'Enrollment Number',
    'Department',
    'Year',
    'Semester',
    'CGPA',
    'Skills',
    'Father Name',
    'Father Phone',
  ];

  if (includeInterest) headers.push('Interested On');

  const rows = students.map(student => {
    const base = [
      student.name || '',
      student.roll || '',
      student.department || '',
      student.year || '',
      student.semester || '',
      student.cgpa || '',
      (Array.isArray(student.skills) ? student.skills.map(s => s.name || s).join('; ') : '') || '',
      student.parentInfo?.fatherName || '',
      student.parentInfo?.fatherPhone || ''
    ];

    if (includeInterest) base.push(student.interestDate ? new Date(student.interestDate).toLocaleString() : '');
    return base;
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  return csvContent;
};

/**
 * Generate Excel from array of students
 * Includes only safe fields
 */
export const generateStudentExcel = async (students) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Students');

  // Add headers
  worksheet.columns = [
    { header: 'Name', key: 'name', width: 20 },
    { header: 'Enrollment Number', key: 'roll', width: 15 },
    { header: 'Department', key: 'department', width: 15 },
    { header: 'Year', key: 'year', width: 10 },
    { header: 'Semester', key: 'semester', width: 10 },
    { header: 'CGPA', key: 'cgpa', width: 10 },
    { header: 'Skills', key: 'skills', width: 30 },
    { header: 'Father Name', key: 'fatherName', width: 20 },
    { header: 'Father Phone', key: 'fatherPhone', width: 15 }
  ];

  const includeInterest = students.some(s => s && s.interestDate);
  if (includeInterest) {
    worksheet.columns.push({ header: 'Interested On', key: 'interestDate', width: 22 });
  }

  // Style header row
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };

  // Add rows
  students.forEach(student => {
    const row = {
      name: student.name || '',
      roll: student.roll || '',
      department: student.department || '',
      year: student.year || '',
      semester: student.semester || '',
      cgpa: student.cgpa || '',
      skills: (Array.isArray(student.skills) ? student.skills.map(s => s.name || s).join('; ') : '') || '',
      fatherName: student.parentInfo?.fatherName || '',
      fatherPhone: student.parentInfo?.fatherPhone || ''
    };

    if (includeInterest) {
      row['interestDate'] = student.interestDate ? new Date(student.interestDate).toLocaleString() : '';
    }

    worksheet.addRow(row);
  });

  return await workbook.xlsx.writeBuffer();
};

/**
 * Generate PDF from array of students
 * Includes only safe fields
 */
export const generateStudentPDF = (students, title = 'Student Export') => {
  const doc = new PDFDocument({
    margin: 50,
    size: 'A4',
    bufferPages: true
  });

  // Title
  doc.fontSize(16).font('Helvetica-Bold').text(title, { align: 'center' });
  doc.moveDown();

  // Timestamp
  doc.fontSize(10).font('Helvetica').text(`Generated: ${new Date().toLocaleString()}`, { align: 'right' });
  doc.moveDown();

  // Table headers
  const tableTop = doc.y;
  const col1X = 50;
  const col2X = 150;
  const col3X = 220;
  const col4X = 280;
  const col5X = 340;
  const col6X = 400;

  const includeInterest = students.some(s => s && s.interestDate);
  const headers = ['Name', 'Enrollment', 'Department', 'Year', 'CGPA', 'Skills'];
  if (includeInterest) headers.push('Interested On');
  
  doc.fontSize(10).font('Helvetica-Bold');
  for (let i = 0; i < headers.length; i++) {
    const x = [col1X, col2X, col3X, col4X, col5X, col6X, 460][i] || (50 + i * 70);
    doc.text(headers[i], x, tableTop);
  }

  doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
  doc.moveDown();

  // Table rows
  doc.fontSize(9).font('Helvetica');
  students.forEach(student => {
    const skills = (Array.isArray(student.skills) ? student.skills.map(s => s.name || s).join(', ') : '').substring(0, 30);
    
    doc.text(student.name || '', col1X, doc.y, { width: 90 });
    doc.text(student.roll || '', col2X, doc.y - 12, { width: 60 });
    doc.text(student.department || '', col3X, doc.y - 12, { width: 50 });
    doc.text(student.year || '', col4X, doc.y - 12, { width: 50 });
    doc.text(String(student.cgpa || ''), col5X, doc.y - 12, { width: 40 });
    doc.text(skills, col6X, doc.y - 12, { width: 100 });
    if (includeInterest) {
      doc.text(student.interestDate ? new Date(student.interestDate).toLocaleString() : '', 460, doc.y - 12, { width: 120 });
    }

    doc.moveDown();
  });

  doc.end();
  return doc;
};

/**
 * Filter students based on search query
 */
export const filterStudents = (students, query) => {
  if (!query || !query.trim()) return students;

  const lowerQuery = query.toLowerCase();
  return students.filter(student => 
    (student.name?.toLowerCase().includes(lowerQuery)) ||
    (student.roll?.toLowerCase().includes(lowerQuery)) ||
    (student.email?.toLowerCase().includes(lowerQuery)) ||
    (student.department?.toLowerCase().includes(lowerQuery)) ||
    (Array.isArray(student.skills) && student.skills.some(s => 
      (s.name || s).toLowerCase().includes(lowerQuery)
    ))
  );
};
