(() => {
  if (!window.hasSentInitialization) {
    window.hasSentInitialization = true;
    console.log("Sending page content to background script");
    const pageContent = String(document.body.innerText);
    chrome.runtime.sendMessage({
      page_content: pageContent,
    });
  }
})();
