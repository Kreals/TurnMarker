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
        this.lastTokenId = ''
        this.animation = undefined
        this.tms = undefined
        this.combatsTracker = []
    }

    init(){
        this.tms = new MarkerList()
    }

    async praiseTheLordAndPassTheAmmunition(){
        console.log('tmReady');
        if (game.user.isGM && game.userId == firstGM()) {
            if (isNewerVersion(game.modules.get("turnmarker").data.version, Settings.getVersion())) {
                renderUpdateWindow();
                this.tms.clearAllMarkers()
                await new Promise(r => setTimeout(r, 1000));
            }
            console.log(game)
            console.log(canvas)
            this.tms.initTurnMarkers(Settings.getTurnMarkerEnabled())
            this.tms.initStartMarkers(Settings.getStartMarkerEnabled())

            this.tms.sync()
        }
        this.animation = MarkerAnimation.initAnim()
    }

    extractCombatData(combat, update){
        let tracker = this.combatsTracker.find(tracker => tracker.id === combat.id)
        if (!tracker){
            tracker = {id:combat.id, prevTurns: combat.turns}
            this.combatsTracker.push(tracker)
        }

        let started = true
        if(update.round === 0 || (combat.round === 0 && update.round === undefined)){
            started = false
            this.tms.deleteMarkersForCombat(combat)
        }

        let firstTurn = false
        if(update.round === 1 && combat.round === 0 ){firstTurn = true}

        let newTokenTurn = combat.turns[update.turn]
        if(firstTurn || !newTokenTurn){newTokenTurn = combat.turns[0]}

        let previousTokenTurn = tracker.prevTurns[combat.turn]
        if(!previousTokenTurn){previousTokenTurn = tracker.prevTurns[0]}

        let newCombatent = combat.combatants.find(cbtnt => cbtnt._id === newTokenTurn._id)
        let nullInitiatives = combat.combatants.filter(cbtnt => (cbtnt.initiative === null && cbtnt.token))

        let data = {
            isStarted: started,
            newTT: newTokenTurn,
            prevTT: previousTokenTurn,
            newC: newCombatent,
            nInits: nullInitiatives
        }
        tracker.prevTurns = combat.turns
        return data
    }


    processNextTurn(combat, update){
        let cd = this.extractCombatData(combat, update)
        if(game.user.isGM && game.userId == firstGM()){
            if (cd.nInits.length === 0 && cd.newC){
                if (combat && !update.active && cd.isStarted) {
                    let tm = this.tms.getTurnMarker(combat.id, cd.prevTT.tokenId)
                    let sm = this.tms.getStartMarker(combat.id, cd.prevTT.tokenId)
                    if(update && update.turn !== undefined || update.round !== undefined){
                        if(Settings.getTurnMarkerEnabled()){
                            if (tm === undefined){
                                tm = new TurnMarker(combat.scene.id, combat.id, cd.newTT.tokenId)
                                this.tms.add(tm) 
                            }
                            if (!cd.newTT.tokenId){
                                tm.shrink()
                            }else{
                                tm.setTokenId(cd.newTT.tokenId)
                                if(cd.newTT.hidden){
                                    tm.hide(true)
                                }else{
                                    tm.hide(tm.getTokenInstance().hidden)
                                }  
                                tm.move({}, Settings.getRatio())
                            }
                        }
                        if(Settings.getStartMarkerEnabled()){
                            if(sm === undefined){
                                sm = new StartMarker(combat.scene.id, combat.id, cd.newTT.tokenId)
                                this.tms.add(sm) 
                            }
                            if (!cd.newTT.tokenId){
                                sm.shrink()
                            }else{
                                sm.setTokenId(cd.newTT.tokenId)
                                if(cd.newTT.hiddenn){
                                    sm.hide(true)
                                }else{
                                    sm.hide(sm.getTokenInstance().hidden)

                                }  
                                sm.move({})
                            }
                        }
                        if (Settings.shouldAnnounceTurns() && !cd.newTT.hidden 
                        && (!cd.newTT.token || !cd.newTT.token.hidden)){
                            Chatter.sendTurnMessage(cd.newC);
                        }
                    }
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
            let tmark = this.tms.getTurnMarker(tile.flags.combat_id, tile.flags.token_id)
            if(tmark){this.tms.deleteRef(tmark)}
        }
        if(tile.flags && tile.flags.startMarker){
            let smark = this.tms.getStartMarker(tile.flags.combat_id, tile.flags.token_id)
            if(smark){this.tms.deleteRef(smark)}
        }
        this.tms.sync()
    }

    deleteCombatMarkers(combat){
        this.tms.deleteMarkersForCombat(combat)
        this.tms.sync()
    }

    processInterTurn(updateToken, update){
        //hide doesn't respect combat tracker
        if(game.user.isGM && game.userId == firstGM()){
            let tms = this.tms.getTurnMarkers(updateToken._id)
            for(let i=0; i < tms.length; i++){
                tms[i].move(update, Settings.getRatio())
                let isTurnHidden = game.combats.get(tms[i].combat_id).combatant.hidden
                if(update && update.hidden !== undefined){
                    tms[i].hide((update.hidden || isTurnHidden))
                }
            }
            let sms = this.tms.getStartMarkers(updateToken._id)
            for(let i=0; i < tms.length; i++){
                let isTurnHidden = game.combats.get(tms[i].combat_id).combatant.hidden
                if(update && update.hidden !== undefined){
                    sms[i].hide((update.hidden || isTurnHidden))
                }

            }
        }
        this.tms.sync()
    }

    handlePreUpdateCombatent(combat, combatant, update){
        if(update && update.hidden !== undefined){
            let tms = this.tms.getTurnMarkers(combatant.tokenId)
            for(let i=0; i < tms.length; i++){
                tms[i].hide((combatant.token.hidden || update.hidden))
            }
            let sms = this.tms.getStartMarkers(combatant.tokenId)
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