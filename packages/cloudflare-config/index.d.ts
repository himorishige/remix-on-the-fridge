interface Env {
  __STATIC_CONTENT: KVNamespace;

  SESSION_KV: KVNamespace;

  BOARD: DurableObjectNamespace;
  COUNTER: DurableObjectNamespace;
  RATE_LIMITER: DurableObjectNamespace;
  STICKY: DurableObjectNamespace;
  USER_STATE: DurableObjectNamespace;

  SESSION_SECRET: string;
}
