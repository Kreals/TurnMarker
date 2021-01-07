import { Marker} from './marker.js';
import { Settings } from './settings.js';

/**
 * Provides functionality for creating, moving, and animating the turn marker
 */
export class TurnMarker extends Marker {

    constructor(scene_id, combat_id, id, tile_data) {
        super(scene_id, combat_id, id, tile_data)
        this.ratio = Settings.getRatio()
        if (this.pendingCreate){
            this.tile_data = this.create()
        }
    }

    create() {
        // Get the real token from the combat tracker
        let token = game.combats.get(this.combat_id).combatant.token;
        if (token){
            let dims = this.getImageDimensions(token, this.ratio);
            let center = this.getImageLocation(token, dims);
            return {
                img: Settings.getChoosenTMImagePath(),
                width: dims.w,
                height: dims.h,
                x: center.x,
                y: center.y,
                z: 900,
                rotation: 0,
                hidden: (token.hidden || game.combats.get(this.combat_id).combatant.hidden),
                locked: false,
                flags: {turnMarker: true, 
                    combat_id: this.combat_id, 
                    id: this.id}
            }
        }else{
            return {
                img: Settings.getChoosenTMImagePath(),
                width: 0,
                height: 0,
                x: 0,
                y: 0,
                z: 900,
                rotation: 0,
                hidden: true,
                locked: false,
                flags: {turnMarker: true, 
                    combat_id: this.combat_id, 
                    id: this.id}
            }
        }
    }
}
