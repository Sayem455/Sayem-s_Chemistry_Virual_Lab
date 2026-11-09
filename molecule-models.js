const plane = (radius, count) => Array.from({length: count}, (_, i) => [
  radius * Math.cos(i * 2 * Math.PI / count),
  radius * Math.sin(i * 2 * Math.PI / count),
  0,
]);
const axis = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
const tetrahedron = [[1, 1, 1], [-1, -1, 1], [-1, 1, -1], [1, -1, -1]]
  .map(point => point.map(value => value / Math.sqrt(3)));
const bentAngle = 104.5 * Math.PI / 360;
const pyramidHeight = -Math.sqrt((Math.cos(107 * Math.PI / 180) + 0.5) / 1.5);
const pyramid = plane(Math.sqrt(1 - pyramidHeight ** 2), 3)
  .map(([x, y]) => [x, y, pyramidHeight]);

function centered(formula, shape, angle, vsepr, center, outer, positions, order = 1) {
  return {
    formula, shape, angle, vsepr,
    atoms: [[center, 0, 0, 0], ...positions.map(point => [outer, ...point])],
    bonds: positions.map((_, i) => [0, i + 1, order]),
  };
}

export const models = [
  centered("CO₂", ["সরলরৈখিক", "Linear"], "180°", "AX₂", "C", "O", axis.slice(0, 2), 2),
  centered("BF₃", ["ত্রিকোণীয় সমতল", "Trigonal planar"], "120°", "AX₃", "B", "F", plane(1, 3)),
  centered("CH₄", ["চতুস্তলকীয়", "Tetrahedral"], "109.5°", "AX₄", "C", "H", tetrahedron),
  centered("NH₃", ["ত্রিকোণীয় পিরামিড", "Trigonal pyramidal"], "≈107°", "AX₃E", "N", "H", pyramid),
  centered("H₂O", ["বাঁকা", "Bent"], "≈104.5°", "AX₂E₂", "O", "H",
    [-1, 1].map(side => [side * Math.sin(bentAngle), Math.cos(bentAngle), 0])),
  centered("PCl₅", ["ত্রিকোণীয় দ্বিপিরামিড", "Trigonal bipyramidal"], "90°, 120°, 180°", "AX₅", "P", "Cl", [...plane(1, 3), ...axis.slice(4)]),
  centered("SF₆", ["অষ্টতলকীয়", "Octahedral"], "90°, 180°", "AX₆", "S", "F", axis),
  centered("XeF₂", ["সরলরৈখিক", "Linear"], "180°", "AX₂E₃", "Xe", "F", axis.slice(0, 2)),
  centered("XeF₄", ["বর্গাকার সমতল", "Square planar"], "90°, 180°", "AX₄E₂", "Xe", "F", axis.slice(0, 4)),
  {
    formula: "C₂H₄", shape: ["প্রতি C-তে ত্রিকোণীয় সমতল", "Trigonal planar at each carbon"], angle: "≈120°", vsepr: "sp²",
    atoms: [["C", -.52, 0, 0], ["C", .52, 0, 0], ["H", -.96, .76, 0], ["H", -.96, -.76, 0], ["H", .96, .76, 0], ["H", .96, -.76, 0]],
    bonds: [[0, 1, 2], [0, 2, 1], [0, 3, 1], [1, 4, 1], [1, 5, 1]],
  },
  {
    formula: "C₂H₂", shape: ["সরলরৈখিক", "Linear"], angle: "180°", vsepr: "sp",
    atoms: [["C", -.46, 0, 0], ["C", .46, 0, 0], ["H", -1.25, 0, 0], ["H", 1.25, 0, 0]],
    bonds: [[0, 1, 3], [0, 2, 1], [1, 3, 1]],
  },
];

const colours = {
  H: ["#ffffff", "#a7b9d1", "#172c49"],
  C: ["#71829c", "#1d2b43", "#ffffff"],
  B: ["#ffd0bd", "#af574a", "#172c49"],
  N: ["#7aafff", "#234da5", "#ffffff"],
  O: ["#ff9aa8", "#bd2342", "#ffffff"],
  F: ["#c6f395", "#4d9028", "#172c49"],
  Cl: ["#90e5a9", "#1c6f4a", "#ffffff"],
  P: ["#ffbe7a", "#ae4826", "#ffffff"],
  S: ["#ffe798", "#b4821b", "#172c49"],
  Xe: ["#d0a3ff", "#7847ae", "#ffffff"],
};

export function drawMolecule(canvas, model, yaw, pitch, flat) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const radians = Math.PI / 180;
  const [cy, sy] = [Math.cos(yaw * radians), Math.sin(yaw * radians)];
  const [cp, sp] = [Math.cos(pitch * radians), Math.sin(pitch * radians)];
  const atoms = model.atoms.map(([label, x, y, z]) => {
    const side = x * cy + z * sy;
    const back = z * cy - x * sy;
    const depth = y * sp + back * cp;
    const scale = flat ? 1 : 5 / (5 - depth);
    return {label, depth, x: 195 + 88 * side * scale, y: 130 + 88 * (y * cp - back * sp) * scale,
      radius: (label === "H" ? 15 : 24) * scale};
  });

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineCap = "round";
  const objects = atoms.map(atom => ({depth: atom.depth, atom}));
  for (const [a, b, order] of model.bonds) {
    const [start, end] = [atoms[a], atoms[b]];
    objects.push({depth: (start.depth + end.depth) / 2, start, end, order});
  }
  for (const {atom, start, end, order} of objects.sort((a, b) => a.depth - b.depth || Number(!!a.atom) - Number(!!b.atom))) {
    if (atom) {
      const {label, x, y, radius} = atom;
      const [light, dark, ink] = colours[label];
      const shade = ctx.createRadialGradient(x - radius / 3, y - radius / 3, 0, x, y, radius);
      shade.addColorStop(0, light);
      shade.addColorStop(1, dark);
      ctx.fillStyle = flat ? light : shade;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = flat ? "#172c49" : ink;
      ctx.font = "bold 15px system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, x, y);
    } else {
      const length = Math.hypot(end.x - start.x, end.y - start.y);
      if (length < 1) continue;
      const nx = (start.y - end.y) / length;
      const ny = (end.x - start.x) / length;
      ctx.strokeStyle = "#667a94";
      ctx.lineWidth = order === 1 ? 7 : 3.5;
      for (let i = 0; i < order; i++) {
        const offset = 7 * (i - (order - 1) / 2);
        const inset = Math.min(.25, start.radius / length);
        const startX = start.x + (end.x - start.x) * inset;
        const startY = start.y + (end.y - start.y) * inset;
        const endInset = Math.min(.25, end.radius / length);
        const endX = end.x + (start.x - end.x) * endInset;
        const endY = end.y + (start.y - end.y) * endInset;
        ctx.beginPath();
        ctx.moveTo(startX + nx * offset, startY + ny * offset);
        ctx.lineTo(endX + nx * offset, endY + ny * offset);
        ctx.stroke();
      }
    }
  }
}
