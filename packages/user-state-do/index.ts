export type UserState = {
  id: string;
  name: string;
  online: boolean;
};
export default class UserStateDurableObject {
  private usersState: UserState[] = [];

  constructor(private state: DurableObjectState) {
    this.state.blockConcurrencyWhile(async () => {
      let storedValue = await this.state.storage.list<UserState>();
      this.usersState = [...storedValue.values()] || [];
    });
  }

  async fetch(request: Request) {
    const url = new URL(request.url);

    switch (url.pathname) {
      case '/add': {
        const params = (await request.json()) as Partial<UserState>;
        const userData: UserState = {
          id: params.id || new Date(Date.now()).toISOString(),
          name: params.name || 'anonymous',
          online: params.online || false,
        };

        await this.state.storage.put(userData.name, userData);

        return new Response(JSON.stringify(userData), { status: 200 });
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
        const data = await this.state.storage.list<UserState>({
          reverse: true,
          limit: 100,
        });
        const users = [...data.values()];

        return new Response(JSON.stringify(users));
      }
      default:
        return new Response('Not found', { status: 404 });
    }
  }
}
