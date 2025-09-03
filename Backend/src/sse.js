const clients = new Set();

function sseHandler(req, res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders && res.flushHeaders();

  const client = { res };
  clients.add(client);
  req.on('close', () => { clients.delete(client); });
}

function broadcast(event, data) {
  const payload = `event: ${event}\n` + `data: ${JSON.stringify(data)}\n\n`;
  for (const c of clients) {
    try { c.res.write(payload); } catch (e) { }
  }
}

module.exports = { sseHandler, broadcast };


