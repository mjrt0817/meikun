import { Question, Subject } from '../types';

/**
 * Parses CSV text into an array of Question objects.
 * Expects format:
 * subject,category,text,option1,option2,option3,option4,correctAnswer(1-4),explanation,hint
 */
export function parseQuestionsCSV(csvText: string): Question[] {
  const lines: string[] = [];
  let currentLine = '';
  let inQuotes = false;
  
  // Custom character parser to handle multiline quoted fields
  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentLine += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === '\n' || char === '\r') {
      if (inQuotes) {
        currentLine += char;
      } else {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        lines.push(currentLine);
        currentLine = '';
      }
    } else {
      currentLine += char;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  
  const parsedQuestions: Question[] = [];
  
  for (let r = 0; r < lines.length; r++) {
    const line = lines[r].trim();
    if (!line) continue;
    
    const cells: string[] = [];
    let currentCell = '';
    let cellInQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"') {
        if (cellInQuotes && nextChar === '"') {
          currentCell += '"';
          i++;
        } else {
          cellInQuotes = !cellInQuotes;
        }
      } else if (char === ',') {
        if (cellInQuotes) {
          currentCell += char;
        } else {
          cells.push(currentCell.trim());
          currentCell = '';
        }
      } else {
        currentCell += char;
      }
    }
    cells.push(currentCell.trim());
    
    // Skip header row if matches field names
    if (r === 0) {
      const isHeader = cells[0].toLowerCase() === 'subject' || 
                       cells[0].includes('教科') || 
                       cells[0].includes('科目') ||
                       cells[2].includes('問題文') ||
                       cells[2].toLowerCase() === 'text';
      if (isHeader) continue;
    }
    
    // Minimally require subject, category, text, options (at least 2), correctAnswerIndex
    if (cells.length < 5) continue;
    
    const subjectRaw = cells[0].toLowerCase();
    const subject: Subject = (
      subjectRaw === 'japanese' || 
      subjectRaw === '国語' || 
      subjectRaw === 'こくご' || 
      subjectRaw === 'kokugo'
    ) ? 'japanese' : 'math';
    
    const category = cells[1] || '追加問題';
    const text = cells[2] || '';
    
    const options: string[] = [];
    // Collect up to 4 options
    if (cells[3]) options.push(cells[3]);
    if (cells[4]) options.push(cells[4]);
    if (cells[5]) options.push(cells[5]);
    if (cells[6]) options.push(cells[6]);
    
    if (options.length === 0) continue; // Skip if no options
    
    // Parse correct answer index. The column is cells[7] or the last one if fewer columns
    const correctValStr = cells[7] || '1';
    const correctVal = parseInt(correctValStr, 10);
    // Convert 1-indexed to 0-indexed
    const correctAnswerIndex = (correctVal >= 1 && correctVal <= options.length) ? correctVal - 1 : 0;
    
    const explanation = cells[8] || '解説はありません。';
    const hint = cells[9] || 'ヒントはありません。';
    const id = `csv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    parsedQuestions.push({
      id,
      subject,
      category,
      text,
      options,
      correctAnswerIndex,
      explanation,
      hint
    });
  }
  
  return parsedQuestions;
}
