/* Pip's closet: original text emoticons, bought only with stars earned in play. */
(function (root) {
  'use strict';
  const KEY = 'afterSchool99.closet.v1';
  const faces = [
    { id: 'smile', glyph: ':)', name: 'First Friend', cost: 0, note: 'Pip’s original smile.' },
    { id: 'happy', glyph: '^_^', name: 'After-School Joy', cost: 3, note: 'The bell finally rang.' },
    { id: 'cool', glyph: 'B)', name: 'LAN Party Legend', cost: 5, note: 'Sunglasses, indoor edition.' },
    { id: 'wink', glyph: ';)', name: 'Secret Keeper', cost: 7, note: 'Your save is safe with Pip.' },
    { id: 'surprise', glyph: 'o_o', name: '56K Surprise', cost: 9, note: 'Someone picked up the phone!' },
    { id: 'love', glyph: '<3', name: 'Forever File', cost: 12, note: 'Some memories stay.' }
  ];
  const blank = { stars: 0, owned: ['smile'], equipped: 'smile' };
  function clean(value) {
    const owned = Array.isArray(value && value.owned)
      ? value.owned.filter((id, n, list) => faces.some(f => f.id === id) && list.indexOf(id) === n) : [];
    if (!owned.includes('smile')) owned.unshift('smile');
    return {
      stars: Number.isSafeInteger(value && value.stars) && value.stars >= 0 ? value.stars : 0,
      owned,
      equipped: owned.includes(value && value.equipped) ? value.equipped : 'smile'
    };
  }
  function load(storage) {
    try { return clean(JSON.parse(storage.getItem(KEY) || 'null')); }
    catch (_) { return clean(blank); }
  }
  function save(storage, state) { storage.setItem(KEY, JSON.stringify(clean(state))); }
  function face(id) { return faces.find(f => f.id === id) || faces[0]; }
  function buy(storage, id) {
    const state = load(storage), item = faces.find(f => f.id === id);
    if (!item) return { ok: false, reason: 'Unknown face', state };
    if (state.owned.includes(id)) return { ok: false, reason: 'Already owned', state };
    if (state.stars < item.cost) return { ok: false, reason: 'Not enough stars', state };
    state.stars -= item.cost;
    state.owned.push(id);
    state.equipped = id;
    save(storage, state);
    return { ok: true, state };
  }
  function equip(storage, id) {
    const state = load(storage);
    if (!state.owned.includes(id)) return { ok: false, state };
    state.equipped = id;
    save(storage, state);
    return { ok: true, state };
  }
  function award(storage, count) {
    const state = load(storage);
    state.stars += Number.isSafeInteger(count) && count > 0 ? count : 0;
    save(storage, state);
    return state;
  }
  const api = { KEY, faces, blank, clean, load, save, face, buy, equip, award };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Closet = api;
})(typeof window !== 'undefined' ? window : globalThis);
