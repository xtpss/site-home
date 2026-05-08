import withResolvers from "./with-resolvers";

const readyResolvers = withResolvers<void>();

const ready = (callback: () => void): void => {
  readyResolvers.promise.then(callback).catch((error) => {
    setTimeout(() => {
      throw error;
    });
  });
};

export default ready;

function doReady() {
  readyResolvers.resolve();
}

function complete() {
  document.removeEventListener("DOMContentLoaded", complete);
  window.removeEventListener("load", complete);
  doReady();
}

if (document.readyState !== "loading") {
  window.setTimeout(doReady);
} else {
  document.addEventListener("DOMContentLoaded", complete, { once: true });
  window.addEventListener("load", complete, { once: true });
}
