//This script: 
//  Is a form application object. It shows the chat log for one archive.

//IMPORTANT NOTE: 
//  This script is a modified version of Dragon Flagoon's script from the DFChatEnhancements module. The code present here
//  was mostly not written by me. Some portions of the code were just inspired by Dragon Flagoon's module, while others 
//  were entirely copied and pasted.

import {ChatArchive} from "./ChatArchive.js";

export class ChatArchiveViewer extends Application {
    //The log data for the archive that is currently being viewed.
    archive = null;
    closeCallback = null;
    messages = null;

    //You must supply log data to open a new viewer.
    constructor(archive, closeCallback) {
		super();
		this.archive = archive;
        this.closeCallback = closeCallback;
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

    //This function is called before the sheet is rendered
	//@override
    _renderInner(data){
		return (super._renderInner(data)).then(async (html) => {
            //When the edit name button is pressed.
			html.find("#edit").on('click', async () => {this._editArchiveData()});

            //When the merge button is pressed.
            html.find("#merge").on('click', async () => {this._mergeArchiveData(html)});

            //Injects the message data into the viewer.
            await this._injectMessages(html);

			return html;
		});
	}

    //Called when the "edit data" button is pressed.
    async _editArchiveData(){
        let data = {
            name: this.archive.name,
            visible: this.archive.visible
        }

        setTimeout(async () => {
            const dialog = new Dialog({
                title: game.i18n.localize("CA.EditArchiveData"),
                content: await renderTemplate("modules/xanders-chat-archive/scripts/templates/archive-editor.html", data),
                buttons: {
                    save: {
                        icon: '<i class="fas fa-save"></i>',
                        label: game.i18n.localize("CA.SaveEdits"),
                        callback: async (html) => {
                            this.archive.name = $(html).find('#name').val();
                            this.archive.visible = $(html).find('#visible').is(':checked');

                            await dialog.close();
                            await ChatArchive.updateChatArchive(this.archive);
                            await this.render(false);
                        }
                    },
                    close: {
                        icon: '<i class="fas fa-times"></i>',
                        label: game.i18n.localize("CA.CancelEdits"),
                        callback: async () => {
                            await dialog.close();
                        }
                    }
                },
                default: 'save'
            });
            dialog.render(true);
        }, 1);
    }
    
    //Called when the "merge" button is pressed.
    async _mergeArchiveData(html){
        let logs = ChatArchive.getLogs();

        //Warning the user if this is the only archive.
        if (logs.length == 1) {
            ui.notifications.info(game.i18n.localize("CA.NoOtherArchives"));
            return;
        }

        const dialog = new Dialog({
            title: game.i18n.localize("CA.MergeArchives"),
            default: 'merge',
            content: await renderTemplate('modules/xanders-chat-archive/scripts/templates/archive-merge.html', {
                id: this.archive.id,
                name: this.archive.name,
                archives: logs.filter(x => x.id != this.archive.id)
            }),
            buttons: {
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: game.i18n.localize("CA.CancelMerge"),
                    callback: async () => await dialog.close()
                },
                merge: {
                    icon: '<i class="fas fa-sitemap"></i>',
                    label: game.i18n.localize("CA.FinishMerge"),
                    callback: async (html) => {
                        const id = $(html).find('#archive').val();
                        if (!id) return;

                        //Getting the chats from both archives and concatinating them.
                        const source = ChatArchive.getLogs().find(x => x.id == id);
                        const currentChats = await ChatArchive.getArchiveContents(this.archive);
                        const sourceChats = await ChatArchive.getArchiveContents(source);
                        const mergedChats = (currentChats).concat(sourceChats).sort((a, b) => a.timestamp - b.timestamp);

                        //Updating the current archive and rerendering it.
                        await ChatArchive.updateChatArchive(this.archive, mergedChats);
                        this.render(true);

                        //Deleting the merged archive if the checkbox was checked.
                        if (($(html).find('#delete-' + this.archive.id)[0]).checked) {
                            await ChatArchive.deleteChatArchive(id);
                        }
                    }
                }
            }
        });
        await dialog.render(true);
    }

    //Inserts the chat messages into the archive viewer.
    async _injectMessages(html){
        const log = html.find('#chat-log');
        const messageHtml = [];
        this.messages = (await ChatArchive.getArchiveContents(this.archive))
            .filter(x => game.user.isGM || x.user === game.userId || x.type !== CONST.CHAT_MESSAGE_TYPES.WHISPER || x.whisper.some(x => x === game.userId));

        let deletionList = [];
        const deleteButton = html.find('#al-save-changes');
        for (const value of this.messages) {
            const chatMessage = value instanceof ChatMessage ? value : new ChatMessage(value);
            try {
                // @ts-ignore
                const html = await chatMessage.getHTML();
                // if we only have 1 message, don't allow it to be deleted. They might as well just delete the archive
                if (this.messages.length == 1)
                    html.find('a.message-delete').hide();
                html.find('a.message-delete').on('click', (event) => {
                    const messageHtml = $(event.target.parentElement?.parentElement?.parentElement?.parentElement);
                    const buttonIcon = $(event.target);
                    if (messageHtml.hasClass('al-deleted')) {
                        messageHtml.removeClass('al-deleted');
                        buttonIcon.removeClass('fa-redo-alt');
                        buttonIcon.addClass('fa-trash');
                        deletionList.splice(deletionList.findIndex(x => x === messageHtml.attr('data-message-id')), 1);
                    } else {
                        messageHtml.addClass('al-deleted');
                        buttonIcon.removeClass('fa-trash');
                        buttonIcon.addClass('fa-redo-alt');
                        deletionList.push(messageHtml.attr('data-message-id'));
                    }
                    if (deletionList.length > 0) deleteButton.show();
                    else deleteButton.hide();
                });
                messageHtml.push(html);
            } catch (err) {
                console.error(`Chat message ${chatMessage.id} failed to render.\n${err})`);
            }
        }

        // Prepend the HTML
        log.prepend(messageHtml);

        deleteButton.hide();
        deleteButton.on('click', async () => {
            if (deletionList.length === this.messages.length) {
                ui.notifications.warn(game.i18n.localize("CA.LeaveOneChat"));
                return;
            }
            Dialog.confirm({
                title: game.i18n.localize("CA.DeleteFromArchive"),
                content: "<p>" + game.i18n.localize("CA.DeleteChatConfirm") + "</p>",
                defaultYes: false,
                yes: async () => {
                    for (const id of deletionList) {
                        const message = html.find(`li[data-message-id="${id}"]`);
                        message.hide(500, () => {
                            message.remove();
                            this.render();
                        });
                    }
                    this.messages = this.messages.filter((x) => !deletionList.includes(x._id));
                    await ChatArchive.updateChatArchive(this.archive, this.messages);
                }
            });
        });
    }

    //When the viewer is closed, it needs removed from the array in the ChatArchive object.
    //@override
    close(options){
		this.closeCallback(this);
		return super.close(options);
	}

}
