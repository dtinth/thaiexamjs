import { getOrCreate } from "@thai/get-or-create";
import { html, type Html } from "@thai/html";
import { micromark } from "micromark";
import { modelPresets } from "../modelPresets";
import type {
  AnswerReport,
  ExamQuestionReport,
  ExamReport,
  SubjectEntry,
} from "../reporting";
import { htmlPage, uiToolkit, type UiToolkit } from "./uiToolkit";

export const examsToPublish = ["onet", "tpat1"];

export function renderExamReportPage(examReport: ExamReport) {
  const [output, appendix] = renderReport(examReport);

  return htmlPage(
    `LLM Performance on ${examReport.shortTitle}`,
    html`
      <h1>LLM Performance on ${examReport.shortTitle}</h1>
      <p class="lead">
        This dashboard showcases how different AI models perform on
        ${examReport.shortEnglishDescription}.
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
      ${output} ${appendix}
    `
  );
}

function renderReport(examReport: ExamReport): [Html, Html] {
  const ui = uiToolkit();
  const output: Html[] = [];
  const appendix: Html[] = [];

  // Add the model report table
  output.push(renderModelReportTable(examReport, ui));

  // Add the per question section
  output.push(renderDetailedReport(examReport, ui, appendix));

  return [output, appendix];
}

function renderModelReportTable(examReport: ExamReport, ui: UiToolkit): Html {
  function thb(baht: number) {
    return `฿${baht.toFixed(2)}`;
  }

  // Filter out models that don't have any graded questions
  const activeModelReports = examReport.modelReports.filter(
    (report) => report.gradedCount > 0
  );

  if (activeModelReports.length === 0) {
    return html`<p>No model reports available</p>`;
  }

  // Round function for human scores
  const round = (x: number) => ui.tooltip(Math.round(x), x.toFixed(2));

  // Get the first model report to access subject structure
  const firstReport = activeModelReports[0];

  // Calculate total questions by subject
  const subjectTotals = firstReport.statsBySubject.map(
    (stats) => stats.gradedCount
  );
  const totalQuestions = subjectTotals.reduce((acc, count) => acc + count, 0);

  // Get subject IDs in the same order as they appear in the model report
  const subjectIds = firstReport.statsBySubject.map(
    (stats) => stats.subjectEntry.subject
  );

  return html`
    <h2>Overall ranking</h2>
    <table class="table">
      <thead>
        <tr>
          <th scope="col">Model</th>
          <th class="text-end" scope="col">Cost</th>
          ${firstReport.statsBySubject.map(
            (stats) =>
              html`<th class="text-end" scope="col">
                ${stats.subjectEntry.definition.shortTitle}
              </th>`
          )}
          <th class="text-end" scope="col">Overall</th>
          <th class="text-end" scope="col">Acc</th>
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
        ${examReport.humanScore
          ? html`
              <tr>
                <td class="text-muted">
                  M6 students average
                  (${ui.tooltip(
                    "adjusted",
                    "The percentage score from NIETS statistics is multiplied by the number of questions in the test and then rounded to the nearest integer to obtain this number."
                  )}
                  from
                  <a href="https://www.niets.or.th/th/content/view/11821"
                    >stats published by NIETS</a
                  >)
                </td>
                <td></td>
                ${examReport.subjectEntries.map((subjectEntry, index) => {
                  const score = subjectEntry.humanScore || 0;
                  return html`
                    <td class="text-end">
                      ${ui.ofTotal(round(score), subjectTotals[index])}
                    </td>
                  `;
                })}
                ${(() => {
                  const totalHumanScore = examReport.subjectEntries.reduce(
                    (acc, subjectEntry) => acc + (subjectEntry.humanScore || 0),
                    0
                  );
                  return html` <td class="text-end">
                      ${ui.ofTotal(round(totalHumanScore), totalQuestions)}
                    </td>
                    <td class="text-end">
                      ${((totalHumanScore / totalQuestions) * 100).toFixed(2)}%
                    </td>`;
                })()}
              </tr>
            `
          : ""}
      </tbody>
    </table>
  `;
}

interface SubjectGroup {
  subjectEntry: SubjectEntry | undefined;
  title: string;
  questionReports: ExamQuestionReport[];
}

function groupQuestionsBySubject(examReport: ExamReport): SubjectGroup[] {
  const subjectsMap = new Map(
    examReport.subjectEntries.map((entry) => [entry.subject, entry])
  );
  const questionsBySubject = new Map<string, ExamQuestionReport[]>();
  for (const questionReport of examReport.questionReports) {
    const subject = questionReport.questionEntry.question.subject;
    getOrCreate(questionsBySubject, subject, () => []).push(questionReport);
  }
  return Array.from(questionsBySubject.entries()).map(
    ([subject, questions]) => {
      const subjectEntry = subjectsMap.get(subject);
      const title = subjectEntry?.definition.title || subject;

      return {
        subjectEntry,
        title,
        questionReports: questions,
      };
    }
  );
}

