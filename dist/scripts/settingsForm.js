import { imageTitles, Settings } from './settings.js';

const videos = ['mp4', 'webm', 'ogg'];

export class SettingsForm extends FormApplication {

    constructor(object, options = {}) {
        super(object, options);
    }

    /**
    * Default Options for this FormApplication
    */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: 'turnmarker-settings-form',
            title: 'Turn Marker - Global Settings',
            template: './modules/turnmarker/templates/settings.html',
            classes: ['sheet', 'tm-settings'],
            width: 500,
            closeOnSubmit: true
        });
    }

    getData() {
        return {
            turnMarkerEnabled: Settings.getTurnMarkerEnabled(),
            ratio: Settings.getRatio(),
            tmimageselector: this.getSelectList(imageTitles, Settings.getImageIndex()),
            tmPreviewPath: Settings.getChoosenTMImagePath(),
            smPreviewPath: Settings.getChoosenSMImagePath(),
            tmcustomimagepath: Settings.getCustomTMImagePath(),
            smcustomimagepath: Settings.getCustomSMImagePath(),
            announce: Settings.shouldAnnounceTurns(),
            announceImage: Settings.getIncludeAnnounceImage(),
            startMarkerEnabled: Settings.getStartMarkerEnabled(),
            animate: Settings.getShouldAnimate(),
            interval: Settings.getInterval()
        };
    }

    /** 
     * Executes on form submission.
     * @param {Object} e - the form submission event
     * @param {Object} d - the form data
     */
    async _updateObject(e, d) {
        console.log('Turn Marker | Saving Settings');
        Settings.setRatio(d.ratio);
        Settings.setImageIndex(Number(d.tmimageselector));
        Settings.setCustomTMImagePath(d.tmcustomimagepath);
        Settings.setCustomSMImagePath(d.smcustomimagepath);
        Settings.setShouldAnnounceTurns(d.announce);
        Settings.setIncludeAnnounceImage(d.announceImage);
        Settings.setTurnMarkerEnabled(d.turnMarkerEnabled);
        Settings.setStartMarkerEnabled(d.startMarkerEnabled);
        Settings.setShouldAnimate(d.animate);
        Settings.setInterval(d.interval);

        if (d.smcustomimagepath == ""){
            d['smimg'] = "modules/turnmarker/assets/start.png"
        }else{
            d['smimg'] = d.smcustomimagepath
        }
        if (d.tmcustomimagepath == ""){
            d['tmimg'] = Settings.getImageByIndex(Number(d.tmimageselector))
        }else{
            d['tmimg'] = d.tmcustomimagepath
        }
        Hooks.call('tmSettingsChanged', d)
    }

    activateListeners(html) {
        super.activateListeners(html);
        const markerSelect = html.find('#tmimageselector');
        const customTMImage = html.find('#tmcustomimagepath');
        const customSMImage = html.find('#smcustomimagepath');
        const tmImgPreview = html.find('#tmImgPreview');
        const smImgPreview = html.find('#smImgPreview');

        //this.updatePreview(html);

        markerSelect.on('change', event => {
            if (customTMImage[0].value.trim() == '') {
                tmImgPreview.attr('src', Settings.getImageByIndex(Number(event.target.value)));
            }
        });

        customTMImage.on('change', event => {
            if (!customTMImage[0].value.trim() == '') {
                markerSelect[0].disabled = true;
                tmImgPreview.attr('src', customTMImage[0].value);
            }else {
                markerSelect[0].disabled = false;
                tmImgPreview.attr('src', Settings.getImageByIndex(Number(event.target.value)));
            }
        });

        customSMImage.on('change', event => {
            if (!customSMImage[0].value.trim() == '') {
                smImgPreview.attr('src', customSMImage[0].value);
            }else{
                smImgPreview.attr('src', "modules/turnmarker/assets/start.png");
            }
        });
    }


    getExtension(filePath) {
        return filePath.slice((filePath.lastIndexOf(".") - 1 >>> 0) + 2);
    }

    getSelectList(array, selected) {
        let options = [];
        array.forEach((x, i) => {
            options.push({ value: x, selected: i == selected });
        });
        return options;
    }
}