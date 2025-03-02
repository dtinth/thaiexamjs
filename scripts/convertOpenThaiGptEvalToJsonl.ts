import fs from 'fs';
import path from 'path';
import * as csv from 'csv/sync';

// Get command line arguments
const inputFile = process.argv[2];
const outputFile = process.argv[3];
const subject = process.argv[4] || 'math';

if (!inputFile || !outputFile) {
  console.log('Usage: bun run scripts/convertOpenThaiGptEvalToJsonl.ts <input-csv> <output-jsonl> [subject]');
  console.log('Example: bun run scripts/convertOpenThaiGptEvalToJsonl.ts datasets/openthaigpt_eval/14_onet_m6_math.csv thai_exam/data/onet/onet_m6_math.jsonl math');
  process.exit(1);
}

// Path to input CSV file
const inputPath = path.resolve(process.cwd(), inputFile);

// Path to output JSONL file
const outputPath = path.resolve(process.cwd(), outputFile);

// Ensure the output directory exists
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Read the CSV file
const csvData = fs.readFileSync(inputPath, 'utf8');

// Parse the CSV data
const records = csv.parse(csvData, {
  columns: true,
  skip_empty_lines: true,
  trim: true,
});

// Track any issues for reporting
const warnings: string[] = [];
let skippedCount = 0;
let processedCount = 0;

