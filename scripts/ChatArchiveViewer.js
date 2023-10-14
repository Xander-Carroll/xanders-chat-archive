//This script: 
//  Is a form application object. It shows the chat log for one archive.

//IMPORTANT NOTE: 
//  This script is a modified version of Dragon Flagoon's script from the DFChatEnhancements module. The code present here
//  was mostly not written by me. Some portions of the code were just inspired by Dragon Flagoon's module, while others 
//  were entirely copied and pasted.

export class ChatArchiveViewer extends Application {
    //The log data for the archive that is currently being viewed.
    archive = null;

    //You must supply log data to open a new viewer.
    constructor(archive) {
		super();
		this.archive = archive;
	}

	//@override
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
			template: "modules/xanders-chat-archive/scripts/templates/archive-viewer.html",
			width: 300,
			height: 700,
			resizable: true,
			title: 'Archive Viewer',
			classes: ['archive-viewer']
		});
	}

    //This function is called to add data to the form before it is rendered.
	//@override
	getData(options = {}) {
		super.getData(options);

		return {
			name: this.archive.name,
			isGM: game.user.isGM,
			visible: this.archive.visible ?? false,
			logId: 'chat-log-' + this.archive.id
		};
	}

}
