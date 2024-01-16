import "./styles/main.css";
import './styles/style.css';
import App from "./App.svelte";
import { auth } from "./stores";

await auth.refresh();

const app = new App({
  target: document.getElementById("app"),
});

export default app;
