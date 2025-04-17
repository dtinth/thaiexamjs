import { renderHtmlAsync } from "@thai/html";
import type { ServeOptions } from "bun";
import { Website } from "../src/web";

const website = await Website.create();

export default {
  fetch: async (request: Request) => {
    const pathname = new URL(request.url).pathname;
    const page = website.pages[pathname.replace(/^\//, "") || "index.html"];
    if (page) {
      return new Response(await renderHtmlAsync(page().render()), {
        headers: {
          "Content-Type": "text/html",
        },
      });
    }

    return new Response("404 Not Found", {
      status: 404,
    });
  },
} as ServeOptions;
