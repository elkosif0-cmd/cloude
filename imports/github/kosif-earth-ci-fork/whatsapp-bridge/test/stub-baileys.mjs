// Stands in for Baileys: links instantly, records every sent message to $SENT_LOG and
// echoes an inbound reply so the inbox path can be tested too.
import { appendFileSync } from 'node:fs';

export const DisconnectReason = { loggedOut: 401, restartRequired: 515 };
export const BufferJSON = { replacer: (_k, v) => v, reviver: (_k, v) => v };
export const Browsers = { macOS: (name) => ['Mac OS', name, '14.4.1'] };
export const proto = {
  Message: { AppStateSyncKeyData: { fromObject: (o) => o } },
  WebMessageInfo: { Status: { ERROR: 0, PENDING: 1, SERVER_ACK: 2, DELIVERY_ACK: 3, READ: 4, PLAYED: 5 } },
};
export const fetchLatestWaWebVersion = async () => ({ version: [2, 3000, 1] });
export const fetchLatestBaileysVersion = async () => ({ version: [2, 3000, 1] });
export const initAuthCreds = () => ({ me: { id: '201000000000@s.whatsapp.net', name: 'Stub' }, registered: true });

let n = 0; // message ids stay unique across sockets, like real WhatsApp ids
const failedOnce = new Set();

export default function makeWASocket({ auth }) {
  const handlers = {};
  const emit = (name, payload) => (handlers[name] || []).forEach((fn) => fn(payload));
  const sock = {
    user: { id: '201000000000@s.whatsapp.net', name: 'Stub' },
    ev: {
      on: (name, fn) => { (handlers[name] ??= []).push(fn); },
      off: (name, fn) => { handlers[name] = (handlers[name] || []).filter((f) => f !== fn); },
    },
    onWhatsApp: async (jid) => [{ exists: !jid.startsWith('999'), jid }],
    sendPresenceUpdate: async () => {},
    readMessages: async () => {},
    requestPairingCode: async (phone) => 'CODE' + phone.slice(-4),
    groupFetchAllParticipating: async () => ({ 'g1@g.us': { id: 'g1@g.us', subject: 'Test Group', participants: [{}, {}, {}] } }),
    sendMessage: async (jid, payload) => {
      if (payload.fileName === 'fail.pdf' && !failedOnce.has('fail.pdf')) {
        failedOnce.add('fail.pdf');
        throw new Error('stub send failure');
      }
      const id = 'MSG' + String(++n).padStart(4, '0');
      const bytes = payload.document ?? payload.image ?? payload.video ?? payload.audio;
      const entry = payload.text !== undefined
        ? { jid, type: 'text', text: payload.text }
        : payload.location ? { jid, type: 'location' }
        : { jid, type: payload.document ? 'document' : payload.image ? 'image' : payload.video ? 'video' : payload.audio ? 'audio' : 'other', fileName: payload.fileName ?? null, mimetype: payload.mimetype, bytes: bytes?.length ?? 0 };
      appendFileSync(process.env.SENT_LOG, JSON.stringify(entry) + '\n');
      await auth.keys.set({ session: { [id]: { n: 1 } } });
      emit('creds.update', { lastSent: id });
      // The other side answers every message; that is what /messages returns.
      emit('messages.upsert', {
        type: 'notify',
        messages: [{
          key: { remoteJid: jid, fromMe: false, id: 'IN' + id },
          pushName: 'Stub Contact',
          messageTimestamp: Math.floor(Date.now() / 1000),
          message: { conversation: 'reply to ' + (payload.text ?? payload.fileName ?? 'media') },
        }],
      });
      // Delivery is a separate provider event. This deliberately fires before the
      // bridge has persisted its message-id mapping, exercising the reconciliation path.
      emit('messages.update', [{ key: { remoteJid: jid, fromMe: true, id }, update: { status: 3 } }]);
      if (payload.text === 'read-me') {
        emit('message-receipt.update', [{
          key: { remoteJid: jid, fromMe: true, id },
          receipt: { receiptTimestamp: Date.now(), readTimestamp: Date.now() },
        }]);
      }
      return { key: { id } };
    },
    logout: async () => {},
    end: () => {},
  };
  setTimeout(() => emit('connection.update', { connection: 'open' }), 10);
  return sock;
}
