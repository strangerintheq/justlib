// just lib
// made by Stranger in the Q

const {PI, min, max, sin, cos, atan2, hypot, sign, pow, abs, sqrt} = Math;
const TAU = PI * 2;
const state = {r: Math.random, last: null, lastCanvas: null};
const clamp = (x, a, b) => max(min(b, x), a);

// random
function setRandomGenerator(rg) {
    state.r = rg;
}

function PRNG(hash) {
    let t, x = new Uint32Array([1, 2, 3, 4].map(i =>
        parseInt(hash.substr(i * 8, 8), 16)));
    return _ => {
        t = x[3], x[3] = x[2], x[2] = x[1], x[1] = x[0],
            t ^= t << 11, t ^= t >>> 8, x[0] = t ^ x[0] ^ x[0] >>> 19;
        return x[0] / 0x100000000;
    }
}

function rnd(x = 1, y = 0) {
    return y + state.r() * x;
}

function rndi(x, y = 0) {
    return y + rnd(x) | 0;
}

function rnds(x = 1) {
    return rnd(x) - x / 2;
}

function rndb(x = .5) {
    return rnd() > x;
}

function rndr() {
    return rnd() * TAU;
}

function pick(arr) {
    return arr[rndi(arr.length)];
}

// utility
function many(x, fn) {
    return [...Array(x | 0)].map((_, i) => fn(i));
}

// math
function rect(w, h) {
    return [
        [-w / 2, -h / 2],
        [+w / 2, -h / 2],
        [+w / 2, +h / 2],
        [-w / 2, +h / 2]
    ]
}

function noise(x, y, z = 7127, t = 3141) {
    let w0 = Math.sin(0.3 * x + 1.4 * t + 2.0 + 2.5 * Math.sin(0.4 * y + -1.3 * t + 1.0));
    let w1 = Math.sin(0.2 * y + 1.5 * t + 2.8 + 2.3 * Math.sin(0.5 * z + -1.2 * t + 0.5));
    let w2 = Math.sin(0.1 * z + 1.3 * t + 1.8 + 2.1 * Math.sin(0.3 * x + -1.5 * t + 1.5));
    return (w0 + w1 + w2) / 3;
}

// vector math
function vec3(x = 0, y = 0, z = 0) {
    return {x, y, z}
}

function triple(a, b, dst, fn) {
    dst.x = fn(a.x, b.x);
    dst.y = fn(a.y, b.y);
    dst.z = fn(a.z, b.z);
}

function vec3_mul_scalar(a, b, dst) {
    triple(a, b, dst, A => A * b)
}

function vec3_add_vec3(a, b, dst) {
    triple(a, b, dst, (A, B) => A + B);
}

function vec3_sub_vec3(a, b, dst) {
    triple(a, b, dst, (A, B) => A - B);
}

function vec3_mul_vec3(a, b, dst) {
    triple(a, b, dst, (A, B) => A * B);
}

function vec3_div_vec3(a, b, dst) {
    triple(a, b, dst, (A, B) => A / B);
}

// palette
function palette(colors) {
    state.palette = colors;
}

// canvas
function createCanvas2d(ratio, k) {
    createCanvas(ratio, k)
    const c = state.lastCanvas;
    const ctx = c.getContext("2d");
    let sc = min(c.width, c.height);
    ctx.translate(c.width / 2, c.height / 2)
    ctx.scale(sc, sc)
    state.last = ctx;
    return ctx;
}

function createCanvasWebgl(ratio, k) {
    createCanvas(ratio, k)
    state.gl = state.lastCanvas.getContext('webgl2');
    return state.lastCanvas
}

function createCanvas(ratio, k) {
    const c = document.createElement("canvas");
    state.lastCanvas = c;
    fitSize(c, ratio, k);
    return c;
}

function appendCanvas() {
    document.body.append(state.lastCanvas);
}

function fitSize(c = state.lastCanvas, ratio = 1, k = 1) {
    const w = innerWidth;
    const h = innerHeight;
    const wider = w / h < ratio;
    const s = c.style;
    c.width = !wider ? h * ratio : w;
    c.height = wider ? w / ratio : h;
    s.width = c.width + "px";
    s.height = c.height + "px"
    s.margin = `${h / 2 - c.height / 2}px 0 0 ${w / 2 - c.width / 2}px`;
    c.width *= k;
    c.height *= k;
}

function bind(ctx) {
    state.last = ctx;
    state.lastCanvas = ctx.canvas;
}

// 2d
function setShape(path, close = true) {
    if (typeof path !== "string") {
        path = "M " + path.join(" L ") + (close ? " Z" : "");
    }
    // console.log(path)
    state.shape = new Path2D(path);
}

function drawShape(method, x = 0, y = 0, r = 0, s = 0) {
    const ctx = state.last;
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(-r)
    ctx.scale(s, s)
    ctx[method](state.shape)
    ctx.restore()
}

