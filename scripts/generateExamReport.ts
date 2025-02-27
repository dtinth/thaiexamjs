import { renderHtml } from "@thai/html";
import { reporting } from "../src/reporting";
import {
  examsToPublish,
  renderExamReportPage,
} from "../src/reportRenderer/renderExamReportPage";

for (const examId of examsToPublish) {
  const examReport = reporting.getExam(examId);
  Bun.write(
    `docs/${examId}.html`,
    renderHtml(renderExamReportPage(examReport))
  );
  console.log(`Generated ${examId}.html`);
}
