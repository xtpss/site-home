import { render } from "solid-js/web";

const App = () => {
  return <div></div>;
};

const root = document.getElementById("render-root");
if (root) {
  render(App, root);
}

console.log(process.env.COMMIT_ID);
