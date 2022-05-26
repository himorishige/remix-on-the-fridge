import { Link } from '@remix-run/react';
import { ShareIcon } from '~/components/icons';
import { useAtomValue } from 'jotai';
import { boardIdAtom } from '~/state/store';
import { Dialog } from '@headlessui/react';
import { useState } from 'react';
import { Button } from '~/components/ui';
import { SubHeader } from './SubHeader';

export const Header = () => {
  const boardId = useAtomValue(boardIdAtom);
  let [isOpen, setIsOpen] = useState(false);

  const shareHandler: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();

    const boardUrl = `${window.location.origin}/board/${boardId}`;

    if (!boardId || !boardUrl) return;

    window.navigator.clipboard.writeText(boardUrl).then(() => {
      alert('Copied to clipboard!');
    });
  };

  return (
    <>
      <header className="text-white bg-sky-700">
        <div className="flex flex-row flex-wrap justify-between items-center py-2 mx-auto">
          <Link to="/" className="flex items-center font-medium">
            <div className="w-12 h-12">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 256 256"
              >
                <defs>
                  <clipPath id="b">
                    <rect width={256} height={256} />
                  </clipPath>
                </defs>
                <g id="a" clipPath="url(#b)">
                  <g transform="translate(-26.102 34)">
                    <path
                      d="M212.654,199.512H95.549a6.5,6.5,0,0,1-6.506-6.506V6.506A6.5,6.5,0,0,1,95.549,0H212.654a6.5,6.5,0,0,1,6.506,6.506v186.5A6.5,6.5,0,0,1,212.654,199.512Z"
                      fill="#e3eded"
                    />
                    <path
                      d="M314.553,0H256V199.512h58.553a6.5,6.5,0,0,0,6.506-6.506V6.506A6.5,6.5,0,0,0,314.553,0Z"
                      transform="translate(-101.898)"
                      fill="#c6dce5"
                    />
                    <g transform="translate(115.066 26.023)">
                      <path
                        d="M162.332,105.817a6.5,6.5,0,0,1-6.506-6.506V73.288a6.506,6.506,0,0,1,13.012,0V99.311A6.505,6.505,0,0,1,162.332,105.817Z"
                        transform="translate(-155.826 -66.782)"
                        fill="#898890"
                      />
                      <path
                        d="M162.332,336.526a6.5,6.5,0,0,1-6.506-6.506V273.636a6.506,6.506,0,1,1,13.012,0V330.02A6.505,6.505,0,0,1,162.332,336.526Z"
                        transform="translate(-155.826 -189.06)"
                        fill="#898890"
                      />
                    </g>
                    <rect
                      width="130.117"
                      height="13.012"
                      transform="translate(89.043 78.07)"
                      fill="#aac9d6"
                    />
                  </g>
                  <image
                    width={60}
                    height={57}
                    transform="translate(128 48)"
                    xlinkHref="data:image/png;base64,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"
                  />
                </g>
              </svg>
            </div>
            <span className="text-xl hover:underline sm:text-3xl">
              on the fridge
            </span>
          </Link>
          <div className="ml-auto">
            <SubHeader />
          </div>
          <div className="px-2 sm:px-4">
            <button
              type="button"
              className="pt-2 text-lg text-white hover:text-cyan-200 transition-colors duration-200"
              onClick={() => setIsOpen(true)}
            >
              <ShareIcon className="w-8 h-8" />
            </button>
          </div>
        </div>
      </header>
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="flex fixed inset-0 justify-center items-center p-4">
          <Dialog.Panel className="p-8 w-full max-w-sm bg-white rounded">
            <Dialog.Title className="mb-2 text-lg">
              Share the URL and invite your family and friends to join the
              board!
            </Dialog.Title>
            <Dialog.Description className="mb-4">
              <img
                src={`./${boardId}.svg`}
                alt="svg"
                className="w-full h-auto"
              />
            </Dialog.Description>
            <div className="flex justify-between items-center">
              <Button onClick={shareHandler}>Copy Board URL</Button>
              <Button secondary="true" onClick={() => setIsOpen(false)}>
                Close
              </Button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};
