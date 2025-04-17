import { html, type Html } from "@thai/html";

export function htmlPage(title: string, content: Html) {
  return html`<!DOCTYPE html>
    <html lang="en" data-bs-theme="dark">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${title}</title>
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
          rel="stylesheet"
          integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
          crossorigin="anonymous"
        />
        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
          crossorigin="anonymous"
        ></script>
        <script
          async
          src="https://cdn.jsdelivr.net/npm/iconify-icon@2.2.0/dist/iconify-icon.min.js"
        ></script>
        <script
          src="https://cdn.jsdelivr.net/npm/@github/relative-time-element@4.4.5/dist/relative-time-element-define.min.js"
          type="module"
          async
        ></script>
      </head>
      <body>
        <div class="container">
          <div class="py-4">${content}</div>
        </div>
      </body>
    </html>`;
}

export type UiToolkit = ReturnType<typeof uiToolkit>;

export function uiToolkit() {
  let nextId = 1;
  const genId = () => `😭${nextId++}`;
  return {
    ofTotal(correct: Html, total: number) {
      return [correct, html`<small class="text-muted">/${total}</small>`];
    },
    tooltip: (content: Html, title: string) => {
      const id = genId();
      return [
        html`<span id="${id}" data-bs-toggle="tooltip" data-bs-title="${title}"
          >${content}</span
        >`,
        html`<script>
          new bootstrap.Tooltip(document.getElementById("${id}"));
        </script>`,
      ];
    },
    replaceable: (content: Html) => {
      const id = genId();
      return {
        target: html`<replaceable-target id="${id}"
          >${content}</replaceable-target
        >`,
        replacer: (newContent: Html) => {
          const templateId = genId();
          return [
            html`<template id="${templateId}">${newContent}</template>`,
            html`<script>
              document
                .getElementById("${id}")
                .replaceChildren(
                  document
                    .getElementById("${templateId}")
                    .content.cloneNode(true)
                );
            </script>`,
          ];
        },
      };
    },
    modal: (title: Html, content: Html) => {
      const id = genId();
      return {
        id,
        element: html`<div
          class="modal fade"
          id="${id}"
          tabindex="-1"
          aria-labelledby="${id}Label"
          aria-hidden="true"
          style="--bs-modal-width: 720px"
        >
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h1 class="modal-title h5" id="${id}Label">${title}</h1>
                <button
                  type="button"
                  class="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div class="modal-body">${content}</div>
              <div class="modal-footer">
                <button
                  type="button"
                  class="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>`,
      };
    },
    accordion: () => {
      const outerId = genId();
      return {
        container: (content: Html) =>
          html`<div class="accordion accordion-flush" id="${outerId}">
            ${content}
          </div>`,
        item: (header: Html, content: Html, id = genId()) => {
          return html`<div class="accordion-item">
            <h2 class="accordion-header" id="${id}">
              <button
                class="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#${id}-content"
                aria-expanded="false"
                aria-controls="${id}-content"
              >
                ${header}
              </button>
            </h2>
            <div
              id="${id}-content"
              class="accordion-collapse collapse"
              aria-labelledby="${id}"
              data-bs-parent="#${outerId}"
            >
              <div class="accordion-body">${content}</div>
            </div>
          </div>`;
        },
      };
    },
  };
}
