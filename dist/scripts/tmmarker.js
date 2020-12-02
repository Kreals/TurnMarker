import { MarkerAnimation } from './markeranimation.js';
import { Settings } from './settings.js';
import { findTokenById, Flags, FlagScope, socketAction, socketName } from './utils.js';

/**
 * Provides functionality for creating, moving, and animating the turn marker
 */
export class TurnMarker {
    /**
     * Handle turn marker when foundry first loads
     */
    static async init() {
        console.log('initTurnMarker')
        let tmarkers = await canvas.tiles.placeables.filter(t => t.data.flags.turnMarker == true);
        for (let i = 1; i < tmarkers.length; i++) {    
                tmarkers[i].delete()
        }
        if (tmarkers[0]){
            game.combats.forEach(combat => {
                if (combat.scene.id === canvas.scene.id && combat.data.active && combat.current.tokenId){
                    this.update({tmimg: Settings.getChoosenTMImagePath(), ratio: Settings.getRatio()},
                        combat.current.tokenId)
                }
            })
        }else{
            game.combats.forEach(combat => {
                if (combat.scene.id === canvas.scene.id && combat.data.active && combat.current.tokenId){
                    tmarkers[0] = this.create(combat.current.tokenId);
                }
            })
            if (!tmarkers[0]){
                tmarkers[0] = this.create()
            }
        }
        if (!Settings.getTurnMarkerEnabled()){
            this.hide()
        }
    }

    /**
     * Places a new turn marker under the token specified, and if required, starts the animation
     * @param {String} tokenId - The ID of the token where the marker should be placed
     */
    static async create(tokenId=false) {
        console.log('createTurnMarker')
        let w, h, x, y
        let token = findTokenById(tokenId);
        if (token){
            let dims = this.getImageDimensions(token, Settings.getRatio());
            let center = this.getImageLocation(token, 1.5);
            w = dims.w, h = dims.h, x = center.x, y = center.y
        }else{ w = 0, h = 0, x = 0, y = 0}
        let newTile = new Tile({
            img: Settings.getChoosenTMImagePath(),
            width: w,
            height: h,
            x: x,
            y: y,
            z: 900,
            rotation: 0,
            hidden: false,
            locked: false,
            flags: {turnMarker: true}
        });
        let tmarker = await canvas.scene.createEmbeddedEntity('Tile', newTile.data)
        return tmarker
    }

    /**
     * Hides the Turn Marker by shrinking it's dimensions
     */
    static async hide() {
        console.log('hideTurnMarker')
        let marker = canvas.tiles.placeables.find(t => t.data.flags.turnMarker == true);
        await canvas.scene.updateEmbeddedEntity('Tile', {
            _id: marker.data._id, 
            x: 0,
            y: 0,
            width: 0,
            height: 0
        });
    }

    /**
     * Updates the turn markers tile's image when the image path has changed
     */
    static async update(data, tokenId) {
        console.log('updateTM')
        let token = findTokenById(tokenId);
        if (game.user.isGM){
            let dims = this.getImageDimensions(token, Number(data.ratio));
            let center = this.getImageLocation(token, Number(data.ratio));
            let tile = canvas.tiles.placeables.find(t => t.data.flags.turnMarker == true);
            if (tile) {
                await canvas.scene.updateEmbeddedEntity('Tile', {
                    _id: tile.id,
                    img: data.tmimg,
                    width: dims.w,
                    height: dims.h,
                    x: center.x,
                    y: center.y,
                    z: 900
                });
            }
            if (data.turnMarkerEnabled !== undefined){
                if(data.turnMarkerEnabled === false){
                    this.hide()
                }
            }
        }
    }

    /**
     * Moves the specified marker tile under the specified token
     * @param {String} tokenId - The ID of the token that the marker should be placed under
     * @param {String} markerId - The ID of the tile currently serving as the turn marker
     */
    static async move(tokenId) {
        console.log('moveTM')
        let token = findTokenById(tokenId);
        let dims = this.getImageDimensions(token);
        let center = this.getImageLocation(token);
        let marker = canvas.tiles.placeables.find(t => t.data.flags.turnMarker == true);
        await canvas.scene.updateEmbeddedEntity('Tile', {
            _id: marker.data._id,
            width: dims.w,
            height: dims.h,
            x: center.x,
            y: center.y,
            hidden: token.data.hidden
        });
    }


    static async combatUpdate(tokenId) {
        console.log('tMCombatUpdate')
        if (Settings.getTurnMarkerEnabled()) {
            let tmarker= canvas.tiles.placeables.find(t => t.data.flags.turnMarker == true);
            if (!tmarker){
                let tmarker = await this.create(tokenId);
            }
            await this.move(tokenId);
        }
    }


    static async tokenUpdate(updateToken) {
        console.log('tMTokenUpdate')
        if (Settings.getTurnMarkerEnabled()) {
            let tmarker= canvas.tiles.placeables.find(t => t.data.flags.turnMarker == true);
            this.move(updateToken._id);
            tmarker.zIndex = Math.max(...canvas.tiles.placeables.map(o => o.zIndex)) + 1;
            tmarker.parent.sortChildren();
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