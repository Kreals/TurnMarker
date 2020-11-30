import { MarkerAnimation } from './markeranimation.js';
import { Settings } from './settings.js';
import { SettingsForm } from './settingsForm.js';
import { findTokenById, Flags, FlagScope, socketAction, socketName } from './utils.js';

/**
 * Provides functionality for creating, moving, and animating the turn marker
 */
export class Marker {
    /**
     * Handle turn marker when foundry first loads
     */
    static async initTurnMarker(animation) {
        console.log('initTurnMarker')
        let tmarker = canvas.tiles.placeables.find(t => t.data.flags.turnMarker == true);
        if (tmarker){
            if (Settings.getTurnMarkerEnabled()){
                if (Settings.getShouldAnimate()){
                    animation = MarkerAnimation.start(tmarker)
                }
            }else{
                this.hideTurnMarker()
            }
        }else{
            if(Object.keys(game.combats).length > 0) {
                let combat1 = game.combats.values().next().value
                let token = findTokenById(combat1.current.tokenId);
                if (token){
                    let result = await this.createTurnMarker(token);
                    tmarker = result[0]
                    animation = result[1]
                }
            }
        }
        return animation
    }

    /**
     * Places a new turn marker under the token specified, and if required, starts the animation
     */
    static async createTurnMarker(tokenId=false) {
        console.log('createTurnMarker')
        let w, h, x, y
        let token = findTokenById(tokenId);
        if (token){
            console.log('boop', token)
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
            flags: { turnMarker: true }
        });
        let tmarker = await canvas.scene.createEmbeddedEntity('Tile', newTile.data)
        return [tmarker,
                MarkerAnimation.start(newTile)]
    }

    /**
     * Moves the specified marker tile under the specified token
     * @param {String} tokenId - The ID of the token that the marker should be placed under
     * @param {String} markerId - The ID of the tile currently serving as the turn marker
     */
    static async moveTMToToken(tokenId) {
        console.log('moveTMToToken')
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


    static async tMCombatUpdate(tokenId, animation) {
        console.log('tMCombatUpdate')
        if (Settings.getTurnMarkerEnabled()) {
            let tmarker= canvas.tiles.placeables.find(t => t.data.flags.turnMarker == true);
            if (!tmarker){
                let result = await this.createTurnMarker(tokenId);
                console.log(result)
                tmarker = result[0]
                animation = result[1]
            }
            await this.moveTMToToken(tokenId);
        }
        return animation
    }


    static async tMTokenUpdate(updateToken) {
        console.log('tMTokenUpdate')
        if (Settings.getTurnMarkerEnabled()) {
            let tmarker= canvas.tiles.placeables.find(t => t.data.flags.turnMarker == true);
            this.moveTMToToken(updateToken._id);
            tmarker.zIndex = Math.max(...canvas.tiles.placeables.map(o => o.zIndex)) + 1;
            tmarker.parent.sortChildren();
        }
    }

    /**
     * Hides the Turn Marker by shrinking it's dimensions
     */
    static async hideTurnMarker() {
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
     * Handle Start marker when foundry first loads
     */
    static async initStartMarker() {
        console.log('initStartMarker')
        let smarker = canvas.tiles.placeables.find(t => t.data.flags.startMarker == true);
        if (smarker){
            if (!Settings.getStartMarkerEnabled()){
                this.hideStartMarker()
            }
        }else{
            if(Object.keys(game.combats).length > 0) {
                let combat1 = game.combats.values().next().value
                let token = findTokenById(combat1.current.tokenId);
                if (token){
                    smarker = await this.createStartMarker(token)
                }
            }
        }
        console.log(smarker)
    }


    static async sMCombatUpdate(tokenId) {
        console.log('sMCombatUpdate')
        if (Settings.getStartMarkerEnabled()) {
            let smarker= canvas.tiles.placeables.find(t => t.data.flags.startMarker == true);
            if (!smarker){
                let result = await this.createStartMarker(token);
                smarker = result[0]
            }
            console.log('sdfsdfsdf')
            await this.moveSMToToken(tokenId);
        }
    }


    static async sMTokenUpdate(updateToken) {
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
     * Places a new start marker under the token specified, and if required, starts the animation
     * @param {String} tokenId - The ID of the token where the marker should be placed
     */
    static async createStartMarker(tokenId=false) {
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
            z: 900,
            rotation: 0,
            hidden: false,
            locked: false,
            flags: { startMarker: true }
        });

        let smarker =  await canvas.scene.createEmbeddedEntity('Tile', newTile.data);
        return [smarker];
    }

    /**
     * Hides the Start Marker by shrinking it's dimensions
     */
    static async hideStartMarker() {
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
     * Moves the specified marker tile under the specified token
     * @param {String} tokenId - The ID of the token that the marker should be placed under
     */
    static async moveSMToToken(tokenId) {
        console.log('moveSMToToken')
        let token = findTokenById(tokenId);
        let dims = this.getImageDimensions(token, 1.5);
        let center = this.getImageLocation(token, 1.5);
        let smarker = canvas.tiles.placeables.find(t => t.data.flags.startMarker == true);
        console.log(dims.w, dims.h,center.x, center.y)
        await canvas.scene.updateEmbeddedEntity('Tile', {
            _id: smarker.data._id,
            width: dims.w,
            height: dims.h,
            x: center.x,
            y: center.y,
            hidden: token.data.hidden
        });
    }

    /**
     * Updates the start markers tile's image when the image path has changed
     */
    static async updateSM(data) {
        console.log('updateSM')
        if (game.user.isGM && Object.keys(game.combats).length > 0) {
            let tile = canvas.tiles.placeables.find(t => t.data.flags.startMarker == true);
            if (tile) {
                await canvas.scene.updateEmbeddedEntity('Tile', {
                    _id: tile.id,
                    img: data.smimg,
                    z: 901
                });
            }
        }
    }


    static async updateTM(data) {
        console.log('updateTM')
        if (game.user.isGM && Object.keys(game.combats).length > 0) {
            let combat1 = game.combats.values().next().value
            let token = findTokenById(combat1.current.tokenId);
            console.log(data)
            if (token){
                let dims = this.getImageDimensions(token, Number(data.ratio));
                let center = this.getImageLocation(token, Number(data.ratio));
                let tile = canvas.tiles.placeables.find(t => t.data.flags.turnMarker == true);
                console.log(data)
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
            }
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
        console.log(token)
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