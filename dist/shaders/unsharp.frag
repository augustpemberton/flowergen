#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;

uniform sampler2D texture;
uniform vec2 resolution;
uniform float amount;
uniform float threshold;
const float alias_scale = 2.75;

uniform float u_time;


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

vec3 rand3(vec3 p) {
  vec3 q = vec3(
    dot(p, vec3(127.1, 311.7, 74.7)),
    dot(p, vec3(269.5, 183.3, 246.1)),
    dot(p, vec3(113.5, 271.9, 124.6))
    );

  return fract(sin(q) * 43758.5453123);
}

vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

float cnoise(vec3 P){
  vec3 Pi0 = floor(P); // Integer part for indexing
  vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
  Pi0 = mod(Pi0, 289.0);
  Pi1 = mod(Pi1, 289.0);
  vec3 Pf0 = fract(P); // Fractional part for interpolation
  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 / 7.0;
  vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 / 7.0;
  vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
  return 2.2 * n_xyz;
}

void main() {
    vec2 uv = vTexCoord;
    uv.y = 1.0 - uv.y;

    vec4 sharp = sharpen(texture, uv);
    //if (sharp.r <= 0.1) sharp.a = 0.0;
    //gl_FragColor = vec4(0,0,0,0);

    float m = max(resolution.x, resolution.y);
    vec2 res = vec2(m, m);
    vec2 uv_norm = gl_FragCoord.xy/res.xy;

    vec4 color1 = vec4(.96, .65, .39, 1.);
    vec4 color2 = vec4(.85, 0.45, .30, 1.);
    vec4 color3 = vec4(.61, 0.32, .25, 1.);
    vec4 color4 = vec4(.11, 0.23, .26, 1.);

    float c = cnoise(vec3(uv_norm * 3., u_time * 0.5));
	c += rand3(vec3(uv, 0.)).g * .5 - .01;

    float c2 = texture2D(texture, uv).r;
    c2 += rand3(vec3(uv, 0.)).r * .5 - .85;
    c2 *= 3.;

    float cs1 = c + c2 - 2.*c*c2; //xor
    float cs2 = c - c2 - 2.*c*c2; //xor

    c = cs2 * 0.2 + cs1;
    //c = c2;

    c += 1.5;


    vec4 col;

    if (c < 0.3) col = color1;
    else if (c < 0.4) col = color3;
    else if (c < 2.) col = color2;
    else col = color4;

    gl_FragColor = col;


    //gl_FragColor = sharp;
}