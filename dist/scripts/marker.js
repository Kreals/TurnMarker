  /**
 * Abstract Class Marker.
 *
 * @class Marker
 */
export class Marker {

    constructor(scene_id, combat_id, id, tile_data) {
        this.scene_id = scene_id
        this.combat_id = combat_id
        this.id = id
        this.pendingDelete = false
        this.pendingUpdate = false
        this.pendingCreate = false
        this.tile_data = undefined
        this.ratio = 1.5
        if (tile_data){
            this.tile_data = tile_data

        }else{
            this.pendingCreate = true
        }
        if (this.constructor == Marker) {
            throw new Error("Abstract classes can't be instantiated.");
        }
    }

    setId(tId){
        this.id = tId;
        this.tile_data.flags.id = tId;
    }

    setCombatId(sId){
        this.combat_id = sId;
        this.tile_data.flags.combat_id = sId;
    }
  
    create(){
        throw new Error("Method 'create()' must be implemented.");
    }

    update(tile_data){
        Object.keys(tile_data).forEach((key) => {
            this.tile_data[key]= tile_data[key]
        })
        this.pendingUpdate = true
    }

    move() {
        // Get the real token from the combat tracker
        let token = game.combats.get(this.combat_id).combatant.token;

        if (token) {
            let dims = this.getImageDimensions(token, this.ratio)
            let center = this.getImageLocation(token, dims)
            this.update({
                width: dims.w,
                height: dims.h,
                x: center.x,
                y: center.y
            });
        }
    }

    shrink(){
        this.update({
            width: 0,
            height: 0})
    }

    hide(state){
        this.update({
            hidden:state
        })
    }

    delete(){
        this.pendingDelete=true
    }

    toString(){
        return this.scene_id + ' ' + this.id + ' ' + this.tile
    }

    /**
     * Get the desired dimensions of the marker based on the token
     * @param {Token} token - the token to size the marker to
     * @param {number} ratio - the scale ratio
     * @returns {Object} - h, w pixel dimensions
     */
    getImageDimensions(token, ratio) {
        let newWidth = 0;
        let newHeight = 0;
        let scene  = game.scenes.get(this.scene_id)

        switch (scene.data.gridType) {
            case 2: case 3: // Hex Rows
                newWidth = newHeight = token.height * ratio;
                break;
            case 4: case 5: // Hex Columns
                newWidth = newHeight = token.width * ratio;
                break;
            default: // Gridless and Square
                newWidth = token.width * ratio;
                newHeight = token.height * ratio;
                break;
        }
        return { w: newWidth * scene.data.grid, h: newHeight * scene.data.grid};
    }


    /**
     * Get location relative to token center
     * @param {Token} token - token to center the marker on
     * @param {Object} dims - dimensions of this marker
     * @returns {Object} x, y coords to place the marker
     */
    getImageLocation(token, dims) {
        let scene  = game.scenes.get(this.scene_id)
        let center = ''
        switch (scene.data.gridType) {
            case 2: case 3: // Hex Rows
                center = {  x: token.x + (token.width * Math.sqrt(3)/2)/2 * scene.data.grid,
                            y: token.y + token.height/2 * scene.data.grid}
                break;
            case 4: case 5: // Hex Columns
                center = {  x: token.x + token.width/2 * scene.data.grid, 
                            y: token.y + (token.width * Math.sqrt(3)/2)/2 * scene.data.grid}
                break;
            default: // Gridless and Square
                center = {  x: token.x + token.width/2 * scene.data.grid, 
                            y: token.y + token.height/2 * scene.data.grid}
                break;
        }
        let newX = center.x - dims.w / 2;
        let newY = center.y - dims.h / 2;
        return { x: newX, y: newY };
    }
}
