/* The twelve later story missions. Each uses the same rules as the main game. */
(function (root) {
  'use strict';
  const later = [
    { title: 'Two Chairs', chapter: 2, ability: 'brake', intro: 'June wrote the movement code. You drew Pip. Hold still: B toggles Brake, a pause between steps.', outro: 'For a moment, both chairs are occupied again.', map: [
      '#########', '#P......#', '#.###...#', '#o......#', '#..h....#', '#....o.E#', '#########'] },
    { title: 'The Unsent Message', chapter: 2, ability: 'phase', intro: 'The message never sent. Press F to arm Phase, then cross one glowing gate. A spark recharges it.', outro: 'The message reads: “Do you want to finish our game?”', map: [
      '#########', '#P.GoGE.#', '#.......#', '#.......#', '#########'] },
    { title: 'A Friend For Pip', chapter: 2, ability: 'echo', intro: 'Pip was never meant to make this journey alone. R records; R again releases an Echo that retraces your route.', outro: 'Dot stays with Pip as the archive opens.', map: [
      '###########', '#P.s..o..E#', '#.........#', '#.........#', '###########'] },
    { title: 'The Long Way Home', chapter: 2, ability: 'brake', intro: 'Shortcuts are not always kinder. Brake gives you time to read a patrol before crossing.', outro: 'June left a note: “We can try again tomorrow.”', map: [
      '###########', '#P....#...#', '#.o...#.o.#', '#.....h...#', '#..o....GE#', '###########'] },
    { title: 'Version Twelve', chapter: 3, ability: 'phase', intro: 'Another version, another chance. Phase is a choice, not a shield: arm it before the gate.', outro: 'The version history is a record of trying, not failing.', map: [
      '###########', '#P...G..o.#', '#.#####.#.#', '#o..G...#E#', '###########'] },
    { title: 'Rain On The Window', chapter: 3, ability: 'anchor', intro: 'A keeps you in place. Stand on the anchor pad and press A; press A again to release.', outro: 'Alex remembers June waiting at the window.', map: [
      '###########', '#P...#....#', '#.a..A.o..#', '#....#....#', '#o...#...E#', '###########'] },
    { title: 'The Transfer Window', chapter: 3, ability: 'echo', intro: 'An Echo can hold a switch while Pip takes another route. Record a path over s, then release it.', outro: 'The final sector is ready for a new machine.', map: [
      '###########', '#P.s.o...E#', '#....o....#', '#.........#', '#.........#', '###########'] },
    { title: 'Before The Shutdown', chapter: 3, ability: 'brake', intro: 'Null warns that cleanup is near. Save the sector before the final transfer.', outro: 'Null is not an enemy. It is trying to keep something alive.', map: [
      '###########', '#P.h......#', '#..o..#...#', '#.....#o.E#', '###########'] },
    { title: 'A Shared Screen', chapter: 4, ability: 'anchor', intro: 'One screen, two ideas, and no save button yet. An anchored Pip can pass the A door.', outro: 'The old project has two authors again.', map: [
      '###########', '#P.a......#', '#....A....#', '#.o..#..o.#', '#....#...E#', '###########'] },
    { title: 'Really Final', chapter: 4, ability: 'echo', intro: 'The last folder contains the first unfinished level. Bring its pieces back together.', outro: 'The original Pip drawing appears beside June’s movement code.', map: [
      '###########', '#P.s.oK.DE#', '#....o....#', '#....o....#', '#.........#', '###########'] },
    { title: 'A New Save', chapter: 5, ability: 'phase', intro: 'The transfer is complete. One final route remains, and you can take it at your own pace.', outro: 'Some things are worth saving twice. Some are worth starting again.', map: [
      '###########', '#P...G....#', '#.o..#..o.#', '#....G...E#', '###########'] },
    { title: 'After School', chapter: 5, ability: 'brake', intro: 'There is still time to play together. Reach the flag and make a new save.', outro: 'Alex calls June. For the first time in years, they talk about the game.', map: [
      '#############', '#P..x.......#', '#.o...h.....#', '#.....#..o..#', '#..o..#....E#', '#############'] }
  ];
  if (typeof module !== 'undefined' && module.exports) module.exports = later;
  else root.LaterMissions = later;
})(typeof window !== 'undefined' ? window : globalThis);
