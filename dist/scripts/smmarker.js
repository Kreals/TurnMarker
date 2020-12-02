import { Settings } from './settings.js';
import { findTokenById, Flags, FlagScope, socketAction, socketName } from './utils.js';

/**
 * Provides functionality for creating, moving, and animating the turn marker
 */
export class StartMarker {
    /**
     * Handle Start marker when foundry first loads
     */
    static async init() {
        console.log('initStartMarker')
        let smarkers = await canvas.tiles.placeables.filter(t => t.data.flags.startMarker == true)
        for (let i = 1; i < smarkers.length; i++) {  
            smarkers[i].delete()
        }
        if (smarkers[0]){
            this.update({smimg: Settings.getChoosenSMImagePath()})
        }else{
            game.combats.forEach(combat => {
                if (combat.scene.id === canvas.scene.id && combat.data.active && combat.current.tokenId){
                    smarkers[0] = this.create(combat.current.tokenId)
                }
            })
            if (!smarkers[0]){
                smarkers[0] = this.create()
            }
        }
        if (!Settings.getStartMarkerEnabled()){
            this.hide()
        }
    }


    /**
     * Places a new start marker under the token specified, and if required, starts the animation
     * @param {String} tokenId - The ID of the token where the marker should be placed
     */
    static async create(tokenId=false) {
        console.log('createStartMarker')
        let w, h, x, y
        let token = findTokenById(tokenId);
        if (token){
            let dims = this.getImageDimensions(token, 1.5);
            let center = this.getImageLocation(token, 1.5);
            w = dims.w, h = dims.h, x = center.x, y = center.y
        }else{ w = 0, h = 0, x = 0, y = 0}
        let newTile = new Tile({
            img: Settings.getChoosenSMImagePath(),
            width: w,
            height: h,
            x: x,
            y: y,
            z: 0,
            rotation: 0,
            hidden: false,
            locked: false,
            flags: { startMarker: true}
        });
        let smarker =  await canvas.scene.createEmbeddedEntity('Tile', newTile.data);
        return [smarker];
    }

    /**
     * Hides the Start Marker by shrinking it's dimensions
     */
    static async hide() {
        console.log('hideStartMarker')
        let marker = canvas.tiles.placeables.find(t => t.data.flags.startMarker == true);
        await canvas.scene.updateEmbeddedEntity('Tile', {
            _id: marker.data._id, 
            x: 0,
            y: 0,
            width: 0,
            height: 0
        });
    }

    /**
     * Updates the start markers tile's image when the image path has changed
     */
    static async update(data) {
        console.log('updateSM')
        if (game.user.isGM){
            let tile = canvas.tiles.placeables.find(t => t.data.flags.startMarker == true);
            if (tile) {
                await canvas.scene.updateEmbeddedEntity('Tile', {
                    _id: tile.id,
                    img: data.smimg,
                    z: 0
                });
            }
            if (data.startMarkerEnabled !== undefined){
                if(data.startMarkerEnabled === false){
                    this.hide()
                }
            }
        }
    }

    /**
     * Moves the specified marker tile under the specified token
     * @param {String} tokenId - The ID of the token that the marker should be placed under
     */
    static async move(tokenId) {
        console.log('moveSMToToken')
        let token = findTokenById(tokenId);
        let dims = this.getImageDimensions(token, 1.5);
        let center = this.getImageLocation(token, 1.5);
        let smarker = canvas.tiles.placeables.find(t => t.data.flags.startMarker == true);
        await canvas.scene.updateEmbeddedEntity('Tile', {
            _id: smarker.data._id,
            width: dims.w,
            height: dims.h,
            x: center.x,
            y: center.y,
            hidden: token.data.hidden
        });
    }


    static async combatUpdate(tokenId) {
        console.log('sMCombatUpdate')
        if (Settings.getStartMarkerEnabled()) {
            let smarker= canvas.tiles.placeables.find(t => t.data.flags.startMarker == true);
            if (!smarker){
                let result = await this.create(tokenId);
                smarker = result[0]
            }
            await this.move(tokenId);
        }
    }


    static async tokenUpdate(updateToken) {
        console.log('sMTokenUpdate')
        if (Settings.getStartMarkerEnabled()) {
            let smarker = canvas.tiles.placeables.find(t => t.data.flags.startMarker == true);
            await canvas.scene.updateEmbeddedEntity('Tile', {
                _id: smarker.data._id,
                hidden: updateToken.hidden
            });
        }
    }



    /**
     * Gets the proper dimensions of the marker tile taking into account the current grid layout
     * @param {object} token - The token that the tile should be placed under
     */
    static getImageDimensions(token, ratio_overide=-1) {
        let ratio;
        if (ratio_overide > -1){
            ratio = ratio_overide
        }else{
            ratio = Settings.getRatio();
        }
        let newWidth = 0;
        let newHeight = 0;

        switch (canvas.grid.type) {
            case 2: case 3: // Hex Rows
                newWidth = newHeight = token.h * ratio;
                break;
            case 4: case 5: // Hex Columns
                newWidth = newHeight = token.w * ratio;
                break;
            default: // Gridless and Square
                newWidth = token.w * ratio;
                newHeight = token.h * ratio;
                break;
        }

        return { w: newWidth, h: newHeight };
    }

    /**
     * Gets the proper location of the marker tile taking into account the current grid layout
     * @param {object} token - The token that the tile should be placed under
     */
    static getImageLocation(token, ratio_overide=-1) {
        let ratio;
        if (ratio_overide > -1){
            ratio = ratio_overide
        }else{
            ratio = Settings.getRatio();
        }
        let newX = 0;
        let newY = 0;
        switch (canvas.grid.type) {
            case 2: case 3: // Hex Rows
                newX = token.center.x - ((token.h * ratio) / 2);
                newY = token.center.y - ((token.h * ratio) / 2);
                break;
            case 4: case 5: // Hex Columns
                newX = token.center.x - ((token.w * ratio) / 2);
                newY = token.center.y - ((token.w * ratio) / 2);
                break;
            default: // Gridless and Square
                newX = token.center.x - ((token.w * ratio) / 2);
                newY = token.center.y - ((token.h * ratio) / 2);
        }

        return { x: newX, y: newY };
    }
}