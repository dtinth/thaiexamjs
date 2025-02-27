import { getOrCreate } from "@thai/get-or-create";
import { html, renderHtml, type Html } from "@thai/html";
import { micromark } from "micromark";
import type { Report } from "../src/Report";
import { modelPresets } from "../src/modelPresets";
import { htmlPage, uiToolkit } from "../src/reportRenderer/uiToolkit";

const report = (await Bun.file("docs/onet.json").json()) as Report;

const modelName = (model: string) => {
  return modelPresets[model]?.displayName || model;
};

class ModelStats {
  constructor(public model: string) {}
  bySubject: Record<string, { correct: number; total: number }> = {};
  promptTokens = 0;
  completionTokens = 0;

  get pricing() {
    const info = this.preset;
    return {
      promptCost: info?.cost?.[0] ?? 0,
      completionCost: info?.cost?.[1] ?? 0,
    };
  }

  get preset() {
    return modelPresets[this.model];
  }

  get displayName() {
    return this.preset?.displayName || this.model;
  }

  get promptCost() {
    return (this.promptTokens / 1e6) * this.pricing.promptCost;
  }

  get completionCost() {
    return (this.completionTokens / 1e6) * this.pricing.completionCost;
  }

  get cost() {
    return this.promptCost + this.completionCost;
  }

  get correct() {
    return Object.values(this.bySubject).reduce(
      (acc, { correct }) => acc + correct,
      0
    );
  }

  get total() {
    return Object.values(this.bySubject).reduce(
      (acc, { total }) => acc + total,
      0
    );
  }

  get acc() {
    return (this.correct / this.total) * 100;
  }
}

const subjectThaiNames = {
  thai: "ภาษาไทย",
  social: "สังคมศึกษา ศาสนาและวัฒนธรรม",
  science: "วิทยาศาสตร์",
  math: "คณิตศาสตร์",
};
const subjectNames = Object.keys(subjectThaiNames);

function thb(usd: number) {
  return `฿${(usd * 35).toFixed(2)}`;
}

const m6Stats: Record<keyof typeof subjectThaiNames, number> = {
  thai: (46.4 * 63) / 100,
  social: (36.87 * 63) / 100,
  science: (28.65 * 20) / 100,
  math: (21.28 * 16) / 100,
};

