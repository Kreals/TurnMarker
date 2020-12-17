import { Chatter } from './chatter.js';
import { TurnMarker } from './tmmarker.js';
import { MarkerList } from './markerList.js';
import { StartMarker } from './smmarker.js';
import { MarkerAnimation } from './markeranimation.js';
import { Settings } from './settings.js';
import { renderUpdateWindow } from './updateWindow.js';
import { firstGM } from './utils.js';


export class Main {

    constructor() {
        this.lastTokenId = '';
        this.animation = undefined;
        this.tms = undefined;
        this.combatsTracker = [];
    }

    init(){
        this.tms = new MarkerList();
    }

    async praiseTheLordAndPassTheAmmunition(){
        console.log('tmReady');
        if (game.user.isGM && game.userId == firstGM()) {
           if (isNewerVersion(game.modules.get("turnmarker").data.version, Settings.getVersion())) {
                renderUpdateWindow();
                this.tms.clearAllMarkers();
                await new Promise(r => setTimeout(r, 1000));
           }
            console.log(game);
            console.log(canvas);
            this.tms.initTurnMarkers(Settings.getTurnMarkerEnabled());
            this.tms.initStartMarkers(Settings.getStartMarkerEnabled());
            this.tms.markerList.map((marker, index, array)=> {
                if (marker instanceof TurnMarker){
                    this.combatsTracker.push({
                        id: marker.combat_id, 
                        prevCID: game.combats.get(marker.combat_id).combatant._id
                    })
                }
            })

            this.tms.sync();
        }
        if(!this.animation){
            this.animation = MarkerAnimation.initAnim();
        }
    }

    processNextTurn(combat, update){
        if (combat){
            if(combat.round > 0){
                if(combat.combatant &&  game.user.isGM && game.userId == firstGM()) {
                    let tracker = this.combatsTracker.find(tracker => tracker.id === combat.id)
                    if (!tracker){
                        tracker = {id:combat.id, prevCID: combat.combatant._id}
                        this.combatsTracker.push(tracker)
                    }

                    let prev_combatent = combat.combatants.find(combatant => combatant._id === tracker.prevCID)
                    if(prev_combatent){
                        if(Settings.getTurnMarkerEnabled()){
                            let tm = this.tms.getTurnMarker(combat.id, prev_combatent._id)
                            if (tm === undefined){
                                tm = new TurnMarker(combat.scene.id, combat.id, combat.combatant._id)
                                this.tms.add(tm)
                            }
                            tm.setId(combat.combatant._id)
                            if (combat.combatant.token){
                                tm.hide((combat.combatant.token.hidden || combat.combatant.hidden))
                                tm.move({}, Settings.getRatio())
                            }else{
                                tm.shrink()
                            }
                        }
                        if(Settings.getStartMarkerEnabled()){
                            let sm = this.tms.getStartMarker(combat.id, prev_combatent._id)
                            if(sm === undefined){
                                sm = new StartMarker(combat.scene.id, combat.id, combat.combatant._id)
                                this.tms.add(sm)
                            }
                            sm.setId(combat.combatant._id)
                            if (combat.combatant.token){
                                sm.hide((combat.combatant.token.hidden || combat.combatant.hidden))
                                sm.move({})
                            }else{
                                sm.shrink()
                            }
                        }
                        if (Settings.shouldAnnounceTurns()){
                            if (combat.combatant.token){
                                if(!combat.combatant.token.hidden && !combat.combatant.hidden){
                                    Chatter.sendTurnMessage(combat.combatant);
                                }
                            }else{
                                if(!combat.combatant.hidden){
                                    Chatter.sendTurnMessage(combat.combatant);  
                                }
                            }
                        }
                    }
                tracker.prevCID = combat.combatant._id;
                }
            }else{
                this.tms.deleteMarkersForCombat(combat)
            }
            this.tms.sync()
        }
    }

    startAnimations(){
        if(Settings.getShouldAnimate()){
            MarkerAnimation.start(this.animation)
        }
    }

    deleteLinkedMarkers(tile){
        if(tile.flags && tile.flags.turnMarker){
            let tmark = this.tms.getTurnMarker(tile.flags.combat_id, tile.flags.id)
            if(tmark){this.tms.deleteRef(tmark)}
        }
        if(tile.flags && tile.flags.startMarker){
            let smark = this.tms.getStartMarker(tile.flags.combat_id, tile.flags.id)
            if(smark){this.tms.deleteRef(smark)}
        }
        this.tms.sync()
    }

    clearTracker(combat){
        for (let i = this.combatsTracker.length -1; i > -1; i--) {
            if(this.combatsTracker[i] === combat.id){
                this.combatsTracker.splice(i, 1);
            }
        }
    }

    deleteCombatMarkers(combat){
        this.tms.deleteMarkersForCombat(combat)
        this.tms.sync()
    }

    processInterTurn(updateToken, update){
        if(game.user.isGM && game.userId == firstGM()){
            let combat = game.combats.find(combat => (combat.combatant && combat.combatant.tokenId == updateToken._id))
            if(combat){
                let tms = this.tms.getTurnMarkers(combat.combatant._id)
                for(let i=0; i < tms.length; i++){
                    tms[i].move(update, Settings.getRatio())
                    let isTurnHidden = game.combats.get(tms[i].combat_id).combatant.hidden
                    if(update && update.hidden !== undefined){
                        tms[i].hide((update.hidden || isTurnHidden))
                    }
                }
                let sms = this.tms.getStartMarkers(combat.combatant._id)
                for(let i=0; i < tms.length; i++){
                    let isTurnHidden = game.combats.get(tms[i].combat_id).combatant.hidden
                    if(update && update.hidden !== undefined){
                        sms[i].hide((update.hidden || isTurnHidden))
                    }
                }
            }
        }
        this.tms.sync()
    }

    handleUpdateCombatent(combat, combatant, update){
        if(update && update.hidden !== undefined){
            let tms = this.tms.getTurnMarkers(update._id)
            for(let i=0; i < tms.length; i++){
                tms[i].hide((combatant.token.hidden || update.hidden))
            }
            let sms = this.tms.getStartMarkers(update._id)
            for(let i=0; i < sms.length; i++){
                sms[i].hide((combatant.token.hidden || update.hidden))
            }
        }
        this.tms.sync()
    }

    handlePause(isPaused){
        MarkerAnimation.togglePause(isPaused, this.animation);
    }

    applySettings(d){
        //sometimes updates dont persist after refresh,... timebased issue with updateEmbeddedEntity?
        //creates to many turnmarkers when changing a setting. need to track down why. 

        this.tms.initTurnMarkers(d.turnMarkerEnabled)
        this.tms.initStartMarkers(d.startMarkerEnabled)

        this.tms.updateAllTurnMarkers({img: d.tmimg}, d.ratio)
        this.tms.updateAllStartMarkers({img: d.smimg})

        if (d.animate){
            MarkerAnimation.start(this.animation);
        }else{
            MarkerAnimation.stop(this.animation); 
        }
        this.tms.sync()
    }


}