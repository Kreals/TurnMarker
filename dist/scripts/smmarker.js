import { Marker} from './marker.js';
import { Settings } from './settings.js';

/**
 * Provides functionality for creating, moving, and animating the turn marker
 */
export class StartMarker extends Marker {

    constructor(scene_id, combat_id, token_id, tile_data) {
        super(scene_id, combat_id, token_id, tile_data)
        this.ratio=1.5
        if (this.pendingCreate){
            this.tile_data = this.create()
        }
    }

    create(){
        let tokens = game.scenes.get(this.scene_id).data.tokens
        let selected;
        for(let i =0 ; i< tokens.length; i++){
            if(tokens[i]._id === this.token_id){
                selected = tokens[i]
            }
        }
        if (selected){
            let dims = this.getImageDimensions(selected, this.ratio)
            let center = this.getImageLocation(selected, this.ratio)
            return {
                img: Settings.getChoosenSMImagePath(),
                width: dims.w,
                height: dims.h,
                x: center.x,
                y: center.y,
                z: 900,
                rotation: 0,
                hidden: (selected.hidden || game.combats.get(this.combat_id).combatant.hidden),
                locked: false,
                flags: {startMarker: true, 
                    combat_id: this.combat_id, 
                    token_id: this.token_id}
            }   
        }  
    }

    move(update){
        let token = this.getTokenInstance()
        if(!update){update = {}}
        if (token){
            if(!update.x){update.x = token.x}
            if(!update.y){update.y = token.y}
            let dims = this.getImageDimensions(token, this.ratio)
            let center = this.getImageLocation(token, this.ratio)
            this.update({
                width: dims.w,
                height: dims.h,
                x: center.x,
                y: center.y})
        }
    }
}