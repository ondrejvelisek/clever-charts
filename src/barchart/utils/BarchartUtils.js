/**
 * @public
 * Returns element text width
 * @param {element} element
 * @param {canvas} canvas
 * @returns {number} text width in pixels
 */
export function calculateTextWidth(element, canvas) {

    const context = canvas.node().getContext("2d");

    const style = window.getComputedStyle(element.node());
    const fontStyle = style.getPropertyValue("font-style");
    const fontVariant = style.getPropertyValue("font-variant");
    const fontWeight = style.getPropertyValue("font-weight");
    const fontStrech = style.getPropertyValue("font-strech");
    const fontSize = style.getPropertyValue("font-size");
    const fontFamily = style.getPropertyValue("font-family");
    context.font = `${fontStyle} ${fontVariant} ${fontWeight} ${fontStrech} ${fontSize} ${fontFamily}`;

    var metrics = context.measureText(element.text());

    return metrics.width;
}