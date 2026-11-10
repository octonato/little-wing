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
	const isMac = navigator.platform.includes("Mac");
	let isPromoting = false;

	// Esc to close, Cmd+Esc / Ctrl+Esc to promote to tab
	document.addEventListener("keydown", (event: KeyboardEvent) => {
		if (event.key !== "Escape") return;

		const modifierPressed = isMac ? event.metaKey : event.ctrlKey;
		if (modifierPressed && !isPromoting) {
			event.preventDefault();
			isPromoting = true;
			const msg: PromoteToTabRequest = { type: "PROMOTE_TO_TAB" };
			chrome.runtime
				.sendMessage(msg)
				.catch((error) => console.warn("Little Wing: promote failed", error))
				.finally(() => {
					isPromoting = false;
				});
		} else {
			const msg: ClosePopupRequest = { type: "CLOSE_POPUP" };
			chrome.runtime.sendMessage(msg);
		}
	});

	// Floating toolbar
	const toolbar = document.createElement("div");
	toolbar.style.cssText = [
		"position: fixed",
		"bottom: 16px",
		"right: 16px",
		"z-index: 2147483647",
		"display: flex",
		"gap: 8px",
	].join(";");

	const copyBtn = createToolbarButton(COPY_ICON, "Copy URL");
	copyBtn.addEventListener("click", () => {
		copyToClipboard(location.href)
			.then(() => flashIcon(copyBtn, CHECK_ICON, COPY_ICON))
			.catch((error) => console.warn("Little Wing: copy failed", error));
	});

	const promoteBtn = createToolbarButton(OPEN_IN_TAB_ICON, "Open in Tab");
	promoteBtn.addEventListener("click", () => {
		const msg: PromoteToTabRequest = { type: "PROMOTE_TO_TAB" };
		chrome.runtime.sendMessage(msg);
	});

	toolbar.append(copyBtn, promoteBtn);
	document.body.appendChild(toolbar);
}

/** An SVG icon as a list of shapes: tag name plus attributes. */
type Icon = [string, Record<string, string>][];

const COPY_ICON: Icon = [
	["rect", { x: "9", y: "9", width: "13", height: "13", rx: "2" }],
	["path", { d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" }],
];

const CHECK_ICON: Icon = [["polyline", { points: "20 6 9 17 4 12" }]];

const OPEN_IN_TAB_ICON: Icon = [
	["path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" }],
	["polyline", { points: "15 3 21 3 21 9" }],
	["line", { x1: "10", y1: "14", x2: "21", y2: "3" }],
];

const SVG_NS = "http://www.w3.org/2000/svg";

const SVG_ATTRS: Record<string, string> = {
	width: "16",
	height: "16",
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	"stroke-width": "2",
	"stroke-linecap": "round",
	"stroke-linejoin": "round",
};

function createSvgElement(
	tag: string,
	attrs: Record<string, string>,
): SVGElement {
	const el = document.createElementNS(SVG_NS, tag);
	for (const [name, value] of Object.entries(attrs)) {
		el.setAttribute(name, value);
	}
	return el;
}

/** Builds an SVG element for the icon. */
function renderIcon(icon: Icon): SVGElement {
	const svg = createSvgElement("svg", SVG_ATTRS);
	for (const [tag, attrs] of icon) {
		svg.appendChild(createSvgElement(tag, attrs));
	}
	return svg;
}

/** Creates a toolbar button showing an icon, with a tooltip. */
function createToolbarButton(icon: Icon, label: string): HTMLButtonElement {
	const btn = document.createElement("button");
	btn.replaceChildren(renderIcon(icon));
	btn.title = label;
	btn.setAttribute("aria-label", label);
	btn.style.cssText = [
		"display: flex",
		"align-items: center",
		"justify-content: center",
		"width: 34px",
		"height: 34px",
		"padding: 0",
		"background: #333",
		"color: #fff",
		"border: none",
		"border-radius: 8px",
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

	return btn;
}

/** Shows a temporary icon on the button, then restores the original one. */
function flashIcon(btn: HTMLButtonElement, temp: Icon, original: Icon): void {
	btn.replaceChildren(renderIcon(temp));
	setTimeout(() => {
		btn.replaceChildren(renderIcon(original));
	}, 1500);
}

/** Writes text to the clipboard. */
async function copyToClipboard(text: string): Promise<void> {
	if (navigator.clipboard && window.isSecureContext) {
		await navigator.clipboard.writeText(text);
		return;
	}

	const textarea = document.createElement("textarea");
	textarea.value = text;
	textarea.style.cssText = "position: fixed; opacity: 0";
	document.body.appendChild(textarea);
	textarea.select();

	const copied = document.execCommand("copy");
	textarea.remove();

	if (!copied) throw new Error("execCommand copy failed");
}

// Check if this content script is running inside our popup window
const checkMsg: IsPopupWindowRequest = { type: "IS_POPUP_WINDOW" };
chrome.runtime.sendMessage(checkMsg, (response: IsPopupWindowResponse) => {
	if (response?.isPopup) {
		setupPopupControls();
	}
});
