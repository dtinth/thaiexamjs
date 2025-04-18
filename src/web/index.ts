import { getOrCreate } from "@thai/get-or-create";
import { html, type Html } from "@thai/html";
import { micromark } from "micromark";
import {
  ExamPreset,
  examPresets,
  type QuestionEntry,
  type SubjectDefinition,
} from "../examPresets";
import type { GradedTask } from "../gradeTask";
import { modelPresets } from "../modelPresets";
import {
  filterByExamPresetId,
  filterByQuestionId,
  getAllGradedTasks,
  getStatsByModel,
  type StatsByModelEntry,
} from "../reportingV2";
import {
  htmlPage,
  uiToolkit,
  type UiToolkit,
} from "../reportRenderer/uiToolkit";

interface WebsiteData {
  gradedTasks: GradedTask[];
}

interface WebPage {
  render: () => Promise<Html>;
}

export const examsPresetIdsToPublish = ["onet_m6", "ic", "tpat1"];

export class Website {
  constructor(public data: WebsiteData) {}

  get pages(): Record<string, () => WebPage> {
    const pages: Record<string, () => WebPage> = {
      "index.html": () => new IndexPage(this.data),
    };
    for (const examPresetId of examsPresetIdsToPublish) {
      const examPreset = examPresets.get(examPresetId);
      pages[`${examPresetId}.html`] = () =>
        new ExamPage(this.data, examPresetId);
      for (const questionEntry of examPreset.questionEntries) {
        const questionPath = getExamQuestionPath(questionEntry);
        if (pages[questionPath]) {
          throw new Error(
            `Duplicate question path: ${questionPath} (${questionEntry.id})`
          );
        }
        pages[questionPath] = () =>
          new ExamQuestionPage(this.data, questionEntry);
      }
    }
    return pages;
  }

  static async create() {
    return new Website({
      gradedTasks: await getAllGradedTasks(),
    });
  }
}

class IndexPage implements WebPage {
  private statsByModel: StatsByModelEntry[];
  private ui = uiToolkit();

  constructor(private data: WebsiteData) {
    this.statsByModel = getStatsByModel(this.data.gradedTasks);
  }

  async render() {
    const overallTable = new OverallTable(this.statsByModel, this.ui);
    return htmlPage(
      "LLM Performance on Thai Exams",
      html`
        <h1>LLM Performance on Thai Exams</h1>
        <p class="lead">
          This dashboard showcases how different AI models perform on various
          Thai standardized tests.
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

        ${renderTwoColumnLayout({
          left: html`
            <h2 class="mt-4 h4">Available Exam Reports</h2>
            <div class="list-group mb-4">
              ${examsPresetIdsToPublish.map((examPresetId) => {
                const examPreset = examPresets.get(examPresetId);
                return html`
                  <a
                    href="${examPresetId}.html"
                    class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <h5 class="mb-1">${examPreset.shortTitle}</h5>
                      <p class="mb-0">${examPreset.description}</p>
                    </div>
                    <span class="badge bg-primary rounded-pill">
                      <iconify-icon icon="mdi:arrow-right"></iconify-icon>
                    </span>
                  </a>
                `;
              })}
            </div>
          `,
          right: html`
            <h2 class="mt-4 h4">Overall Ranking</h2>
            <div class="card">
              <div class="card-body p-0">${overallTable.render()}</div>
            </div>
          `,
        })}
        ${renderQuickLink()}
      `
    );
  }
}

class ExamPage implements WebPage {
  private examPreset: ExamPreset;
  private gradedTasks: GradedTask[];
  private statsByModel: StatsByModelEntry[];
  private ui = uiToolkit();

  constructor(private data: WebsiteData, private examPresetId: string) {
    this.examPreset = examPresets.get(examPresetId);
    this.gradedTasks = filterByExamPresetId(
      this.data.gradedTasks,
      this.examPresetId
    );
    this.statsByModel = getStatsByModel(this.gradedTasks);
  }

