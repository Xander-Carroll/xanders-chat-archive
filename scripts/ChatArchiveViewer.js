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
            //When the "visible to players" checkbox is changed.
            html.find("#visible-chat-log-" + this.archive.id).on('change', async (element) => {
				this.archive.visible = (element.target).checked;
				await ChatArchive.updateChatArchive(this.archive);
			});

            //When the edit name button is pressed.
			html.find("#edit").on('click', async () => {this._changeName()});

            //Injects the message data into the viewer.
            this._injectMessages(html);

			return html;
		});
	}

    //Called when the "edit name" button is pressed.
    async _changeName(){
        setTimeout(async () => {
            const dialog = new Dialog({
                title: "Change Archive Title",
                content: `<input id="name" type="text" value="${this.archive.name}"/>`,
                buttons: {
                    save: {
                        icon: '<i class="fas fa-save"></i>',
                        label: 'Save Name',
                        callback: async (html) => {
                            this.archive.name = $(html).find('#name').val();
                            await dialog.close();
                            await ChatArchive.updateChatArchive(this.archive);
                            await this.render(false);
                        }
                    },
                    close: {
                        icon: '<i class="fas fa-times"></i>',
                        label: 'Cancel Name Change',
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
    
    //Inserts the chat messages into the archive viewer.
    async _injectMessages(html){
        const log = html.find('#chat-log');
        const messageHtml = [];
        this.messages = (await ChatArchive.getArchiveContents(this.archive))
            .filter(x => game.user.isGM || x.user === game.userId || x.type !== CONST.CHAT_MESSAGE_TYPES.WHISPER || x.whisper.some(x => x === game.userId));

        const deletionList = [];
        const deleteButton = html.find('#al-save-changes');
        deleteButton.hide();
        
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
    }

    //When the viewer is closed, it needs removed from the array in the ChatArchive object.
    //@override
    close(options){
		this.closeCallback(this);
		return super.close(options);
	}

}
