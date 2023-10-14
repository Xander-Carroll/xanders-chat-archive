//This script: 
//  Is a form application object. When the "Create New Archive" button is pressed, it opens one of these forms.

//IMPORTANT NOTE: 
//  This script is a modified version of Dragon Flagoon's script from the DFChatEnhancements module. The code present here
//  was modified by me, not written by me. Some portions of the code were just inspired by Dragon Flagoon's module, while others 
//  were entirely copied and pasted.

import {ChatArchive} from "./ChatArchive.js";

export class NewChatArchiveDialog extends FormApplication{
    //@override
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: "modules/xanders-chat-archive/scripts/templates/new-archive.html",
            resizable: false,
            minimizable: false,
            submitOnClose: false,
			submitOnChange: false,
			closeOnSubmit: true,
            title: game.i18n.localize("CA.CreateNewArchive")
        });
    }

    //This function is called when the "Create Archive" button is pressed.
    //@override
    async _updateObject(_event, formData) {
        //Getting the name of the new archvie.
        let name = formData.name;

        //If no name was given, the default name is used.
		if (!name) {
			name = game.i18n.localize("CA.DefaultArchiveName");
		}

        //Determining if the archive should be visible to players.
        let visible = formData.visible;

        //Getting all of the chat card objects.
        let chats = ui.chat.collection;

        // If we are selecting a date range
		if (formData['date-or-all'] === 'date') {
			const fromDate = new Date(formData.from).getTime();
			const toDate = new Date(formData.to).getTime();

            //If either the from or to date is missing, then an error is thrown.
			if (isNaN(fromDate) || isNaN(toDate)) {
				ui.notifications.warn(game.i18n.localize("CA.TooAndFromDates"));
				throw Error('MissingDate');
			}

            //Only the chats that are within the choosen date range are kept.
            chats = chats.filter((value) => value.timestamp >= fromDate && value.timestamp <= toDate);
		}

        //If the date range selected did not include any messages, then no archive is made.
        if (chats.size <= 0){
            ui.notifications.warn(game.i18n.localize("CA.NoChatsFound"));
            throw Error('MissingMessage');
        }

        //At this point the chat variable includes all of the messages which should be archived.
        await ChatArchive.createChatArchive(name, chats, formData['visible']);
    }

    //This function is used to dynamically change the form as the user selects buttons.
    //@override
    _renderInner() {
		return super._renderInner().then((html) => {
			const from = html.find('#ca-from');
			const to = html.find('#ca-to');

            //When the "Archive entire chat log" button is pressed.
			html.find('#ca-all').on('change', () => {
				from.prop('disabled', true);
				to.prop('disabled', true);
			});

            //When the "Archive a date range" button is pressed.
			html.find('#ca-date').on('change', () => {
				from.prop('disabled', false);
				to.prop('disabled', false);
			});

			return html;
		});
	}
}
