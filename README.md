# Little Wing

Little Wing is a Chromium extension that opens links in a floating popup window.
It works in Chrome, Dia, and other Chromium-based browsers.

The goal is to emulate [Arc](https://arc.net)'s Little Arc: a small, temporary window for quick lookups.
You can then close it or move it into the main window.

## Usage

- **Shift+Cmd+Click** a link to open it in the popup.
- **Esc** closes the popup.
- **Cmd+Esc** moves the popup's page into a tab in the main window.
- Use the buttons in the popup's bottom-right corner to copy the URL or open the page in a tab.

## Install

You need [Bun](https://bun.sh) to build the extension.

1. Clone the repo:

   ```sh
   git clone git@github.com:octonato/little-wing.git
   cd little-wing
   ```

2. Install the dependencies:

   ```sh
   bun install
   ```

3. Build the extension:

   ```sh
   bun run build:prod
   ```

   The build writes the extension to `dist/`.

4. Load it in the browser:
   1. Open the extensions page (`chrome://extensions` in Chrome).
   2. Turn on **Developer mode**.
   3. Click **Load unpacked** and select the `dist/` folder.

## Update

1. Pull the latest changes and rebuild:

   ```sh
   git pull
   bun run build:prod
   ```

2. On the extensions page, click the reload icon on the Little Wing card.
3. Reload any open tabs so they pick up the new content script.

## Development

- `bun run dev` rebuilds on every change.
- `bun run lint` checks the code with Biome.
