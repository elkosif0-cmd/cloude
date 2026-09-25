// Minimal stand-in for @cloudflare/containers: forwards containerFetch to the local server.mjs.
export class Container {
  constructor(ctx, env) { this.ctx = ctx; this.env = env; }
  containerFetch(url, init) { return fetch(url.replace('http://container', process.env.CONTAINER_ORIGIN), init); }
  async onActivityExpired() {}
}
export const getContainer = (ns, name) => ns.get(name);
