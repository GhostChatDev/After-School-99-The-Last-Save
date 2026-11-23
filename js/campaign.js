/* Six archive sectors, two new missions per chapter. Original 12 remain in missions.js. */
(function (root) {
  'use strict';
  const missions = [
    { title: 'Two Chairs', chapter: 2, ability: 'brake', intro: 'June wrote the movement code. You drew Pip. Press B to toggle Brake; it trades energy for careful planning.',
      map: ['#########','#P.o....#','#.###...#','#o....o.#','#...###.#','#......E#','#########'], outro: 'June: “You always made the hard levels for me.”' },
    { title: 'The Unsent Message', chapter: 2, ability: 'phase', intro: 'Press Q to arm Phase. Its one charge carries you through one blue gate; a spark recharges it.',
      map: ['#########','#P..G.o.#','#.###...#','#o......#','#...###.#','#......E#','#########'], outro: 'A message draft ends before either sibling says goodbye.' },
    { title: 'A Friend For Pip', chapter: 3, ability: 'echo', intro: 'Press E to start Echo, move in a loop over the switch, then press E again to replay it.',
      map: ['#########','#Pso....#','#.###...#','#o......#','#...###.#','#......E#','#########'], outro: '“Give him a friend so he doesn’t get lonely.”' },
    { title: 'The Long Way Home', chapter: 3, ability: 'anchor', intro: 'Stand on an anchor pad and press Space. Anchor holds that point and opens A doors.',
      map: ['#########','#Pa.A.o.#','#.###...#','#o......#','#...###.#','#......E#','#########'], outro: 'Home was not one address. It was who waited there.' },
    { title: 'Version Twelve', chapter: 4, ability: 'phase', intro: 'Blue gates are marked G. Arm Phase before entering; a wrong approach still costs a life.',
      map: ['#########','#P.o..G.#','#.#.###.#','#o......#','#.###...#','#o.....E#','#########'], outro: 'Twelve versions. None of them were really final.' },
    { title: 'Rain On The Window', chapter: 4, ability: 'brake', intro: 'Dust bunnies move every turn, even in Step mode. Brake is a planning tool, not invincibility.',
      map: ['#########','#P.o....#','#...h...#','#.###.#.#','#o......#','#......E#','#########'], outro: 'Rain on glass, two chairs pulled close to the monitor.' },
    { title: 'The Transfer Window', chapter: 5, ability: 'echo', intro: 'A recorded Echo repeats your route after recording stops. Close the loop across the switch.',
      map: ['#########','#Ps.....#','#.#.###.#','#o......#','#...#...#','#o.....E#','#########'], outro: 'Dot finds a route to a modern disk. There is time for one attempt.' },
    { title: 'Before The Shutdown', chapter: 5, ability: 'anchor', intro: 'Anchor on the pad, then cross the A door. Space again releases it.',
      map: ['#########','#PaA....#','#.#.###.#','#o......#','#...#...#','#o.....E#','#########'], outro: 'Null: “Preservation is not the same as never changing.”' },
    { title: 'A Shared Screen', chapter: 6, ability: 'phase', intro: 'The last sectors combine what you learned. Collect every memory before saving.',
      map: ['#########','#P.o.G..#','#.##....#','#o..x...#','#....##.#','#o.....E#','#########'], outro: 'The final level loads: two names in the corner, yours and June’s.' },
    { title: 'Really Final', chapter: 6, ability: 'echo', intro: 'The archive is collapsing, but a route remains. Use Echo to release the exit.',
      map: ['#########','#Ps.....#','#.##....#','#o..x...#','#....##.#','#o.....E#','#########'], outro: 'The unfinished level was never a failure. It was a place you shared.' },
    { title: 'A New Save', chapter: 6, ability: 'anchor', intro: 'One anchored point can open the way forward without holding the rest of the world still.',
      map: ['#########','#PaA....#','#.##....#','#o..x...#','#....##.#','#o.....E#','#########'], outro: 'Pip steps onto a new disk. The old room does not disappear.' },
    { title: 'After School', chapter: 6, ability: 'phase', intro: 'Make the last save—not to live in 1999, but to carry what mattered out with you.',
      map: ['#########','#P.o.G..#','#...#...#','#o..h...#','#...#...#','#o.....E#','#########'], outro: 'Alex calls June. “I found our game. Want to finish it together?”' }
  ];
  if (typeof module !== 'undefined' && module.exports) module.exports = missions; else root.Campaign = missions;
})(typeof window !== 'undefined' ? window : globalThis);