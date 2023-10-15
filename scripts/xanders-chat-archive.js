//This script: 
//  Is the first script that will execute. The "main" method in a sense.
//	Adds settings spesific to this module.
//	Adds the "Archive Chat Log" button.
//	Adds the "View Chat Archives" button.

//IMPORTANT NOTE: 
//  This script is a modified version of Dragon Flagoon's script from the DFChatEnhancements module. The code present here
//  was modified by me, not written by me. Some portions of the code were just inspired by Dragon Flagoon's module, while others 
//  were entirely copied and pasted.

import {NewChatArchiveDialog} from "./NewChatArchiveDialog.js";
import {ArchiveFolderMenu} from "./ChatArchive.js";
import {ManageChatArchiveDialog} from "./ManageChatArchiveDialog.js";
import {ChatArchive} from "./ChatArchive.js";


// Objects that will be used when a new archive is made, or when the archiver viewer is opened.
let newArchiveDialog = null;
let manageArchiveDialog = null;

//This function will be called as soon as the module is loaded.
Hooks.on("setup", () => {
	//Registers all of the settings that the user can change for this module.
	registerSettings();
	ArchiveFolderMenu.createArchiveFolderIfMissing();
	ChatArchive.chatViewers = new Collection();
});

//All of the settings that this module adds are registered here.
export function registerSettings(){
	//Creates the menu that allows the user to choose a folder.
	game.settings.registerMenu("xanders-chat-archive", "archiveFolderName", {
		name: game.i18n.localize("CA.ChooseArchiveFolder"),
		label: game.i18n.localize("CA.ChooseArchiveFolder"),
		hint: game.i18n.localize("CA.ChooseArchiveFolderHint"),
		restricted: true,
		type: ArchiveFolderMenu
	});
	
	//Adds the "Hide Chat Export Button setting and implements its functionality."
	game.settings.register("xanders-chat-archive", "hideExport", {
		config: true,
		scope: "world",
		name: game.i18n.localize("CA.HideChatExportButton"),
		hint: game.i18n.localize("CA.HideChatExportButtonHint"),
		type: Boolean,
		default: false,
		onChange: (newValue) => {
			if (!newValue)
				$('#chat-controls .export-log').show();
			else
				$('#chat-controls .export-log').hide();
		}
	});

	//A variable which contains the folder name for the archive folder.
	game.settings.register("xanders-chat-archive", "archiveFolderName", {
		scope: 'world',
		config: false,
		type: String,
		default: `worlds/${game.world.id}/chat-archive`,
		onChange: async () => {
			await ArchiveFolderMenu.createArchiveFolderIfMissing();
		}
	});

	//A variable which contains the source folder name for the archive folder. "data, core, etc"
	game.settings.register("xanders-chat-archive", "archiveSourceFolderName", {
		scope: 'world',
		config: false,
		type: String,
		default: 'data'
	});

	//The variable which contains all of the saved logs and their IDs.
	game.settings.register("xanders-chat-archive", "chatArchiveLog", {
		scope: 'world',
		config: false,
		type: Object,
		default: [],
		onChange: () => {
			if (manageArchiveDialog != null){
				manageArchiveDialog.render();
			}
		}
	});

	//The variable which determines if the chat archives are sorted in ascending or descending order.
	game.settings.register("xanders-chat-archive", "archiveReverseSort", {
		scope: 'client',
		config: false,
		type: Boolean,
		default: false
	});
}

//When the chat log is fully rendered, the "archive chat log" button is added, and the "export chat log" button is removed if necessary.
Hooks.on('renderChatLog', (event, html) => {
	//Creating the jQuery archive button.
	const archiveButton = $(`<a class="button chat-archive" title="` + game.i18n.localize("CA.ArchiveChatLog") + `"><i class="fas fa-archive"></i></a>`);

	//Implementing the archive button click functionality.
	archiveButton.on('click', () => {
		//If the form already exists, then it is brought to the top. Otherwise a new form is made.
		if (newArchiveDialog == null) {
			newArchiveDialog = new NewChatArchiveDialog();
			newArchiveDialog.render(true);
		} else {
			newArchiveDialog.bringToTop();
		}
	});

	//Adding the archive button to the page
	html.find('.control-buttons').prepend(archiveButton).attr('style', 'flex:0 0 auto;');

	//Removing the export chat log button from the page if that setting is selected.
	if (game.settings.get("xanders-chat-archive", "hideExport")) {
		html.find('.control-buttons .export-log').hide();
	}
});

//When the settings tab is fully rendered, the "view chat archives" button is added.
Hooks.on('renderSettings', (event, html) => {
	//Creating the jQuery view archvies button
	const archiveManagerHtml = $(`<div id="df-chat-enhance-settings" style="margin:0">
								    <button data-action="archive"><i class="fas fa-archive"></i> ` + game.i18n.localize("CA.ViewChatArchives") + `</button>
                                  </div>`);

								  

	//Implementing the view archives button click functionality.
	archiveManagerHtml.on('click', () => {
		//If the form already exists, then it is brought to the top. Otherwise a new form is made.
		if (manageArchiveDialog == null) {
			manageArchiveDialog = new ManageChatArchiveDialog();
			manageArchiveDialog.render(true);
		} else {
			manageArchiveDialog.bringToTop();
		}
	});

	//Adding the view archives button to the page
	html.find('#settings-game').append(archiveManagerHtml);
});

//Hooks that will clear the dialog variables when the dialogs are closed.
Hooks.on('closeNewChatArchiveDialog', () =>{newArchiveDialog = null});
Hooks.on('closeManageChatArchiveDialog', () =>{manageArchiveDialog = null});