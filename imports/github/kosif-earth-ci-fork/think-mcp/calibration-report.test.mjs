import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const worker=fs.readFileSync(new URL('./worker.js',import.meta.url),'utf8');

test('empirical calibration report is exposed and does not auto-lower gates',()=>{
  assert.match(worker,/function\s+wilsonLowerBound\s*\(/);
  assert.match(worker,/function\s+calibrationReportTool\s*\(/);
  assert.match(worker,/name:"kosif_calibration_report"/);
  assert.match(worker,/mode:"empirical_calibration_report"/);
  assert.match(worker,/brierScore/);
  assert.match(worker,/expectedCalibrationError/);
  assert.match(worker,/wilson95LowerBound/);
  assert.match(worker,/Do not lower operational gates from this report alone/);
});

test('calibration tool requires observed outcomes',()=>{
  assert.match(worker,/OBSERVATIONS_REQUIRED/);
  assert.match(worker,/VALID_OBSERVATIONS_REQUIRED/);
  assert.match(worker,/jevProbability/);
  assert.match(worker,/success/);
});
