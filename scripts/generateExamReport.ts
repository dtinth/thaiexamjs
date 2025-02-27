import { renderHtml } from "@thai/html";
import { html } from "@thai/html";
import { reporting } from "../src/reporting";
import {
  examsToPublish,
  renderExamReportPage,
} from "../src/reportRenderer/renderExamReportPage";
import { htmlPage, uiToolkit } from "../src/reportRenderer/uiToolkit";

// Generate exam pages
for (const examId of examsToPublish) {
  const examReport = reporting.getExam(examId);
  Bun.write(
    `docs/${examId}.html`,
    renderHtml(renderExamReportPage(examReport))
  );
  console.log(`Generated ${examId}.html`);
}

// Generate index page
function renderIndexPage() {
  const ui = uiToolkit();
  
  return htmlPage(
    "LLM Performance on Thai Exams",
    html`
      <h1>LLM Performance on Thai Exams</h1>
      <p class="lead">
        This dashboard showcases how different AI models perform on various Thai standardized tests.
      </p>
      <p>
        <a
          href="https://github.com/dtinth/thaiexamjs"
          class="btn btn-outline-light"
          target="_blank"
        >
          <iconify-icon icon="mdi:github"></iconify-icon> View on GitHub
        </a>
      </p>
      
      <h2 class="mt-4">Available Exam Reports</h2>
      <div class="list-group mb-4">
        ${examsToPublish.map(examId => {
          const examReport = reporting.getExam(examId);
          return html`
            <a href="${examId}.html" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
              <div>
                <h5 class="mb-1">${examReport.shortTitle}</h5>
                <p class="mb-1">${examReport.description}</p>
              </div>
              <span class="badge bg-primary rounded-pill">
                <iconify-icon icon="mdi:arrow-right"></iconify-icon>
              </span>
            </a>
          `;
        })}
      </div>
    `
  );
}

// Write the index page
Bun.write(
  "docs/index.html",
  renderHtml(renderIndexPage())
);
console.log(`Generated index.html`);
