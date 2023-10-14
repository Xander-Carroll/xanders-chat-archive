//This script: 
//  The model for a "Chat Archive" object.
//  Will create a folder for chat archives and the JSON files which represent each archive.

//IMPORTANT NOTE: 
//  This script is a modified version of Dragon Flagoon's script from the DFChatEnhancements module. The code present here
//  was mostly not written by me. Some portions of the code were just inspired by Dragon Flagoon's module, while others 
//  were entirely copied and pasted.

//The ChatArchive data object and functions to save and load the object files.
export class ChatArchive{
	//Should be called with an array of chat objects to create a new archive.
	static async createChatArchive(name, chats, visible){
		const newId = chats.contents[0].id;
		const entry = await this._generateChatArchiveFile(newId, name, chats, visible);
		return entry;
	}

	//Will be called from the createChatArchive function, and will create a JSON file for the archive.
	static async _generateChatArchiveFile(id, name, chats, visible){
		alert("File Being Made Now...");
	}

}

//A dialog which the user can use to set their preffered output file location.
export class ArchiveFolderMenu extends FormApplication {
	//The current folder that files should be exported to.
	source = game.settings.get("xanders-chat-archive", "archiveSourceFolderName");

	//@override
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
            template: "modules/xanders-chat-archive/scripts/templates/archive-folder.html",
            minimizable: false,
            title: "Archive Folder Location",
			classes: ["archive-folder-picker"],
            resizable: true,
			submitOnClose: false,
			submitOnChange: false,
			closeOnSubmit: true,
			height: 120,
			width: 315
        });
	}

	//Creates the archive folder if it is missing.
	static async createArchiveFolderIfMissing() {
		const folder = game.settings.get("xanders-chat-archive", "archiveFolderName");
		const source = game.settings.get("xanders-chat-archive", "archiveSourceFolderName");

		//We try to open the given folder, if it can't be opened then we try to create one.
		await FilePicker.browse(source, folder).catch(async _ => {
			console.log(source);
			if (!await FilePicker.createDirectory(source, folder, {}))
				throw new Error('Could not access the archive folder: ' + folder);
		});
	}

	//This function is called when the submit button is pressed.
	//@override
	getData(_options){
		return { path: game.settings.get("xanders-chat-archive", "archiveFolderName")};
	}

	//Dynamically updates the dialog based on what the user selects.
	async _renderInner(data){
		const html = await super._renderInner(data);
		const input = html.find('input#ca-folder-path')[0];

		html.find('label>button').on('click', async event => {
			event.preventDefault();
			const fp = new FilePicker({
				title: 'Pick an Archive Folder',
				type: 'folder',
				activeSource: this.source,
				field: input,
				callback: async (path) => {
					this.source = fp.activeSource;
				},
				button: event.currentTarget
			});
			await fp.browse(game.settings.get("xanders-chat-archive", "archiveFolderName"));
		});
		return html;
	}

	//This function is called when the submit button is pressed.
	async _updateObject(_event, formData) {
		await game.settings.set("xanders-chat-archive", "archiveSourceFolderName", this.source);
		await game.settings.set("xanders-chat-archive", "archiveFolderName", formData.path);
	}
}