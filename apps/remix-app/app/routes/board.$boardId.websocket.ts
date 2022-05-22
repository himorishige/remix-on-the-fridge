import type { LoaderFunction } from '@remix-run/cloudflare';

export const loader: LoaderFunction = async ({
  context: { env },
  params: { boardId },
  request,
}) => {
  if (!boardId) {
    return new Response('Invalid board id', { status: 400 });
  }
  const board = env.BOARD.get(env.BOARD.idFromString(boardId));

  const url = new URL(request.url);
  return board.fetch(`${url.protocol}//.../websocket`, request);
};
