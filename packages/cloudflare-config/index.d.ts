interface Env {
  __STATIC_CONTENT: KVNamespace;

  BOARD: DurableObjectNamespace;
  COUNTER: DurableObjectNamespace;
  RATE_LIMITER: DurableObjectNamespace;

  SESSION_SECRET: string;
}