function fillShape(x = 0, y = 0, r = 0, s = 1) {
    drawShape("fill", x, y, r, s)
}

function strokeShape(x = 0, y = 0, r = 0, s = 1) {
    drawShape("stroke", x, y, r, s)
}

function strokeWidth(x) {
    return assign("lineWidth", x)
}

function assign(k, v) {
    return state.last[k] = v;
}

function assignStyle(param, style) {
    let p = state.palette;
    if (style === null) {
        style = pick(p);
    }
    if (typeof style === "number") {
        style = p[(style | 0) % p.length]
    }
    return assign(param, style);
}

function fillStyle(style) {
    return assignStyle("fillStyle", style)
}

function strokeStyle(style) {
    return assignStyle("strokeStyle", style)
}

function fillRect(x, y, w, h) {
    const ctx = state.last;
    ctx.fillRect(x, y, w, h)
}

function fillCircle(x, y, r) {
    const ctx = state.last;
    ctx.beginPath()
    ctx.ellipse(x, y, r, r, 0, 0, Math.PI * 2)
    ctx.fill()
}


// color manipulations

function colorComponent(str, off) {
    return parseInt(str.substr(off, 2), 16) / 255
}

function hslOperation(color, operation) {
    const r = colorComponent(color, 1)
    const g = colorComponent(color, 3)
    const b = colorComponent(color, 5)

    const hsl = rgbToHsl(r, g, b)

    operation(hsl)

    const c = "#" + hslToRgb(...hsl).map(x => {
        x = Math.max(Math.min(255, x * 255), 0) | 0
        return (x < 16 ? "0" : "") + x.toString(16)
    }).join("");
    // console.log(c)
    return c
}

function rgbToHsl(r, g, b) {
    // r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }

    return [h, s, l];
}

function hslToRgb(h, s, l) {
    var r, g, b;

    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    // r *= 255, g *= 255, b *= 255;
    return [r, g, b];
}

function hue2rgb(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
}


// field
//
// coordinates is normalized to interval  from -0.5 to 0.5 at short side,
// to be equal library default canvas coordinates
function field(q, fn, ratio = 1) {
    const w = q;
    const h = q;
    const fld = many(h, y => many(w, x => {
        return fn((x - w / 2) / q, (y - h / 2) / q);
    }));
    return (x, y) => {
        const row = fld[(y * q + h / 2) | 0];
        return row && row[(x * q + w / 2) | 0];
    }
}


// simplest quadtree
function q3(cx, cy, hw, hh = hw) {

    const w = hw / 2,
        h = hh / 2,
        children = [],
        points = [];

    const pointInAABB = (
        cx, cy, hw, hh, x, y
    ) =>
        cx - hw < x &&
        cx + hw > x &&
        cy - hh < y &&
        cy + hh > y;

    const intersects = (
        x1, y1, w1, h1,
        x2, y2, w2, h2
    ) => {
        if (Math.abs(x1 - x2) > w1 + w2)
            return false;
        return Math.abs(y1 - y2) < h1 + h2;
    };

    return {
        insert(x, y, r) {

            if (!pointInAABB(cx, cy, hw, hh, x, y))
                return false;
            if (points.length < 4) {
                points.push({x, y, r});
                return true;
            }
            !children[0] && children.push(
                q3(cx - w, cy - h, w, h),
                q3(cx + w, cy - h, w, h),
                q3(cx + w, cy + h, w, h),
                q3(cx - w, cy + h, w, h)
            );
            for (let i = 0; i < 4; i++)
                if (children[i].insert(x, y, r))
                    return true;
            return false;

        },
        circle(x, y, r) {

            const result = [];

            if (!intersects(x, y, r, r, cx, cy, hw, hh))
                return result;

            for (let i = 0; i < points.length; i++) {
                const p = points[i];
                if (pointInAABB(x, y, r, r, p.x, p.y))
                    result.push(p);
            }

            if (!children[0])
                return result;

            for (let i = 0; i < 4; i++)
                result.push(...children[i]
                    .circle(x, y, r));
            return result;

        }
    }
}


// webgl stuff

const fullScreenTriangle = new Float32Array([-1, 3, -1, -1, 3, -1])

const defaultVertexShader = `
in vec2 pt = fullScreenTriangle;
void main() {
    gl_Position = vec4(pt, 0.0, 1.0);
}`;

