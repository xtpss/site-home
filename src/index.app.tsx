import { render } from "solid-js/web";

const App = () => {
  return <div></div>;
};

const root = document.getElementById("solidJSRoot");
if (root) {
  render(App, root);
}

const $printEnv = () => {
  console.log(`Commit ID: ${process.env.COMMIT_ID?.slice(0, 8)}`);
};

const $hostname = () => {
  const hostname = window.location.hostname;
  const el = document.getElementById("hostname");
  if (el) {
    el.textContent = hostname.split(".").slice(-2).join(".");
    el.classList.toggle("opacity-0", false);
    el.classList.toggle("opacity-100", true);
  }
};

const $browserInfo = () => {
  const eln = document.getElementById("ua-normal");
  if (eln) {
    const ua = navigator.userAgent;
    eln.textContent = `${ua}`;
  }
  const eld = document.getElementById("ua-data");
  if (eld && "userAgentData" in navigator) {
    const uad = navigator.userAgentData;
    eld.textContent = `${JSON.stringify(uad)}`;
  }
};

function $init() {
  $printEnv();
  $hostname();
  $browserInfo();
}

window.addEventListener("DOMContentLoaded", $init);
