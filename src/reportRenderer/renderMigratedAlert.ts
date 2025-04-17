import { html } from "@thai/html";

export function renderMigratedAlert() {
  return html`
    <div class="alert alert-warning mb-4" role="alert">
      <strong>This website has moved!</strong> Please visit the new URL at
      <a href="https://ai-vs-thai-exams.pages.dev/" class="alert-link"
        >https://ai-vs-thai-exams.pages.dev/</a
      >. This page still works but contains outdated information and remains
      available for archival purposes as it contains old models.
    </div>
  `;
}