function webglProgram(fs, vs = defaultVertexShader) {
    const gl = state.gl;
    const callbacks = [];
    const pid = gl.createProgram();
    shader(vs, gl.VERTEX_SHADER);
    shader(fs, gl.FRAGMENT_SHADER);
    gl.linkProgram(pid);
    gl.useProgram(pid);

    return (count = 3, points = false) => {
        gl.useProgram(pid);
        callbacks.forEach(cb => cb());
        gl.drawArrays(points ? gl.POINTS : gl.TRIANGLES, 0, count);
    };

    function print(str, i, message) {
        if (!state.log) {
            state.log = document.createElement('div');
            state.log.style.fontFamily = 'Courier New, monospace';
            state.log.style.position = 'fixed';
            state.log.style.top = '0';
            state.log.innerHTML = "<h1>SHADER ERROR<h1>"
            document.body.append(state.log);
        }
        let line = 1 + i;
        let currentLine = line === +message.split(':')[2];
        let msg = ("" + line).padStart(4, "0") + ': ' + str.split(' ').join('&nbsp;');
        if (currentLine)
            msg = '<br>' + message + '<br>' + msg + '<br><br>';
        state.log.innerHTML += `<div ${currentLine && 'style="background:#900;color:#fff"'}>${msg}</div>`
    }

    function shader(src, type) {
        const id = gl.createShader(type);
        src = prepare(src);
        console.log(src)
        gl.shaderSource(id, src);
        gl.compileShader(id);
        const message = gl.getShaderInfoLog(id);
        if (message) {
            src.split('\n').map((line, i) => print(line, i, message))
            throw message;
        }
        gl.attachShader(pid, id);
    }

    function prepare(code) {

        let index = 0;
        code = code.split('\n').map(line => {
            if (line.startsWith('in'))
                line = attribute(line);
            else if (~line.indexOf('sampler2D'))
                line = sampler(line, index++);
            else if (~line.indexOf('uniform'))
                line = uniform(line);
            return line;
        }).join('\n');

        function patch(what, on) {
            code = code.split(what).map((c, i, a) => {
                return c + (i + 1 < a.length ? on() : "");
            }).join("");
        }


        patch("RND2", () => `vec2(${many(2, () => rnd())})`);
        patch("RND3", () => `vec3(${many(3, () => rnd())})`);
        patch("RND4", () => `vec4(${many(4, () => rnd())})`);
        patch("RNDI", rndi);
        patch("RNDS", rnds);
        patch("RND", rnd);

        if (~code.indexOf('palette'))
            code = paletteShaderPart() + code;

        code = '#version 300 es\nprecision highp float;\n' + code;

        return code;
    }

    function paletteShaderPart() {
        const p = state.palette, n = p.length;
        const c = (s, i) => (parseInt(s.substr(i, 2), 16) / 255).toFixed(4);
        const v = (x) => `vec3(${c(x, 1)},${c(x, 3)},${c(x, 5)});`
        return `\nvec3 color(float x){\nx = mod(x, ${n}.);${many(n, i => `\nif (x < ${i + 1}.)return ${v(p[i])}`).join("")}\n}\n\nvec3 palette(float x){return mix(color(x),color(x+1.),fract(x));}\n`;
    }

    function lineParams(line) {
        const l = line.trim().split(/\s+/);
        const size = +l[1].split('vec')[1] || 1;
        const code = 'return () =>' + line.split('=')[1];
        // console.log(code)
        const value = (new Function('', code))();
        return [l[2], size, value, line.split('=')[0].trim() + ';'];
    }

    function sampler(line, index) {

        const [name, size, value, newLine] = lineParams(line);
        const texture = gl.createTexture();

        console.log('activeTexture', index)
        gl.activeTexture(gl.TEXTURE0 + index);
        gl.bindTexture(gl.TEXTURE_2D, texture);

        function texParam(key, value) {
            gl.texParameteri(gl.TEXTURE_2D, key, value);
        }

        texParam(gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        texParam(gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        texParam(gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        texParam(gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        let loc;
        callbacks.push(() => {
            if (!loc)
                loc = gl.getUniformLocation(pid, name);
            gl.activeTexture(gl.TEXTURE0 + index);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.uniform1i(loc, index);
            const data = value();
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
                data.canvas ? data.canvas : data);
        });

        return newLine;
    }

    function uniform(line) {
        const [name, size, value, newLine] = lineParams(line);
        const f = gl[`uniform${size}f`];
        let loc;
        callbacks.push(() => {
            if (!loc)
                loc = gl.getUniformLocation(pid, name);
            const v = value();
            // console.log(name, 'uniform set value', ...v)
            f.call(gl, loc, ...v)
        });
        return newLine;
    }

    function attribute(line) {
        const [name, size, value, newLine] = lineParams(line);
        const bufferId = gl.createBuffer();
        let type, loc;
        callbacks.push(() => {
            gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
            if (!loc) {
                loc = gl.getAttribLocation(pid, name);
                gl.enableVertexAttribArray(loc);
            }
            type = type ? gl.STATIC_DRAW : gl.DYNAMIC_DRAW;
            const data = value();
            gl.bufferData(gl.ARRAY_BUFFER, data, type);
            gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
        })
        return newLine;
    }
}



