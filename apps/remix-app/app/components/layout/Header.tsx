import { Link } from '@remix-run/react';

export const Header = () => {
  return (
    <header className="text-white bg-sky-600">
      <div className="container flex flex-col flex-wrap justify-between items-center py-5 mx-auto md:flex-row">
        <Link to="/" className="flex items-center font-medium">
          <span className="text-xl">Remix on the fridge</span>
        </Link>
        <div>icon</div>
      </div>
    </header>
  );
};
