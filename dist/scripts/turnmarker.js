import { Chatter } from './chatter.js';
import { TurnMarker } from './tmmarker.js';
import { StartMarker } from './smmarker.js';
import { MarkerAnimation } from './markeranimation.js';
import { Settings } from './settings.js';
import { renderUpdateWindow } from './updateWindow.js';
import { findTokenById, firstGM, Flags, FlagScope, socketAction, socketName } from './utils.js';

let lastTokenId = '';
let animation;
CONFIG.debug.hooks = false

/*  issues
    marker image duplicates when settings are changed and combat is active
    custom start marker doesnt work?
    system doesnt handle multiple combats within the same scene properly
    changing turnmarker template causes animation to speed up 
    changing settings only affects current combat and scene
*/

Hooks.on('init', async () => {
    Settings.registerSettings();

})

Hooks.on('ready', async () => {
    console.log('ready');
    await TurnMarker.init()
    StartMarker.init()
    animation = MarkerAnimation.init()
    if (game.user.isGM) {
        if (isNewerVersion(game.modules.get("turnmarker").data.version, Settings.getVersion())) {
            renderUpdateWindow();
        }
    }
});

Hooks.on('tmSettingsChanged', async (d) => {
    console.log('tmSettingsChanged', d);
    await TurnMarker.init()
    StartMarker.init()
    game.combats.forEach(combat => {
        if (combat.scene.id === canvas.scene.id && combat.data.active){
            TurnMarker.update(d, combat.current.tokenId);
            StartMarker.update(d);
        }
    })
    if (d.animate){
        await MarkerAnimation.start(animation);
    }else{
        MarkerAnimation.stop(animation); 
    }
  

});

Hooks.on('updateCombat', async (combat, update) => {
    console.log('updateCombat')
    if (combat && combat.combatant && update &&  game.user.isGM && game.userId == firstGM()) {
        if (combat.combatant.token) { //if combantant has a token 
            lastTokenId = combat.combatant._id;
            await TurnMarker.combatUpdate(combat.combatant.token._id)
            StartMarker.combatUpdate(combat.combatant.token._id)
            if (Settings.shouldAnnounceTurns() && !combat.combatant.token.hidden && !combat.combatant.hidden) {
                Chatter.sendTurnMessage(combat.combatant);
            }
        }else{ // just hide everything
            TurnMarker.hide();
            StartMarker.hide();
            if (Settings.shouldAnnounceTurns() && !combat.combatant.hidden) {
                Chatter.sendTurnMessage(combat.combatant);
            }
        }
    }
});

Hooks.on('deleteCombat', async () => {
    console.log('deleteCombat')
    if (game.user.isGM) {
        TurnMarker.hide();
        StartMarker.hide();
    }
});

Hooks.on('updateToken', (scene, updateToken, updateData) => {
    console.log('updateToken')
    if ((updateData.x || updateData.y || updateData.width || updateData.height || updateData.hidden|| !updateData.hidden) &&
        (game && game.combat && game.combat.combatant && game.combat.combatant.tokenId == updateToken._id && game.user.isGM)) {
        TurnMarker.tokenUpdate(updateToken);
        StartMarker.tokenUpdate(updateToken);
    }
});

 Hooks.on('canvasReady', async () => {
    //Settings.registerSettings();
    await TurnMarker.init()
    StartMarker.init()
});


Hooks.on('pauseGame', async (isPaused) => {
    await MarkerAnimation.pauseToggle(isPaused, animation);
});