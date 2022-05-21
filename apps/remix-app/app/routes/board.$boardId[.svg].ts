import type { LoaderFunction } from '@remix-run/cloudflare';
import QRCode from 'qrcode-svg';

const MAXAGE = 60 * 60;
const S_MAXAGE = 60 * 60 * 24;

export const loader: LoaderFunction = async ({
  context: { env },
  params: { boardId },
  request,
}) => {
  if (!boardId) {
    return new Response('Invalid board url', { status: 400 });
  }

  const board = env.BOARD.get(env.BOARD.idFromString(boardId));

  if (!board) {
    return new Response('Invalid board url', { status: 400 });
  }

  const url = new URL(request.url);
  const boardUrl = url.href.replace('.svg', '');

  const qr = new QRCode({
    content: boardUrl,
    ecl: 'H',
    padding: 0,
    width: 256,
    height: 256,
  });

  const response = new Response(qr.svg(), {
    headers: {
      'Content-Type': 'image/svg+xml',
      Vary: 'Accept-Encoding',
      'Cache-Control': `max-age: ${MAXAGE}, s-maxage: ${S_MAXAGE}`,
    },
  });

  return response;
};
