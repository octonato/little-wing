export interface OpenPopupRequest {
	type: "OPEN_POPUP";
	url: string;
	parentWidth: number;
	parentHeight: number;
	parentTop: number;
	parentLeft: number;
}

export interface PromoteToTabRequest {
	type: "PROMOTE_TO_TAB";
}

export interface ClosePopupRequest {
	type: "CLOSE_POPUP";
}

export interface IsPopupWindowRequest {
	type: "IS_POPUP_WINDOW";
}

export interface IsPopupWindowResponse {
	isPopup: boolean;
	parentWindowId: number | null;
}

export type Message =
	| OpenPopupRequest
	| PromoteToTabRequest
	| ClosePopupRequest
	| IsPopupWindowRequest;