// Convert CSV records to JSONL format
const jsonlData = records.map((record: any, index: number) => {
  const lineNumber = index + 2; // +2 because of header row and 0-indexing
  
  // Basic validation of required fields
  if (!record.year || !record.no || !record.instruction) {
    warnings.push(`Warning: Missing required fields at line ${lineNumber} (CSV row ${index + 2})
Record: ${JSON.stringify(record)}`);
    skippedCount++;
    return null;
  }
  
  // Process the record to convert escaped newlines to actual newlines
  Object.keys(record).forEach(key => {
    if (typeof record[key] === 'string') {
      // Convert literal \n to actual newlines
      record[key] = record[key].replace(/\\n/g, '\n');
    }
  });
  
  // Extract question number for more useful warnings
  const questionNumber = record.no;
  
  // Helper function to add record details to warnings
  const addRecordContext = (warningMessage: string) => {
    return `${warningMessage}
Record: ${JSON.stringify(record)}`;
  };
  
  // Skip non-answerable questions early
  if (record.isAnswerable === 'FALSE') {
    warnings.push(`Warning: Question #${questionNumber} - Skipping non-answerable question (CSV row ${lineNumber})${record.note ? ` - Note: ${record.note}` : ''}`);
    skippedCount++;
    return null;
  }
  
  // Check if it's a multiple choice question with single choice solution
  if (record.isMultipleChoice === 'TRUE' && record.isSingleChoiceSolution === 'TRUE') {
    // Get options from the input field
    if (!record.input) {
      warnings.push(addRecordContext(`Warning: Question #${questionNumber} is missing options (CSV row ${lineNumber})`));
      skippedCount++;
      return null;
    }
    
    // Process the input string to extract options more reliably
    // First, normalize the input by adding a space before each option
    let inputText = record.input.replace(/\((\d+)\)/g, '\n($1)').trim();
    
    // Extract options from the normalized text
    const optionRegex = /\((\d+)\)\s*([\s\S]*?)(?=\n\(\d+\)|$)/g;
    const matches = [...inputText.matchAll(optionRegex)];
    
    // Verify we have enough options
    if (matches.length < 2) {
      warnings.push(addRecordContext(`Warning: Question #${questionNumber} has fewer than 2 options extracted (CSV row ${lineNumber})`));
      skippedCount++;
      return null;
    }
    
    // Extract option letters and values
    const optionValues: Record<string, string> = {};
    const optionLetters = ['a', 'b', 'c', 'd', 'e'];
    
    // Map each option number to its corresponding letter
    matches.forEach(match => {
      const optionNumber = parseInt(match[1]);
      if (optionNumber >= 1 && optionNumber <= 5) {
        const letterIndex = optionNumber - 1;
        optionValues[optionLetters[letterIndex]] = match[2].trim();
      }
    });
    
    // Determine the correct answer (a, b, c, d, or e)
    let answer = '';
    if (record.result) {
      // Handle potential multi-line result
      const resultText = record.result.trim();
      // Check for format like "(2) xz > 0" or just "2"
      const resultMatch = resultText.match(/\(?(\d+)\)?/);
      
      if (resultMatch) {
        const answerNumber = parseInt(resultMatch[1]);
        if (answerNumber >= 1 && answerNumber <= 5) {
          answer = optionLetters[answerNumber - 1];
        } else {
          warnings.push(addRecordContext(`Warning: Question #${questionNumber} - Answer number out of range: ${answerNumber} (CSV row ${lineNumber})`));
        }
      } else {
        warnings.push(addRecordContext(`Warning: Question #${questionNumber} - Could not parse answer: ${resultText} (CSV row ${lineNumber})`));
      }
    } else {
      warnings.push(addRecordContext(`Warning: Question #${questionNumber} - Missing answer (CSV row ${lineNumber})`));
    }
    
    // Verify that the correct answer corresponds to an option
    if (answer && !optionValues[answer]) {
      warnings.push(addRecordContext(`Warning: Question #${questionNumber} - Answer '${answer}' doesn't match any option (CSV row ${lineNumber})`));
    }
    
    processedCount++;
    
    // Create the JSONL entry
    return JSON.stringify({
      year: parseInt(record.year),
      no: parseInt(record.no),
      subject: subject,
      question: record.instruction,
      a: optionValues.a || '',
      b: optionValues.b || '',
      c: optionValues.c || '',
      d: optionValues.d || '',
      e: optionValues.e || '',
      answer
    });
  } else if (record.isAnswerable === 'TRUE') {
    // Non-multiple choice questions with numerical answers
    if (!record.result) {
      warnings.push(addRecordContext(`Warning: Question #${questionNumber} - Answerable question is missing an answer (CSV row ${lineNumber})`));
      skippedCount++;
      return null;
    }
    
    processedCount++;
    
    return JSON.stringify({
      year: parseInt(record.year),
      no: parseInt(record.no),
      subject: subject,
      question: record.instruction,
      answer: record.result
    });
  } else if (record.isMultipleChoice === 'TRUE' && record.isSingleChoiceSolution !== 'TRUE') {
    warnings.push(`Warning: Question #${questionNumber} - Skipping multiple-choice question without single choice solution (CSV row ${lineNumber})${record.note ? ` - Note: ${record.note}` : ''}`);
    skippedCount++;
    return null;
  } else {
    // For other skipped questions, include full record context
    warnings.push(addRecordContext(`Warning: Question #${questionNumber} - Skipping question for unknown reason (CSV row ${lineNumber})`));
    skippedCount++;
    return null;
  }
}).filter(Boolean);

// Write to JSONL file
fs.writeFileSync(outputPath, jsonlData.join('\n'), 'utf8');

// Extract filename for more informative log
const inputFileName = path.basename(inputPath);
const outputFileName = path.basename(outputPath);

// Print summary
console.log(`Converted ${processedCount} questions from ${inputFileName} to ${outputFileName}`);
console.log(`Skipped ${skippedCount} questions`);

// Print warnings
if (warnings.length > 0) {
  console.log("\nWarnings:");
  warnings.forEach(warning => console.log(warning));
}

// Validation summary
if (processedCount === 0) {
  console.error('\nERROR: No questions were processed. Please check your input file format.');
  process.exit(1);
} else if (warnings.length > 0) {
  console.log(`\nCompleted with ${warnings.length} warnings.`);
} else {
  console.log('\nConversion completed successfully with no warnings.');
}