import { io } from 'socket.io-client';

console.log('Iniciando cliente socket...');

const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoic2FtaUBleGFtcGxlLmNvbSIsInJvbGUiOiJNRU1CRVIiLCJpYXQiOjE3OTE1NDAwMjMsImV4cCI6MTc5MTU0MDkyM30.f9PcMG35XRP6M1dsNSKhEX0yJMmxfurjHLuy2RJkFg4';

const socket = io('http://127.0.0.1:3000', {
  auth: {
    token,
  },
  transports: ['websocket'],
});

socket.on('connect', () => {
  console.log('✅ Conectado:', socket.id);

  socket.emit('channel:join', 1, (response) => {
    console.log('Join response:', response);
  });
});

socket.on('message:new', (message) => {
  console.log('📨 Nuevo mensaje:', message);
});

socket.on('disconnect', (reason, details) => {
  console.log('🔌 Desconectado');
  console.log('Reason:', reason);
  console.log('Details:', details);
});

socket.on('connect_error', (error) => {
  console.error('❌ Error de conexión:', error.message);
  console.error('Description:', error.description);
  console.error('Context:', error.context);
});
