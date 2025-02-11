import axios from "axios";
chrome.action.onClicked.addListener(async (tab) => {
  await chrome.sidePanel.open({ tabId: tab.id });
});

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log("Received Content:", message.content);

  try {
    const response = await axios.post("http://127.0.0.1:5000/initialize", {
      session_id: 1,
      page_content: message.content,
    });

    if (response) {
      console.log("Content sent successfully!");
    } else {
      console.error("Failed to send content, status:", response.status);
    }
  } catch (error) {
    console.error("Error sending content:", error);
  }
});

chrome.runtime.onSuspend.addListener(async () => {
  try {
    const response = await axios.post("http://127.0.0.1:5000/disconnect", {
      session_id: 1,
    });

    if (response) {
      console.log("session disconnected successfully!");
    } else {
      console.error("Failed to disconnect the session", response.status);
    }
  } catch (error) {
    console.error("Error disconnecting:", error);
  }
});
