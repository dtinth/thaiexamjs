import { renderHtml } from "@thai/html";
import { reporting } from "../src/reporting";
import { renderExamReportPage } from "../src/reportRenderer/renderExamReportPage";

const examId = "tpat1";
const examReport = reporting.getExam(examId);

Bun.write(`docs/${examId}.html`, renderHtml(renderExamReportPage(examReport)));
