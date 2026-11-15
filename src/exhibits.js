export const exhibits = [
  {
    id: 'apollo11', name: 'Apollo 11 retroreflector', title: 'The Echo', place: 'The Moon', year: '1969',
    status: 'Passive · still usable', color: '#b3d4f5', position: [-8.5, 3.5], width: 2.2,
    source: 'https://ilrs.cddis.eosdis.nasa.gov/missions/satellite_missions/current_missions/ap11_general.html',
    references: [
      ['NASA archival photograph', 'https://commons.wikimedia.org/wiki/File:Apollo_11_Lunar_Laser_Ranging_Experiment.jpg']
    ],
    story: [
      'I’m the reflector Apollo 11 left on the Moon in 1969. My panel holds one hundred glass reflectors. I’ve never needed a battery.',
      'When an observatory sends a laser pulse toward me, my corner-shaped pieces of glass send some of that light back the way it came.',
      'Scientists time the round trip. They halve that time to find how long the light took to reach me. Multiply by the speed of light, and you have the distance.'
    ],
    action: 'Fire the laser'
  },
  {
    id: 'apollo17', name: 'Apollo 17 lunar rover', title: 'The Last Drive', place: 'The Moon', year: '1972',
    status: 'Parked on the Moon', color: '#b3d4f5', position: [8, 3.5], width: 4.7,
    source: 'https://www.nasa.gov/missions/apollo/apollo-17-mission-details/',
    references: [
      ['NASA archival photograph', 'https://commons.wikimedia.org/wiki/File:Lunar_Rover_Apollo_17.jpg']
    ],
    story: [
      'I’m the electric rover that carried Gene Cernan and Jack Schmitt across the Taurus–Littrow valley in 1972.',
      'Over three outings we drove nearly thirty-six kilometers. That gave the crew a chance to collect rocks and soil from different parts of the valley.',
      'Those samples came home for scientists to study. I stayed parked on the Moon. Decades later, a spacecraft photographed the tracks we left behind.'
    ],
    action: 'See the rover tracks',
    more: 'https://science.nasa.gov/resource/apollo-17-landing-site-the-taurus-littrow-valley/'
  },
  {
    id: 'opportunity', name: 'Opportunity rover', title: 'The Blueberry Mystery', place: 'Mars', year: '2004',
    status: 'Mission ended', color: '#f6a578', position: [-8, -8.3], width: 4.4,
    source: 'https://science.nasa.gov/photojournal/keepers-of-the-hematite/',
    references: [
      ['NASA/JPL-Caltech model', 'https://science.nasa.gov/resource/spirit-and-opportunity-rover-3d-model/'],
      ['Martian blueberries image', 'https://science.nasa.gov/resource/martian-blueberries-2/']
    ],
    story: [
      'When I landed on Mars in 2004, I found tiny round grains scattered through the rocks. My team called them blueberries.',
      'My close-up imager showed their shape. A tool on my arm identified hematite, an iron mineral. The grains were one clue that liquid water once shaped this place.',
      'A planet-wide dust storm cut off my sunlight in 2018. I fell silent, but the clues I sent home are still here for you to explore.'
    ],
    action: 'Inspect the blueberries'
  },
  {
    id: 'insight', name: 'InSight lander', title: 'The Heart of Mars', place: 'Mars', year: '2018',
    status: 'Mission ended', color: '#f6a578', position: [8, -8.3], width: 4.6,
    source: 'https://www.jpl.nasa.gov/edu/resources/teachable-moment/how-insight-revealed-the-heart-of-mars/',
    references: [
      ['NASA VTAD model', 'https://science.nasa.gov/resource/insight-3d-model/']
    ],
    story: [
      'I’m InSight. My job on Mars was to stay in one place and listen to the ground.',
      'I set a seismometer on the surface. It recorded tiny vibrations called marsquakes, including some caused by meteoroid impacts.',
      'Those waves changed as they passed through Mars. Scientists used those changes to study the layers beneath my feet. Dust built up on my solar panels, and my mission ended in 2022.'
    ],
    action: 'Watch a marsquake'
  },
  {
    id: 'voyager', name: 'Voyager 1', title: 'Beyond the Sun’s Bubble', place: 'Deep space', year: '1977',
    status: 'Extended mission', color: '#b7aafa', position: [0, -13.5], width: 5.3,
    source: 'https://science.nasa.gov/photojournal/voyager-captures-sounds-of-interstellar-space/',
    references: [
      ['NASA VTAD model', 'https://science.nasa.gov/resource/voyager-3d-model/']
    ],
    story: [
      'I left Earth in 1977. Long after my visits to Jupiter and Saturn, I crossed the edge of the bubble blown by the Sun.',
      'My antennas detected waves in plasma, a gas made of charged particles. Their pitch told scientists how dense the plasma around me was.',
      'Those measurements helped confirm I had entered interstellar space in 2012. Listen to the waves my instrument picked up.'
    ],
    action: 'Hear Voyager’s data'
  }
];
