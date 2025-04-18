import { renderHtmlAsync } from "@thai/html";
import { Website } from "../src/web";

const website = await Website.create();

for (const [path, page] of Object.entries(website.pages)) {
  const filePath = `./dist/${path}`;
  const content = await renderHtmlAsync(page().render());
  await Bun.write(filePath, content);
  console.log(`Generated ${filePath}`);
}
