import { TouchMouseButton } from './touchmousebutton';
export class TouchJoystickHandler {
    constructor(stickid, maxdistance, deadzone, fixed = true, button = -1, baseid = null) {
        this.isFixed = true;
        this.touchId = null;
        this.pointerId = null;
        this.dragStart = null;
        this.mouseButton = -1;
        this.maxDistance = 48;
        this.deadZone = 2;
        this.xvalue = 0;
        this.yvalue = 0;
        this.stick = null;
        this.base = null;
        this.active = false;
        this.enabled = true;
        this.updateElements = true;
        this.preventDefault = true;
        this.stopPropagation = true;
        this.baseElementOpacity = "1";
        this.stickElementOpacity = "1";
        this.onHandleDown = null;
        this.onHandleMove = null;
        this.onHandleUp = null;
        this.isFixed = fixed;
        this.deadZone = deadzone;
        this.maxDistance = maxdistance;
        this.mouseButton = button;
        if (baseid)
            this.base = document.getElementById(baseid);
        if (stickid)
            this.stick = document.getElementById(stickid);
        if (this.base)
            this.base.oncontextmenu = (e) => false;
        if (this.stick)
            this.stick.oncontextmenu = (e) => false;
        if (this.isFixed) {
            if (this.stick) {
                this.stick.addEventListener("pointerdown", (e) => this.handleDown(e));
            }
            else {
                console.warn("Failed to locate fixed joystick element: " + stickid);
            }
        }
        else {
            if (this.base)
                this.base.style.opacity = "0";
            if (this.stick)
                this.stick.style.opacity = "0";
            document.documentElement.addEventListener("pointerdown", (e) => this.handleDown(e));
        }
        document.documentElement.addEventListener("pointermove", (e) => this.handleMove(e), { passive: false });
        document.documentElement.addEventListener("pointerup", (e) => this.handleUp(e));
    }
    dispose() {
    }
    isActive() { return this.active; }
    getValueX() { return this.xvalue; }
    getValueY() { return this.yvalue; }
    getMouseButton() { return this.mouseButton; }
    getBaseElement() { return this.base; }
    getStickElement() { return this.stick; }
    isFixedJoystick() { return this.isFixed; }
    handleDown(event) {
        if (!this.enabled)
            return;
        const leftButtonDown = (event.buttons & 1) === 1;
        const rightButtonDown = (event.buttons & 2) === 2;
        if (this.mouseButton === TouchMouseButton.Left && !leftButtonDown)
            return;
        if (this.mouseButton === TouchMouseButton.Right && !rightButtonDown)
            return;
        this.active = true;
        this.pointerId = event.pointerId;
        this.showBaseElement(event);
        if (this.stick)
            this.stick.style.transition = "0s";
        if (this.active && this.preventDefault)
            event.preventDefault();
        if (event.changedTouches) {
            this.dragStart = { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
            this.touchId = event.changedTouches[0].identifier;
        }
        else {
            this.dragStart = { x: event.clientX, y: event.clientY };
        }
        if (this.onHandleDown)
            this.onHandleDown(event);
        if (this.stopPropagation)
            event.stopPropagation();
    }
    handleMove(event) {
        if (!this.enabled || !this.active || event.pointerId !== this.pointerId)
            return;
        if (event.changedTouches) {
            let touchmoveId = null;
            for (let i = 0; i < event.changedTouches.length; i++) {
                if (this.touchId === event.changedTouches[i].identifier) {
                    touchmoveId = i;
                    event.clientX = event.changedTouches[i].clientX;
                    event.clientY = event.changedTouches[i].clientY;
                }
            }
            if (touchmoveId === null)
                return;
        }
        const xDiff = event.clientX - this.dragStart.x;
        const yDiff = event.clientY - this.dragStart.y;
        const angle = Math.atan2(yDiff, xDiff);
        const distance = Math.min(this.maxDistance, Math.hypot(xDiff, yDiff));
        const xPosition = distance * Math.cos(angle);
        const yPosition = distance * Math.sin(angle);
        if (this.stick)
            this.stick.style.transform = `translate3d(${xPosition}px, ${yPosition}px, 0px)`;
        const distance2 = (distance < this.deadZone) ? 0 : this.maxDistance / (this.maxDistance - this.deadZone) * (distance - this.deadZone);
        const xPosition2 = distance2 * Math.cos(angle);
        const yPosition2 = distance2 * Math.sin(angle);
        const xPercent = parseFloat((xPosition2 / this.maxDistance).toFixed(4));
        const yPercent = parseFloat((yPosition2 / this.maxDistance).toFixed(4));
        this.xvalue = xPercent;
        this.yvalue = yPercent;
        if (this.onHandleMove)
            this.onHandleMove(event);
        if (this.stopPropagation)
            event.stopPropagation();
    }
    handleUp(event) {
        if (!this.enabled || !this.active || event.pointerId !== this.pointerId)
            return;
        if (event.changedTouches && this.touchId !== event.changedTouches[0].identifier)
            return;
        if (this.stick) {
            this.stick.style.transition = ".2s";
            this.stick.style.transform = `translate3d(0px, 0px, 0px)`;
        }
        this.xvalue = 0;
        this.yvalue = 0;
        this.touchId = null;
        this.pointerId = null;
        this.active = false;
        this.hideBaseElement();
        if (this.onHandleUp)
            this.onHandleUp(event);
        if (this.stopPropagation)
            event.stopPropagation();
    }
    showBaseElement(event) {
        if (!this.isFixed && this.updateElements) {
            if (this.base && this.base.style.opacity !== this.baseElementOpacity) {
                const baseRect = this.base.getBoundingClientRect();
                this.base.style.left = event.clientX - baseRect.width / 2 + "px";
                this.base.style.top = event.clientY - baseRect.height / 2 + "px";
                this.base.style.opacity = this.baseElementOpacity;
            }
            if (this.stick && this.stick.style.opacity !== this.stickElementOpacity) {
                this.stick.style.opacity = this.stickElementOpacity;
            }
        }
        else if (!this.isFixed && !this.updateElements) {
            this.hideBaseElement();
        }
    }
    hideBaseElement() {
        if (!this.isFixed) {
            if (this.base && this.base.style.opacity !== "0") {
                this.base.style.opacity = "0";
                this.base.style.left = "-1000px";
                this.base.style.top = "-1000px";
            }
            if (this.stick && this.stick.style.opacity !== "0") {
                this.stick.style.opacity = "0";
            }
        }
    }
}
