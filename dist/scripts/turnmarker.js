import { Chatter } from './chatter.js';
import { Marker } from './marker.js';
import { MarkerAnimation } from './markeranimation.js';
import { Settings } from './settings.js';
import { renderUpdateWindow } from './updateWindow.js';
import { firstGM, Flags, FlagScope, socketAction, socketName } from './utils.js';

let animation;
let lastTokenId = '';

CONFIG.debug.hooks = false

/*  issues
    marker image duplicates when settings are changed and combat is active
    custom start marker doesnt work?
    system doesnt handle multiple combats properly
*/

Hooks.on('ready', async () => {
    Settings.registerSettings();

    animation = await Marker.initTurnMarker()
    Marker.initStartMarker()

    if (game.user.isGM) {
        if (isNewerVersion(game.modules.get("turnmarker").data.version, Settings.getVersion())) {
            renderUpdateWindow();
        }
    }
});

Hooks.on('tmSettingsChanged', async (d) => {
    console.log('stuff', d);
    Marker.updateSM(d);
    Marker.updateTM(d);

    console.log(animation)
    if (d.animate){
        console.log(true)
        //if (!animation){
        animation = await MarkerAnimation.start();
        //}
    }else{
        console.log(false)
        MarkerAnimation.stop(animation);
    }

});

Hooks.on('updateCombat', async (combat, update) => {
    if (combat && combat.combatant && update &&  game.user.isGM && game.userId == firstGM()) {
        if (combat.combatant.token) { //if combantant has a token 
            lastTokenId = combat.combatant._id;
            animation = await Marker.tMCombatUpdate(combat.combatant.token._id, animation)
            Marker.sMCombatUpdate(combat.combatant.token._id)
            if (Settings.shouldAnnounceTurns() && !combat.combatant.token.hidden && !combat.combatant.hidden) {
                Chatter.sendTurnMessage(combat.combatant);
            }
        }else{ // just hide everything
            Marker.hideTurnMarker();
            Marker.hideStartMarker();
            if (Settings.shouldAnnounceTurns() && !combat.combatant.hidden) {
                Chatter.sendTurnMessage(combat.combatant);
            }
        }
    }
});

Hooks.on('deleteCombat', async () => {
    if (game.user.isGM) {
        Marker.hideTurnMarker();
        Marker.hideStartMarker();
    }
});

Hooks.on('updateToken', (scene, updateToken, updateData) => {
    if ((updateData.x || updateData.y || updateData.width || updateData.height || updateData.hidden|| !updateData.hidden) &&
        (game && game.combat && game.combat.combatant && game.combat.combatant.tokenId == updateToken._id) && game.user.isGM && game.combat) {
        Marker.tMTokenUpdate(updateToken);
        Marker.sMTokenUpdate(updateToken);
    }
});

// Hooks.on('updateTile', () => {
//     if (canvas.scene.data.tokenVision) {
//         let tile = canvas.tiles.placeables.find(t => t.data.flags.turnMarker == true);
//         if (tile) {
//             let combatant = canvas.tokens.placeables.find(x => x.id == game.combat.combatant.tokenId);
//             if (combatant && !combatant.data.hidden) {
//                 //tile.visible = canvas.sight.testVisibility(combatant.center, { tolerance: canvas.dimensions.size / 4 });
//             }
//         }
//     }
// });


Hooks.on('pauseGame', async (isPaused) => {
    animation = await MarkerAnimation.pauseToggle(isPaused, animation);
});