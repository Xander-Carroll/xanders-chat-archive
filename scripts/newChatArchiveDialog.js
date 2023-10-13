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
}