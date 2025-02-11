(() => {
  let pageContent = document.body.innerText;
  console.log("Extracted Content:", pageContent);
})();

if (!window.hasSentInitialization) {
    window.hasSentInitialization = true;
    chrome.runtime.sendMessage({ content: document.body.innerText });
}
  