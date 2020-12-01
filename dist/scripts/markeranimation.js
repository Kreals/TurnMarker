import { Settings } from './settings.js';

export class MarkerAnimation {

    /**
     * Starts the animation loop for the specified tile
     */
    static init() {
        console.log('init animation')
        let animation = this.animate.bind();
        if(Settings.getShouldAnimate() && Settings.getTurnMarkerEnabled()) {
            this.start(animation)
        }
        return animation
    }

    /**
     * Handles the animation of the turn marker when the game is paused
     * @param {boolean} isPaused - indicates if the game is paused
     * @param {object} animation - animation object bound to the turnmarker
     */
    static pauseToggle(isPaused, animation){
        if (Settings.getShouldAnimate() && Settings.getTurnMarkerEnabled()) {
            if (isPaused) {  
                this.stop(animation);
            } else {
                this.start(animation);
            }
        }
    }

    /**
     * Starts the animation loop for the specified tile
     * @param {String} tile - The tile currently serving as the turn marker 
     */
    static start(animation) {
        console.log('start animation')
        if (!game.paused) {
            canvas.app.ticker.remove(animation);
            canvas.app.ticker.add(animation);
        }
    }

    /**
     * Stops the animation loop for the specified tile
     * @param {object} animation - The animator object
     */
    static stop(animation) {
        console.log('stopping animation')
        canvas.app.ticker.remove(animation);
    }

    /**
     * Called on every tick of the animation loop to rotate the image based on the current frame
     * @param {number} dt - The delta time
     */
    static animate(dt) {
        let tile = canvas.tiles.placeables.find(t => t.data.flags.turnMarker == true);
        if (tile && tile.data.img) {
            let delta = Settings.getInterval() / 10000;
            //TODO: apply modulus to rotation increase. Seems infinte atm might error if left too long.
            try {
                tile.tile.img.rotation += (delta * dt);
            } catch (err) {
                // skip lost frames if the tile is being updated by the server
            }
        }
    }
}