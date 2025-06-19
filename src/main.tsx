import { render } from "preact";
import "./styles/fonts.css";
import "./styles/index.css";
import App from "./app";
import { ThemeProvider } from "next-themes";
import { themes } from "./lib/constants";

render(
  <ThemeProvider
    attribute="class"
    defaultTheme="dusk"
    themes={themes}
    disableTransitionOnChange
  >
    <App />
  </ThemeProvider>,
  document.getElementById("app")!
);
