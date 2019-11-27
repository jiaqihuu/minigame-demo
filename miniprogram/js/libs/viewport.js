import * as PIXI from './pixi.min';
!(function(t, e) {
    'object' == typeof exports && 'undefined' != typeof module
        ? e(exports, PIXI)
        : 'function' == typeof define && define.amd
        ? define(['exports', 'pixi.js'], e)
        : e(((t = t || self).Viewport = {}), t.PIXI);
})(this, function(t, e) {
    'use strict';
    class i {
        constructor(t) {
            (this.viewport = t), (this.touches = []), this.addListeners();
        }
        addListeners() {
            (this.viewport.interactive = !0),
                this.viewport.forceHitArea ||
                    (this.viewport.hitArea = new e.Rectangle(
                        0,
                        0,
                        this.viewport.worldWidth,
                        this.viewport.worldHeight
                    )),
                this.viewport.on('pointerdown', this.down, this),
                this.viewport.on('pointermove', this.move, this),
                this.viewport.on('pointerup', this.up, this),
                this.viewport.on('pointerupoutside', this.up, this),
                this.viewport.on('pointercancel', this.up, this),
                this.viewport.on('pointerout', this.up, this),
                (this.wheelFunction = t => this.handleWheel(t)),
                this.viewport.options.divWheel.addEventListener('wheel', this.wheelFunction, {
                    passive: this.viewport.options.passiveWheel
                }),
                (this.isMouseDown = !1);
        }
        destroy() {
            this.viewport.options.divWheel.removeEventListener('wheel', this.wheelFunction);
        }
        down(t) {
            if (this.viewport.pause || !this.viewport.worldVisible) return;
            if (
                ('mouse' === t.data.pointerType
                    ? (this.isMouseDown = !0)
                    : this.get(t.data.pointerId) || this.touches.push({ id: t.data.pointerId, last: null }),
                1 === this.count())
            ) {
                this.last = t.data.global.clone();
                const e = this.viewport.plugins.get('decelerate'),
                    i = this.viewport.plugins.get('bounce');
                (e && e.isActive()) || (i && i.isActive())
                    ? (this.clickedAvailable = !1)
                    : (this.clickedAvailable = !0);
            } else this.clickedAvailable = !1;
            this.viewport.plugins.down(t) && this.viewport.options.stopPropagation && t.stopPropagation();
        }
        checkThreshold(t) {
            return Math.abs(t) >= this.viewport.threshold;
        }
        move(t) {
            if (this.viewport.pause || !this.viewport.worldVisible) return;
            const e = this.viewport.plugins.move(t);
            if (this.clickedAvailable) {
                const e = t.data.global.x - this.last.x,
                    i = t.data.global.y - this.last.y;
                (this.checkThreshold(e) || this.checkThreshold(i)) && (this.clickedAvailable = !1);
            }
            e && this.viewport.options.stopPropagation && t.stopPropagation();
        }
        up(t) {
            if (this.viewport.pause || !this.viewport.worldVisible) return;
            'mouse' === t.data.pointerType && (this.isMouseDown = !1),
                'mouse' !== t.data.pointerType && this.remove(t.data.pointerId);
            const e = this.viewport.plugins.up(t);
            this.clickedAvailable &&
                0 === this.count() &&
                (this.viewport.emit('clicked', {
                    screen: this.last,
                    world: this.viewport.toWorld(this.last),
                    viewport: this
                }),
                (this.clickedAvailable = !1)),
                e && this.viewport.options.stopPropagation && t.stopPropagation();
        }
        getPointerPosition(t) {
            let i = new e.Point();
            return (
                this.viewport.options.interaction
                    ? this.viewport.options.interaction.mapPositionToPoint(i, t.clientX, t.clientY)
                    : ((i.x = t.clientX), (i.y = t.clientY)),
                i
            );
        }
        handleWheel(t) {
            if (this.viewport.pause || !this.viewport.worldVisible) return;
            const e = this.viewport.toLocal(this.getPointerPosition(t));
            if (
                this.viewport.left <= e.x &&
                e.x <= this.viewport.right &&
                this.viewport.top <= e.y &&
                e.y <= this.viewport.bottom
            ) {
                this.viewport.plugins.wheel(t) && t.preventDefault();
            }
        }
        pause() {
            (this.touches = []), (this.isMouseDown = !1);
        }
        get(t) {
            for (let e of this.touches) if (e.id === t) return e;
            return null;
        }
        remove(t) {
            for (let e = 0; e < this.touches.length; e++)
                if (this.touches[e].id === t) return void this.touches.splice(e, 1);
        }
        count() {
            return (this.isMouseDown ? 1 : 0) + this.touches.length;
        }
    }
    const s = [
        'drag',
        'pinch',
        'wheel',
        'follow',
        'mouse-edges',
        'decelerate',
        'bounce',
        'snap-zoom',
        'clamp-zoom',
        'snap',
        'clamp'
    ];
    class n {
        constructor(t) {
            (this.viewport = t), (this.list = []), (this.plugins = {});
        }
        add(t, e, i = s.length) {
            this.plugins[t] = e;
            const n = s.indexOf(t);
            -1 !== n && s.splice(n, 1), s.splice(i, 0, t), this.sort();
        }
        get(t) {
            return this.plugins[t];
        }
        update(t) {
            for (let e of this.list) e.update(t);
        }
        resize() {
            for (let t of this.list) t.resize();
        }
        reset() {
            for (let t of this.list) t.reset();
        }
        remove(t) {
            this.plugins[t] && ((this.plugins[t] = null), this.viewport.emit(t + '-remove'), this.sort());
        }
        pause(t) {
            this.plugins[t] && this.plugins[t].pause();
        }
        resume(t) {
            this.plugins[t] && this.plugins[t].resume();
        }
        sort() {
            this.list = [];
            for (let t of s) this.plugins[t] && this.list.push(this.plugins[t]);
        }
        down(t) {
            let e = !1;
            for (let i of this.list) i.down(t) && (e = !0);
            return e;
        }
        move(t) {
            let e = !1;
            for (let i of this.viewport.plugins.list) i.move(t) && (e = !0);
            return e;
        }
        up(t) {
            let e = !1;
            for (let i of this.list) i.up(t) && (e = !0);
            return e;
        }
        wheel(t) {
            let e = !1;
            for (let i of this.list) i.wheel(t) && (e = !0);
            return e;
        }
    }
    class h {
        constructor(t) {
            (this.parent = t), (this.paused = !1);
        }
        destroy() {}
        down() {
            return !1;
        }
        move() {
            return !1;
        }
        up() {
            return !1;
        }
        wheel() {
            return !1;
        }
        update() {}
        resize() {}
        reset() {}
        pause() {
            this.paused = !0;
        }
        resume() {
            this.paused = !1;
        }
    }
    const o = {
        direction: 'all',
        wheel: !0,
        wheelScroll: 1,
        reverse: !1,
        clampWheel: !1,
        underflow: 'center',
        factor: 1,
        mouseButtons: 'all',
        keyToPress: null,
        ignoreKeyToPressOnTouch: !1
    };
    class r extends h {
        constructor(t, e = {}) {
            super(t),
                (this.options = Object.assign({}, o, e)),
                (this.moved = !1),
                (this.reverse = this.options.reverse ? 1 : -1),
                (this.xDirection =
                    !this.options.direction || 'all' === this.options.direction || 'x' === this.options.direction),
                (this.yDirection =
                    !this.options.direction || 'all' === this.options.direction || 'y' === this.options.direction),
                (this.keyIsPressed = !1),
                this.parseUnderflow(),
                this.mouseButtons(this.options.mouseButtons),
                this.options.keyToPress && this.handleKeyPresses(this.options.keyToPress);
        }
        handleKeyPresses(t) {
            parent.addEventListener('keydown', e => {
                t.includes(e.code) && (this.keyIsPressed = !0);
            }),
                parent.addEventListener('keyup', e => {
                    t.includes(e.code) && (this.keyIsPressed = !1);
                });
        }
        mouseButtons(t) {
            this.mouse =
                t && 'all' !== t
                    ? [-1 !== t.indexOf('left'), -1 !== t.indexOf('middle'), -1 !== t.indexOf('right')]
                    : [!0, !0, !0];
        }
        parseUnderflow() {
            const t = this.options.underflow.toLowerCase();
            'center' === t
                ? ((this.underflowX = 0), (this.underflowY = 0))
                : ((this.underflowX = -1 !== t.indexOf('left') ? -1 : -1 !== t.indexOf('right') ? 1 : 0),
                  (this.underflowY = -1 !== t.indexOf('top') ? -1 : -1 !== t.indexOf('bottom') ? 1 : 0));
        }
        checkButtons(t) {
            const e = 'mouse' === t.data.pointerType,
                i = this.parent.input.count();
            return !(!(1 === i || (i > 1 && !this.parent.plugins.get('pinch'))) || (e && !this.mouse[t.data.button]));
        }
        checkKeyPress(t) {
            return !!(
                !this.options.keyToPress ||
                this.keyIsPressed ||
                (this.options.ignoreKeyToPressOnTouch && 'touch' === t.data.pointerType)
            );
        }
        down(t) {
            if (!this.paused)
                return this.checkButtons(t) && this.checkKeyPress(t)
                    ? ((this.last = { x: t.data.global.x, y: t.data.global.y }), (this.current = t.data.pointerId), !0)
                    : void (this.last = null);
        }
        get active() {
            return this.moved;
        }
        move(t) {
            if (!this.paused && this.last && this.current === t.data.pointerId) {
                const i = t.data.global.x,
                    s = t.data.global.y,
                    n = this.parent.input.count();
                if (1 === n || (n > 1 && !this.parent.plugins.get('pinch'))) {
                    const t = i - this.last.x,
                        n = s - this.last.y;
                    if (
                        this.moved ||
                        (this.xDirection && this.parent.input.checkThreshold(t)) ||
                        (this.yDirection && this.parent.input.checkThreshold(n))
                    ) {
                        const t = { x: i, y: s };
                        return (
                            this.xDirection && (this.parent.x += (t.x - this.last.x) * this.options.factor),
                            this.yDirection && (this.parent.y += (t.y - this.last.y) * this.options.factor),
                            (this.last = t),
                            this.moved ||
                                this.parent.emit('drag-start', {
                                    screen: new e.Point(this.last.x, this.last.y),
                                    world: this.parent.toWorld(new e.Point(this.last.x, this.last.y)),
                                    viewport: this.parent
                                }),
                            (this.moved = !0),
                            this.parent.emit('moved', { viewport: this.parent, type: 'drag' }),
                            !0
                        );
                    }
                } else this.moved = !1;
            }
        }
        up() {
            if (this.paused) return;
            const t = this.parent.input.touches;
            if (1 === t.length) {
                const e = t[0];
                return (
                    e.last && ((this.last = { x: e.last.x, y: e.last.y }), (this.current = e.id)), (this.moved = !1), !0
                );
            }
            if (this.last && this.moved) {
                const t = new e.Point(this.last.x, this.last.y);
                return (
                    this.parent.emit('drag-end', { screen: t, world: this.parent.toWorld(t), viewport: this.parent }),
                    (this.last = null),
                    (this.moved = !1),
                    !0
                );
            }
        }
        wheel(t) {
            if (!this.paused && this.options.wheel) {
                if (!this.parent.plugins.get('wheel'))
                    return (
                        this.xDirection && (this.parent.x += t.deltaX * this.options.wheelScroll * this.reverse),
                        this.yDirection && (this.parent.y += t.deltaY * this.options.wheelScroll * this.reverse),
                        this.options.clampWheel && this.clamp(),
                        this.parent.emit('wheel-scroll', this.parent),
                        this.parent.emit('moved', { viewport: this.parent, type: 'wheel' }),
                        this.parent.options.passiveWheel || t.preventDefault(),
                        !0
                    );
            }
        }
        resume() {
            (this.last = null), (this.paused = !1);
        }
        clamp() {
            const t = this.parent.plugins.get('decelerate') || {};
            if ('y' !== this.options.clampWheel)
                if (this.parent.screenWorldWidth < this.parent.screenWidth)
                    switch (this.underflowX) {
                        case -1:
                            this.parent.x = 0;
                            break;
                        case 1:
                            this.parent.x = this.parent.screenWidth - this.parent.screenWorldWidth;
                            break;
                        default:
                            this.parent.x = (this.parent.screenWidth - this.parent.screenWorldWidth) / 2;
                    }
                else
                    this.parent.left < 0
                        ? ((this.parent.x = 0), (t.x = 0))
                        : this.parent.right > this.parent.worldWidth &&
                          ((this.parent.x = -this.parent.worldWidth * this.parent.scale.x + this.parent.screenWidth),
                          (t.x = 0));
            if ('x' !== this.options.clampWheel)
                if (this.parent.screenWorldHeight < this.parent.screenHeight)
                    switch (this.underflowY) {
                        case -1:
                            this.parent.y = 0;
                            break;
                        case 1:
                            this.parent.y = this.parent.screenHeight - this.parent.screenWorldHeight;
                            break;
                        default:
                            this.parent.y = (this.parent.screenHeight - this.parent.screenWorldHeight) / 2;
                    }
                else
                    this.parent.top < 0 && ((this.parent.y = 0), (t.y = 0)),
                        this.parent.bottom > this.parent.worldHeight &&
                            ((this.parent.y =
                                -this.parent.worldHeight * this.parent.scale.y + this.parent.screenHeight),
                            (t.y = 0));
        }
    }
    const a = { noDrag: !1, percent: 1, center: null };
    class p extends h {
        constructor(t, e = {}) {
            super(t), (this.options = Object.assign({}, a, e));
        }
        down() {
            if (this.parent.input.count() >= 2) return (this.active = !0), !0;
        }
        move(t) {
            if (this.paused || !this.active) return;
            const e = t.data.global.x,
                i = t.data.global.y,
                s = this.parent.input.touches;
            if (s.length >= 2) {
                const n = s[0],
                    h = s[1],
                    o =
                        n.last && h.last
                            ? Math.sqrt(Math.pow(h.last.x - n.last.x, 2) + Math.pow(h.last.y - n.last.y, 2))
                            : null;
                if (
                    (n.id === t.data.pointerId
                        ? (n.last = { x: e, y: i, data: t.data })
                        : h.id === t.data.pointerId && (h.last = { x: e, y: i, data: t.data }),
                    o)
                ) {
                    let t;
                    const e = { x: n.last.x + (h.last.x - n.last.x) / 2, y: n.last.y + (h.last.y - n.last.y) / 2 };
                    this.options.center || (t = this.parent.toLocal(e));
                    const i =
                        ((Math.sqrt(Math.pow(h.last.x - n.last.x, 2) + Math.pow(h.last.y - n.last.y, 2)) - o) /
                            this.parent.screenWidth) *
                        this.parent.scale.x *
                        this.options.percent;
                    (this.parent.scale.x += i),
                        (this.parent.scale.y += i),
                        this.parent.emit('zoomed', { viewport: this.parent, type: 'pinch' });
                    const s = this.parent.plugins.get('clamp-zoom');
                    if ((s && s.clamp(), this.options.center)) this.parent.moveCenter(this.options.center);
                    else {
                        const i = this.parent.toGlobal(t);
                        (this.parent.x += e.x - i.x),
                            (this.parent.y += e.y - i.y),
                            this.parent.emit('moved', { viewport: this.parent, type: 'pinch' });
                    }
                    !this.options.noDrag &&
                        this.lastCenter &&
                        ((this.parent.x += e.x - this.lastCenter.x),
                        (this.parent.y += e.y - this.lastCenter.y),
                        this.parent.emit('moved', { viewport: this.parent, type: 'pinch' })),
                        (this.lastCenter = e),
                        (this.moved = !0);
                } else this.pinching || (this.parent.emit('pinch-start', this.parent), (this.pinching = !0));
                return !0;
            }
        }
        up() {
            if (this.pinching && this.parent.input.touches.length <= 1)
                return (
                    (this.active = !1),
                    (this.lastCenter = null),
                    (this.pinching = !1),
                    (this.moved = !1),
                    this.parent.emit('pinch-end', this.parent),
                    !0
                );
        }
    }
    const l = { left: !1, right: !1, top: !1, bottom: !1, direction: null, underflow: 'center' };
    class c extends h {
        constructor(t, e = {}) {
            super(t),
                (this.options = Object.assign({}, l, e)),
                this.options.direction &&
                    ((this.options.left = 'x' === this.options.direction || 'all' === this.options.direction || null),
                    (this.options.right = 'x' === this.options.direction || 'all' === this.options.direction || null),
                    (this.options.top = 'y' === this.options.direction || 'all' === this.options.direction || null),
                    (this.options.bottom = 'y' === this.options.direction || 'all' === this.options.direction || null)),
                this.parseUnderflow(),
                (this.last = { x: null, y: null, scaleX: null, scaleY: null }),
                this.update();
        }
        parseUnderflow() {
            const t = this.options.underflow.toLowerCase();
            'none' === t
                ? (this.noUnderflow = !0)
                : 'center' === t
                ? ((this.underflowX = this.underflowY = 0), (this.noUnderflow = !1))
                : ((this.underflowX = -1 !== t.indexOf('left') ? -1 : -1 !== t.indexOf('right') ? 1 : 0),
                  (this.underflowY = -1 !== t.indexOf('top') ? -1 : -1 !== t.indexOf('bottom') ? 1 : 0),
                  (this.noUnderflow = !1));
        }
        move() {
            return this.update(), !1;
        }
        update() {
            if (this.paused) return;
            if (
                this.parent.x === this.last.x &&
                this.parent.y === this.last.y &&
                this.parent.scale.x === this.last.scaleX &&
                this.parent.scale.y === this.last.scaleY
            )
                return;
            const t = { x: this.parent.x, y: this.parent.y },
                e = this.parent.plugins.decelerate || {};
            if (null !== this.options.left || null !== this.options.right) {
                let i = !1;
                if (this.parent.screenWorldWidth < this.parent.screenWidth) {
                    if (!this.noUnderflow)
                        switch (this.underflowX) {
                            case -1:
                                0 !== this.parent.x && ((this.parent.x = 0), (i = !0));
                                break;
                            case 1:
                                this.parent.x !== this.parent.screenWidth - this.parent.screenWorldWidth &&
                                    ((this.parent.x = this.parent.screenWidth - this.parent.screenWorldWidth),
                                    (i = !0));
                                break;
                            default:
                                this.parent.x !== (this.parent.screenWidth - this.parent.screenWorldWidth) / 2 &&
                                    ((this.parent.x = (this.parent.screenWidth - this.parent.screenWorldWidth) / 2),
                                    (i = !0));
                        }
                } else
                    null !== this.options.left &&
                        this.parent.left < (!0 === this.options.left ? 0 : this.options.left) &&
                        ((this.parent.x = -(!0 === this.options.left ? 0 : this.options.left) * this.parent.scale.x),
                        (e.x = 0),
                        (i = !0)),
                        null !== this.options.right &&
                            this.parent.right >
                                (!0 === this.options.right ? this.parent.worldWidth : this.options.right) &&
                            ((this.parent.x =
                                -(!0 === this.options.right ? this.parent.worldWidth : this.options.right) *
                                    this.parent.scale.x +
                                this.parent.screenWidth),
                            (e.x = 0),
                            (i = !0));
                i && this.parent.emit('moved', { viewport: this.parent, original: t, type: 'clamp-x' });
            }
            if (null !== this.options.top || null !== this.options.bottom) {
                let i = !1;
                if (this.parent.screenWorldHeight < this.parent.screenHeight) {
                    if (!this.noUnderflow)
                        switch (this.underflowY) {
                            case -1:
                                0 !== this.parent.y && ((this.parent.y = 0), (i = !0));
                                break;
                            case 1:
                                this.parent.y !== this.parent.screenHeight - this.parent.screenWorldHeight &&
                                    ((this.parent.y = this.parent.screenHeight - this.parent.screenWorldHeight),
                                    (i = !0));
                                break;
                            default:
                                this.parent.y !== (this.parent.screenHeight - this.parent.screenWorldHeight) / 2 &&
                                    ((this.parent.y = (this.parent.screenHeight - this.parent.screenWorldHeight) / 2),
                                    (i = !0));
                        }
                } else
                    null !== this.options.top &&
                        this.parent.top < (!0 === this.options.top ? 0 : this.options.top) &&
                        ((this.parent.y = -(!0 === this.options.top ? 0 : this.options.top) * this.parent.scale.y),
                        (e.y = 0),
                        (i = !0)),
                        null !== this.options.bottom &&
                            this.parent.bottom >
                                (!0 === this.options.bottom ? this.parent.worldHeight : this.options.bottom) &&
                            ((this.parent.y =
                                -(!0 === this.options.bottom ? this.parent.worldHeight : this.options.bottom) *
                                    this.parent.scale.y +
                                this.parent.screenHeight),
                            (e.y = 0),
                            (i = !0));
                i && this.parent.emit('moved', { viewport: this.parent, original: t, type: 'clamp-y' });
            }
            (this.last.x = this.parent.x),
                (this.last.y = this.parent.y),
                (this.last.scaleX = this.parent.scale.x),
                (this.last.scaleY = this.parent.scale.y);
        }
        reset() {
            this.update();
        }
    }
    const d = { minWidth: null, minHeight: null, maxWidth: null, maxHeight: null };
    class u extends h {
        constructor(t, e = {}) {
            super(t), (this.options = Object.assign({}, d, e)), this.clamp();
        }
        resize() {
            this.clamp();
        }
        clamp() {
            if (this.paused) return;
            let t = this.parent.worldScreenWidth,
                e = this.parent.worldScreenHeight;
            if (null !== this.options.minWidth && t < this.options.minWidth) {
                const i = this.parent.scale.x;
                this.parent.fitWidth(this.options.minWidth, !1, !1, !0),
                    (this.parent.scale.y *= this.parent.scale.x / i),
                    (t = this.parent.worldScreenWidth),
                    (e = this.parent.worldScreenHeight),
                    this.parent.emit('zoomed', { viewport: this.parent, type: 'clamp-zoom' });
            }
            if (null !== this.options.maxWidth && t > this.options.maxWidth) {
                const i = this.parent.scale.x;
                this.parent.fitWidth(this.options.maxWidth, !1, !1, !0),
                    (this.parent.scale.y *= this.parent.scale.x / i),
                    (t = this.parent.worldScreenWidth),
                    (e = this.parent.worldScreenHeight),
                    this.parent.emit('zoomed', { viewport: this.parent, type: 'clamp-zoom' });
            }
            if (null !== this.options.minHeight && e < this.options.minHeight) {
                const i = this.parent.scale.y;
                this.parent.fitHeight(this.options.minHeight, !1, !1, !0),
                    (this.parent.scale.x *= this.parent.scale.y / i),
                    (t = this.parent.worldScreenWidth),
                    (e = this.parent.worldScreenHeight),
                    this.parent.emit('zoomed', { viewport: this.parent, type: 'clamp-zoom' });
            }
            if (null !== this.options.maxHeight && e > this.options.maxHeight) {
                const t = this.parent.scale.y;
                this.parent.fitHeight(this.options.maxHeight, !1, !1, !0),
                    (this.parent.scale.x *= this.parent.scale.y / t),
                    this.parent.emit('zoomed', { viewport: this.parent, type: 'clamp-zoom' });
            }
        }
        reset() {
            this.clamp();
        }
    }
    const g = { friction: 0.95, bounce: 0.8, minSpeed: 0.01 };
    class m extends h {
        constructor(t, e = {}) {
            super(t),
                (this.options = Object.assign({}, g, e)),
                (this.saved = []),
                this.reset(),
                this.parent.on('moved', t => this.moved(t));
        }
        destroy() {
            this.parent;
        }
        down() {
            (this.saved = []), (this.x = this.y = !1);
        }
        isActive() {
            return this.x || this.y;
        }
        move() {
            if (this.paused) return;
            const t = this.parent.input.count();
            (1 === t || (t > 1 && !this.parent.plugins.get('pinch'))) &&
                (this.saved.push({ x: this.parent.x, y: this.parent.y, time: performance.now() }),
                this.saved.length > 60 && this.saved.splice(0, 30));
        }
        moved(t) {
            if (this.saved.length) {
                const e = this.saved[this.saved.length - 1];
                'clamp-x' === t.type
                    ? e.x === t.original.x && (e.x = this.parent.x)
                    : 'clamp-y' === t.type && e.y === t.original.y && (e.y = this.parent.y);
            }
        }
        up() {
            if (0 === this.parent.input.count() && this.saved.length) {
                const t = performance.now();
                for (let e of this.saved)
                    if (e.time >= t - 100) {
                        const i = t - e.time;
                        (this.x = (this.parent.x - e.x) / i),
                            (this.y = (this.parent.y - e.y) / i),
                            (this.percentChangeX = this.percentChangeY = this.options.friction);
                        break;
                    }
            }
        }
        activate(t) {
            void 0 !== (t = t || {}).x && ((this.x = t.x), (this.percentChangeX = this.options.friction)),
                void 0 !== t.y && ((this.y = t.y), (this.percentChangeY = this.options.friction));
        }
        update(t) {
            if (this.paused) return;
            let e;
            this.x &&
                ((this.parent.x += this.x * t),
                (this.x *= this.percentChangeX),
                Math.abs(this.x) < this.options.minSpeed && (this.x = 0),
                (e = !0)),
                this.y &&
                    ((this.parent.y += this.y * t),
                    (this.y *= this.percentChangeY),
                    Math.abs(this.y) < this.options.minSpeed && (this.y = 0),
                    (e = !0)),
                e && this.parent.emit('moved', { viewport: this.parent, type: 'decelerate' });
        }
        reset() {
            this.x = this.y = null;
        }
    }
    var w =
        'undefined' != typeof globalThis
            ? globalThis
            : 'undefined' != typeof window
            ? window
            : 'undefined' != typeof global
            ? global
            : 'undefined' != typeof self
            ? self
            : {};
    var f = (function(t, e) {
        return t((e = { exports: {} }), e.exports), e.exports;
    })(function(t, e) {
        (function() {
            var e;
            (function(e) {
                t.exports = e;
            })(
                (e = {
                    linear: function(t, e, i, s) {
                        return (i * t) / s + e;
                    },
                    easeInQuad: function(t, e, i, s) {
                        return i * (t /= s) * t + e;
                    },
                    easeOutQuad: function(t, e, i, s) {
                        return -i * (t /= s) * (t - 2) + e;
                    },
                    easeInOutQuad: function(t, e, i, s) {
                        return (t /= s / 2) < 1 ? (i / 2) * t * t + e : (-i / 2) * (--t * (t - 2) - 1) + e;
                    },
                    easeInCubic: function(t, e, i, s) {
                        return i * (t /= s) * t * t + e;
                    },
                    easeOutCubic: function(t, e, i, s) {
                        return i * ((t = t / s - 1) * t * t + 1) + e;
                    },
                    easeInOutCubic: function(t, e, i, s) {
                        return (t /= s / 2) < 1 ? (i / 2) * t * t * t + e : (i / 2) * ((t -= 2) * t * t + 2) + e;
                    },
                    easeInQuart: function(t, e, i, s) {
                        return i * (t /= s) * t * t * t + e;
                    },
                    easeOutQuart: function(t, e, i, s) {
                        return -i * ((t = t / s - 1) * t * t * t - 1) + e;
                    },
                    easeInOutQuart: function(t, e, i, s) {
                        return (t /= s / 2) < 1
                            ? (i / 2) * t * t * t * t + e
                            : (-i / 2) * ((t -= 2) * t * t * t - 2) + e;
                    },
                    easeInQuint: function(t, e, i, s) {
                        return i * (t /= s) * t * t * t * t + e;
                    },
                    easeOutQuint: function(t, e, i, s) {
                        return i * ((t = t / s - 1) * t * t * t * t + 1) + e;
                    },
                    easeInOutQuint: function(t, e, i, s) {
                        return (t /= s / 2) < 1
                            ? (i / 2) * t * t * t * t * t + e
                            : (i / 2) * ((t -= 2) * t * t * t * t + 2) + e;
                    },
                    easeInSine: function(t, e, i, s) {
                        return -i * Math.cos((t / s) * (Math.PI / 2)) + i + e;
                    },
                    easeOutSine: function(t, e, i, s) {
                        return i * Math.sin((t / s) * (Math.PI / 2)) + e;
                    },
                    easeInOutSine: function(t, e, i, s) {
                        return (-i / 2) * (Math.cos((Math.PI * t) / s) - 1) + e;
                    },
                    easeInExpo: function(t, e, i, s) {
                        return 0 === t ? e : i * Math.pow(2, 10 * (t / s - 1)) + e;
                    },
                    easeOutExpo: function(t, e, i, s) {
                        return t === s ? e + i : i * (1 - Math.pow(2, (-10 * t) / s)) + e;
                    },
                    easeInOutExpo: function(t, e, i, s) {
                        return (t /= s / 2) < 1
                            ? (i / 2) * Math.pow(2, 10 * (t - 1)) + e
                            : (i / 2) * (2 - Math.pow(2, -10 * --t)) + e;
                    },
                    easeInCirc: function(t, e, i, s) {
                        return -i * (Math.sqrt(1 - (t /= s) * t) - 1) + e;
                    },
                    easeOutCirc: function(t, e, i, s) {
                        return i * Math.sqrt(1 - (t = t / s - 1) * t) + e;
                    },
                    easeInOutCirc: function(t, e, i, s) {
                        return (t /= s / 2) < 1
                            ? (-i / 2) * (Math.sqrt(1 - t * t) - 1) + e
                            : (i / 2) * (Math.sqrt(1 - (t -= 2) * t) + 1) + e;
                    },
                    easeInElastic: function(t, e, i, s) {
                        var n, h, o;
                        return (
                            (o = 1.70158),
                            0 === t || (t /= s),
                            (h = 0) || (h = 0.3 * s),
                            (n = i) < Math.abs(i)
                                ? ((n = i), (o = h / 4))
                                : (o = (h / (2 * Math.PI)) * Math.asin(i / n)),
                            -n * Math.pow(2, 10 * (t -= 1)) * Math.sin(((t * s - o) * (2 * Math.PI)) / h) + e
                        );
                    },
                    easeOutElastic: function(t, e, i, s) {
                        var n, h, o;
                        return (
                            (o = 1.70158),
                            0 === t || (t /= s),
                            (h = 0) || (h = 0.3 * s),
                            (n = i) < Math.abs(i)
                                ? ((n = i), (o = h / 4))
                                : (o = (h / (2 * Math.PI)) * Math.asin(i / n)),
                            n * Math.pow(2, -10 * t) * Math.sin(((t * s - o) * (2 * Math.PI)) / h) + i + e
                        );
                    },
                    easeInOutElastic: function(t, e, i, s) {
                        var n, h, o;
                        return (
                            (o = 1.70158),
                            0 === t || (t /= s / 2),
                            (h = 0) || (h = s * (0.3 * 1.5)),
                            (n = i) < Math.abs(i)
                                ? ((n = i), (o = h / 4))
                                : (o = (h / (2 * Math.PI)) * Math.asin(i / n)),
                            t < 1
                                ? n * Math.pow(2, 10 * (t -= 1)) * Math.sin(((t * s - o) * (2 * Math.PI)) / h) * -0.5 +
                                  e
                                : n * Math.pow(2, -10 * (t -= 1)) * Math.sin(((t * s - o) * (2 * Math.PI)) / h) * 0.5 +
                                  i +
                                  e
                        );
                    },
                    easeInBack: function(t, e, i, s, n) {
                        return void 0 === n && (n = 1.70158), i * (t /= s) * t * ((n + 1) * t - n) + e;
                    },
                    easeOutBack: function(t, e, i, s, n) {
                        return void 0 === n && (n = 1.70158), i * ((t = t / s - 1) * t * ((n + 1) * t + n) + 1) + e;
                    },
                    easeInOutBack: function(t, e, i, s, n) {
                        return (
                            void 0 === n && (n = 1.70158),
                            (t /= s / 2) < 1
                                ? (i / 2) * (t * t * ((1 + (n *= 1.525)) * t - n)) + e
                                : (i / 2) * ((t -= 2) * t * ((1 + (n *= 1.525)) * t + n) + 2) + e
                        );
                    },
                    easeInBounce: function(t, i, s, n) {
                        return s - e.easeOutBounce(n - t, 0, s, n) + i;
                    },
                    easeOutBounce: function(t, e, i, s) {
                        return (t /= s) < 1 / 2.75
                            ? i * (7.5625 * t * t) + e
                            : t < 2 / 2.75
                            ? i * (7.5625 * (t -= 1.5 / 2.75) * t + 0.75) + e
                            : t < 2.5 / 2.75
                            ? i * (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375) + e
                            : i * (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375) + e;
                    },
                    easeInOutBounce: function(t, i, s, n) {
                        return t < n / 2
                            ? 0.5 * e.easeInBounce(2 * t, 0, s, n) + i
                            : 0.5 * e.easeOutBounce(2 * t - n, 0, s, n) + 0.5 * s + i;
                    }
                })
            );
        }.call(w));
    });
    function y(t, e) {
        return t ? ('function' == typeof t ? t : 'string' == typeof t ? f[t] : void 0) : f[e];
    }
    const x = { sides: 'all', friction: 0.5, time: 150, ease: 'easeInOutSine', underflow: 'center', bounceBox: null };
    class v extends h {
        constructor(t, e = {}) {
            super(t),
                (this.options = Object.assign({}, x, e)),
                (this.ease = y(this.options.ease, 'easeInOutSine')),
                this.options.sides &&
                    ('all' === this.options.sides
                        ? (this.top = this.bottom = this.left = this.right = !0)
                        : 'horizontal' === this.options.sides
                        ? (this.right = this.left = !0)
                        : 'vertical' === this.options.sides
                        ? (this.top = this.bottom = !0)
                        : ((this.top = -1 !== this.options.sides.indexOf('top')),
                          (this.bottom = -1 !== this.options.sides.indexOf('bottom')),
                          (this.left = -1 !== this.options.sides.indexOf('left')),
                          (this.right = -1 !== this.options.sides.indexOf('right')))),
                this.parseUnderflow(),
                (this.last = {}),
                this.reset();
        }
        parseUnderflow() {
            const t = this.options.underflow.toLowerCase();
            'center' === t
                ? ((this.underflowX = 0), (this.underflowY = 0))
                : ((this.underflowX = -1 !== t.indexOf('left') ? -1 : -1 !== t.indexOf('right') ? 1 : 0),
                  (this.underflowY = -1 !== t.indexOf('top') ? -1 : -1 !== t.indexOf('bottom') ? 1 : 0));
        }
        isActive() {
            return null !== this.toX || null !== this.toY;
        }
        down() {
            this.toX = this.toY = null;
        }
        up() {
            this.bounce();
        }
        update(t) {
            if (!this.paused) {
                if ((this.bounce(), this.toX)) {
                    const e = this.toX;
                    (e.time += t),
                        this.parent.emit('moved', { viewport: this.parent, type: 'bounce-x' }),
                        e.time >= this.options.time
                            ? ((this.parent.x = e.end),
                              (this.toX = null),
                              this.parent.emit('bounce-x-end', this.parent))
                            : (this.parent.x = this.ease(e.time, e.start, e.delta, this.options.time));
                }
                if (this.toY) {
                    const e = this.toY;
                    (e.time += t),
                        this.parent.emit('moved', { viewport: this.parent, type: 'bounce-y' }),
                        e.time >= this.options.time
                            ? ((this.parent.y = e.end),
                              (this.toY = null),
                              this.parent.emit('bounce-y-end', this.parent))
                            : (this.parent.y = this.ease(e.time, e.start, e.delta, this.options.time));
                }
            }
        }
        calcUnderflowX() {
            let t;
            switch (this.underflowX) {
                case -1:
                    t = 0;
                    break;
                case 1:
                    t = this.parent.screenWidth - this.parent.screenWorldWidth;
                    break;
                default:
                    t = (this.parent.screenWidth - this.parent.screenWorldWidth) / 2;
            }
            return t;
        }
        calcUnderflowY() {
            let t;
            switch (this.underflowY) {
                case -1:
                    t = 0;
                    break;
                case 1:
                    t = this.parent.screenHeight - this.parent.screenWorldHeight;
                    break;
                default:
                    t = (this.parent.screenHeight - this.parent.screenWorldHeight) / 2;
            }
            return t;
        }
        oob() {
            const t = this.options.bounceBox;
            if (t) {
                const i = void 0 === t.x ? 0 : t.x,
                    s = void 0 === t.y ? 0 : t.y,
                    n = void 0 === t.width ? this.parent.worldWidth : t.width,
                    h = void 0 === t.height ? this.parent.worldHeight : t.height;
                return {
                    left: this.parent.left < i,
                    right: this.parent.right > n,
                    top: this.parent.top < s,
                    bottom: this.parent.bottom > h,
                    topLeft: new e.Point(i * this.parent.scale.x, s * this.parent.scale.y),
                    bottomRight: new e.Point(
                        n * this.parent.scale.x - this.parent.screenWidth,
                        h * this.parent.scale.y - this.parent.screenHeight
                    )
                };
            }
            return {
                left: this.parent.left < 0,
                right: this.parent.right > this.parent.worldWidth,
                top: this.parent.top < 0,
                bottom: this.parent.bottom > this.parent.worldHeight,
                topLeft: new e.Point(0, 0),
                bottomRight: new e.Point(
                    this.parent.worldWidth * this.parent.scale.x - this.parent.screenWidth,
                    this.parent.worldHeight * this.parent.scale.y - this.parent.screenHeight
                )
            };
        }
        bounce() {
            if (this.paused) return;
            let t,
                e = this.parent.plugins.get('decelerate');
            e &&
                (e.x || e.y) &&
                ((e.x && e.percentChangeX === e.options.friction) ||
                    (e.y && e.percentChangeY === e.options.friction)) &&
                ((((t = this.oob()).left && this.left) || (t.right && this.right)) &&
                    (e.percentChangeX = this.options.friction),
                ((t.top && this.top) || (t.bottom && this.bottom)) && (e.percentChangeY = this.options.friction));
            const i = this.parent.plugins.get('drag') || {},
                s = this.parent.plugins.get('pinch') || {};
            if (((e = e || {}), !(i.active || s.active || (this.toX && this.toY) || (e.x && e.y)))) {
                const i = (t = t || this.oob()).topLeft,
                    s = t.bottomRight;
                if (!this.toX && !e.x) {
                    let e = null;
                    t.left && this.left
                        ? (e = this.parent.screenWorldWidth < this.parent.screenWidth ? this.calcUnderflowX() : -i.x)
                        : t.right &&
                          this.right &&
                          (e = this.parent.screenWorldWidth < this.parent.screenWidth ? this.calcUnderflowX() : -s.x),
                        null !== e &&
                            this.parent.x !== e &&
                            ((this.toX = { time: 0, start: this.parent.x, delta: e - this.parent.x, end: e }),
                            this.parent.emit('bounce-x-start', this.parent));
                }
                if (!this.toY && !e.y) {
                    let e = null;
                    t.top && this.top
                        ? (e = this.parent.screenWorldHeight < this.parent.screenHeight ? this.calcUnderflowY() : -i.y)
                        : t.bottom &&
                          this.bottom &&
                          (e = this.parent.screenWorldHeight < this.parent.screenHeight ? this.calcUnderflowY() : -s.y),
                        null !== e &&
                            this.parent.y !== e &&
                            ((this.toY = { time: 0, start: this.parent.y, delta: e - this.parent.y, end: e }),
                            this.parent.emit('bounce-y-start', this.parent));
                }
            }
        }
        reset() {
            (this.toX = this.toY = null), this.bounce();
        }
    }
    const b = {
        topLeft: !1,
        friction: 0.8,
        time: 1e3,
        ease: 'easeInOutSine',
        interrupt: !0,
        removeOnComplete: !1,
        removeOnInterrupt: !1,
        forceStart: !1
    };
    class W extends h {
        constructor(t, e, i, s = {}) {
            super(t),
                (this.options = Object.assign({}, b, s)),
                (this.ease = y(s.ease, 'easeInOutSine')),
                (this.x = e),
                (this.y = i),
                this.options.forceStart && this.snapStart();
        }
        snapStart() {
            (this.percent = 0), (this.snapping = { time: 0 });
            const t = this.options.topLeft ? this.parent.corner : this.parent.center;
            (this.deltaX = this.x - t.x),
                (this.deltaY = this.y - t.y),
                (this.startX = t.x),
                (this.startY = t.y),
                this.parent.emit('snap-start', this.parent);
        }
        wheel() {
            this.options.removeOnInterrupt && this.parent.plugins.remove('snap');
        }
        down() {
            this.options.removeOnInterrupt
                ? this.parent.plugins.remove('snap')
                : this.options.interrupt && (this.snapping = null);
        }
        up() {
            if (0 === this.parent.input.count()) {
                const t = this.parent.plugins.get('decelerate');
                t && (t.x || t.y) && (t.percentChangeX = t.percentChangeY = this.options.friction);
            }
        }
        update(t) {
            if (!(this.paused || (this.options.interrupt && 0 !== this.parent.input.count())))
                if (this.snapping) {
                    const e = this.snapping;
                    let i, s, n;
                    if (((e.time += t), e.time > this.options.time))
                        (i = !0), (s = this.startX + this.deltaX), (n = this.startY + this.deltaY);
                    else {
                        const t = this.ease(e.time, 0, 1, this.options.time);
                        (s = this.startX + this.deltaX * t), (n = this.startY + this.deltaY * t);
                    }
                    this.options.topLeft ? this.parent.moveCorner(s, n) : this.parent.moveCenter(s, n),
                        this.parent.emit('moved', { viewport: this.parent, type: 'snap' }),
                        i &&
                            (this.options.removeOnComplete && this.parent.plugins.remove('snap'),
                            this.parent.emit('snap-end', this.parent),
                            (this.snapping = null));
                } else {
                    const t = this.options.topLeft ? this.parent.corner : this.parent.center;
                    (t.x === this.x && t.y === this.y) || this.snapStart();
                }
        }
    }
    const H = {
        width: 0,
        height: 0,
        time: 1e3,
        ease: 'easeInOutSine',
        center: null,
        interrupt: !0,
        removeOnComplete: !1,
        removeOnInterrupts: !1,
        forceStart: !1,
        noMove: !1
    };
    class M extends h {
        constructor(t, e = {}) {
            super(t),
                (this.options = Object.assign({}, H, e)),
                (this.ease = y(this.options.ease)),
                this.options.width > 0 && (this.xScale = t.screenWidth / this.options.width),
                this.options.height > 0 && (this.yScale = t.screenHeight / this.options.height),
                (this.xIndependent = !!this.xScale),
                (this.yIndependent = !!this.yScale),
                (this.xScale = this.xIndependent ? this.xScale : this.yScale),
                (this.yScale = this.yIndependent ? this.yScale : this.xScale),
                0 === this.options.time
                    ? ((t.container.scale.x = this.xScale),
                      (t.container.scale.y = this.yScale),
                      this.options.removeOnComplete && this.parent.plugins.remove('snap-zoom'))
                    : e.forceStart && this.createSnapping();
        }
        createSnapping() {
            const t = this.parent.scale;
            (this.snapping = {
                time: 0,
                startX: t.x,
                startY: t.y,
                deltaX: this.xScale - t.x,
                deltaY: this.yScale - t.y
            }),
                this.parent.emit('snap-zoom-start', this.parent);
        }
        resize() {
            (this.snapping = null),
                this.options.width > 0 && (this.xScale = this.parent.screenWidth / this.options.width),
                this.options.height > 0 && (this.yScale = this.parent.screenHeight / this.options.height),
                (this.xScale = this.xIndependent ? this.xScale : this.yScale),
                (this.yScale = this.yIndependent ? this.yScale : this.xScale);
        }
        wheel() {
            this.options.removeOnInterrupt && this.parent.plugins.remove('snap-zoom');
        }
        down() {
            this.options.removeOnInterrupt
                ? this.parent.plugins.remove('snap-zoom')
                : this.options.interrupt && (this.snapping = null);
        }
        update(t) {
            if (this.paused) return;
            if (this.options.interrupt && 0 !== this.parent.input.count()) return;
            let e;
            if ((this.options.center || this.options.noMove || (e = this.parent.center), this.snapping)) {
                if (this.snapping) {
                    const i = this.snapping;
                    if (((i.time += t), i.time >= this.options.time))
                        this.parent.scale.set(this.xScale, this.yScale),
                            this.options.removeOnComplete && this.parent.plugins.remove('snap-zoom'),
                            this.parent.emit('snap-zoom-end', this.parent),
                            (this.snapping = null);
                    else {
                        const t = this.snapping;
                        (this.parent.scale.x = this.ease(t.time, t.startX, t.deltaX, this.options.time)),
                            (this.parent.scale.y = this.ease(t.time, t.startY, t.deltaY, this.options.time));
                    }
                    const s = this.parent.plugins.get('clamp-zoom');
                    s && s.clamp(),
                        this.options.noMove ||
                            (this.options.center
                                ? this.parent.moveCenter(this.options.center)
                                : this.parent.moveCenter(e));
                }
            } else (this.parent.scale.x === this.xScale && this.parent.scale.y === this.yScale) || this.createSnapping();
        }
        resume() {
            (this.snapping = null), super.resume();
        }
    }
    const S = { speed: 0, acceleration: null, radius: null };
    class O extends h {
        constructor(t, e, i = {}) {
            super(t), (this.target = e), (this.options = Object.assign({}, S, i)), (this.velocity = { x: 0, y: 0 });
        }
        update(t) {
            if (this.paused) return;
            const e = this.parent.center;
            let i = this.target.x,
                s = this.target.y;
            if (this.options.radius) {
                if (
                    !(
                        Math.sqrt(Math.pow(this.target.y - e.y, 2) + Math.pow(this.target.x - e.x, 2)) >
                        this.options.radius
                    )
                )
                    return;
                {
                    const t = Math.atan2(this.target.y - e.y, this.target.x - e.x);
                    (i = this.target.x - Math.cos(t) * this.options.radius),
                        (s = this.target.y - Math.sin(t) * this.options.radius);
                }
            }
            const n = i - e.x,
                h = s - e.y;
            if (n || h)
                if (this.options.speed)
                    if (this.options.acceleration) {
                        const o = Math.atan2(s - e.y, i - e.x),
                            r = Math.sqrt(Math.pow(n, 2) + Math.pow(h, 2));
                        if (r) {
                            const a =
                                (Math.pow(this.velocity.x, 2) + Math.pow(this.velocity.y, 2)) /
                                (2 * this.options.acceleration);
                            this.velocity =
                                r > a
                                    ? {
                                          x: Math.min(
                                              this.velocity.x + this.options.acceleration * t,
                                              this.options.speed
                                          ),
                                          y: Math.min(
                                              this.velocity.y + this.options.acceleration * t,
                                              this.options.speed
                                          )
                                      }
                                    : {
                                          x: Math.max(
                                              this.velocity.x - this.options.acceleration * this.options.speed,
                                              0
                                          ),
                                          y: Math.max(
                                              this.velocity.y - this.options.acceleration * this.options.speed,
                                              0
                                          )
                                      };
                            const p = Math.cos(o) * this.velocity.x,
                                l = Math.sin(o) * this.velocity.y,
                                c = Math.abs(p) > Math.abs(n) ? i : e.x + p,
                                d = Math.abs(l) > Math.abs(h) ? s : e.y + l;
                            this.parent.moveCenter(c, d),
                                this.parent.emit('moved', { viewport: this.parent, type: 'follow' });
                        }
                    } else {
                        const t = Math.atan2(s - e.y, i - e.x),
                            o = Math.cos(t) * this.options.speed,
                            r = Math.sin(t) * this.options.speed,
                            a = Math.abs(o) > Math.abs(n) ? i : e.x + o,
                            p = Math.abs(r) > Math.abs(h) ? s : e.y + r;
                        this.parent.moveCenter(a, p),
                            this.parent.emit('moved', { viewport: this.parent, type: 'follow' });
                    }
                else this.parent.moveCenter(i, s), this.parent.emit('moved', { viewport: this.parent, type: 'follow' });
        }
    }
    const z = { percent: 0.1, smooth: !1, interrupt: !0, reverse: !1, center: null };
    class I extends h {
        constructor(t, e = {}) {
            super(t), (this.options = Object.assign({}, z, e));
        }
        down() {
            this.options.interrupt && (this.smoothing = null);
        }
        update() {
            if (this.smoothing) {
                const t = this.smoothingCenter,
                    e = this.smoothing;
                let i;
                this.options.center || (i = this.parent.toLocal(t)),
                    (this.parent.scale.x += e.x),
                    (this.parent.scale.y += e.y),
                    this.parent.emit('zoomed', { viewport: this.parent, type: 'wheel' });
                const s = this.parent.plugins.get('clamp-zoom');
                if ((s && s.clamp(), this.options.center)) this.parent.moveCenter(this.options.center);
                else {
                    const e = this.parent.toGlobal(i);
                    (this.parent.x += t.x - e.x), (this.parent.y += t.y - e.y);
                }
                this.smoothingCount++, this.smoothingCount >= this.options.smooth && (this.smoothing = null);
            }
        }
        wheel(t) {
            if (this.paused) return;
            let e = this.parent.input.getPointerPosition(t);
            const i = ((this.options.reverse ? -1 : 1) * -t.deltaY * (t.deltaMode ? 120 : 1)) / 500,
                s = Math.pow(2, (1 + this.options.percent) * i);
            if (this.options.smooth) {
                const t = {
                    x: this.smoothing ? this.smoothing.x * (this.options.smooth - this.smoothingCount) : 0,
                    y: this.smoothing ? this.smoothing.y * (this.options.smooth - this.smoothingCount) : 0
                };
                (this.smoothing = {
                    x: ((this.parent.scale.x + t.x) * s - this.parent.scale.x) / this.options.smooth,
                    y: ((this.parent.scale.y + t.y) * s - this.parent.scale.y) / this.options.smooth
                }),
                    (this.smoothingCount = 0),
                    (this.smoothingCenter = e);
            } else {
                let t;
                this.options.center || (t = this.parent.toLocal(e)),
                    (this.parent.scale.x *= s),
                    (this.parent.scale.y *= s),
                    this.parent.emit('zoomed', { viewport: this.parent, type: 'wheel' });
                const i = this.parent.plugins.get('clamp-zoom');
                if ((i && i.clamp(), this.options.center)) this.parent.moveCenter(this.options.center);
                else {
                    const i = this.parent.toGlobal(t);
                    (this.parent.x += e.x - i.x), (this.parent.y += e.y - i.y);
                }
            }
            return (
                this.parent.emit('moved', { viewport: this.parent, type: 'wheel' }),
                this.parent.emit('wheel', {
                    wheel: { dx: t.deltaX, dy: t.deltaY, dz: t.deltaZ },
                    event: t,
                    viewport: this.parent
                }),
                !this.parent.options.passiveWheel || void 0
            );
        }
    }
    const C = {
        radius: null,
        distance: null,
        top: null,
        bottom: null,
        left: null,
        right: null,
        speed: 8,
        reverse: !1,
        noDecelerate: !1,
        linear: !1,
        allowButtons: !1
    };
    class k extends h {
        constructor(t, e = {}) {
            super(t),
                (this.options = Object.assign({}, C, e)),
                (this.reverse = this.options.reverse ? 1 : -1),
                (this.radiusSquared = Math.pow(this.options.radius, 2)),
                this.resize();
        }
        resize() {
            const t = this.options.distance;
            null !== t
                ? ((this.left = t),
                  (this.top = t),
                  (this.right = this.parent.worldScreenWidth - t),
                  (this.bottom = this.parent.worldScreenHeight - t))
                : this.radius ||
                  ((this.left = this.options.left),
                  (this.top = this.options.top),
                  (this.right = null === this.options.right ? null : this.parent.worldScreenWidth - this.options.right),
                  (this.bottom =
                      null === this.options.bottom ? null : this.parent.worldScreenHeight - this.options.bottom));
        }
        down() {
            this.options.allowButtons || (this.horizontal = this.vertical = null);
        }
        move(t) {
            if (
                ('mouse' !== t.data.pointerType && 1 !== t.data.identifier) ||
                (!this.options.allowButtons && 0 !== t.data.buttons)
            )
                return;
            const e = t.data.global.x,
                i = t.data.global.y;
            if (this.radiusSquared) {
                const t = this.parent.toScreen(this.parent.center);
                if (Math.pow(t.x - e, 2) + Math.pow(t.y - i, 2) >= this.radiusSquared) {
                    const s = Math.atan2(t.y - i, t.x - e);
                    this.options.linear
                        ? ((this.horizontal = Math.round(Math.cos(s)) * this.options.speed * this.reverse * 0.06),
                          (this.vertical = Math.round(Math.sin(s)) * this.options.speed * this.reverse * 0.06))
                        : ((this.horizontal = Math.cos(s) * this.options.speed * this.reverse * 0.06),
                          (this.vertical = Math.sin(s) * this.options.speed * this.reverse * 0.06));
                } else
                    this.horizontal && this.decelerateHorizontal(),
                        this.vertical && this.decelerateVertical(),
                        (this.horizontal = this.vertical = 0);
            } else null !== this.left && e < this.left ? (this.horizontal = 1 * this.reverse * this.options.speed * 0.06) : null !== this.right && e > this.right ? (this.horizontal = -1 * this.reverse * this.options.speed * 0.06) : (this.decelerateHorizontal(), (this.horizontal = 0)), null !== this.top && i < this.top ? (this.vertical = 1 * this.reverse * this.options.speed * 0.06) : null !== this.bottom && i > this.bottom ? (this.vertical = -1 * this.reverse * this.options.speed * 0.06) : (this.decelerateVertical(), (this.vertical = 0));
        }
        decelerateHorizontal() {
            const t = this.parent.plugins.get('decelerate');
            this.horizontal &&
                t &&
                !this.options.noDecelerate &&
                t.activate({ x: (this.horizontal * this.options.speed * this.reverse) / (1e3 / 60) });
        }
        decelerateVertical() {
            const t = this.parent.plugins.get('decelerate');
            this.vertical &&
                t &&
                !this.options.noDecelerate &&
                t.activate({ y: (this.vertical * this.options.speed * this.reverse) / (1e3 / 60) });
        }
        up() {
            this.horizontal && this.decelerateHorizontal(),
                this.vertical && this.decelerateVertical(),
                (this.horizontal = this.vertical = null);
        }
        update() {
            if (!this.paused && (this.horizontal || this.vertical)) {
                const t = this.parent.center;
                this.horizontal && (t.x += this.horizontal * this.options.speed),
                    this.vertical && (t.y += this.vertical * this.options.speed),
                    this.parent.moveCenter(t),
                    this.parent.emit('moved', { viewport: this.parent, type: 'mouse-edges' });
            }
        }
    }
    const P = {
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        worldWidth: null,
        worldHeight: null,
        threshold: 5,
        passiveWheel: !0,
        stopPropagation: !1,
        forceHitArea: null,
        noTicker: !1,
        interaction: null,
        disableOnContextMenu: !1
    };
    (t.Plugin = h),
        (t.Viewport = class extends e.Container {
            constructor(t = {}) {
                if ((super(), (this.options = Object.assign({}, P, t)), t.ticker)) this.options.ticker = t.ticker;
                else {
                    let i;
                    const s = e;
                    (i = parseInt(/^(\d+)\./.exec(e.VERSION)[1]) < 5 ? s.ticker.shared : s.Ticker.shared),
                        (this.options.ticker = t.ticker || i);
                }
                (this.screenWidth = this.options.screenWidth),
                    (this.screenHeight = this.options.screenHeight),
                    (this._worldWidth = this.options.worldWidth),
                    (this._worldHeight = this.options.worldHeight),
                    (this.forceHitArea = this.options.forceHitArea),
                    (this.threshold = this.options.threshold),
                    (this.options.divWheel = this.options.divWheel || document.body),
                    this.options.disableOnContextMenu &&
                        (this.options.divWheel.oncontextmenu = t => t.preventDefault()),
                    this.options.noTicker ||
                        ((this.tickerFunction = () => this.update(this.options.ticker.elapsedMS)),
                        this.options.ticker.add(this.tickerFunction)),
                    (this.input = new i(this)),
                    (this.plugins = new n(this));
            }
            destroy(t) {
                this.options.noTicker || this.options.ticker.remove(this.tickerFunction),
                    this.input.destroy(),
                    super.destroy(t);
            }
            update(t) {
                this.pause ||
                    (this.plugins.update(t),
                    this.lastViewport &&
                        (this.lastViewport.x !== this.x || this.lastViewport.y !== this.y
                            ? (this.moving = !0)
                            : this.moving && (this.emit('moved-end', this), (this.moving = !1)),
                        this.lastViewport.scaleX !== this.scale.x || this.lastViewport.scaleY !== this.scale.y
                            ? (this.zooming = !0)
                            : this.zooming && (this.emit('zoomed-end', this), (this.zooming = !1))),
                    this.forceHitArea ||
                        ((this._hitAreaDefault = new e.Rectangle(
                            this.left,
                            this.top,
                            this.worldScreenWidth,
                            this.worldScreenHeight
                        )),
                        (this.hitArea = this._hitAreaDefault)),
                    (this._dirty =
                        this._dirty ||
                        !this.lastViewport ||
                        this.lastViewport.x !== this.x ||
                        this.lastViewport.y !== this.y ||
                        this.lastViewport.scaleX !== this.scale.x ||
                        this.lastViewport.scaleY !== this.scale.y),
                    (this.lastViewport = { x: this.x, y: this.y, scaleX: this.scale.x, scaleY: this.scale.y }),
                    this.emit('frame-end', this));
            }
            resize(t = window.innerWidth, e = window.innerHeight, i, s) {
                (this.screenWidth = t),
                    (this.screenHeight = e),
                    void 0 !== i && (this._worldWidth = i),
                    void 0 !== s && (this._worldHeight = s),
                    this.plugins.resize();
            }
            get worldWidth() {
                return this._worldWidth ? this._worldWidth : this.width / this.scale.x;
            }
            set worldWidth(t) {
                (this._worldWidth = t), this.plugins.resize();
            }
            get worldHeight() {
                return this._worldHeight ? this._worldHeight : this.height / this.scale.y;
            }
            set worldHeight(t) {
                (this._worldHeight = t), this.plugins.resize();
            }
            getVisibleBounds() {
                return new e.Rectangle(this.left, this.top, this.worldScreenWidth, this.worldScreenHeight);
            }
            toWorld(t, i) {
                return 2 === arguments.length ? this.toLocal(new e.Point(t, i)) : this.toLocal(t);
            }
            toScreen(t, i) {
                return 2 === arguments.length ? this.toGlobal(new e.Point(t, i)) : this.toGlobal(t);
            }
            get worldScreenWidth() {
                return this.screenWidth / this.scale.x;
            }
            get worldScreenHeight() {
                return this.screenHeight / this.scale.y;
            }
            get screenWorldWidth() {
                return this.worldWidth * this.scale.x;
            }
            get screenWorldHeight() {
                return this.worldHeight * this.scale.y;
            }
            get center() {
                return new e.Point(
                    this.worldScreenWidth / 2 - this.x / this.scale.x,
                    this.worldScreenHeight / 2 - this.y / this.scale.y
                );
            }
            set center(t) {
                this.moveCenter(t);
            }
            moveCenter() {
                let t, e;
                return (
                    isNaN(arguments[0])
                        ? ((t = arguments[0].x), (e = arguments[0].y))
                        : ((t = arguments[0]), (e = arguments[1])),
                    this.position.set(
                        (this.worldScreenWidth / 2 - t) * this.scale.x,
                        (this.worldScreenHeight / 2 - e) * this.scale.y
                    ),
                    this.plugins.reset(),
                    (this.dirty = !0),
                    this
                );
            }
            get corner() {
                return new e.Point(-this.x / this.scale.x, -this.y / this.scale.y);
            }
            set corner(t) {
                this.moveCorner(t);
            }
            moveCorner(t, e) {
                return (
                    1 === arguments.length
                        ? this.position.set(-t.x * this.scale.x, -t.y * this.scale.y)
                        : this.position.set(-t * this.scale.x, -e * this.scale.y),
                    this.plugins.reset(),
                    this
                );
            }
            fitWidth(t, e, i = !0, s) {
                let n;
                e && (n = this.center), (this.scale.x = this.screenWidth / t), i && (this.scale.y = this.scale.x);
                const h = this.plugins.get('clamp-zoom');
                return !s && h && h.clamp(), e && this.moveCenter(n), this;
            }
            fitHeight(t, e, i = !0, s) {
                let n;
                e && (n = this.center), (this.scale.y = this.screenHeight / t), i && (this.scale.x = this.scale.y);
                const h = this.plugins.get('clamp-zoom');
                return !s && h && h.clamp(), e && this.moveCenter(n), this;
            }
            fitWorld(t) {
                let e;
                t && (e = this.center),
                    (this.scale.x = this.screenWidth / this.worldWidth),
                    (this.scale.y = this.screenHeight / this.worldHeight),
                    this.scale.x < this.scale.y ? (this.scale.y = this.scale.x) : (this.scale.x = this.scale.y);
                const i = this.plugins.get('clamp-zoom');
                return i && i.clamp(), t && this.moveCenter(e), this;
            }
            fit(t, e = this.worldWidth, i = this.worldHeight) {
                let s;
                t && (s = this.center),
                    (this.scale.x = this.screenWidth / e),
                    (this.scale.y = this.screenHeight / i),
                    this.scale.x < this.scale.y ? (this.scale.y = this.scale.x) : (this.scale.x = this.scale.y);
                const n = this.plugins.get('clamp-zoom');
                return n && n.clamp(), t && this.moveCenter(s), this;
            }
            setZoom(t, e) {
                let i;
                e && (i = this.center), this.scale.set(t);
                const s = this.plugins.get('clamp-zoom');
                return s && s.clamp(), e && this.moveCenter(i), this;
            }
            zoomPercent(t, e) {
                return this.setZoom(this.scale.x + this.scale.x * t, e);
            }
            zoom(t, e) {
                return this.fitWidth(t + this.worldScreenWidth, e), this;
            }
            set scaled(t) {
                this.setZoom(t, !0);
            }
            get scaled() {
                return this.scale.x;
            }
            snapZoom(t) {
                return this.plugins.add('snap-zoom', new M(this, t)), this;
            }
            OOB() {
                return {
                    left: this.left < 0,
                    right: this.right > this.worldWidth,
                    top: this.top < 0,
                    bottom: this.bottom > this._worldHeight,
                    cornerPoint: new e.Point(
                        this.worldWidth * this.scale.x - this.screenWidth,
                        this.worldHeight * this.scale.y - this.screenHeight
                    )
                };
            }
            get right() {
                return -this.x / this.scale.x + this.worldScreenWidth;
            }
            set right(t) {
                (this.x = -t * this.scale.x + this.screenWidth), this.plugins.reset();
            }
            get left() {
                return -this.x / this.scale.x;
            }
            set left(t) {
                (this.x = -t * this.scale.x), this.plugins.reset();
            }
            get top() {
                return -this.y / this.scale.y;
            }
            set top(t) {
                (this.y = -t * this.scale.y), this.plugins.reset();
            }
            get bottom() {
                return -this.y / this.scale.y + this.worldScreenHeight;
            }
            set bottom(t) {
                (this.y = -t * this.scale.y + this.screenHeight), this.plugins.reset();
            }
            get dirty() {
                return this._dirty;
            }
            set dirty(t) {
                this._dirty = t;
            }
            get forceHitArea() {
                return this._forceHitArea;
            }
            set forceHitArea(t) {
                t
                    ? ((this._forceHitArea = t), (this.hitArea = t))
                    : ((this._forceHitArea = null),
                      (this.hitArea = new e.Rectangle(0, 0, this.worldWidth, this.worldHeight)));
            }
            drag(t) {
                return this.plugins.add('drag', new r(this, t)), this;
            }
            clamp(t) {
                return this.plugins.add('clamp', new c(this, t)), this;
            }
            decelerate(t) {
                return this.plugins.add('decelerate', new m(this, t)), this;
            }
            bounce(t) {
                return this.plugins.add('bounce', new v(this, t)), this;
            }
            pinch(t) {
                return this.plugins.add('pinch', new p(this, t)), this;
            }
            snap(t, e, i) {
                return this.plugins.add('snap', new W(this, t, e, i)), this;
            }
            follow(t, e) {
                return this.plugins.add('follow', new O(this, t, e)), this;
            }
            wheel(t) {
                return this.plugins.add('wheel', new I(this, t)), this;
            }
            clampZoom(t) {
                return this.plugins.add('clamp-zoom', new u(this, t)), this;
            }
            mouseEdges(t) {
                return this.plugins.add('mouse-edges', new k(this, t)), this;
            }
            get pause() {
                return this._pause;
            }
            set pause(t) {
                (this._pause = t),
                    (this.lastViewport = null),
                    (this.moving = !1),
                    (this.zooming = !1),
                    t && this.input.pause();
            }
            ensureVisible(t, e, i, s) {
                t < this.left ? (this.left = t) : t + i > this.right && (this.right = t + i),
                    e < this.top ? (this.top = e) : e + s > this.bottom && (this.bottom = e + s);
            }
        }),
        Object.defineProperty(t, '__esModule', { value: !0 });
});
//# sourceMappingURL=viewport.js.map
