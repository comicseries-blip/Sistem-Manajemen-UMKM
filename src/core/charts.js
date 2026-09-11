import Chart from 'chart.js/auto';

const instances = new Map();

export function createChart(id, config) {
  destroyChart(id);
  const canvas = document.getElementById(id);
  if (!canvas) return null;

  const inst = new Chart(canvas.getContext('2d'), config);
  instances.set(id, inst);
  return inst;
}

export function destroyChart(id) {
  const inst = instances.get(id);
  if (inst) {
    inst.destroy();
    instances.delete(id);
  }
}