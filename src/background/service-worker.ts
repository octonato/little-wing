import type {
	IsPopupWindowResponse,
	Message,
	OpenPopupRequest,
} from "../shared/messages";

/** Window ids of the Little Wing popup and the window that opened it. */
interface PopupState {
	popupWindowId: number | null;
	parentWindowId: number | null;
}

async function loadState(): Promise<PopupState> {
	const stored = await chrome.storage.session.get([
		"popupWindowId",
		"parentWindowId",
	]);

	return {
		popupWindowId: stored.popupWindowId ?? null,
		parentWindowId: stored.parentWindowId ?? null,
	};
}

async function saveState(patch: Partial<PopupState>): Promise<void> {
	await chrome.storage.session.set(patch);
}

/** Returns the sender's window id if that window is a popup window. */
async function senderPopupWindowId(
	sender: chrome.runtime.MessageSender,
): Promise<number | null> {
	const windowId = sender.tab?.windowId;
	if (windowId === undefined) return null;

	const win = await chrome.windows.get(windowId);
	return win.type === "popup" ? windowId : null;
}

/** Returns the saved parent window if it still exists, else the last focused normal window. */
async function resolveParentWindowId(
	parentWindowId: number | null,
): Promise<number | null> {
	if (parentWindowId !== null) {
		try {
			await chrome.windows.get(parentWindowId);
			return parentWindowId;
		} catch {
			console.warn(
				`Little Wing: parent window ${parentWindowId} is gone, using last focused window`,
			);
		}
	}

	try {
		const win = await chrome.windows.getLastFocused({
			windowTypes: ["normal"],
		});
		return win.id ?? null;
	} catch {
		return null;
	}
}

async function openPopup(
	message: OpenPopupRequest,
	sender: chrome.runtime.MessageSender,
): Promise<void> {
	const state = await loadState();
	const parentWindowId = sender.tab?.windowId ?? null;

	if (state.popupWindowId !== null) {
		const tabs = await chrome.tabs.query({ windowId: state.popupWindowId });
		const tabId = tabs[0]?.id;

		if (tabId !== undefined) {
			await chrome.tabs.update(tabId, { url: message.url });
			await chrome.windows.update(state.popupWindowId, { focused: true });
			await saveState({ parentWindowId });
			return;
		}
	}

	const width = Math.round(message.parentWidth * 0.85);
	const height = Math.round(message.parentHeight * 0.85);
	const left = Math.round(
		message.parentLeft + (message.parentWidth - width) / 2,
	);
	const top = Math.round(
		message.parentTop + (message.parentHeight - height) / 2,
	);

	const win = await chrome.windows.create({
		type: "popup",
		url: message.url,
		width,
		height,
		top,
		left,
		focused: true,
	});

	await saveState({ popupWindowId: win?.id ?? null, parentWindowId });
}

async function isPopupWindow(
	sender: chrome.runtime.MessageSender,
): Promise<IsPopupWindowResponse> {
	const state = await loadState();
	const windowId = sender.tab?.windowId;
	const isPopup = windowId !== undefined && windowId === state.popupWindowId;

	return { isPopup, parentWindowId: state.parentWindowId };
}

async function promoteToTab(
	sender: chrome.runtime.MessageSender,
): Promise<void> {
	const tabId = sender.tab?.id;
	const popupWindowId = await senderPopupWindowId(sender);

	if (tabId === undefined || popupWindowId === null) {
		console.warn("Little Wing: PROMOTE_TO_TAB sent from a non-popup window");
		return;
	}

	const state = await loadState();
	const parentWindowId = await resolveParentWindowId(state.parentWindowId);

	if (parentWindowId === null) {
		console.warn("Little Wing: no window to move the tab to");
		return;
	}

	await chrome.tabs.move(tabId, { windowId: parentWindowId, index: -1 });
	await chrome.tabs.update(tabId, { active: true });
	await chrome.windows.update(parentWindowId, { focused: true });

	await saveState({ popupWindowId: null });
}

async function closePopup(sender: chrome.runtime.MessageSender): Promise<void> {
	const popupWindowId = await senderPopupWindowId(sender);

	if (popupWindowId === null) {
		console.warn("Little Wing: CLOSE_POPUP sent from a non-popup window");
		return;
	}

	await chrome.windows.remove(popupWindowId);
	await saveState({ popupWindowId: null });
}

async function handleMessage(
	message: Message,
	sender: chrome.runtime.MessageSender,
): Promise<IsPopupWindowResponse | undefined> {
	switch (message.type) {
		case "OPEN_POPUP":
			await openPopup(message, sender);
			return undefined;

		case "IS_POPUP_WINDOW":
			return isPopupWindow(sender);

		case "PROMOTE_TO_TAB":
			await promoteToTab(sender);
			return undefined;

		case "CLOSE_POPUP":
			await closePopup(sender);
			return undefined;
	}
}

chrome.runtime.onInstalled.addListener(() => {
	console.log("Little Wing extension installed");
});

chrome.runtime.onMessage.addListener(
	(message: Message, sender, sendResponse) => {
		handleMessage(message, sender)
			.then(sendResponse)
			.catch((error) => {
				console.error(`Little Wing: ${message.type} failed`, error);
				sendResponse(undefined);
			});

		return true;
	},
);

chrome.windows.onRemoved.addListener(async (windowId) => {
	const state = await loadState();

	if (windowId === state.popupWindowId) {
		await saveState({ popupWindowId: null });
	}
});
