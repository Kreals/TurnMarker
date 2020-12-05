import { Settings } from "./settings.js";


export class Chatter {

    static sendTurnMessage(combatant) {
        let players = [];
        combatant.players.forEach(player => {
            players.push(player.name);
        });
        if (players.length == 0) players.push("GM");
        ChatMessage.create({
            speaker: { actor: combatant.actor },
            //speaker: { actor: {}, alias: 'Turn Marker' },
            content:
                `<div class="flexrow">${this.placeImage(combatant)}
                    <div style="flex: 12;">
                        ` +  this.generateAnnounceString(combatant) + `
                        <p>${players.join(' - ')}</p>
                    </div>
                    </div><em>Turn Marker</em>`
        });
    }

    static placeImage(combatant) {
        if (Settings.getIncludeAnnounceImage()) {
            let img = combatant.img;
            if (combatant.flags.core && combatant.flags.core.thumb) {
                img = combatant.flags.core.thumb;
            }
            return `<div style="flex:3;"><img src="${img}" style="border: none;" /></div>`;
            // return `<div style="flex:3;"><video><source="${combatant.img}"></video></div>`;
        } else return '';
    }

    static generateAnnounceString(combatant){
        let localisation = game.i18n.lang
        switch(localisation) {
            case 'en':
                return `<h2>${combatant.name} ${game.i18n.localize('tm.settings.chatannounce.name')}</h2>`
            case 'de':
                return `<h2>${combatant.name} ${game.i18n.localize('tm.settings.chatannounce.name')}</h2>`
            case 'fr':
                return `<h2>${game.i18n.localize('tm.settings.chatannounce.name')} ${combatant.name} </h2>`
            case 'ja':
                return `<h2>${combatant.name} ${game.i18n.localize('tm.settings.chatannounce.name')}</h2>`
            case 'ko':
                return `<h2>${combatant.name} ${game.i18n.localize('tm.settings.chatannounce.name')}</h2>`
        }

    }
}