  async render() {
    const { examPreset } = this;
    return htmlPage(
      `LLM Performance on ${examPreset.shortTitle}`,
      html`
        <h1>LLM Performance on ${examPreset.shortTitle}</h1>
        <p class="lead">
          This dashboard showcases how different AI models perform on
          ${examPreset.shortEnglishDescription}.
        </p>
        <p>
          <a href="./" class="btn btn-outline-light me-2">
            <iconify-icon icon="mdi:arrow-left"></iconify-icon> Back to Index
          </a>
          <a
            href="https://github.com/dtinth/thaiexamjs"
            class="btn btn-outline-light"
            target="_blank"
          >
            <iconify-icon icon="mdi:github"></iconify-icon> View on GitHub
          </a>
        </p>
        ${this.renderOverallTable()} ${this.renderDetailedReport()}
        ${renderQuickLink()}
      `
    );
  }

  renderOverallTable(): Html {
    const { ui, examPreset, statsByModel } = this;
    const overallTable = new OverallTable(statsByModel, ui);
    overallTable.extraColumns = Object.entries(examPreset.subjects || {}).map(
      ([subjectId, subjectDefinition]) => {
        return {
          header: html`${subjectDefinition.shortTitle}`,
          render: (modelStat: StatsByModelEntry) => {
            const gradedTasks = this.gradedTasks.filter(
              (gradedTask) =>
                gradedTask.task.questionEntry.question.subject === subjectId &&
                gradedTask.task.modelPresetId === modelStat.modelPresetId
            );
            const total = gradedTasks.length;
            const score = gradedTasks.reduce(
              (acc, gradedTask) => acc + gradedTask.score,
              0
            );
            return html`${ui.ofTotal(score, total)}`;
          },
        };
      }
    );
    return html`
      <h2>Overall ranking</h2>
      ${overallTable.render()}
    `;
  }

  get questionsGroupedBySubject() {
    const { examPreset } = this;
    type SubjectGroup = {
      subjectDefinition?: SubjectDefinition;
      questionEntries: QuestionEntry[];
    };
    const groupMap = new Map<string, SubjectGroup>();
    for (const [subjectId, subjectDefinition] of Object.entries(
      examPreset.subjects || {}
    )) {
      groupMap.set(subjectId, {
        subjectDefinition: subjectDefinition,
        questionEntries: [],
      });
    }
    for (const questionEntry of examPreset.questionEntries) {
      const subjectId = questionEntry.question.subject;
      const group = getOrCreate(groupMap, subjectId, () => ({
        subjectDefinition: examPreset.subjects?.[subjectId],
        questionEntries: [],
      }));
      group.questionEntries.push(questionEntry);
    }
    return Array.from(groupMap.values());
  }

