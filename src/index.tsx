import { render } from "solid-js/web";

const root = document.getElementById("root");
if (root) {
  render(
    () => (
      <div class="relative h-full p-8">
        <div>In building</div>
      </div>
    ),
    root,
  );
}
