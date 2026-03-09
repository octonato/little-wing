import type {
	ClosePopupRequest,
	IsPopupWindowRequest,
	IsPopupWindowResponse,
	OpenPopupRequest,
	PromoteToTabRequest,
} from "../shared/messages";

function findAnchor(target: EventTarget | null): HTMLAnchorElement | null {
	if (!target || !(target instanceof HTMLElement)) return null;
	return target.closest("a[href]");
}

// --- Main window behavior: intercept Shift+Cmd+Click ---

document.addEventListener(
	"click",
	(event: MouseEvent) => {
		if (!event.metaKey || !event.shiftKey) return;

		const anchor = findAnchor(event.target);
		if (!anchor) return;

		event.preventDefault();
		event.stopPropagation();

		const url = anchor.href;
		if (!url || url === "#" || url.startsWith("javascript:")) return;

		const message: OpenPopupRequest = {
			type: "OPEN_POPUP",
			url,
			parentWidth: window.outerWidth,
			parentHeight: window.outerHeight,
			parentTop: window.screenY,
			parentLeft: window.screenX,
		};
		chrome.runtime.sendMessage(message);
	},
	true,
);

// --- Popup window behavior: Esc to close + promote toolbar ---

function setupPopupControls(): void {
	// Esc to close
	document.addEventListener("keydown", (event: KeyboardEvent) => {
		if (event.key === "Escape") {
			const msg: ClosePopupRequest = { type: "CLOSE_POPUP" };
			chrome.runtime.sendMessage(msg);
		}
	});

	// Floating promote button
	const btn = document.createElement("button");
	btn.textContent = "↗ Open in Tab";
	btn.style.cssText = [
		"position: fixed",
		"bottom: 16px",
		"right: 16px",
		"z-index: 2147483647",
		"padding: 8px 14px",
		"background: #333",
		"color: #fff",
		"border: none",
		"border-radius: 8px",
		"font: 13px -apple-system, BlinkMacSystemFont, sans-serif",
		"cursor: pointer",
		"box-shadow: 0 2px 8px rgba(0,0,0,0.3)",
		"opacity: 0.7",
		"transition: opacity 0.15s",
	].join(";");
	btn.addEventListener("mouseenter", () => {
		btn.style.opacity = "1";
	});
	btn.addEventListener("mouseleave", () => {
		btn.style.opacity = "0.7";
	});
	btn.addEventListener("click", () => {
		const msg: PromoteToTabRequest = { type: "PROMOTE_TO_TAB" };
		chrome.runtime.sendMessage(msg);
	});

	document.body.appendChild(btn);
}

// Check if this content script is running inside our popup window
const checkMsg: IsPopupWindowRequest = { type: "IS_POPUP_WINDOW" };
chrome.runtime.sendMessage(checkMsg, (response: IsPopupWindowResponse) => {
	if (response?.isPopup) {
		setupPopupControls();
	}
});