  renderDetailedReport(): Html {
    const { ui, questionsGroupedBySubject } = this;

    const mapKey = (modelPresetId: string, questionEntry: QuestionEntry) =>
      `${modelPresetId}-${questionEntry.id}`;
    const gradedTaskMap = new Map<string, GradedTask>(
      this.gradedTasks.map((gradedTask) => [
        mapKey(gradedTask.task.modelPresetId, gradedTask.task.questionEntry),
        gradedTask,
      ])
    );

    const renderQuestionRow = (questionEntry: QuestionEntry): Html => {
      const gradedTasks = this.statsByModel.flatMap((stat) => {
        const gradedTask = gradedTaskMap.get(
          mapKey(stat.modelPresetId, questionEntry)
        );
        return gradedTask ? [gradedTask] : [];
      });
      const score = gradedTasks.reduce(
        (acc, gradedTask) => acc + gradedTask.score,
        0
      );
      const question = questionEntry.question;
      const questionInfo = question.year
        ? `${question.year} #${question.no}.`
        : `[${questionEntry.index}]`;
      const href = getExamQuestionPath(questionEntry);
      return html`
        <tr>
          <td>
            <div class="text-truncate text-muted" style="max-width: 42ch">
              ${questionInfo}
              <a href="${href}">${questionEntry.question.question}</a>
            </div>
          </td>
          <td class="text-center">
            <div class="d-inline-flex gap-1">
              ${this.statsByModel.map((stat) => {
                const gradedTask = gradedTaskMap.get(
                  mapKey(stat.modelPresetId, questionEntry)
                );
                const badge = renderAnswerBadge(gradedTask, {
                  fixedWidth: true,
                });
                const modelPreset = modelPresets[stat.modelPresetId]!;
                const displayName =
                  modelPreset.displayName || stat.modelPresetId;
                return ui.tooltip(badge, displayName);
              })}
            </div>
          </td>
          <td class="text-end">${ui.ofTotal(score, gradedTasks.length)}</td>
        </tr>
      `;
    };

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
          ${questionsGroupedBySubject.map((group) => {
            const title = group.subjectDefinition?.title || "";
            return html`
              ${title
                ? html`<tr>
                    <th colspan="3">
                      ${title} (${group.questionEntries.length})
                    </th>
                  </tr>`
                : ""}
              ${group.questionEntries.map((questionEntry) =>
                renderQuestionRow(questionEntry)
              )}
            `;
          })}
        </tbody>
      </table>`;
  }
}

class OverallTable {
  constructor(
    private statsByModel: StatsByModelEntry[],
    private ui: UiToolkit
  ) {}

  extraColumns: {
    header: Html;
    render: (modelStat: StatsByModelEntry) => Html;
  }[] = [];

  render() {
    const { ui, statsByModel, extraColumns } = this;
    function thb(baht: number) {
      return `฿${baht.toFixed(2)}`;
    }
    return html`
      <table class="table">
        <thead>
          <tr>
            <th scope="col">Model</th>
            <th class="text-end" scope="col">Cost</th>
            ${extraColumns.map(
              (column) =>
                html`<th class="text-end" scope="col">${column.header}</th>`
            )}
            <th class="text-end" scope="col">Overall</th>
            <th class="text-end" scope="col">Acc</th>
          </tr>
        </thead>
        <tbody>
          ${statsByModel.map((modelStat) => {
            const tooltipContent =
              `input: ${modelStat.inputTokens.toLocaleString()} tokens; ` +
              `output: ${modelStat.outputTokens.toLocaleString()} tokens`;
            const modelPreset = modelPresets[modelStat.modelPresetId]!;
            return html`<tr>
              <td>
                ${modelPreset.icon
                  ? html`<iconify-icon
                      inline
                      icon="${modelPreset.icon}"
                    ></iconify-icon> `
                  : ""}
                ${modelPreset.displayName || modelStat.modelPresetId}
              </td>
              <td class="text-end">
                ${modelStat.costThb > 0
                  ? ui.tooltip(thb(modelStat.costThb), tooltipContent)
                  : "—"}
              </td>
              ${extraColumns.map(
                (column) => html`
                  <td class="text-end">${column.render(modelStat)}</td>
                `
              )}
              <td class="text-end">
                ${ui.ofTotal(modelStat.score, modelStat.total)}
              </td>
              <td class="text-end">
                ${(modelStat.accuracy * 100).toFixed(2)}%
              </td>
            </tr>`;
          })}
        </tbody>
      </table>
    `;
  }
}

class ExamQuestionPage implements WebPage {
  private examPreset: ExamPreset;
  private ui = uiToolkit();
  constructor(private data: WebsiteData, private questionEntry: QuestionEntry) {
    this.examPreset = examPresets.get(questionEntry.examPresetId);
  }
  get pageTitle() {
    const examTitle = this.examPreset.shortTitle;
    const question = this.questionEntry.question;
    const questionInfo = question.year
      ? `${question.year} ข้อ ${question.no}`
      : `[${this.questionEntry.index}]`;
    const subjectEntry = this.examPreset.subjects?.[question.subject];
    const subjectTitle = subjectEntry?.title || question.subject;
    const title = [
      examTitle,
      `- ${subjectTitle}`,
      questionInfo ? `- ${questionInfo}` : "",
    ]
      .filter(Boolean)
      .join(" ");
    return title;
  }
  get letters() {
    const question = this.questionEntry.question;
    const letters: string[] = [];
    for (let i = 97; i < 97 + 26 && question[String.fromCharCode(i)]; i++) {
      letters.push(String.fromCharCode(i));
    }
    return letters;
  }
  async render() {
    const pageTitle = this.pageTitle;
    const question = this.questionEntry.question;
    return htmlPage(
      pageTitle,
      html`
        <h1>${pageTitle}</h1>
        <p class="lead">
          With answers from ${this.gradedTasks.length} AI models.
        </p>
        <p>
          <a
            href="../${this.questionEntry.examPresetId}.html"
            class="btn btn-outline-light me-2"
          >
            <iconify-icon icon="mdi:arrow-left"></iconify-icon>
            Back to ${this.examPreset.shortTitle}
          </a>
        </p>

        <div data-question-id="${this.questionEntry.id}">
          ${renderTwoColumnLayout({
            left: html`<div class="card">
              <div class="card-header">
                <h5 class="card-title mb-0">Question</h5>
              </div>
              <div class="card-body">
                ${{
                  __html: micromark(question.question),
                }}
                <ol type="A">
                  ${this.letters.map((x) => html`<li>${question[x]}</li>`)}
                </ol>
              </div>
              <div class="card-footer">
                <span
                  class="badge bg-success d-inline-block align-middle"
                  style="transform: translateY(-2px)"
                  >${question.answer.toUpperCase()}</span
                >
                is the correct answer according to the dataset.
              </div>
            </div>`,
            right: html`<div class="card flex-grow-1">
              <div class="card-header">
                <h5 class="card-title mb-0">Answers by AI</h5>
              </div>
              <div class="card-body p-0">${this.renderAiAnswers()}</div>
            </div>`,
          })}
        </div>
        <script>
          // Check if the hash refers to an accordion item
          const hash = window.location.hash;
          if (hash) {
            const element = document.querySelector(
              hash + " button.accordion-button"
            );
            console.log(element);
            if (element && element.classList.contains("collapsed")) {
              console.log(element);
              element.click();
            }
          }
        </script>
      `
    );
  }
  get gradedTasks() {
    return filterByQuestionId(this.data.gradedTasks, this.questionEntry.id);
  }
  renderAiAnswers() {
    const { ui } = this;
    const gradedTasks = this.gradedTasks;
    const accordion = ui.accordion();
    return accordion.container(
      gradedTasks.map((gradedTask) => {
        const { title, body } = this.renderAiAnswer(gradedTask);
        return accordion.item(title, body, gradedTask.task.modelPresetId);
      })
    );
  }
  renderAiAnswer(gradedTask: GradedTask) {
    const badge = renderAnswerBadge(gradedTask);
    const modelPreset = modelPresets[gradedTask.task.modelPresetId];
    const result = gradedTask.status.result;
    const usage = result?.usage;
    const displayName =
      modelPreset.displayName || gradedTask.task.modelPresetId;
    return {
      title: html`<div class="d-flex gap-1 flex-grow-1 pe-2">
        ${badge}
        <div class="flex-grow-1">${displayName}</div>
        <div class="text-end">
          ${usage
            ? this.ui.tooltip(
                usage.completionTokens,
                `${usage.completionTokens} output tokens`
              )
            : ""}
        </div>
      </div>`,
      body: result
        ? html`<div>${renderAnswer(result.reasoning, result.text)}</div>`
        : html`<div>The model was unable to produce an answer.</div>`,
    };
  }
}

function renderTwoColumnLayout({
  left,
  right,
}: {
  left: Html;
  right: Html;
}): Html {
  return html`<div class="d-flex flex-column flex-lg-row gap-3">
    <div class="flex-grow-1" style="max-width: 100%; flex-basis: 0;">
      ${left}
    </div>
    <div class="flex-grow-1" style="max-width: 100%; flex-basis: 0;">
      ${right}
    </div>
  </div>`;
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

function renderAnswerBadge(
  gradedTask: GradedTask | undefined,
  options: { fixedWidth?: boolean } = {}
): Html {
  let badge: Html;
  let style: Html = "";
  if (options.fixedWidth) {
    style = html`style="width: 2ch; padding-left: 0; padding-right: 0;"`;
  }

  if (!gradedTask) {
    badge = html`<span class="badge bg-secondary" ${style}>-</span>`;
  } else if (!gradedTask.gradingResult.actual) {
    badge = html`<span class="badge bg-warning" ${style}>?</span>`;
  } else if (gradedTask.score) {
    badge = html`<span class="badge bg-success" ${style}
      >${gradedTask.gradingResult.actual.toUpperCase()}</span
    >`;
  } else {
    badge = html`<span class="badge bg-danger" ${style}
      >${gradedTask.gradingResult.actual.toUpperCase()}</span
    >`;
  }

  return badge;
}

function getExamQuestionPath(questionEntry: QuestionEntry) {
  const { examPresetId, question, index } = questionEntry;
  let pageSlug = [question.subject, `${index}`].filter(Boolean).join("");

  return `${examPresetId}/${pageSlug}.html`;
}

const renderQuickLink = () => html`
  <script src="https://cdnjs.cloudflare.com/ajax/libs/quicklink/2.3.0/quicklink.umd.js"></script>
  <script>
    window.addEventListener("load", () => {
      quicklink.listen();
    });
  </script>
`;
