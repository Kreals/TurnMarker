import { Marker } from './marker.js';
import { SettingsForm } from './settingsForm.js';
import { modName } from './utils.js';

const version = 'tm-version';
const ratio = 'ratio';
const animation = 'animation';
const interval = 'interval';
const announce = 'announce-turn';
const announceAsActor = 'announce-asActor';
const announceImage = 'announce-image';
const tmimageselector = 'tmimageselector';
const tmcustomimagepath = 'tmcustomimagepath';
const smcustomimagepath = 'smcustomimagepath';
const turnMarkerEnabled = 'turnmarker-enabled';
const startMarkerEnabled = 'startMarker-enabled';
export const imageTitles = [
    'Runes of Incendium by Rin',
    'Runes of the Cultist by Rin',
    'Runes of Regeneration by Rin',
    'Runes of the Cosmos by Rin',
    'Runes of Earthly Dust by Rin',
    'Runes of Reality by Rin',
    'Runes of the Believer by Rin',
    'Runes of the Mad Mage by Rin',
    'Runes of the Blue Sky by Rin',
    'Runes of the Universe by Rin',
    'Runes of Prosperity by Rin'
];

/**
 * Provides functionality for reading and writing module settings
 */
export class Settings {

    static getVersion() {
        return game.settings.get(modName, version);
    }

    static setVersion(val) {
        game.settings.set(modName, version, val);
    }

    /**
     * Gets the image ratio
     */
    static getRatio() {
        return game.settings.get(modName, ratio);
    }

    /**
     * Sets the image ratio
     * @param {Number} val - The image ratio
     */
    static setRatio(val) {
        game.settings.set(modName, ratio, val);
    }

    /**
     * Returns true if the marker should be animated
     */
    static getShouldAnimate() {
        return game.settings.get(modName, animation);
    }

    static setShouldAnimate(val) {
        return game.settings.set(modName, animation, val);
    }

    /**
     * Gets the animation interval in ms.
     */
    static getInterval() {
        return game.settings.get(modName, interval);
    }

    static setInterval(val) {
        game.settings.set(modName, interval, val);
    }

    /**
     * Returns true if turn changes should be announced in chat
     */
    static shouldAnnounceTurns() {
        return game.settings.get(modName, announce);
    }

    /**
     * Sets whether or not to announce turn changes
     * @param {Boolean} val - Whether or not to announce turn changes
     */
    static setShouldAnnounceTurns(val) {
        game.settings.set(modName, announce, val);
    }

    static getIncludeAnnounceImage() {
        return game.settings.get(modName, announceImage);
    }

    static setIncludeAnnounceImage(val) {
        game.settings.set(modName, announceImage, val);
    }

    static setImageIndex(val) {
        return game.settings.set(modName, tmimageselector, val);
    }

    static getImageIndex() {
        return game.settings.get(modName, tmimageselector);
    }

    static getTurnMarkerEnabled() {
        return game.settings.get(modName, turnMarkerEnabled);
    }


    static setTurnMarkerEnabled(val) {
        game.settings.set(modName, turnMarkerEnabled, val);
    }

    static getStartMarkerEnabled() {
        return game.settings.get(modName, startMarkerEnabled);
    }

    static setStartMarkerEnabled(val) {
        game.settings.set(modName, startMarkerEnabled, val);
    }

    static getCustomTMImagePath() {
        return game.settings.get(modName, tmcustomimagepath);
    }

    static getCustomSMImagePath() {
        return game.settings.get(modName, smcustomimagepath);
    }

    static setCustomTMImagePath(val) {
        game.settings.set(modName, tmcustomimagepath, val);
    }

    static setCustomSMImagePath(val) {
        game.settings.set(modName, smcustomimagepath, val);
    }


    static getChoosenTMImagePath() {
       let cpath = game.settings.get(modName, tmcustomimagepath);
       if (cpath == ""){
        return this.getImageByIndex(this.getImageIndex())
        }else{
            return cpath
        }
    }

    static getChoosenSMImagePath() {
        let cpath = game.settings.get(modName, smcustomimagepath);
        if (cpath == ""){
            return "modules/turnmarker/assets/start.png"
        }else{
            return cpath
        }
    }

