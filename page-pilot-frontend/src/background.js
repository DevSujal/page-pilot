import axios from "axios";

chrome.action.onClicked.addListener(async (tab) => {
  await chrome.sidePanel.open({ tabId: tab.id });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received Content:", message.page_content);

  // Use async function inside the listener
  const initializeSession = async () => {
    try {
      const response = await axios.post("http://127.0.0.1:5000/initialize", {
        session_id: "1",  // Convert to string to match Flask expectations
        page_content: message.page_content,
      });

      if (response.status === 200) {
        console.log("Content sent successfully!");
        // Send response back to content script if needed
        sendResponse({ success: true, data: response.data });
      } else {
        console.error("Failed to send content, status:", response.status);
        sendResponse({ success: false, error: "Request failed" });
      }
    } catch (error) {
      console.error("Error sending content:", error.message);
      console.error("Full error object:", error);
      sendResponse({ success: false, error: error.message });
    }
  };

  // Important: Return true to indicate async response
  initializeSession();
  return true;  // Keep message channel open for async response
});

chrome.runtime.onSuspend.addListener(async () => {
  try {
    const response = await axios.post("http://127.0.0.1:5000/disconnect", {
      session_id: "1",
    });

    if (response.status === 200) {
      console.log("Session disconnected successfully!");
      console.log("Response data:", response.data);
    } else {
      console.error("Failed to disconnect the session", response.status);
    }
  } catch (error) {
    console.error("Error disconnecting:", error.message);
  }
});