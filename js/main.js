"use strict";

const { PI, cos, sin, abs, sqrt, pow, floor, round, random, atan2 } = Math;
const HALF_PI = 0.5 * PI;
const TAU = 2 * PI;
const TO_RAD = PI / 180;
const rand = n => n * random();
const randIn = (min, max) => rand(max - min) + min;
const randRange = n => n - rand(2 * n);
const fadeIn = (t, m) => t / m;
const fadeOut = (t, m) => (m - t) / m;
const fadeInOut = (t, m) => {
	let hm = 0.5 * m;
	return abs((t + hm) % m - hm) / (hm);
};
const dist = (x1, y1, x2, y2) => sqrt(pow(x2 - x1, 2) + pow(y2 - y1, 2));
const angle = (x1, y1, x2, y2) => atan2(y2 - y1, x2 - x1);
const lerp = (n1, n2, speed) => (1 - speed) * n1 + speed * n2;

const particleCount = 1000;

let canvas;
let ctx;
let center;
let particles;
let mouse;
let hover;

Array.prototype.lerp = function(target, speed) {
	this.forEach((n, i) => (this[i] = lerp(n, target[i], speed)));
};

class Particle {
	constructor() {
		this.init();
	}
	get color() {
		return `hsla(${this.hue}, 50%, 50%, ${fadeInOut(this.life, this.ttl)})`;
	}
	init() {
		this.life = 0;
		this.ttl = randIn(10, 30);
		this.speed = randIn(3, 5);
		this.size = randIn(1, 5);
		this.position = [center[0] + randIn(-40,40), center[1] + randIn(-10,-30)];
		let direction = angle(center[0], center[1], this.position[0], this.position[1]);
		//randIn(-0.15 * PI, -0.85 * PI);
		this.velocity = [
			cos(direction) * this.speed,
			sin(direction) * this.speed * 2
		];
		this.hue = randIn(10,40);
		this.reset = false;
	}
	checkBounds() {
		const [x, y] = this.position;
		return x > canvas.a.width || x < 0 || y > canvas.a.height || y < 0;
	}
	update() {
		this.speed = fadeIn(dist(center[0], center[1], this.position[0], this.position[1]), 0.5 * canvas.a.height) * 20;
		this.velocity[0] = lerp(this.velocity[0], cos(-HALF_PI) * this.speed, 0.1);
		this.velocity[1] *= 1.01;;
		this.position[0] += this.velocity[0];
		this.position[1] += this.velocity[1];

		(this.checkBounds() || this.life++ > this.ttl) && this.init();

		return this;
	}
	draw() {
		ctx.a.save();
		ctx.a.fillStyle = this.color;
		ctx.a.fillRect(this.position[0], this.position[1], this.size, this.size * 1.5);
		ctx.a.restore();

		return this;
	}
}

function setup() {
	createCanvas();
	resize();
	createParticles();
	draw();
}

function createCanvas() {
	canvas = {
		a: document.createElement("canvas"),
		b: document.createElement("canvas")
	};
	canvas.b.style = `
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		filter: contrast(1.5);
	`;
	document.body.appendChild(canvas.b);
	ctx = {
		a: canvas.a.getContext("2d"),
		b: canvas.b.getContext("2d")
	};
	center = [0,0];
	mouse = [0,0];
	hover = false;
}

function createParticles() {
	particles = [];

	let i;

	for (i = 0; i < particleCount; i++) {
		particles.push(new Particle());
	}
}

function resize() {
	const { innerWidth, innerHeight } = window;

	canvas.a.width = canvas.b.width = innerWidth;
	canvas.a.height = canvas.b.height = innerHeight;

	center[0] = 0.5 * innerWidth;
	center[1] = 0.75 * innerHeight;
}

function mouseHandler(e) {
	const { type, clientX, clientY } = e;
	
	hover = type === "mousemove";
	
	mouse[0] = clientX;
	mouse[1] = clientY;
}

function renderToScreen() {
	ctx.b.save();
	ctx.b.filter = "blur(15px)";
	ctx.b.drawImage(canvas.a, 0, 0);
	ctx.b.restore();
	
	ctx.b.save();
	ctx.b.filter = "blur(18px)";
	ctx.b.globalCompositeOperation = 'soft-light';
	ctx.b.drawImage(canvas.a, 0, 0);
	ctx.b.restore();
	
	ctx.b.save();
	ctx.b.filter = "blur(6px)";
	ctx.b.globalCompositeOperation = 'lighter';
	ctx.b.drawImage(canvas.a, 0, 0);
	ctx.b.restore();
}

function draw() {
	ctx.a.clearRect(0, 0, canvas.a.width, canvas.a.height);

	ctx.b.fillStyle = "rgba(0,0,0,0.15)";
	ctx.b.fillRect(0, 0, canvas.a.width, canvas.a.height);

	center.lerp(hover ? mouse : [0.5 * canvas.a.width, 0.75 * canvas.a.height], 0.1);
	
	let i;

	for (i = 0; i < particleCount; i++) {
		particles[i].draw().update();
	}

	renderToScreen();

	window.requestAnimationFrame(draw);
}

// window.addEventListener("load", setup);
// window.addEventListener("resize", resize);
// window.addEventListener("mousemove", mouseHandler);
// window.addEventListener("mouseout", mouseHandler);
