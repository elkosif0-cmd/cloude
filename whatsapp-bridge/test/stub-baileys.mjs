// Stands in for Baileys: always linked, records every sent message to $SENT_LOG.
import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs';

export const DisconnectReason = { loggedOut: 401, restartRequired: 515 };

export async function useMultiFileAuthState(dir) {
  mkdirSync(dir, { recursive: true });
  const sessions = {};
  const keys = {
    async get(_type, ids) {
      return Object.fromEntries(ids.map((id) => [id, sessions[id]]).filter(([,v]) => v));
    },
    async set(data) {
      for (const group of Object.values(data || {})) {
        for (const [id, value] of Object.entries(group || {})) {
          if (value) sessions[id] = value;
          else delete sessions[id];
        }
      }
      writeFileSync(dir + '/stub-session.json', JSON.stringify(sessions));
    },
  };
  return {
    state: { creds: { me: { id: '201000000000@s.whatsapp.net' } }, keys },
    saveCreds: async () => writeFileSync(dir + '/creds.json', JSON.stringify({ ok: true })),
  };
}

export default function makeWASocket({ auth }) {
  const handlers = {};
  const sock = {
    user: { id: '201000000000@s.whatsapp.net', name: 'Stub' },
    ev: { on: (name, fn) => { (handlers[name] ??= []).push(fn); } },
    onWhatsApp: async (jid) => [{ exists: !jid.startsWith('999'), jid }],
    sendMessage: async (jid, payload) => {
      if (payload.fileName === 'fail.pdf') throw new Error('stub send failure');
      const id = 'MSG' + Math.random().toString(36).slice(2, 10);
      const bytes = payload.document ?? payload.image ?? payload.video ?? payload.audio;
      const entry = payload.text !== undefined
        ? { jid, type: 'text', text: payload.text }
        : { jid, type: payload.document ? 'document' : payload.image ? 'image' : 'other', fileName: payload.fileName ?? null, bytes: bytes?.length ?? 0 };
      appendFileSync(process.env.SENT_LOG, JSON.stringify(entry) + '\n');
      await auth.keys.set({ session: { [id]: { n: 1 } } });
      handlers['creds.update']?.forEach((fn) => fn({}));
      return { key: { id } };
    },
    logout: async () => {},
  };
  setTimeout(() => handlers['connection.update']?.forEach((fn) => fn({ connection: 'open' })), 10);
  return sock;
}
