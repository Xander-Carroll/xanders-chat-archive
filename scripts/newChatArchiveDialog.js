//This script: 
//  Is a form application object. When the "Create New Archive" button is pressed, it opens one of these forms.

//IMPORTANT NOTE: 
//  This script is a modified version of Dragon Flagoon's script from the DFChatEnhancements module. The code present here
//  was mostly not written by me. Some portions of the code were just inspired by Dragon Flagoon's module, while others 
//  were entirely copied and pasted.

export class newChatArchiveDialog extends FormApplication{
    //@override
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: "modules/xanders-chat-archive/scripts/templates/new-archive.html",
            resizable: false,
            minimizable: false,
            title: "Create New Chat Archive"
        });
    }

    //This function is called when the "Create Archive" button is pressed.
    //@override
    _updateObject(_event, formData) {
        //Getting the name of the new archvie.
        const name = formData.name;

        //If no name was given, an error is thrown.
		if (!name) {
			ui.notifications.warn("You must include a name for the archive.");
			throw Error("MissingName");
		}

        // If we are selecting a date range
		if (formData['date-or-all'] === 'date') {
			const fromDate = new Date(formData.from).getTime();
			const toDate = new Date(formData.to).getTime();
			if (isNaN(fromDate) || isNaN(toDate)) {
				ui.notifications.warn("You must include both to and from dates when using the range option.");
				throw Error('MissingDate');
			}
		}
    }

    //This function is used to dynamically change the form as the user selects a date range.
    //@override
    _renderInner() {
		return super._renderInner().then((html) => {
			const from = html.find('#ca-from');
			const to = html.find('#ca-to');

            //When the "Archive Entire Chat Log" button is pressed.
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