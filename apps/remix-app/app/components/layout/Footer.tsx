import { useAtomValue } from 'jotai';
import { boardLoaderCallsAtom } from '~/state/store';

type Props = {
  loaderCalls?: number;
};

export const Footer: React.FC<Props> = (props) => {
  const localLoaderCalls = useAtomValue(boardLoaderCallsAtom);

  return (
    <footer>
      <div className="bg-sky-700">
        <div className="container flex flex-wrap py-4 mx-auto">
          <p className="text-sm text-center text-gray-200 sm:text-left">
            &copy; 2022 _himorishige —
            <a
              href="https://twitter.com/_himorishige"
              className="ml-1 text-gray-100"
              target="_blank"
              rel="noopener noreferrer"
            >
              @_himorishige
            </a>
          </p>
          <span className="mt-2 w-full text-sm text-center text-gray-300 sm:mt-0 sm:ml-auto sm:w-auto sm:text-left">
            Root loader invocations: {props.loaderCalls}. Local loader
            invocations: {localLoaderCalls}.
          </span>
        </div>
      </div>
    </footer>
  );
};
