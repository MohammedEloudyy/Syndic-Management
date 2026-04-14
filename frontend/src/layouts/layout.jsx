import { Link, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <>
      <header>
        <div className="items-center justify-between flex bg-gray-800 bg-opacity-90 px-12 py-4 mb-4 mx-auto shadow-2xl">
          <div className="text-2xl text-white font-semibold inline-flex items-center">
            <Link to="/" className="hover:text-gray-200">
              Syndic Management
            </Link>
          </div>

          <div>
            <ul className="flex text-white">
              <li className="ml-5 px-2 py-1">
                <Link className="flex items-center hover:text-gray-200" to="/">
                  Home
                </Link>
              </li>
              <li className="ml-5 px-2 py-1">
                <Link className="flex items-center hover:text-gray-200" to="/login">
                  Login
                </Link>
              </li>
              <li className="ml-5 px-2 py-1">
                <Link className="flex items-center hover:text-gray-200" to="/register">
                  Register
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </>
  );
}