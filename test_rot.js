const THREE = require('three');
function testRot(x, y, z) {
  const v = new THREE.Vector3(0, 0, 1);
  const e = new THREE.Euler(x, y, z);
  v.applyEuler(e);
  console.log(`[${x}, ${y}, ${z}] -> normal: [${Math.round(v.x)}, ${Math.round(v.y)}, ${Math.round(v.z)}]`);
}
testRot(Math.PI/2, 0, 0);
testRot(-Math.PI/2, 0, 0);
testRot(0, Math.PI/2, 0);
testRot(0, -Math.PI/2, 0);
testRot(0, Math.PI, 0);
