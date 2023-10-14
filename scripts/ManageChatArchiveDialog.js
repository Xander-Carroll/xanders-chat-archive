//This script: 
//  Is a form application object. When the "View Chat Archives" button is pressed, it opens one of these forms.

//IMPORTANT NOTE: 
//  This script is a modified version of Dragon Flagoon's script from the DFChatEnhancements module. The code present here
//  was mostly not written by me. Some portions of the code were just inspired by Dragon Flagoon's module, while others 
//  were entirely copied and pasted.

import {ChatArchive} from "./ChatArchive.js";

export class ManageChatArchiveDialog extends FormApplication{
    
	//@override
    static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			template: "modules/xanders-chat-archive/scripts/templates/archive-manager.html",
			resizable: true,
			minimizable: true,
            classes: ["archive-manager"],
			width: 300,
			height: 500,
			title: "Chat Archives"
		});
	}

	//This function is called to add data to the form before it is rendered.
	//@override
    getData(options) {
		const data = super.getData(options);

        //Collecting all of the ChatArchive log objects.
		let messages = ChatArchive.getLogs();

        //If the user is not a GM, then they should not be shown some logs.
		if (!game.user.isGM)
			messages = messages.filter(x => x.visible);

        //Sorting the logs based on their name.
		messages = messages.sort((a, b) => a.name.localeCompare(b.name));

        //Getting the data that should be fead to the html template.
		mergeObject(data, {
			messages: messages,
			isGM: game.user.isGM
        });

		return data;
	}
}