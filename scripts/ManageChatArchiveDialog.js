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

	//This function provides interactive functionality to the form.
	//@override
	activateListeners(html) {
		//If there are chat logs present, then the "There are not chat archives" text should be hidden.
		if (ChatArchive.getLogs().length > 0)
			html.find('p.ca-no-items').hide();

		//Adding functionality for the view and delete buttons.
		html.find('a[data-type="view"]').each((i, element) => { this._subscribeView($(element), this); });
		html.find('a[data-type="delete"]').each((i, element) => { this._subscribeDelete($(element), this); });

		//When the delete all button is pressed, the user must confirm that they actually want to delete all logs.
		html.find('#ca-delete-all').on('click', async function () {
			await Dialog.confirm({
				title: 'Delete All Archives',
				content: '<p>Are you sure that you want to delete all archives?</p><p>This can not be undone.</p>',
				defaultYes: false,
				yes: async () => {
					await Dialog.confirm({
						title: 'Delete All Archives',
						content: '<p>This is your last chance. Are you absolutely sure?</p>',
						defaultYes: false,
						yes: async () => {
							await ChatArchive.deleteAll();
							ui.notifications.info("All archives have been deleted.");
						}
					});
				}
			});
		});
	}

	//Called whenever a view button is pressed.
	_subscribeView(element, form){
		
	}

	//Called whenever a delete button is pressed.
	_subscribeDelete(element, form){
		element.on('click', async function () {
			//Finding the archive with the given id.
			const id = element.attr('data-id');

			if (!id || !ChatArchive.exists(id)) {
				ui.notifications.error("An archive could not be delted. The given id does not exist.");
				throw Error(`Invalid id for Chat Archive: '${$(this).attr('data-id')}'`);
			}

			//Confirming that the user wants to delete the archive with the given id.
			const archive = ChatArchive.getArchive(id);

			await Dialog.confirm({
				title: "Delete Archive",
				content: "Are you sure that you want to delete {name}?".replace('{name}', archive.name),
				defaultYes: false,
				yes: async () => {
					await ChatArchive.deleteChatArchive(id);
					form.render();
				}
			});
		});
	}
}