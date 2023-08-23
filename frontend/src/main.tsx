import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider
} from "react-router-dom";
import App from "./App";
import Host from "./routes/Host";
import Join from "./routes/Join";
import Session from "./routes/Session";

const router = createBrowserRouter([
  {
    path: "/outtapocket",
    element: <App />,
  },
  {
    path: "/outtapocket/host",
    element: <Host />,
  },
  {
    path: "/outtapocket/join",
    element: <Join />,
  },
  {
    path: "/outtapocket/session",
    element: <Session />,
  }
]);

createRoot(document.getElementById("root") as HTMLElement).render(
  <RouterProvider router={router} />
);