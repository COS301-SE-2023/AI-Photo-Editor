import * as PIXI from 'pixi.js';
import { type Filter, getPixiFilter } from './types';
import { randomId } from './render';

// Apply a series of filters and flatten the result to a sprite.
// This is done so that the filters are applied evenly regardless of scaling.
export function applyFilters(blink: PIXI.Application, content: PIXI.Container, filters: Filter[]) {
    // `renderPadding` is necessary for filters like
    // blur that spread beyond the bounds of the sprite
    const renderPadding = 100;

    // Normalize offset to fit within renderTexture
    const { x: bx, y: by, width: bw, height: bh } = content.getLocalBounds();
    content.transform.position.x = -bx + renderPadding;
    content.transform.position.y = -by + renderPadding;

    // Apply filters
    content.filters = filters.map(getPixiFilter);

    // Render to texture
    const renderTexture = PIXI.RenderTexture.create({
        width: bw + 2 * renderPadding,
        height: bh + 2 * renderPadding,
    });
    console.log("RENDER TEXTURE", renderTexture);
    blink.renderer.render(content, { renderTexture: renderTexture });

    content.filters = null;
    content.transform.setFromMatrix(new PIXI.Matrix());

    // Create flattened sprite
    const renderSprite = new PIXI.Sprite(renderTexture);
    renderSprite.name = `FilterSprite(${randomId()})`
    // renderSprite.anchor.x = 0.5;
    // renderSprite.anchor.y = 0.5;
    renderSprite.setTransform(bx - renderPadding, by - renderPadding);

    return renderSprite;
}