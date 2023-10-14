//This script: 
//  Is a form application object. When the "View Chat Archives" button is pressed, it opens one of these forms.

//IMPORTANT NOTE: 
//  This script is a modified version of Dragon Flagoon's script from the DFChatEnhancements module. The code present here
//  was mostly not written by me. Some portions of the code were just inspired by Dragon Flagoon's module, while others 
//  were entirely copied and pasted.

import {ChatArchive} from "./ChatArchive.js";
import {ChatArchiveViewer} from "./ChatArchiveViewer.js";

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
		html.find('#ca-delete-all').on('click', () => {this._subscribeDeleteAll()});
	}

	//Called when the "delete all" button is pressed.
	async _subscribeDeleteAll(){
		await Dialog.confirm({
			title: game.i18n.localize("CA.DeleteAllArchives"),
			content: game.i18n.localize("CA.DeleteAllArchivesConfirm1"),
			defaultYes: false,
			yes: async () => {
				await Dialog.confirm({
					title: game.i18n.localize("CA.DeleteAllArchives"),
					content: game.i18n.localize("CA.DeleteAllArchivesConfirm2"),
					defaultYes: false,
					yes: async () => {
						await ChatArchive.deleteAll();
						ui.notifications.info(game.i18n.localize("CA.AllArchivesDeleted"));
					}
				});
			}
		});
	}

	//Called whenever a view button is pressed.
	_subscribeView(element, form){
		element.on('click', function () {
			//Finding the archive with the given id.
			const id = $(this).attr('data-id');

			//Ensuring that the archive exists.
			if (!id || !ChatArchive.exists(id)) {
				ui.notifications.error(game.i18n.localize("CA.NoArchiveExists"));
				throw Error(`Invalid id for Chat Archive: '${$(this).attr('data-id')}'`);
			}
			
			//If a viewer is already open, it is brought to the top. Otherwise a new viewer is made.
			if (ChatArchive.chatViewers.has(id)) {
				ChatArchive.chatViewers.get(id).bringToTop();
			} else {
				ChatArchive.chatViewers.set(id, new ChatArchiveViewer(ChatArchive.getArchive(id), view => {
					ChatArchive.chatViewers.delete(view.archive.id);
				}));
				ChatArchive.chatViewers.get(id).render(true);
			}
		});
	}

	//Called whenever a delete button is pressed.
	_subscribeDelete(element, form){
		element.on('click', async function () {
			//Finding the archive with the given id.
			const id = element.attr('data-id');

			//Ensuring that the archive exists.
			if (!id || !ChatArchive.exists(id)) {
				ui.notifications.error(game.i18n.localize("CA.NoArchiveExists"));
				throw Error(`Invalid id for Chat Archive: '${$(this).attr('data-id')}'`);
			}

			//Confirming that the user wants to delete the archive with the given id.
			const archive = ChatArchive.getArchive(id);

			await Dialog.confirm({
				title: game.i18n.localize("CA.DeleteArchive"),
				content: game.i18n.localize("CA.DeleteArchiveConfirm").replace('{name}', archive.name),
				defaultYes: false,
				yes: async () => {
					await ChatArchive.deleteChatArchive(id);
					form.render();
				}
			});
		});
	}
}