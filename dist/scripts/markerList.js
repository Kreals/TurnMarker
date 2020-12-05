import { TurnMarker } from './tmmarker.js';
import { StartMarker } from './smmarker.js';
import { firstGM } from './utils.js';


export class MarkerList {

    constructor() {
      this.markerList=[]
    }

    initTurnMarkers(isEnabled){
        game.combats.forEach(combat => {
            if(combat.combatants){
                let nullInitiatives = combat.combatants.filter(cbtnt => (cbtnt.initiative === null && cbtnt.token))
                if (combat.scene.id && combat.current.tokenId && combat.current.round > 0 && nullInitiatives.length === 0){
                    let tmarkers = game.scenes.get(combat.scene.id).data.tiles.filter(t => t.flags.turnMarker == true)
                    for (let i = 0; i < tmarkers.length; i++) {
                        if(combat.current.tokenId === tmarkers[i].flags.token_id &&
                            combat.id === tmarkers[i].flags.combat_id){
                            let tm = new TurnMarker(combat.scene.id, combat.id, combat.current.tokenId, tmarkers[i])
                            this.add(tm)
                            if(!isEnabled){tm.delete()}
                            break;
                        }
                    }
                    if(tmarkers.length === 0 && combat.current.tokenId && isEnabled){
                        this.add(new TurnMarker(combat.scene.id, combat.id, combat.current.tokenId))
                    }
                }
            }
        })
    }

    initStartMarkers(isEnabled){
        game.combats.forEach(combat => {
            if(combat.combatants){
                let nullInitiatives = combat.combatants.filter(cbtnt => (cbtnt.initiative === null && cbtnt.token))
                if (combat.scene.id && combat.current.tokenId && combat.current.round > 0 && nullInitiatives.length === 0){
                    let smarkers = game.scenes.get(combat.scene.id).data.tiles.filter(t => t.flags.startMarker == true)
                    for (let i = 0; i < smarkers.length; i++) {
                        if(combat.current.tokenId === smarkers[i].flags.token_id &&
                            combat.id === smarkers[i].flags.combat_id){
                            let sm = new StartMarker(combat.scene.id, combat.id, combat.current.tokenId, smarkers[i])
                            this.add(sm)
                            if(!isEnabled){sm.delete()}
                            break;
                        }
                    }
                    if(smarkers.length === 0 && combat.current.tokenId && isEnabled){
                        this.add(new StartMarker(combat.scene.id, combat.id, combat.current.tokenId))
                    }
                }
            }
        })
    }

    add(marker){
        this.markerList.push(marker)
    }

    update(index, data){
        this.markerList[index].update(data)
    }

    updateAllTurnMarkers(tile_data_template, ratio){
        let tms = this.markerList.filter(t => t instanceof TurnMarker)
        for (let i = 0; i < tms.length; i++) {
            tms[i].update(tile_data_template)
            tms[i].move({}, ratio)
        }
    }

    updateAllStartMarkers(tile_data_template){
        let sms = this.markerList.filter(t => t instanceof StartMarker)
        for (let i = 0; i < sms.length; i++) {
            sms[i].update(tile_data_template)
        }
    }

    getTurnMarker(combat_id, token_id){
        let tm = this.markerList.find(m => (m instanceof TurnMarker 
            && combat_id === m.combat_id 
            && token_id === m.token_id))
        return tm
    }

    getStartMarker(combat_id, token_id){
        let sm = this.markerList.find(m => (m instanceof StartMarker 
            && combat_id === m.combat_id 
            && token_id === m.token_id))
        return sm
    }


    getTurnMarkers(token_id){
        let markers = []
        for (let i = this.markerList.length -1; i > -1; i--) {
            if (token_id === this.markerList[i].token_id && this.markerList[i] instanceof TurnMarker){
                markers.push(this.markerList[i])
            }
        }
        return markers
    }

    getStartMarkers(token_id){
        let markers = []
        for (let i = this.markerList.length -1; i > -1; i--) {
            if (token_id === this.markerList[i].token_id && this.markerList[i] instanceof StartMarker){
                markers.push(this.markerList[i])
            }
        }
        return markers
    }

    deleteMarkersForCombat(combat){
        for (let i = combat.combatants.length -1; i > -1; i--) {
            combat.combatants[i].tokenId
            for (let i2 = this.markerList.length -1; i2 > -1; i2--) {
                if(combat.combatants[i].tokenId === this.markerList[i2].token_id 
                    && combat.id === this.markerList[i2].combat_id){
                    this.markerList[i2].delete()
                }
            }
        }
    }

    deleteFromList(markerList){
        for (let i = markerList.length -1; i > -1; i--) {
            markerList[i].delete()
        }
    }

    deleteAllTurnMarkers(){
        let tms = this.markerList.filter(t => t instanceof TurnMarker)
        for (let i = 0; i < tms.length; i++) {
            tms[i].delete()
        }
    }

    deleteAllStartMarkers(){
        let sms = this.markerList.filter(t => t instanceof StartMarker)
        for (let i = 0; i < sms.length; i++) {
            sms[i].delete()
        }
    }

    deleteAll(){
        for (let i = this.markerList.length -1; i > -1; i--) {
            this.markerList[i].delete()
        }
    }

    deleteRef(markerRef){
        for (let i = this.markerList.length -1; i > -1; i--) {
            if(this.markerList[i] === markerRef){
                this.markerList.splice(i, 1);
            }
        }
    }

    clearAllMarkers(){
        //this is intended to remove all misconfigured tiles - might not belong in this class
        game.scenes.forEach((scene, key, map) => {
            let tmarkers = scene.data.tiles.filter(t => t.flags.turnMarker == true)
            for (let i = 0; i < tmarkers.length; i++) {
                scene.deleteEmbeddedEntity('Tile',  tmarkers[i]._id)
            }

            let smarkers = scene.data.tiles.filter(t => t.flags.startMarker == true)
            for (let i = 0; i < smarkers.length; i++) {
                scene.deleteEmbeddedEntity('Tile',  smarkers[i]._id)
            }
        })

        game.scenes.forEach((scene, key, map) => {
            let smarkers = scene.data.tiles.filter(t => t.flags.startMarker == true)
            for (let i = 0; i < smarkers.length; i++) {
                scene.deleteEmbeddedEntity('Tile',  smarkers[i]._id)
            }
        })
    }


    togglePauseAll(state){
        game.scenes.forEach((scene, key, map) => {
            for (let i = this.markerList.length -1; i > -1; i--) {
                    this.markerList[i].togglePause(state)
            }
        })
    }

    async sync(){
        if(game.user.isGM && game.userId == firstGM()){
            for (let i = this.markerList.length -1; i > -1; i--) {
                let m = this.markerList[i]
                if(m){
                    if (m.pendingCreate){
                        m.pendingCreate=false
                        m.tile_data = await game.scenes.get(m.scene_id).createEmbeddedEntity('Tile',  m.tile_data)
                    }
                    if (m.pendingUpdate){
                        m.pendingUpdate=false
                        await game.scenes.get(m.scene_id).updateEmbeddedEntity('Tile',  m.tile_data, {diff: false})
                    }
                    if (m.pendingDelete){
                        await game.scenes.get(m.scene_id).deleteEmbeddedEntity('Tile',  m.tile_data._id)
                        this.markerList.splice(i, 1);
                    }
                }
            }
        }
    }
}