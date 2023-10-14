A varriation on DF Chat-Enhancements archive function.

IMPORTANT NOTE: This script is a modified version of Dragon Flagoon's module DFChatEnhancements. The code present here
was not entirely written by me. Some portions of the code were just inspired by Dragon Flagoon's module, while others 
were entirely copied and pasted.


Here is a brief summary of what each of the files is for:
xanders-chat-archive.js     - This is the first script to run. It registers settings and acts as the "main" method.
NewChatArchiveDialog.js     - When you press the "Archive" button on the chat log, this dialog opens.
ManageChatArchiveDialog.js  - When you press the "View Archives" button in the settings menu, this dialog opens.
ChatArchiveViewer.js        - When you choose a dialog in the manager, this opens. This is what actually shows chat cards.
ChatArchive.js              - Functions for writing chat logs to JSON files and for reading them back in.