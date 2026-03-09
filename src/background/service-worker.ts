import type { IsPopupWindowResponse, Message } from "../shared/messages";

let popupWindowId: number | null = null;
let parentWindowId: number | null = null;

chrome.runtime.onInstalled.addListener(() => {
	console.log("Little Wing extension installed");
});

chrome.runtime.onMessage.addListener(
	(message: Message, sender, sendResponse) => {
		if (message.type === "OPEN_POPUP") {
			parentWindowId = sender.tab?.windowId ?? null;

			const width = Math.round(message.parentWidth * 0.85);
			const height = Math.round(message.parentHeight * 0.85);
			const left = Math.round(
				message.parentLeft + (message.parentWidth - width) / 2,
			);
			const top = Math.round(
				message.parentTop + (message.parentHeight - height) / 2,
			);

			if (popupWindowId !== null) {
				chrome.tabs.query({ windowId: popupWindowId }, (tabs) => {
					if (tabs[0]?.id) {
						chrome.tabs.update(tabs[0].id, { url: message.url });
						chrome.windows.update(popupWindowId as number, {
							focused: true,
						});
					}
				});
				return false;
			}

			chrome.windows.create(
				{
					type: "popup",
					url: message.url,
					width,
					height,
					top,
					left,
					focused: true,
				},
				(win) => {
					if (win?.id) {
						popupWindowId = win.id;
					}
				},
			);
			return false;
		}

		if (message.type === "IS_POPUP_WINDOW") {
			const windowId = sender.tab?.windowId;
			const isPopup = windowId !== undefined && windowId === popupWindowId;
			const response: IsPopupWindowResponse = {
				isPopup,
				parentWindowId,
			};
			sendResponse(response);
			return false;
		}

		if (message.type === "PROMOTE_TO_TAB") {
			if (popupWindowId === null || parentWindowId === null) return false;

			chrome.tabs.query({ windowId: popupWindowId }, (tabs) => {
				const tab = tabs[0];
				if (!tab?.id || parentWindowId === null) return;

				chrome.tabs.move(tab.id, {
					windowId: parentWindowId,
					index: -1,
				});
				chrome.tabs.update(tab.id, { active: true });
				chrome.windows.update(parentWindowId, { focused: true });

				popupWindowId = null;
			});
			return false;
		}

		if (message.type === "CLOSE_POPUP") {
			if (popupWindowId !== null) {
				chrome.windows.remove(popupWindowId);
				popupWindowId = null;
			}
			return false;
		}

		return false;
	},
);

chrome.windows.onRemoved.addListener((windowId) => {
	if (windowId === popupWindowId) {
		popupWindowId = null;
	}
});
