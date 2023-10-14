# Xander's Chat Archiver
If you are like me, maybe your chat logs contain important notes that you might want to look at later. Or maybe your chat log is getting so full that you want to empty it, but don't necessairly want to delete all of the messages within it. Or maybe you have been running a long term campaign and just want to remanese over old sessions. Whatever the case, this module allows you to save your chat logs for viewing later. 

## About This Module
This module is a modified version of the archive functionality in Dragon Flagoon's module [DF Chat-Enhancement's](https://github.com/flamewave000/dragonflagon-fvtt/tree/master/df-chat-enhance).

My module does not have any dependencies, and does not include any features from *DF Chat Enhancements* except for the archive functionality. As a user, I was not a big fan of some of the other changes made by *DF Chat Enhancements*, but the archive function is one that I really wanted to have in my games.

So - I decided to remake DF Chat-Enhancements with only the features that I wanted. The code present here was modified by me, not written by me. Some portions of the code were just inspired by Dragon Flagoon's module, while others were entirely copied and pasted.

## Important Note For All Users of this Module
This module saves your chat archives as JSON files on your foundry server. However, Foundry VTT does not let modules delete files. This is a good thing from a security standpoint, but it means that **any time you delete a chat archive in Foundry, the JSON file will not be deleted from your server**. The file will be cleared (will become an empty file), but it will not be deleted. 

This means that if you delete too many archives, your foundry server will become cluttered with 0kb files. There isn't a way around this due to the way that Foundry VTT is implemented. If you want to delete these files you will have to do it server side, not client side.

## Module Changes
The entire project was rebuilt from the ground up. So there has been some changes from DF's origional module. Additional features were added, and some features wern't included.

Notable changes for users include:
- The abillity to re-import chat archives back into the chat log.
- Quality of life improvements (buttons in different and more consistent places, etc.).
- Element style changes (things look a little different and hopefully better).

Features that were present in DF's module, but that were not included in this module are:
- Export chat log to HTML file
- Print chat log
- Reverse alphabetical sort archive manager.

Noteable changes for developers include:
- The IDs for chat archives are now 16 charachter UUIDs, just like every other ID in foundry.
- The code has been ported from TypeScript to JavaScript.
- I have added a large number of comments and other notes to make the code easier to follow.

## Notes for Developers
### File Summary
Here is a brief summary of what each of the files is for:
- scripts/xanders-chat-archive.js     - This is the first script to run. It registers settings and acts as the "main" method.
- scripts/NewChatArchiveDialog.js     - When you press the "Archive" button on the chat log, this dialog opens.
- scripts/ManageChatArchiveDialog.js  - When you press the "View Archives" button in the settings menu, this dialog opens.
- scripts/ChatArchiveViewer.js        - When you choose a dialog in the manager, this opens. This is what actually shows a chat log.
- scripts/ChatArchive.js              - Functions for writing chat logs to JSON files and for reading them back in.

- scripts/templates/                  - Includes the handlebars tempaltes used to render all of the forms and dialogs.

### How the Module Works
This module works by creating a *chatArchiveLog* settings variable. This variable holds the information for all of the current archives that have been created. Every time a new Archive is created its ID, filepath, and some other information is added to this variable, every time that an archive is deleted its information is removed from this varaible.

When archives are created a JSON file is written to the server with all of the chat information. When archives are deleted, the file containing this infomration is cleared.

Other than this, the module just provides forms and dialogs as a means to manipulate ChatMessage objects.

## References
- https://github.com/flamewave000/dragonflagon-fvtt/tree/master/df-chat-enhance