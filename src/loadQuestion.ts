export async function loadQuestion(file: string) {
  return (await Bun.file(file).text())
    .split("\n")
    .filter((x) => x.trim())
    .map((x) => JSON.parse(x));
}

export function getQuestionFiles() {
  return Array.from(
    new Bun.Glob("thai_exam/data/**/*_test.jsonl").scanSync()
  ).sort();
}
