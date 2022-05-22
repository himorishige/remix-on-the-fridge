interface Env {
  __STATIC_CONTENT: KVNamespace;

  SESSION_KV: KVNamespace;

  BOARD: DurableObjectNamespace;
  COUNTER: DurableObjectNamespace;
  RATE_LIMITER: DurableObjectNamespace;

  SESSION_SECRET: string;
}
