//This script: 
//	Adds settings spesific to this module.
//	Adds the "Archive Chat Log" button.
//	Adds the "View Chat Archives" button.

//IMPORTANT NOTE: 
//  This script is a modified version of Dragon Flagoon's module DFChatEnhancements. The code present here
//  was not entirely written by me. Some portions of the code were just inspired by Dragon Flagoon's module, while others 
//  were entirely copied and pasted.

//Changes from DF's module include:
// 	Being ported from TS to JS. This code does not need compiled.
//	Comments and code clairity improvements.
//  Minor renaming and QOL improvements.

//This function will be called as soon as the module is loaded.
Hooks.on("setup", () => {
	//Registers all of the settings that the user can change for this module.
	registerSettings();
});

//All of the settings that this module adds are registered here.
export function registerSettings(){
	//Adds the "Hide Chat Export Button setting and implements its functionality."
	game.settings.register("xanders-chat-archive", "hideExport", {
		config: true,
		scope: "world",
		name: "Hide Chat Export Button",
		hint: "This will remove the \"Export Chat Log\" button, leaving only the archive button.",
		type: Boolean,
		default: false,
		onChange: (newValue) => {
			if (!newValue)
				$('#chat-controls .export-log').show();
			else
				$('#chat-controls .export-log').hide();
		}
	});
}

//When the chat log is fully rendered, the "archive chat log" button is added, and the "export chat log" button is removed if necessary.
Hooks.on('renderChatLog', (event, html) => {
	//Creating the jQuery archive button.
	const archiveButton = $(`<a class="button chat-archive" title="Archive Chat Log"><i class="fas fa-archive"></i></a>`);
	
	//Implementing the archive button click functionality.
	archiveButton.on('click', () => {
		alert("ARCHIVE!");
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
								    <button data-action="archive"><i class="fas fa-archive"></i> View Chat Archives</button>
                                  </div>`);

	//Implementing the view archives button click functionality.
	archiveManagerHtml.on('click', () => {
		alert("VIEW ARCHIVES!")
	});

	//Adding the view archives button to the page
	html.find('#settings-game').append(archiveManagerHtml);
});