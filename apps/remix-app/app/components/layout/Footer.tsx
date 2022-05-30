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
        <div className="flex flex-wrap justify-between items-center p-4 mx-auto">
          <p className="text-sm text-gray-200">
            &copy; 2022 _himorishige —
            <a
              href="https://twitter.com/_himorishige"
              className="text-gray-100"
              target="_blank"
              rel="noopener noreferrer"
            >
              @_himorishige
            </a>
          </p>
          <div className="text-sm text-gray-300">
            Root loader invocations: {props.loaderCalls}. Local loader
            invocations: {localLoaderCalls}.
          </div>
        </div>
      </div>
    </footer>
  );
};
