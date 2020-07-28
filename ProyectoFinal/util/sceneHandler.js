

function initControls()
{
    $('#point').ColorPicker({
        color: '#ffffff',
        onShow: (colpkr) => {
            $(colpkr).fadeIn(500);
            return false;
        },
        onHide: (colpkr) => {
            $(colpkr).fadeOut(500);
            return false;
        },
        onChange: (hsb, hex, rgb) => {
            $('#point div').css('backgroundColor', '#' + hex);
            Game.setLightColor( Game.pointLight, rgb.r, rgb.g, rgb.b);
        },
        onSubmit: (hsb, hex, rgb, el) => {
            $(el).val(hex);
            $('#point div').css( "background-color", "#" + hex );
            Game.setLightColor( Game.pointLight, rgb.r, rgb.g, rgb.b);
            $(el).ColorPickerHide();
        },
    });
    
    var pointHex = "#ffffff";
    $('#point').ColorPickerSetColor(pointHex);
    $('#point div').css( "background-color", pointHex );
    
    $('#ambient').ColorPicker({
        color: '#ffffff',
        onShow: (colpkr) => {
            $(colpkr).fadeIn(500);
            return false;
        },
        onHide: (colpkr) => {
            $(colpkr).fadeOut(500);
            return false;
        },
        onChange: (hsb, hex, rgb) => {
            $('#ambient div').css('backgroundColor', '#' + hex);
            Game.setLightColor( Game.ambientLight, rgb.r, rgb.g, rgb.b);
        },
        onSubmit: (hsb, hex, rgb, el) => {
            $(el).val(hex);
            $('#ambient div').css( "background-color", "#" + hex );
            Game.setLightColor( Game.ambientLight, rgb.r, rgb.g, rgb.b);
            $(el).ColorPickerHide();
        },
    });
    var ambientHex = "#ffffff";
    $('#ambient').ColorPickerSetColor(ambientHex);
    $('#ambient div').css( "background-color", ambientHex );
}