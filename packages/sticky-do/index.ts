export interface Task {
  id: string;
  title: string;
  timestamp: number;
  status: 'pending' | 'assigned' | 'done';
  owner: string;
  assignee: string;
}

export default class StickyDurableObject {
  constructor(private state: DurableObjectState) {}

  async fetch(request: Request) {
    const url = new URL(request.url);

    switch (url.pathname) {
      case '/add': {
        const params = (await request.json()) as Partial<Task>;
        const taskData: Task = {
          id: params.id || new Date(Date.now()).toISOString(),
          title: params.title || 'no title',
          timestamp: params.timestamp || Date.now(),
          status: params.status || 'pending',
          owner: params.owner || 'anonymous',
          assignee: params.assignee || 'anonymous',
        };

        await this.state.storage.put(taskData.id, taskData);

        return new Response(JSON.stringify(taskData), { status: 200 });
      }
      case '/delete': {
        const params = (await request.json()) as { id: string };
        const response = await this.state.storage.delete(params.id);

        return new Response(
          JSON.stringify({ message: response ? 'ok' : 'failed' }),
          { status: 200 },
        );
      }
      case '/latest': {
        const data = await this.state.storage.list<Task>({
          reverse: true,
          limit: 100,
        });
        const tasks = [...data.values()];

        return new Response(JSON.stringify(tasks));
      }
      default:
        return new Response('Not found', { status: 404 });
    }
  }
}
