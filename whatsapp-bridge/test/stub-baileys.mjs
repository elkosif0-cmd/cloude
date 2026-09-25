// Stands in for Baileys: always "linked", records every sent message to $SENT_LOG.
import { appendFileSync } from 'node:fs';

export const BufferJSON = { replacer: (_k, v) => v, reviver: (_k, v) => v };
export const DisconnectReason = { loggedOut: 401, restartRequired: 515 };
export const fetchLatestBaileysVersion = async () => ({});
export const initAuthCreds = () => ({ me: { id: '201000000000@s.whatsapp.net' } });
export const proto = { Message: { AppStateSyncKeyData: { fromObject: (x) => x } } };

export default function makeWASocket({ auth }) {
  const handlers = {};
  const sock = {
    ev: { on: (name, fn) => { (handlers[name] ??= []).push(fn); } },
    onWhatsApp: async (jid) => [{ exists: !jid.startsWith('999'), jid }],
    sendMessage: async (jid, payload) => {
      const id = 'MSG' + Math.random().toString(36).slice(2, 10);
      const entry = payload.text !== undefined
        ? { jid, type: 'text', text: payload.text }
        : { jid, type: payload.document ? 'document' : payload.image ? 'image' : 'other', fileName: payload.fileName ?? null, bytes: (payload.document ?? payload.image ?? payload.video ?? payload.audio).length };
      appendFileSync(process.env.SENT_LOG, JSON.stringify(entry) + '\n');
      // Baileys updates keys after sends; the bridge must persist them afterwards.
      await auth.keys.set({ session: { [id]: { n: 1 } } });
      return { key: { id } };
    },
    logout: async () => {},
  };
  setTimeout(() => handlers['connection.update']?.forEach((fn) => fn({ connection: 'open' })), 10);
  return sock;
}
