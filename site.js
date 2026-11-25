/* Shared script: header artwork, eyes and background */
(() => {
	const NS = 'http://www.w3.org/2000/svg';
	const RED = '#ff0f47', GREEN = '#14ff7c', INK = '#08050a', PLUM = '#230a1d', WHITE = '#fff4f7';

	// fixed seed, so the artwork is the same on every visit
	let seed = 77;
	const rand = (a = 0, b = 1) => {
		seed = (seed * 16807) % 2147483647;
		return a + (seed / 2147483647) * (b - a);
	};

	const el = (tag, attrs, parent) => {
		const node = document.createElementNS(NS, tag);
		for (const key in attrs) node.setAttribute(key, attrs[key]);
		if (parent) parent.appendChild(node);
		return node;
	};

	const poly = (parent, points, fill, extra = {}) =>
		el('polygon', { points, fill, ...extra }, parent);

	/* ---------- eyes ---------- */
	const eyes = [];
	let clipId = 0;

	const ICONS = {
		pickaxe: 'M-12-6C-5-13 7-14 13-9L9-5L12-2L9 1L5-3L-8 12L-12 8L1-6C-3-9-7-9-12-6Z',
		rocket: 'M0-14C7-8 7 0 5 6L10 12L3 10L0 15L-3 10L-10 12L-5 6C-7 0-7-8 0-14ZM0-7A3 3 0 1 0 0-1A3 3 0 1 0 0-7Z'
	};

	// type: 'big', 'ring', 'slit', or an icon name
	function makeEye(parent, x, y, w, h, angle, type) {
		const outer = el('g', { transform: `translate(${x} ${y}) rotate(${angle})` }, parent);
		const lid = el('g', { class: 'blink' }, outer);
		const shape = `M${-w} 0Q0 ${-2 * h} ${w} 0Q0 ${2 * h} ${-w} 0Z`;
		const id = `eye-clip-${clipId++}`;
		el('path', { d: shape }, el('clipPath', { id }, lid));
		el('path', { d: shape, fill: GREEN, stroke: RED, 'stroke-width': Math.max(2, h * 0.07) }, lid);
		const iris = el('g', {}, el('g', { 'clip-path': `url(#${id})` }, lid));

		const circle = (r, fill, extra = {}) => el('circle', { r, fill, ...extra }, iris);
		if (type === 'big') {
			circle(h * 0.72, RED);
			circle(h * 0.5, 'none', { stroke: GREEN, 'stroke-width': h * 0.025 });
			circle(h * 0.19, GREEN);
		} else if (type === 'ring') {
			circle(h * 0.68, RED);
			circle(h * 0.43, 'none', { stroke: GREEN, 'stroke-width': h * 0.1 });
			circle(h * 0.16, GREEN);
		} else if (type === 'slit') {
			el('ellipse', { rx: h * 0.55, ry: h * 0.72, fill: INK }, iris);
		} else {
			circle(26, RED);
			circle(20, 'none', { stroke: GREEN, 'stroke-width': 1.5 });
			el('path', { d: ICONS[type], fill: GREEN, 'fill-rule': 'evenodd' }, iris);
		}

		const eye = { outer, lid, iris, angle, reachX: w * 0.2, reachY: h * 0.22 };
		eyes.push(eye);
		return eye;
	}

	const face = document.getElementById('face');

	function buildFace() {
		/* ---------- header artwork: wedges converge on one point ---------- */
		const root = el('g', { class: 'glow' }, face);
		const NECK = [600, 505];

		// back wedges, alternating hot red and dark plum
		const rim = [
			[-40, 300], [-30, 90], [90, -20], [300, -20], [420, -20], [535, -20], [585, -20], [660, -20],
			[720, -20], [800, -20], [930, -20], [1060, -20], [1230, 60], [1240, 230], [1230, 330]
		];
		for (let i = 0; i < rim.length - 1; i++) {
			const dark = [1, 4, 6, 9, 12].includes(i);
			poly(root, `${NECK} ${rim[i]} ${rim[i + 1]}`, dark ? PLUM : RED);
		}

		// thin ink cracks between the wedges
		for (let i = 1; i < rim.length - 1; i++) {
			const [x, y] = rim[i];
			poly(root, `${NECK} ${x - 9},${y} ${x + 9},${y}`, INK);
		}

		// loose shards breaking off, pointing back at the neck
		for (let i = 0; i < 110; i++) {
			const a = rand(Math.PI * 0.94, Math.PI * 2.06);
			const dist = rand(40, 640);
			const cx = NECK[0] + Math.cos(a) * dist * 1.1;
			const cy = NECK[1] + Math.sin(a) * dist * 0.7 + rand(-30, 75);
			const len = rand(16, 90), wid = rand(5, 20);
			const ux = Math.cos(a), uy = Math.sin(a);
			const roll = rand();
			const shard = poly(root,
				`${cx + ux * len},${cy + uy * len} ${cx - uy * wid},${cy + ux * wid} ${cx - ux * len * 0.25 + uy * wid},${cy - uy * len * 0.25 - ux * wid}`,
				roll < 0.66 ? RED : roll < 0.92 ? INK : PLUM);
			if (i % 3 === 0) {
				shard.setAttribute('class', 'shard-drift');
				shard.style.setProperty('--dx', `${ux * rand(4, 14)}px`);
				shard.style.setProperty('--dy', `${uy * rand(4, 14)}px`);
				shard.style.animationDelay = `${-rand(0, 5)}s`;
			}
		}

		// the two great eyes
		makeEye(root, 316, 196, 226, 178, 24, 'big');
		makeEye(root, 862, 336, 182, 108, -19, 'big');

		// zigzags
		const bolt = (points, delay) => {
			const b = poly(root, points, WHITE, { class: 'grin', stroke: RED, 'stroke-width': 5 });
			b.style.animationDelay = `${delay}s`;
		};
		bolt('1215,-10 1090,20 1118,70 1010,92 1040,150 932,170 962,226 850,262 986,222 962,180 1078,146 1050,106 1160,70 1136,42 1215,26', 0);
		bolt('90,372 168,402 160,368 240,418 232,386 318,440 312,414 392,470 300,448 304,468 222,424 228,446 150,402 156,420', -0.8);
		bolt('462,438 512,458 508,436 556,470 560,448 614,480 548,478 546,492 510,462 506,480', -1.6);

		// the crowd of smaller eyes: [x, y, half-width, half-height, angle, type]
		[
			[575,  44, 30, 17,   4, 'slit'], [632,  96, 24, 13,  -6, 'slit'],
			[566, 142, 29, 16,   2, 'slit'], [563, 188, 31, 16,   0, 'slit'],
			[570, 234, 27, 15,  -3, 'slit'], [622, 318, 26, 12,   5, 'slit'],
			[690, 268, 34, 14,  -8, 'slit'], [540, 322, 20, 10,  12, 'slit'],
			[756,  52, 22, 11, -14, 'slit'], [1122, 262, 28, 14, -22, 'slit'],
			[498, 108, 18,  9,  18, 'slit'], [648, 392, 18,  9,   0, 'slit'],
			[702,  150, 54, 27,  66, 'ring'], [632, 218, 42, 20, -52, 'ring'],
			[561, 400, 40, 26,  72, 'ring'], [690, 436, 46, 20, -74, 'ring'],
			[1052, 418, 78, 28, -12, 'ring'], [150, 400, 52, 25,  76, 'ring'],
			[268, 442, 44, 17, -56, 'ring'], [786, 482, 40, 18,  82, 'ring'],
			[912, 474, 38, 16, -18, 'ring'], [438, 428, 28, 13, -64, 'ring']
		].forEach(e => {
			const [x, y, w, h, angle] = e;
			if (y > 370) {
				poly(root, `${-w * 1.9},${h * 0.3} ${-w * 0.5},${-h * 1.7} ${w * 1.5},${-h * 0.9} ${w * 1.15},${h * 0.2} ${w * 2},${h * 0.9} ${-w * 0.2},${h * 1.55}`,
					RED, { transform: `translate(${x} ${y}) rotate(${angle})` });
			}
			makeEye(root, ...e);
		});
	}

	if (face) buildFace();

	document.querySelectorAll('.card-eye').forEach(svg => {
		makeEye(svg, 0, 0, 68, 38, -7, svg.dataset.icon);
	});

	/* ---------- eyes follow the pointer or the focused card ---------- */
	let target = null, queued = false;

	function look() {
		queued = false;
		for (const eye of eyes) {
			const box = eye.outer.getBoundingClientRect();
			let ox = 0, oy = 0;
			if (target) {
				const dx = target.x - (box.left + box.width / 2);
				const dy = target.y - (box.top + box.height / 2);
				const pull = Math.min(1, Math.hypot(dx, dy) / 240);
				const a = Math.atan2(dy, dx) - eye.angle * Math.PI / 180;
				ox = Math.cos(a) * eye.reachX * pull;
				oy = Math.sin(a) * eye.reachY * pull;
			}
			eye.iris.setAttribute('transform', `translate(${ox} ${oy})`);
		}
	}

	function watch(x, y) {
		target = { x, y };
		if (!queued) { queued = true; requestAnimationFrame(look); }
	}

	addEventListener('pointermove', e => watch(e.clientX, e.clientY), { passive: true });

	document.querySelectorAll('.game-card').forEach(card => {
		card.addEventListener('focus', () => {
			const box = card.getBoundingClientRect();
			watch(box.left + box.width / 2, box.top + box.height / 2);
		});
	});

	// random single blinks, face eyes only
	const faceEyes = eyes.filter(e => face && face.contains(e.outer));
	setInterval(() => {
		if (document.hidden || !faceEyes.length) return;
		const eye = faceEyes[Math.floor(Math.random() * faceEyes.length)];
		eye.lid.style.setProperty('--open', 0.06);
		setTimeout(() => eye.lid.style.removeProperty('--open'), 160);
	}, 650);

	/* ---------- background canvas ---------- */
	const canvas = document.getElementById('static');
	const ctx = canvas.getContext('2d');
	let W, H, stars, drops, last = 0, frame;

	function setup() {
		const dpr = Math.min(devicePixelRatio || 1, 2);
		W = innerWidth;
		H = innerHeight;
		canvas.width = W * dpr;
		canvas.height = H * dpr;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

		// denser toward the middle
		stars = Array.from({ length: Math.min(1400, Math.round(W * H / 800)) }, (_, i) => {
			const clustered = i % 2 === 0;
			return {
				x: clustered ? W / 2 + (Math.random() + Math.random() + Math.random() - 1.5) * W * 0.34 : Math.random() * W,
				y: Math.random() * H,
				s: Math.random() < 0.94 ? 1 : 2,
				a: 0.12 + Math.random() * 0.5
			};
		});

		drops = Array.from({ length: Math.round(W / 38) }, () => ({
			x: Math.random() * W,
			y: Math.random() * H,
			len: 20 + Math.random() * 130,
			speed: 3 + Math.random() * 14,
			w: Math.random() < 0.85 ? 1 : 3,
			color: Math.random() < 0.78 ? '255,15,71' : '255,220,232'
		}));
	}

	function paint() {
		ctx.clearRect(0, 0, W, H);
		for (const s of stars) {
			ctx.fillStyle = `rgba(255,244,247,${s.a})`;
			ctx.fillRect(s.x, s.y, s.s, s.s);
		}
		for (const d of drops) {
			const g = ctx.createLinearGradient(0, d.y, 0, d.y + d.len);
			g.addColorStop(0, `rgba(${d.color},0)`);
			g.addColorStop(1, `rgba(${d.color},0.6)`);
			ctx.fillStyle = g;
			ctx.fillRect(d.x, d.y, d.w, d.len);
		}
	}

	// redraw at about 12 fps
	function tick(now) {
		frame = requestAnimationFrame(tick);
		if (now - last < 83) return;
		last = now;
		for (const d of drops) {
			d.y += d.speed;
			if (d.y > H) { d.y = -d.len; d.x = Math.random() * W; }
		}
		paint();
	}

	function start() {
		cancelAnimationFrame(frame);
		setup();
		paint();
		frame = requestAnimationFrame(tick);
	}

	addEventListener('resize', start);

	start();
})();
