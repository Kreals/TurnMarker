import { Marker} from './marker.js';
import { Settings } from './settings.js';

/**
 * Provides functionality for creating, moving, and animating the turn marker
 */
export class StartMarker extends Marker {

    constructor(scene_id, combat_id, id, tile_data) {
        super(scene_id, combat_id, id, tile_data)
        if (this.pendingCreate){
            this.tile_data = this.create()
        }
    }

    create() {
        // Get the real token from the combat tracker
        let tokenId = game.combats.get(this.combat_id).combatant.tokenId;
        let token = canvas.tokens.get(tokenId);
        if (token){
            let dims = this.getImageDimensions(token, this.ratio);
            let center = this.getImageLocation(token, dims);
            return {
                img: Settings.getChoosenSMImagePath(),
                width: dims.w,
                height: dims.h,
                x: center.x,
                y: center.y,
                z: 900,
                rotation: 0,
                hidden: (token.hidden || game.combats.get(this.combat_id).combatant.hidden),
                locked: false,
                flags: {startMarker: true, 
                    combat_id: this.combat_id, 
                    id: this.id}
            }
        }else{
            return {
                img: Settings.getChoosenSMImagePath(),
                width: 0,
                height: 0,
                x: 0,
                y: 0,
                z: 900,
                rotation: 0,
                hidden: true,
                locked: false,
                flags: {startMarker: true, 
                    combat_id: this.combat_id, 
                    id: this.id}
            }
        } 
    }
}
