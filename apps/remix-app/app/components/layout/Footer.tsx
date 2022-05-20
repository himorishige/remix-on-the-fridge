export const Footer = () => {
  return (
    <footer>
      <div className="bg-gray-100">
        <div className="container flex flex-wrap py-4 mx-auto">
          <p className="text-sm text-center text-gray-500 sm:text-left">
            &copy; 2022 _himorishige —
            <a
              href="https://twitter.com/_himorishige"
              className="ml-1 text-gray-600"
              target="_blank"
              rel="noopener noreferrer"
            >
              @_himorishige
            </a>
          </p>
          <span className="mt-2 w-full text-sm text-center text-gray-500 sm:mt-0 sm:ml-auto sm:w-auto sm:text-left">
            Remix on the fridge
          </span>
        </div>
      </div>
    </footer>
  );
};
