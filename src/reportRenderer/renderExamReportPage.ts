import { html } from "@thai/html";
import { modelPresets } from "../modelPresets";
import type { ExamModelReport, ExamReport } from "../reporting";
import { htmlPage, uiToolkit } from "./uiToolkit";

export function renderExamReportPage(examReport: ExamReport) {
  return htmlPage(
    `LLM Performance on ${examReport.shortTitle}`,
    html`
      <h1>LLM Performance on ${examReport.shortTitle}</h1>
      <p class="lead">${examReport.description}</p>
      <p>
        <a
          href="https://github.com/dtinth/thaiexamjs"
          class="btn btn-outline-light"
          target="_blank"
        >
          <iconify-icon icon="mdi:github"></iconify-icon> View on GitHub
        </a>
      </p>
      ${renderModelReportTable(examReport.modelReports)}
    `
  );
}

function renderModelReportTable(modelReports: ExamModelReport[]) {
  const ui = uiToolkit();

  function thb(baht: number) {
    return `฿${baht.toFixed(2)}`;
  }

  // Filter out models that don't have any graded questions
  const activeModelReports = modelReports.filter(
    (report) => report.gradedCount > 0
  );

  return html`
    <h2>Overall ranking</h2>
    <table class="table">
      <thead>
        <tr>
          <th scope="col">Model</th>
          <th class="text-end" scope="col">Cost</th>
          ${activeModelReports[0].statsBySubject.map(
            (stats) =>
              html`<th class="text-end" scope="col">
                ${stats.subjectEntry.definition.shortTitle}
              </th>`
          )}
          <th class="text-end" scope="col">Accuracy</th>
          <th class="text-end" scope="col">Score</th>
        </tr>
      </thead>
      <tbody>
        ${activeModelReports.map((modelReport) => {
          const tooltipContent =
            `input: ${modelReport.promptTokens.toLocaleString()} tokens; ` +
            `output: ${modelReport.completionTokens.toLocaleString()} tokens`;

          return html`<tr>
            <td>
              ${modelPresets[modelReport.presetId]?.displayName ||
              modelReport.presetId}
            </td>
            <td class="text-end">
              ${modelReport.cost > 0
                ? ui.tooltip(thb(modelReport.cost), tooltipContent)
                : "—"}
            </td>
            ${modelReport.statsBySubject.map(
              (stats) =>
                html`<td class="text-end">
                  ${stats.gradedCount > 0
                    ? ui.ofTotal(stats.correctCount, stats.gradedCount)
                    : "—"}
                </td>`
            )}
            <td class="text-end">
              ${ui.ofTotal(modelReport.correctCount, modelReport.gradedCount)}
            </td>
            <td class="text-end">
              ${(
                (modelReport.correctCount / modelReport.gradedCount) *
                100
              ).toFixed(2)}%
            </td>
          </tr>`;
        })}
      </tbody>
    </table>
  `;
}
