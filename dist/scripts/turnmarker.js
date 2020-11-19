import { Chatter } from './chatter.js';
import { Marker } from './marker.js';
import { MarkerAnimation } from './markeranimation.js';
import { Settings } from './settings.js';
import { renderUpdateWindow } from './updateWindow.js';
import { firstGM, Flags, FlagScope, socketAction, socketName } from './utils.js';

let animator;
let markerId;
let lastTurn = '';
let verbose = true
let token_magic = false

CONFIG.debug.hooks = true

Hooks.on('ready', async () => {
    Settings.registerSettings();
    let marker = canvas.tiles.placeables.find(t => t.data.flags.turnMarker == true);
    if (marker && marker.id) {
        markerId = marker.id;
        let tile = canvas.tiles.placeables.find(t => t.data.flags.turnMarker == true);
        tile.zIndex = Math.max(...canvas.tiles.placeables.map(o => o.zIndex)) + 1;
        tile.parent.sortChildren();
        animator = MarkerAnimation.startAnimation(animator, markerId);
    }

    if (game.user.isGM) {
        if (isNewerVersion(game.modules.get("turnmarker").data.version, Settings.getVersion())) {
            renderUpdateWindow();
        }
    }

    game.socket.on(socketName, async (data) => {
        if (game.user.isGM) {
            switch (data.mode) {
                case socketAction.placeStartMarker:
                    await canvas.scene.createEmbeddedEntity('Tile', data.tileData);
                    canvas.scene.setFlag(FlagScope, Flags.startMarkerPlaced, true);
            }
        }
    });

    // let tm = game.modules.get("tokenmagic")
    // if (tm?.active){
    //     token_magic = tm
    //     console.log(tm)
    // }
});

Hooks.on('createTile', (scene, tile) => {
    if (tile.flags.turnMarker == true) {
        markerId = tile._id;
        tile = canvas.tiles.placeables.find(t => t.data.flags.turnMarker == true);
        tile.zIndex = Math.max(...canvas.tiles.placeables.map(o => o.zIndex)) + 1;
        tile.parent.sortChildren();
        animator = MarkerAnimation.startAnimation(animator, markerId);
    }
});

Hooks.on('preUpdateToken', async (scene, token) => {
    if (game.combat) {
        if (token._id == game.combat.combatant.token._id && !canvas.scene.getFlag(FlagScope, Flags.startMarkerPlaced)) {
            await Marker.placeStartMarker(game.combat.combatant.token._id);
        }
    }
});

Hooks.on('updateCombat', async (combat, update) => {
    if (combat.combatant) {
        if (update && lastTurn != combat.combatant._id && game.user.isGM && game.userId == firstGM()) {
            lastTurn = combat.combatant._id;
            if (combat && combat.combatant && combat.combatant.token) {
                let tile = canvas.tiles.placeables.find(t => t.data.flags.turnMarker == true);
                let result = await Marker.placeTurnMarker(combat.combatant.token._id, (tile && tile.id) || undefined);
                console.log(result)
                if (result) {
                    markerId = result;
                }
                if (Settings.getTurnMarkerEnabled()) {
                    Marker.deleteStartMarker();
                    canvas.scene.unsetFlag(FlagScope, Flags.startMarkerPlaced);
                }
                if (Settings.shouldAnnounceTurns() && !combat.combatant.hidden) {
                    Chatter.sendTurnMessage(combat.combatant);
                }
            }else{
                Marker.clearAllMarkers()
                MarkerAnimation.stopAnimation(animator);
            }
        }
    }
});

Hooks.on('deleteCombat', async () => {
    if (game.user.isGM) {
        Marker.clearAllMarkers();
    }
    MarkerAnimation.stopAnimation(animator);
});

Hooks.on('updateToken', (scene, updateToken, updateData) => {
    let tile = canvas.tiles.placeables.find(t => t.data.flags.turnMarker == true);
    if (tile) {
        if ((updateData.x || updateData.y || updateData.width || updateData.height || updateData.hidden|| !updateData.hidden) &&
            (game && game.combat && game.combat.combatant && game.combat.combatant.tokenId == updateToken._id) &&
            game.user.isGM && game.combat) {
            Marker.moveMarkerToToken(updateToken._id, tile.id);
            tile.zIndex = Math.max(...canvas.tiles.placeables.map(o => o.zIndex)) + 1;
            tile.parent.sortChildren();
        }
    }
});

Hooks.on('updateTile', () => {
    if (canvas.scene.data.tokenVision) {
        let tile = canvas.tiles.placeables.find(t => t.data.flags.turnMarker == true);
        if (tile) {
            let combatant = canvas.tokens.placeables.find(x => x.id == game.combat.combatant.tokenId);
            if (combatant && !combatant.data.hidden) {
                //tile.visible = canvas.sight.testVisibility(combatant.center, { tolerance: canvas.dimensions.size / 4 });
            }
        }
    }
});

Hooks.on('deleteTile', () => {
    MarkerAnimation.stopAnimation(animator);
    markerId = undefined
});

Hooks.on('pauseGame', async (isPaused) => {
    if(verbose){console.log('pauseGame')}

    if (markerId && Settings.getShouldAnimate()) {
        if (isPaused) {
            MarkerAnimation.stopAnimation(animator);
        } else {
            animator = MarkerAnimation.startAnimation(animator, markerId);
        }
    }
});