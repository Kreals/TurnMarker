import { TurnMarker } from './tmmarker.js';
import { StartMarker } from './smmarker.js';
import { firstGM } from './utils.js';


export class MarkerList {

    constructor() {
      this.markerList=[]
    }

    initTurnMarkers(isEnabled){
        game.combats.forEach(combat => {
            if(combat.combatant){
                if (combat.scene.id && combat.current.round > 0){
                    let tile = game.scenes.get(combat.scene.id).data.tiles.find(t => t.flags.turnMarker === true && t.flags.id === combat.combatant._id)
                    if(tile){
                        let tm = new TurnMarker(combat.scene.id, combat.id, combat.combatant._id, tile)
                        this.add(tm)
                        if(!isEnabled){tm.delete()}
                    }else if(isEnabled){
                        this.add(new TurnMarker(combat.scene.id, combat.id, combat.combatant._id))
                    }
                }
            }
        })
    }

    initStartMarkers(isEnabled){
        game.combats.forEach(combat => {
            if(combat.combatant){
                if (combat.scene.id && combat.current.round > 0){
                    let tile = game.scenes.get(combat.scene.id).data.tiles.find(t => t.flags.startMarker === true && t.flags.id === combat.combatant._id)
                    if(tile){
                        let sm = new StartMarker(combat.scene.id, combat.id, combat.combatant._id, tile)
                        this.add(sm)
                        if(!isEnabled){sm.delete()}
                    }else if(isEnabled){
                        this.add(new StartMarker(combat.scene.id, combat.id, combat.combatant._id))
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
            tms[i].ratio = ratio
            tms[i].move()
        }
    }

    updateAllStartMarkers(tile_data_template){
        let sms = this.markerList.filter(t => t instanceof StartMarker)
        for (let i = 0; i < sms.length; i++) {
            sms[i].update(tile_data_template)
            sms[i].move()

        }
    }

    getTurnMarker(combat_id, cId){
        let tm = this.markerList.find(m => (m instanceof TurnMarker
            && combat_id === m.combat_id
            && cId === m.id))
        return tm
    }

    getStartMarker(combat_id, cId){
        let sm = this.markerList.find(m => (m instanceof StartMarker 
            && combat_id === m.combat_id 
            && cId === m.id))
        return sm
    }


    getTurnMarkers(cId){
        let markers = []
        for (let i = this.markerList.length -1; i > -1; i--) {
            if (cId === this.markerList[i].id && this.markerList[i] instanceof TurnMarker){
                markers.push(this.markerList[i])
            }
        }
        return markers
    }

    getStartMarkers(cId){
        let markers = []
        for (let i = this.markerList.length -1; i > -1; i--) {
            if (cId === this.markerList[i].id && this.markerList[i] instanceof StartMarker){
                markers.push(this.markerList[i])
            }
        }
        return markers
    }

    deleteMarkersForCombat(combat){
        for (let i = combat.combatants.length -1; i > -1; i--) {
            combat.combatants[i]._id
            for (let i2 = this.markerList.length -1; i2 > -1; i2--) {
                if(combat.combatants[i]._id === this.markerList[i2].id 
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
        game.scenes.forEach(async (scene, key, map) => {
            let tmarkers = scene.data.tiles.filter(t => t.flags.turnMarker == true)
            for (let i = 0; i < tmarkers.length; i++) {
                await scene.deleteEmbeddedEntity('Tile',  tmarkers[i]._id)
            }

            let smarkers = scene.data.tiles.filter(t => t.flags.startMarker == true)
            for (let i = 0; i < smarkers.length; i++) {
                await scene.deleteEmbeddedEntity('Tile',  smarkers[i]._id)
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