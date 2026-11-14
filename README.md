# Still Out There

A first-person browser museum for the 2026 NASA Space Apps challenge *Abandoned but not Forgotten*. Walk toward five freestanding 2D exhibit cutouts to hear short stories about the science they made possible.

## Run locally

Requires Node.js 20.19+ or 22.12+.

```sh
npm ci
npm run dev
```

Open the local address printed by Vite. Use WASD or the arrow keys to walk and drag to look. On a touch device, hold the on-screen arrows and drag the gallery to look around. Click the gallery for mouse look or use Q and E to turn. Press Escape to release the mouse. The exhibit directory offers quick access and a readable tour from the entrance.

`npm run build` outputs the static site to `dist/`. `npm run preview` serves that build locally.

## Exhibits and media credits

| Exhibit | Cutout and mission references |
|---|---|
| Apollo 11 retroreflector | [NASA mission photo AS11-40-5952](https://commons.wikimedia.org/wiki/File:Apollo_11_Lunar_Laser_Ranging_Experiment.jpg) and [International Laser Ranging Service](https://ilrs.cddis.eosdis.nasa.gov/missions/satellite_missions/current_missions/ap11_general.html). |
| Apollo 17 lunar rover | [NASA lunar rover photo](https://commons.wikimedia.org/wiki/File:Lunar_Rover_Apollo_17.jpg), [mission summary](https://www.nasa.gov/missions/apollo/apollo-17-mission-details/), and [NASA/GSFC/Arizona State University landing site imagery](https://science.nasa.gov/resource/apollo-17-landing-site-the-taurus-littrow-valley/). |
| Opportunity rover | Render from the [NASA/JPL-Caltech rover model](https://science.nasa.gov/resource/spirit-and-opportunity-rover-3d-model/), [Martian blueberries photo](https://science.nasa.gov/resource/martian-blueberries-2/), and [mineral readings](https://science.nasa.gov/photojournal/keepers-of-the-hematite/). |
| InSight lander | Render from the [NASA/JPL-Caltech InSight model](https://science.nasa.gov/resource/insight-lander-3d-model/) and [NASA JPL's InSight teaching resource](https://www.jpl.nasa.gov/edu/resources/teachable-moment/how-insight-revealed-the-heart-of-mars/). |
| Voyager 1 | Render from the [NASA VTAD Voyager model](https://science.nasa.gov/resource/voyager-3d-model/), [NASA/JPL-Caltech lobby illustration](https://science.nasa.gov/image-detail/pia17462/), and a short excerpt from [NASA/JPL-Caltech/University of Iowa plasma wave playback](https://science.nasa.gov/photojournal/voyager-captures-sounds-of-interstellar-space/). |

Apollo 11 and Apollo 17 are cropped and masked archival photos. The other three cutouts are fixed-angle renders of NASA 3D models. The illustrations and simulations have labels in the app where applicable. The first-person stories are dramatized from the mission sources. The demo uses synthesized meSpeak voices with local MP3 playback. Narration copy and cue times are in `src/exhibits.js` and `src/narration.js`.

The walk-through uses Three.js and takes inspiration from the [3D Art Gallery](https://github.com/ilaydaozel/3D-Art-Gallery). The gallery uses CSS 3D rendering when WebGL 2 is unavailable and keeps the same movement and distance triggers.
