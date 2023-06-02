export function getDownloadSpeed(speedInKB) {
  const BYTES_PER_KB = 1024;
  const UNITS = ["KB/s", "MB/s", "GB/s"];

  let speed = parseInt(speedInKB) || 0;
  let unitIndex = 0;

  if (speed >= BYTES_PER_KB) {
    // 1Gb = 1024 ** 2
    if (speed >= BYTES_PER_KB ** 2) unitIndex = 2;
    else unitIndex = 1; //mb

    speed = speed / BYTES_PER_KB ** unitIndex;
  }

  return {
    value: parseFloat(speed.toFixed(2)),
    unit: UNITS[unitIndex],
  };
}