function renderReport() {
  const ui = uiToolkit();
  const byModel = new Map<string, ModelStats>();
  for (const { question, answers } of report.questions) {
    for (const [model, answer] of Object.entries(answers)) {
      const stats = getOrCreate(byModel, model, () => new ModelStats(model));
      stats.bySubject[question.subject] ||= { correct: 0, total: 0 };
      stats.bySubject[question.subject].total++;
      if (answer.correct) {
        stats.bySubject[question.subject].correct++;
      }
      stats.promptTokens += answer.result.usage.promptTokens;
      stats.completionTokens += answer.result.usage.completionTokens;
    }
  }
  const modelNames = report.modelNames.sort((a, b) => a.localeCompare(b));
  const output: Html[] = [];
  const appendix: Html[] = [];

  // Overall ranking
  const round = (x: number) => ui.tooltip(Math.round(x), x.toFixed(2));
  output.push(html`<h2>Overall ranking</h2>
    <table class="table">
      <thead>
        <tr>
          <th scope="col">Model</th>
          <th class="text-end" scope="col">Cost</th>
          <th class="text-end" scope="col">Thai</th>
          <th class="text-end" scope="col">Social</th>
          <th class="text-end" scope="col">Science</th>
          <th class="text-end" scope="col">Math</th>
          <th class="text-end" scope="col">Overall</th>
          <th class="text-end" scope="col">Acc</th>
        </tr>
      </thead>
      <tbody>
        ${Array.from(byModel.values())
          .sort((a, b) => b.correct - a.correct)
          .map((stats) => {
            const tooltipContent =
              `input: ${stats.promptTokens.toLocaleString()} tokens (${thb(
                stats.promptCost
              )}); ` +
              `output: ${stats.completionTokens.toLocaleString()} tokens (${thb(
                stats.completionCost
              )})`;
            return html`<tr>
              <td>${modelName(stats.model)}</td>
              <td class="text-end">
                ${stats.cost > 0
                  ? ui.tooltip(thb(stats.cost), tooltipContent)
                  : "—"}
              </td>
              ${subjectNames.map((subject) => {
                const { correct, total } = stats.bySubject[subject] || {
                  correct: 0,
                  total: 0,
                };
                return html`<td class="text-end">
                  ${ui.ofTotal(correct, total)}
                </td>`;
              })}
              <td class="text-end">
                ${ui.ofTotal(stats.correct, stats.total)}
              </td>
              <td class="text-end">${stats.acc.toFixed(2)}%</td>
            </tr>`;
          })}
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
          <td class="text-end">${ui.ofTotal(round(m6Stats.thai), 63)}</td>
          <td class="text-end">${ui.ofTotal(round(m6Stats.social), 63)}</td>
          <td class="text-end">${ui.ofTotal(round(m6Stats.science), 20)}</td>
          <td class="text-end">${ui.ofTotal(round(m6Stats.math), 16)}</td>
          <td class="text-end">
            ${ui.ofTotal(
              round(Object.values(m6Stats).reduce((acc, x) => acc + x, 0)),
              63 + 63 + 20 + 16
            )}
          </td>
          <td class="text-end">
            ${(
              (Object.values(m6Stats).reduce((acc, x) => acc + x, 0) /
                (63 + 63 + 20 + 16)) *
              100
            ).toFixed(2)}%
          </td>
        </tr>
      </tbody>
    </table>`);

  // Subject ranking
  const renderSubjectRankingTable = () => {
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
          ${subjectNames.map((subject) => {
            const subjectQuestions = report.questions.filter(
              (q) => q.question.subject === subject
            );
            const thaiSubjectName =
              subjectThaiNames[subject as keyof typeof subjectThaiNames];
            return html`
              <tr>
                <th colspan="6">
                  ${thaiSubjectName} (${subjectQuestions.length})
                </th>
                ${subjectQuestions.map((q) => {
                  return renderQuestionRow(q);
                })}
              </tr>
            `;
          })}
        </tbody>
      </table>`;
  };
  const renderQuestionRow = ({
    question,
    answers,
  }: (typeof report.questions)[number]) => {
    const correctModels = Object.entries(answers)
      .filter(([, answer]) => answer.correct)
      .map(([model]) => model);
    const title = html`${question.year} #${question.no}. ${question.question}`;
    const titleReplaceable = ui.replaceable(title);

    let letters: string[] = [];
    for (let i = 97; i < 97 + 26 && question[String.fromCharCode(i)]; i++) {
      letters.push(String.fromCharCode(i));
    }

    const accordion = ui.accordion();
    const thaiSubjectName =
      subjectThaiNames[question.subject as keyof typeof subjectThaiNames];
    const modal = ui.modal(
      html`O-NET ปี ${question.year} วิชา ${thaiSubjectName} ข้อ ${question.no}`,
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
          modelNames.map((model) => {
            let badge: Html;
            const answer = answers[model];
            badge = renderAnswerBadge(answer);
            return accordion.item(
              html`<div class="d-flex gap-1 flex-grow-1 pe-2">
                ${badge}
                <div class="flex-grow-1">${modelName(model)}</div>
                <div class="text-end">
                  ${answer?.result.usage.completionTokens
                    ? ui.tooltip(
                        answer.result.usage.completionTokens,
                        `${answer.result.usage.completionTokens} output tokens`
                      )
                    : ""}
                </div>
              </div>`,
              answer
                ? html`<div>
                    ${renderAnswer(answer.result.reasoning, answer.result.text)}
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
        html`<a data-bs-toggle="modal" data-bs-target="#${modal.id}" href="javascript:">${title}</b>`
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
            ${modelNames.map((model) => {
              const answer = answers[model];
              const badge = renderAnswerBadge(answer, { fixedWidth: true });
              return ui.tooltip(badge, modelName(model));
            })}
          </div>
        </td>
        <td class="text-end">
          ${ui.ofTotal(correctModels.length, modelNames.length)}
        </td>
      </tr>
    `;
  };

  output.push(renderSubjectRankingTable());

  return [output, appendix];
}

function renderAnswerBadge(
  answer?: (typeof report.questions)[number]["answers"][string],
  options: { fixedWidth?: boolean } = {}
) {
  let badge: Html;
  let style: Html = "";
  if (options.fixedWidth) {
    style = html`style="width: 2ch; padding-left: 0; padding-right: 0;"`;
  }
  if (!answer) {
    badge = html`<span class="badge bg-secondary" ${style}>-</span>`;
  } else if (!answer.actual) {
    badge = html`<span class="badge bg-warning" ${style}>?</span>`;
  } else if (answer.correct) {
    badge = html`<span class="badge bg-success" ${style}
      >${answer.actual.toUpperCase()}</span
    >`;
  } else {
    badge = html`<span class="badge bg-danger" ${style}
      >${answer.actual.toUpperCase()}</span
    >`;
  }
  return badge;
}

function renderAnswer(reasoning: string | undefined, text: string) {
  let html = "";
  reasoning ??= "";
  const m = text.match(/^<think>([^]+)<\/think>/i);
  if (m) {
    text = text.slice(m[0].length);
    reasoning += m[1];
  }

  const md = (x: string) => micromark(x);
  if (reasoning) {
    html += `<div class="card mb-3"><div class="card-body">${md(
      reasoning
    )}</div></div>`;
  }
  html += md(text);

  return { __html: html };
}

await Bun.write(
  "docs/onet.html",
  renderHtml(
    htmlPage(
      "LLM Performance on Thai O-NET Tests",
      html`
        <h1>LLM Performance on Thai O-NET Tests</h1>
        <p class="lead">
          This dashboard showcases how different AI models perform on Thailand’s
          O-NET standardized tests.
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
        ${renderReport()}
      `
    )
  )
);

console.log("Done!");
