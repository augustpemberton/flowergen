#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;

uniform sampler2D texture;
uniform vec2 resolution;
uniform float amount;
uniform float threshold;
const float alias_scale = 2.75;


vec4 average(sampler2D image, vec2 pos, vec2 resolution) {
    float xoff = 1.0 / float(resolution.x);
    float yoff = 1.0 / float(resolution.y);

    vec4 rgb_ne = texture2D(image, pos + vec2(-xoff,yoff));
    vec4 rgb_n = texture2D(image, pos + vec2(0,yoff));
    vec4 rgb_nw = texture2D(image, pos + vec2(xoff,yoff));
    vec4 rgb_w = texture2D(image, pos + vec2(xoff,0));
    vec4 rgb_o = texture2D(image, pos + vec2(0,0));
    vec4 rgb_e = texture2D(image, pos + vec2(-xoff,0));
    vec4 rgb_sw = texture2D(image, pos + vec2(-xoff,-yoff));
    vec4 rgb_s = texture2D(image, pos + vec2(0,-yoff));
    vec4 rgb_se = texture2D(image, pos + vec2(xoff,-yoff));
  
    return (rgb_ne + rgb_n + rgb_nw + rgb_w + rgb_e + rgb_sw + rgb_s + rgb_se) / 8.0;
}

vec4 sharpen(sampler2D texture, vec2 uv) {
    vec4 orig = texture2D(texture, uv);
    vec4 average = average(texture, uv, resolution);

    vec4 contrasted = orig + (orig - average) * amount;

    vec4 difference = contrasted - average;
    float fdiff = abs(dot(vec4(1,1,1,1), difference));

    if (fdiff > threshold) {
        float alias_amount = clamp(fdiff * alias_scale, 0.25, 0.75);
        return mix(contrasted, average, alias_amount);
    } else {
        return orig;
    }
}

void main() {
    vec2 uv = vTexCoord;
    uv.y = 1.0 - uv.y;

    vec4 sharp = sharpen(texture, uv);
    //if (sharp.r <= 0.1) sharp.a = 0.0;
    //gl_FragColor = vec4(0,0,0,0);
    gl_FragColor = sharp;
}