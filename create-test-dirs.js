/* eslint-disable no-undef */
// Temporary script to create test directories
const fs = require('fs');
const path = require('path');

const basePath = 'D:\\job-carrot\\Web dev\\carrotacademy-v1.1\\src';
const dirs = [
  path.join(basePath, 'test'),
  path.join(basePath, 'test', 'helpers')
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created: ${dir}`);
  }
});

console.log('Test directories created successfully!');
