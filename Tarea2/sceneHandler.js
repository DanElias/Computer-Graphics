


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
            setLightColor(pointLight, rgb.r, rgb.g, rgb.b);
        },
        onSubmit: (hsb, hex, rgb, el) => {
            $(el).val(hex);
            $('#point div').css( "background-color", "#" + hex );
            setLightColor(pointLight, rgb.r, rgb.g, rgb.b);
            $(el).ColorPickerHide();
        },
    });
    
    var pointHex = "#ffffff";
    $('#point').ColorPickerSetColor(pointHex);
    $('#point div').css( "background-color", pointHex );
    
    $('#ambient').ColorPicker({
        color: '#121212',
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
            setLightColor(ambientLight, rgb.r, rgb.g, rgb.b);
        },
        onSubmit: (hsb, hex, rgb, el) => {
            $(el).val(hex);
            $('#ambient div').css( "background-color", "#" + hex );
            setLightColor(ambientLight, rgb.r, rgb.g, rgb.b);
            $(el).ColorPickerHide();
        },
    });
    var ambientHex = "#121212";
    $('#ambient').ColorPickerSetColor(ambientHex);
    $('#ambient div').css( "background-color", ambientHex );
}