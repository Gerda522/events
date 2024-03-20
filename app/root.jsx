import {
  Links,
  Link,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import styles from "./app.css";
import Navbar from "./components/Navbar";
import authenticator from "./services/auth.server";
import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";

export const links = () => [
  {
    rel: "stylesheet",
    href: styles,
  },
];

export async function loader({ request }) {
  const user = await authenticator.isAuthenticated(request);
  return json({ isAuthenticated: !!user });
}

export function meta() {
  return [{ title: "Events" }];
}

export default function App() {
  const user = useLoaderData();
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Navbar />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