function renderDetailedReport(
  examReport: ExamReport,
  ui: UiToolkit,
  appendix: Html[]
): Html {
  const subjectGroups = groupQuestionsBySubject(examReport);

  // Nested function to render individual question rows
  function renderQuestionRow(
    questionReport: ExamQuestionReport,
    subjectEntry?: SubjectEntry
  ): Html {
    const question = questionReport.questionEntry.question;
    const answerReports = Object.values(questionReport.answers);

    // Create title with question info
    const questionInfo = question.year
      ? `${question.year} #${question.no}.`
      : `[${questionReport.questionEntry.index}]`;
    const title = html`${questionInfo} ${question.question}`;
    const titleReplaceable = ui.replaceable(title);

    // Find option letters (a, b, c, d, etc.)
    let letters: string[] = [];
    for (let i = 97; i < 97 + 26 && question[String.fromCharCode(i)]; i++) {
      letters.push(String.fromCharCode(i));
    }

    // Create accordion for model answers
    const accordion = ui.accordion();
    const subjectTitle = subjectEntry?.definition.title || question.subject;

    const examTitle = examReport.shortTitle;
    const modalTitle = html`${examTitle}
    ${questionInfo ? `- ${questionInfo}` : ""} - ${subjectTitle}`;

    const modal = ui.modal(
      modalTitle,
      html`<div>
        <div>${{ __html: micromark(question.question) }}</div>
        <ol type="A">
          ${letters.map((x) => html`<li>${question[x]}</li>`)}
        </ol>
        <p>
          <span class="badge bg-success">${question.answer.toUpperCase()}</span>
          is the correct answer according to the dataset.
        </p>
        ${accordion.container(
          Object.values(questionReport.answers).map((answer) => {
            const badge = renderAnswerBadge(answer);

            return accordion.item(
              html`<div class="d-flex gap-1 flex-grow-1 pe-2">
                ${badge}
                <div class="flex-grow-1">${answer.presetId}</div>
                <div class="text-end">
                  ${answer.found &&
                  answer.data.found?.logEntry.result.usage.completionTokens
                    ? ui.tooltip(
                        answer.data.found.logEntry.result.usage
                          .completionTokens,
                        `${answer.data.found.logEntry.result.usage.completionTokens} output tokens`
                      )
                    : ""}
                </div>
              </div>`,
              answer.found && answer.data.found
                ? html`<div>
                    ${renderAnswer(
                      answer.data.found.logEntry.result.reasoning,
                      answer.data.found.logEntry.result.text
                    )}
                  </div>`
                : html`<div>The model was unable to produce an answer.</div>`
            );
          })
        )}
      </div>`
    );

    appendix.push(modal.element);
    appendix.push(
      titleReplaceable.replacer(
        html`<a
          data-bs-toggle="modal"
          data-bs-target="#${modal.id}"
          href="javascript:"
          >${title}</a
        >`
      )
    );

    return html`
      <tr>
        <td>
          <div class="text-truncate text-muted" style="max-width: 42ch">
            ${titleReplaceable.target}
          </div>
        </td>
        <td class="text-center">
          <div class="d-inline-flex gap-1">
            ${answerReports.map((answer) => {
              const badge = renderAnswerBadge(answer, { fixedWidth: true });
              return ui.tooltip(badge, answer.modelDisplayName);
            })}
          </div>
        </td>
        <td class="text-end">
          ${ui.ofTotal(
            answerReports.filter((a) => a.correct).length,
            answerReports.length
          )}
        </td>
      </tr>
    `;
  }

  return html`<h2>Per question</h2>
    <table class="table">
      <thead>
        <tr>
          <th scope="col">Question</th>
          <th scope="col" class="text-center">Answers</th>
          <th scope="col" class="text-end">Correct</th>
        </tr>
      </thead>
      <tbody>
        ${subjectGroups.map((group) => {
          return html`
            <tr>
              <th colspan="3">
                ${group.title} (${group.questionReports.length})
              </th>
            </tr>
            ${group.questionReports.map((questionReport) =>
              renderQuestionRow(questionReport, group.subjectEntry)
            )}
          `;
        })}
      </tbody>
    </table>`;
}

function renderAnswerBadge(
  answer: AnswerReport,
  options: { fixedWidth?: boolean } = {}
): Html {
  let badge: Html;
  let style: Html = "";
  if (options.fixedWidth) {
    style = html`style="width: 2ch; padding-left: 0; padding-right: 0;"`;
  }

  if (!answer.found) {
    badge = html`<span class="badge bg-secondary" ${style}>-</span>`;
  } else if (!answer.data.found?.gradingResult.actual) {
    badge = html`<span class="badge bg-warning" ${style}>?</span>`;
  } else if (answer.correct) {
    badge = html`<span class="badge bg-success" ${style}
      >${answer.data.found.gradingResult.actual.toUpperCase()}</span
    >`;
  } else {
    badge = html`<span class="badge bg-danger" ${style}
      >${answer.data.found.gradingResult.actual.toUpperCase()}</span
    >`;
  }

  return badge;
}

function renderAnswer(
  reasoning: string | undefined,
  text: string
): { __html: string } {
  let html = "";
  reasoning ??= "";

  // Extract reasoning from text if in <think> tags format
  const m = text.match(/^<think>([^]+)<\/think>/i);
  if (m) {
    text = text.slice(m[0].length);
    reasoning += m[1];
  }

  const md = (x: string) => micromark(x);

  // Show reasoning in a card if available
  if (reasoning) {
    html += `<div class="card mb-3"><div class="card-body">${md(
      reasoning
    )}</div></div>`;
  }

  // Show model's text response
  html += md(text);

  return { __html: html };
}
