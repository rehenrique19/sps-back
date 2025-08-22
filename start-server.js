#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando servidor SPS Test...\n');

// Inicia o servidor
const server = spawn('node', ['src/index.js'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'development' }
});

server.on('error', (error) => {
  console.error('❌ Erro ao iniciar servidor:', error);
  process.exit(1);
});

server.on('close', (code) => {
  console.log(`\n📴 Servidor finalizado com código ${code}`);
  process.exit(code);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Parando servidor...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Parando servidor...');
  server.kill('SIGTERM');
});