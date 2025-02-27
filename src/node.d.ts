declare module "node:stream" {
  function compose(...streams: NodeJS.WritableStream[]): NodeJS.WritableStream;
}
