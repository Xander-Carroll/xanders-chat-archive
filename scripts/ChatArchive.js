//This script: 
//  The model for a "Chat Archive" object.
//  Will create a folder for chat archives and the JSON files which represent each archive.
//	Will 'delete' or clear files.
//	Holds all of the currently open viewer objects.

//IMPORTANT NOTE: 
//  This script is a modified version of Dragon Flagoon's script from the DFChatEnhancements module. The code present here
//  was mostly not written by me. Some portions of the code were just inspired by Dragon Flagoon's module, while others 
//  were entirely copied and pasted.

//The ChatArchive data object and functions to save and load the object files.
export class ChatArchive{
	//Should be called with an array of chat objects to create a new archive.
	static async createChatArchive(name, chats, visible){
		//Creating the archive file.
		const newId = randomID();
		const entry = await this._generateChatArchiveFile(newId, name, chats, visible);

		//Adding the archive to the log.
		const logs = game.settings.get("xanders-chat-archive", "chatArchiveLog");
		logs.push(entry);
		await game.settings.set("xanders-chat-archive", "chatArchiveLog", logs);

		//Returning the archive data
		return entry;
	}

	//Will be called from the createChatArchive function, and will create a JSON file for the archive.
	static async _generateChatArchiveFile(id, name, chats, visible){
		// Getting the folder path
		const folder = game.settings.get("xanders-chat-archive", "archiveFolderName");
		const source = game.settings.get("xanders-chat-archive", "archiveSourceFolderName");

		// Add id of the most recent chat and replace special characters in name with underscores
		let safeName = name + '_' + id;
		safeName = safeName.replace(/[^ a-z0-9-_()[\]<>]/gi, '_');

		// Generate the system safe filename
		const fileName = encodeURI(`${safeName}.json`);

		// Create the File and save it.
		const file = new File([JSON.stringify(chats, null, '')], fileName, { type: 'application/json' });
		const response = await FilePicker.upload(source, folder, file);

		//If saving the file failed, catch the error.
		if (!response.path) {
			console.error(`Could not create archive ${fileName}\nReason: ${response}`);
			throw new Error('Could not upload the archive to server: ' + fileName);
		}

		//Creating the return data, and returning it.
		const entry = {
			id: id,
			name: name,
			visible: visible,
			filepath: response.path,
			filename: fileName
		};

		return entry;
	}

	//Returns a list of archive entries from the given logs.
	static getLogs(){ 
		return game.settings.get("xanders-chat-archive", "chatArchiveLog");
	}

	//Returns the archive with the given id.
	static getArchive(id) { 
		return this.getLogs().find(x => x.id == id); 
	}

	//Returns true if an archive with the given id exists.
	static exists(id) { 
		return !!this.getLogs().find(x => x.id == id); 
	}

	//Deletes all of the chat archives.
	static async deleteAll() {
		const folder = game.settings.get("xanders-chat-archive", "archiveFolderName");
		const source = game.settings.get("xanders-chat-archive", "archiveSourceFolderName");
		const logs = game.settings.get("xanders-chat-archive", "chatArchiveLog");

		//Files can't be deleted. Instead the files are cleared to save memory.
		await Promise.all(logs.map(archive => {
			const file = new File([''], archive.filename, { type: 'application/json' });
			return FilePicker.upload(source, folder, file, {});
		}));

		//Clearing the archvie log.
		game.settings.set("xanders-chat-archive", "chatArchiveLog", []);
	}

	//Deletes the chat archive with the given id.
	static async deleteChatArchive(id) {
		const folder = game.settings.get("xanders-chat-archive", "archiveFolderName");
		const source = game.settings.get("xanders-chat-archive", "archiveSourceFolderName");
		const logs = game.settings.get("xanders-chat-archive", "chatArchiveLog");

		//Getting the index of the log to be deleted.
		const entryIdx = logs.findIndex(x => x.id === id);

		//If the id wasn't found, return with an error.
		if (entryIdx < 0) {
			console.error(`Could not find entry for ID#${id}`);
			return;
		}

		//Getting the entry which should be deleted.
		const entry = logs[entryIdx];

		//Files can't be deleted. Instead the files are cleared to save memory.
		const file = new File([''], entry.filename, { type: 'application/json' });
		await FilePicker.upload(source, folder, file, {});

		//Removing the file from the log.
		logs.splice(entryIdx, 1);
		game.settings.set("xanders-chat-archive", "chatArchiveLog", logs);
	}

	//A collection of all the currently open chat archive viewers.
	static chatViewers = [];
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

	//This function is called to add data to the form before it is rendered.
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