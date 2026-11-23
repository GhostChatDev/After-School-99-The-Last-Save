/* Later campaign missions: 20x20 deterministic grids. */
(function (root) {
  'use strict';
  const map = [
    '#P.....#..............#',
    '#......#...o..........#',
    '#..#...#....#########.#',
    '#..#...#..............#',
    '#..#...........h......#',
    '#..#...#..............#',
    '#..#...#########......#',
    '#..#...#..............#',
    '#......#...x..........#',
    '####D###...x..........#',
    '#......#...#..........#',
    '#..o...#...#..........#',
    '#......#...#...o......#',
    '#......#...#..........#',
    '#......#...#..........#',
    '#......#...#..........#',
    '#......#...#..........#',
    '#......#...#..........#',
    '#..K...#...#.........E#',
    '#######################'
  ];
  // All authored missions use the same tile grammar. Routes are validated by
  // the shared state machine, not by decorative reachability alone.
  const later = [
    { title: 'A Route Through Blue', chapter: 2, intro: 'The next sector opens with a long route. Take the key, gather the memories, and keep your turns deliberate.', map: map, outro: 'A blue folder remembers the sound of two children laughing.' },
    { title: 'The Long Way Home', chapter: 2, intro: 'Shortcuts are not always kinder. Collect the sparks and read the dust patrol before crossing.', map: map, outro: 'June left a note in the margin: “We can try again tomorrow.”' },
    { title: 'The Homework Backup', chapter: 2, intro: 'An unfinished drawing is still worth saving. The exit waits beyond the familiar blue folders.', map: map, outro: 'A homework page carries a tiny drawing of Pip and a friend.' },
    { title: 'Two Chairs', chapter: 2, intro: 'There were always two chairs at this desk. Keep moving, but do not rush the last turn.', map: map, outro: 'For a moment, both chairs are occupied again.' },
    { title: 'Summer Route', chapter: 3, intro: 'The summer archive is warm with old afternoons. Recover the key and bring every memory home.', map: map, outro: 'A saved drawing shows a bicycle outside the house.' },
    { title: 'Rain On The Window', chapter: 3, intro: 'Rain loops behind the folders. The patrols are predictable; your route can be too.', map: map, outro: 'Alex remembers June waiting at the window.' },
    { title: 'A Shared Screen', chapter: 3, intro: 'One screen, two ideas, and no save button yet. Find the route through the archive.', map: map, outro: 'The old project has two authors again.' },
    { title: 'The Last Bell', chapter: 3, intro: 'The final bell of summer is stored here. Do not leave a memory behind.', map: map, outro: 'The school bell becomes a quiet electronic chime.' },
    { title: 'Archive Sector Four', chapter: 4, intro: 'The older backups are fragile but readable. Follow the key through the folder walls.', map: map, outro: 'A voice clip survives: “It does not have to be perfect.”' },
    { title: 'Version Twelve', chapter: 4, intro: 'Another version, another chance. The memories are intact if you reach them carefully.', map: map, outro: 'The version history is a record of trying, not failing.' },
    { title: 'The Unsent Message', chapter: 4, intro: 'A message to June was never sent. Carry its memories to the exit.', map: map, outro: 'The message reads: “Do you want to finish our game?”' },
    { title: 'Before The Shutdown', chapter: 4, intro: 'Null warns that cleanup is near. Save this sector before the final transfer.', map: map, outro: 'Null is not an enemy. It is trying to keep something alive.' },
    { title: 'Really Final', chapter: 5, intro: 'The last folder contains the first unfinished level. Bring its pieces back together.', map: map, outro: 'The original Pip drawing appears beside June’s movement code.' },
    { title: 'What We Made', chapter: 5, intro: 'There is no perfect version waiting here. There is only the one you can save.', map: map, outro: 'The archive stops asking to be restored and starts asking to be shared.' },
    { title: 'A Friend For Pip', chapter: 5, intro: 'The note was right: Pip was never meant to make this journey alone.', map: map, outro: 'Dot stays with Pip as the transfer window opens.' },
    { title: 'The Transfer Window', chapter: 5, intro: 'The Overwrite is close. One last careful route can carry the whole archive out.', map: map, outro: 'The final sector is ready for a new machine.' },
    { title: 'The Last Save', chapter: 6, intro: 'Save what you can. Keep moving. The game does not need to be perfect to be finished.', map: map, outro: 'Pip reaches the final flag with the archive intact.' },
    { title: 'After School', chapter: 6, intro: 'There is still time to play together. Reach the flag and make a new save.', map: map, outro: 'Alex calls June. For the first time in years, they talk about the game.' },
    { title: 'Really, Really Final', chapter: 6, intro: 'The old folder name was never an ending. Bring the last memories home.', map: map, outro: 'A new file appears beside the old one: AFTER_SCHOOL_TOGETHER.' },
    { title: 'A New Save', chapter: 6, intro: 'The transfer is complete. One final route remains, and you can take it at your own pace.', map: map, outro: 'Some things are worth saving twice. Some are worth starting again.' }
  ];
  if (typeof module !== 'undefined' && module.exports) module.exports = later;
  else root.LaterMissions = later;
})(typeof window !== 'undefined' ? window : globalThis);
