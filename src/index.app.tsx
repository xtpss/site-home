import ready from "./_vanilla/ready";
import copyToOwn from "./_vanilla/copy-to-own";

ready(function () {
  console.log(`Commit ID: ${process.env.COMMIT_ID?.slice(0, 8)}`);
});

ready(function () {
  const hostname = window.location.hostname;
  const el = document.getElementById("hostname");
  if (el) {
    el.textContent = hostname.split(".").slice(-2).join(".");
    el.classList.toggle("opacity-0", false);
    el.classList.toggle("opacity-100", true);
  }
});

function usingTemplate(nodes: Node[]) {
  const mainEl = document.querySelector("main");
  if (!mainEl) {
    return;
  }
  const tpl = document.querySelector('template[data-tpl="section"]') as HTMLTemplateElement | null;
  if (!tpl) {
    return;
  }
  const anchorEl = mainEl.childNodes.values().find((node) => {
    return node.nodeType === Node.COMMENT_NODE && (node as Comment).data.trim() === "section end";
  });
  if (!anchorEl) {
    return;
  }
  const sectionEl = tpl.content.cloneNode(true) as DocumentFragment;
  sectionEl.querySelector("section")?.append(...nodes);
  anchorEl.parentNode?.insertBefore(sectionEl, anchorEl);
}

ready(function () {
  const els = [];
  const el0 = document.createElement("div");
  el0.className = "wrap-break-word";
  el0.textContent = `${navigator.userAgent}`;
  els.push(el0);
  if ("userAgentData" in navigator) {
    const el1 = document.createElement("div");
    el1.className = "wrap-break-word";
    el1.textContent = `${JSON.stringify(navigator.userAgentData, null, 2)}`;
    els.push(el1);
  }
  usingTemplate(els);
});

ready(function () {
  const screen = copyToOwn(window.screen);
  const el2 = document.createElement("div");
  el2.className = "wrap-break-word";
  el2.textContent = `${JSON.stringify(screen, null, 2)}`;
  const viewport = {} as Record<string, unknown>;
  viewport.innerHeight = window.innerHeight;
  viewport.innerWidth = window.innerWidth;
  viewport.clientHeight = document.documentElement.clientHeight;
  viewport.clientWidth = document.documentElement.clientWidth;
  viewport.devicePixelRatio = window.devicePixelRatio;
  viewport.touchPoints = navigator.maxTouchPoints;
  const el3 = document.createElement("div");
  el3.className = "wrap-break-word";
  el3.textContent = `${JSON.stringify(viewport, null, 2)}`;
  usingTemplate([el2, el3]);
});
