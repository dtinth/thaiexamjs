import { reporting } from "../src/reporting";

const examId = "tpat1";
const examReport = reporting.getExam(examId);

// Print basic report info
console.log(`\n=== ${examReport.title} ===`);
console.log(examReport.description);
console.log(`Questions: ${examReport.questionReports.length}`);

for (const modelReport of examReport.modelReports) {
  console.log(
    modelReport.presetId,
    [modelReport.cost.toFixed(2)],
    modelReport.correctCount,
    "/",
    modelReport.gradedCount
  );
}
