 (function () {
  var script = document.currentScript;
  if (!script) return;

  var creator = script.getAttribute("data-creator");
  if (!creator) return console.error("[ZapTip] Missing data-creator attribute");

  var BASE = script.src.replace("/widget.js", "");
  var IFRAME_URL = BASE + "/tip/" + creator + "?embed=true";

  // Floating button
  var btn = document.createElement("button");
  btn.textContent = "\u26A1 Tip me on Starknet!";
  btn.style.cssText =
    "position:fixed;bottom:24px;right:24px;z-index:99999;" +
    "padding:12px 20px;border:none;border-radius:12px;cursor:pointer;" +
    "background:#e5e5e5;color:#1a1a1a;font-weight:600;font-size:14px;" +
    "font-family:system-ui,sans-serif;box-shadow:0 4px 12px rgba(0,0,0,0.3);" +
    "transition:transform 0.15s,box-shadow 0.15s;";
  btn.onmouseenter = function () { btn.style.transform = "scale(1.05)"; };
  btn.onmouseleave = function () { btn.style.transform = "scale(1)"; };

  // Overlay + iframe
  var overlay = document.createElement("div");
  overlay.style.cssText =
    "display:none;position:fixed;inset:0;z-index:100000;" +
    "background:rgba(0,0,0,0.6);align-items:center;justify-content:center;";

  var frame = document.createElement("iframe");
  frame.src = IFRAME_URL;
  frame.style.cssText =
    "width:400px;max-width:95vw;height:620px;max-height:90vh;" +
    "border:none;border-radius:16px;background:#1a1a1a;";

  overlay.appendChild(frame);

  btn.onclick = function () { overlay.style.display = "flex"; };
  overlay.onclick = function (e) {
    if (e.target === overlay) overlay.style.display = "none";
  };

  document.body.appendChild(btn);
  document.body.appendChild(overlay);
})();
