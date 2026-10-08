export function registerSocketHandler(io) {
  io.on('connection', (socket) => {
    socket.emit('connected', { timestamp: new Date().toISOString() });
  });
}

export const broadcast = (req, event, payload) => req.app.get('io')?.emit(event, payload);