    static getImageByIndex(index) {
        switch (index) {
            case 0: return 'modules/turnmarker/assets/incendium.png';
            case 1: return 'modules/turnmarker/assets/cultist.png';
            case 2: return 'modules/turnmarker/assets/regeneration.png';
            case 3: return 'modules/turnmarker/assets/cosmos.png';
            case 4: return 'modules/turnmarker/assets/earthlydust.png';
            case 5: return 'modules/turnmarker/assets/reality.png';
            case 6: return 'modules/turnmarker/assets/believer.png';
            case 7: return 'modules/turnmarker/assets/madmage.png';
            case 8: return 'modules/turnmarker/assets/bluesky.png';
            case 9: return 'modules/turnmarker/assets/universe.png';
            case 10: return 'modules/turnmarker/assets/prosperity.png';
        }
    }


    /**
     * Registers all game settings
     */
    static registerSettings() {

        game.settings.registerMenu(modName, 'tm.settingsMenu', {
            name: 'tm.settings.button.name',
            label: 'tm.settings.button.label',
            icon: 'fas fa-sync-alt',
            type: SettingsForm,
            restricted: true,
        });

        game.settings.register(modName, version, {
            name: `${modName} version`,
            default: '0.0.0',
            type: String,
            scope: 'world',
        });

        game.settings.register(modName, ratio, {
            name: 'tm.settings.ratio.name',
            hint: 'tm.settings.ratio.hint',
            scope: 'world',
            config: false,
            type: Number,
            default: 1.5,
            restricted: true
        });

        game.settings.register(modName, animation, {
            name: 'tm.settings.animate.name',
            hint: 'tm.settings.animate.hint',
            scope: 'world',
            config: false,
            type: Boolean,
            default: true,
        });

        game.settings.register(modName, interval, {
            name: 'tm.settings.interval.name',
            hint: 'tm.settings.interval.hint',
            scope: 'world',
            config: false,
            type: Number,
            default: 100
        });

        game.settings.register(modName, tmimageselector, {
            name: 'tm.settings.tmimageselector.name',
            scope: 'world',
            config: false,
            type: Number,
            default: 0,
            choices: imageTitles,
            restricted: true
        });

        game.settings.register(modName, tmcustomimagepath, {
            name: 'tm.settings.tmcustomimagepath.name',
            hint: 'tm.settings.tmcustomimagepath.hint',
            scope: 'world',
            config: false,
            type: String,
            default: '',
            restricted: true
        });

        game.settings.register(modName, smcustomimagepath, {
            name: 'tm.settings.smcustomimagepath.name',
            hint: 'tm.settings.smcustomimagepath.hint',
            scope: 'world',
            config: false,
            type: String,
            default: '',
            restricted: true
        });

        game.settings.register(modName, announce, {
            name: 'tm.settings.announce.name',
            hint: 'tm.settings.announce.hint',
            scope: 'world',
            config: false,
            type: Boolean,
            default: true
        });

        game.settings.register(modName, announceImage, {
            name: 'tm.settings.announceImage.name',
            hint: 'tm.settings.announceImage.hint',
            scope: 'world',
            config: false,
            type: Boolean,
            default: true
        });

        game.settings.register(modName, announceAsActor, {
            name: 'tm.settings.announceAs.name',
            hint: 'tm.settings.announceAs.hint',
            scope: 'world',
            config: false,
            type: Boolean,
            default: true
        });

        game.settings.register(modName, turnMarkerEnabled, {
            name: 'tm.settings.turnMarkerEnabled.name',
            hint: 'tm.settings.turnMarkerEnabled.hint',
            scope: 'world',
            config: false,
            type: Boolean,
            default: true,
            restricted: true
        });

        game.settings.register(modName, startMarkerEnabled, {
            name: 'tm.settings.startEnabled.name',
            hint: 'tm.settings.startEnabled.hint',
            scope: 'world',
            config: false,
            type: Boolean,
            default: false,
            restricted: true
        });
    }
}