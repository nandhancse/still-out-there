import './style.css';
import { exhibits } from './exhibits.js';
import { durations } from './narration.js';

const byId = id => document.getElementById(id);
const lobby = byId('lobby');
const walk = byId('walk');
const credits = byId('credits');
const exitFade = byId('exit-fade');
const directory = byId('directory');
const controls = byId('controls');
const story = byId('story');
const distancePanel = byId('distance');
const caption = byId('caption');
const experiment = byId('experiment');
const progress = byId('story-fill');
const audioNotice = byId('audio-notice');
const base = import.meta.env.BASE_URL;
const audio = new Audio();
audio.id = 'narration';
audio.hidden = true;
document.body.append(audio);
audio.preload = 'auto';
const visited = new Set();
const VIEW_RANGE = 6;
let gallery;
let inMuseum = false;
let entering = false;
let sound = true;
let current;
let storyStart = 0;
let lastCaption;
let animationId;
let fullStory = false;
let finished = false;
let playbackRequest = 0;

function prepareAudio() {
  // Keep the same media element unlocked for stories started by proximity.
  if (!audio.getAttribute('src')) {
    audio.src = `${base}audio/enter.wav`;
    audio.play().catch(() => {});
  }
}

function toggleSound() {
  sound = !sound;
  audio.muted = !sound;
  const sample = experiment.querySelector('audio');
  if (sample) sample.muted = !sound;
  for (const id of ['intro-sound', 'tour-sound']) {
    byId(id).textContent = sound ? 'Sound on' : 'Sound off';
    byId(id).setAttribute('aria-pressed', sound);
  }
  audioNotice.hidden = true;
  if (!sound || sample) return;
  if (!current || finished) {
    if (!audio.getAttribute('src')) prepareAudio();
  } else if (audio.paused) {
    const elapsed = (performance.now() - storyStart) / 1000;
    if (audio.readyState > 0) audio.currentTime = Math.min(audio.duration, elapsed);
    playNarration();
  }
}

function stopStory() {
  playbackRequest++;
  cancelAnimationFrame(animationId);
  audio.pause();
  experiment.querySelector('audio')?.pause();
  audioNotice.hidden = true;
  story.hidden = true;
  experiment.hidden = true;
  experiment.replaceChildren();
  current = null;
}

function playNarration() {
  const request = ++playbackRequest;
  audio.play().catch(error => {
    if (request !== playbackRequest || !current || !sound || error.name === 'AbortError') return;
    audioNotice.textContent = error.name === 'NotAllowedError'
      ? 'Tap Replay to hear the narration.'
      : 'Narration unavailable. You can read the full story.';
    audioNotice.hidden = false;
  });
}

function tickStory(now) {
  if (!current) return;
  const timings = durations[current.id];
  const end = timings.at(-1);
  const elapsed = audio.ended ? end : Math.min(audio.paused ? (now - storyStart) / 1000 : audio.currentTime, end);
  progress.style.transform = `scaleX(${elapsed / end})`;
  const index = timings.findIndex((time, i) => i > 0 && elapsed < time) - 1;
  const line = current.story[index < 0 ? current.story.length - 1 : index];
  if (!fullStory && lastCaption !== line) {
    caption.textContent = line;
    lastCaption = line;
  }
  finished = elapsed >= end;
  if (!finished) animationId = requestAnimationFrame(tickStory);
}

function playStory(exhibit) {
  stopStory();
  current = exhibit;
  finished = false;
  fullStory = false;
  lastCaption = null;
  visited.add(exhibit.id);
  byId('visited-count').textContent = `${visited.size} / ${exhibits.length} explored`;
  byId('story-tag').textContent = `${exhibit.place} · ${exhibit.year} · ${exhibit.status}`;
  byId('story-title').textContent = exhibit.title;
  byId('activity').textContent = exhibit.action;
  byId('transcript').textContent = 'Full story';
  byId('story-source').href = exhibit.source;
  byId('story-meter').hidden = false;
  story.hidden = false;
  audio.src = `${base}audio/${exhibit.id}.mp3`;
  audio.muted = !sound;
  playNarration();
  storyStart = performance.now();
  tickStory(storyStart);
}

function approach(exhibit, distance, triggerRange, nearExit) {
  if (nearExit) {
    void showCredits();
    return;
  }
  distance = Math.max(0, distance);
  distancePanel.hidden = distance > VIEW_RANGE;
  if (distancePanel.hidden) return;
  const rounded = `${distance.toFixed(1)} m`;
  const progress = Math.min(1, Math.max(0, (VIEW_RANGE - distance) / (VIEW_RANGE - triggerRange)));
  const name = byId('target-name');
  const range = byId('target-range');
  const hint = byId('distance-hint');
  const heard = visited.has(exhibit.id);
  const message = !heard ? 'Walk closer to hear the story' : current === exhibit ? 'Story unlocked' : 'Revisit from Exhibits';
  if (name.textContent !== exhibit.name) name.textContent = exhibit.name;
  if (range.textContent !== rounded) range.textContent = rounded;
  if (hint.textContent !== message) hint.textContent = message;
  byId('distance-fill').style.transform = `scaleX(${heard ? 1 : progress})`;
  if (!heard && distance <= triggerRange) playStory(exhibit);
}

async function enterMuseum() {
  if (inMuseum || entering) return;
  prepareAudio();
  entering = true;
  const button = byId('enter');
  button.disabled = true;
  button.setAttribute('aria-busy', 'true');
  byId('enter-label').textContent = 'Opening museum…';
  try {
    if (!gallery) {
      const { createGallery } = await import('./gallery.js');
      gallery = createGallery(byId('scene'), exhibits, approach);
      await gallery.load();
    }
  } catch (error) {
    console.warn('3D gallery unavailable', error);
    openDirectory();
    return;
  } finally {
    entering = false;
    button.disabled = false;
    button.removeAttribute('aria-busy');
    byId('enter-label').textContent = 'Enter museum';
  }
  if (current) stopStory();
  if (directory.open) directory.close();
  lobby.hidden = true;
  walk.hidden = false;
  inMuseum = true;
  gallery.start();
  openMuseumDialog(controls);
}

async function showCredits() {
  if (!inMuseum) return;
  inMuseum = false;
  walk.inert = true;
  exitFade.hidden = false;
  stopStory();
  await gallery.openExit();
  gallery.stop();
  walk.hidden = true;
  walk.inert = false;
  distancePanel.hidden = true;
  byId('credits-progress').textContent = `You explored ${visited.size} of ${exhibits.length} exhibits.`;
  credits.hidden = false;
  credits.scrollTop = 0;
  exitFade.hidden = true;
  byId('credits-title').focus({ preventScroll: true });
}

function returnToEntrance() {
  credits.hidden = true;
  lobby.hidden = false;
  byId('enter').focus();
}

function openDirectory() {
  openMuseumDialog(directory);
}

function openMuseumDialog(dialog) {
  if (dialog.open) return;
  gallery?.pause(true);
  dialog.showModal();
}

byId('enter').addEventListener('click', enterMuseum);
for (const id of ['intro-sound','tour-sound']) byId(id).addEventListener('click', toggleSound);
byId('to-exit').addEventListener('click', () => gallery.goToExit());
byId('credits-return').addEventListener('click', returnToEntrance);
for (const id of ['open-exhibits','tour-exhibits']) byId(id).addEventListener('click', openDirectory);
byId('close-directory').addEventListener('click', () => directory.close());
byId('open-controls').addEventListener('click', () => openMuseumDialog(controls));
for (const dialog of [directory, controls]) {
  dialog.addEventListener('close', () => gallery?.pause(directory.open || controls.open));
}
controls.addEventListener('close', () => {
  if (inMuseum) byId('open-controls').focus({ preventScroll: true });
});
byId('close-story').addEventListener('click', stopStory);
byId('replay').addEventListener('click', () => { if (current) playStory(current); });
byId('transcript').addEventListener('click', () => {
  fullStory = !fullStory;
  byId('transcript').textContent = fullStory ? 'Show captions' : 'Full story';
  if (fullStory) caption.textContent = current.story.join(' ');
  else {
    lastCaption = null;
    cancelAnimationFrame(animationId);
    tickStory(performance.now());
  }
});
document.addEventListener('keydown', event => {
  if (event.code === 'Tab' && document.pointerLockElement) gallery?.releasePointer();
});
for (const exhibit of exhibits) {
  const item = document.createElement('button');
  item.className = 'quiet directory-item';
  item.type = 'button';
  item.innerHTML = `<img alt="" src="${base}exhibits/${exhibit.id}.webp"><span><strong>${exhibit.name}</strong><span class="directory-detail">${exhibit.place} · ${exhibit.year}</span></span>`;
  item.addEventListener('click', () => {
    directory.close();
    if (!inMuseum) {
      // The directory also offers a readable tour if a visitor skips the 3D room.
      playStory(exhibit);
    } else {
      gallery.goTo(exhibit);
      playStory(exhibit);
    }
  });
  byId('exhibit-list').append(item);

  const row = document.createElement('div');
  const name = document.createElement('dt');
  name.textContent = exhibit.name;
  const links = document.createElement('dd');
  const resources = [[exhibit.id === 'voyager' ? 'Plasma-wave audio and mission source' : 'Mission source', exhibit.source], ...exhibit.references];
  if (exhibit.more) resources.push(['NASA landing-site image', exhibit.more]);
  for (const [label, url] of resources) {
    const link = document.createElement('a');
    link.textContent = label;
    link.href = url;
    link.target = '_blank';
    link.rel = 'noreferrer';
    links.append(link);
  }
  row.append(name, links);
  byId('credits-references').append(row);
}

byId('activity').addEventListener('click', () => {
  if (!current) return;
  experiment.hidden = false;
  switch (current.id) {
    case 'apollo11':
      experiment.innerHTML = `<svg viewBox="0 0 280 62" role="img" aria-label="A light pulse travels from Earth to the Moon and back"><path d="M32 31H248" stroke="#a9b9d2" stroke-dasharray="4 4"/><circle cx="22" cy="31" r="14" fill="#417da8"/><circle cx="258" cy="31" r="10" fill="#d3c9bf"/><circle class="pulse" cx="32" cy="31" r="4" fill="#ffda80"/></svg><div role="status">Timing the round trip…</div>`;
      {
        const result = experiment.lastElementChild;
        setTimeout(() => {
          result.textContent = 'Example round trip: 2.56 s. One way: 1.28 s. At about 300,000 km/s, that is about 384,000 km.';
        }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 2560);
      }
      break;
    case 'apollo17':
      experiment.innerHTML = `<p>Follow the tracks left during three trips across Taurus–Littrow.</p><a class="source" target="_blank" rel="noreferrer" href="${current.more}">Open NASA’s landing-site image ↗</a>`;
      break;
    case 'opportunity':
      experiment.innerHTML = `<a href="${base}exhibits/berries.webp" target="_blank" rel="noreferrer"><img src="${base}exhibits/berries.webp" alt="Opportunity close-up of small round hematite-rich grains on the Martian surface"></a><p>Can you pick out the round grains? Tap the photo to take a closer look.</p>`;
      break;
    case 'insight':
      experiment.innerHTML = `<svg viewBox="0 0 160 110" role="img" aria-label="Diagram of waves moving through layers of Mars"><defs><clipPath id="mars-disc"><circle cx="80" cy="55" r="49"/></clipPath></defs><circle cx="80" cy="55" r="49" fill="#a25b47"/><circle cx="80" cy="55" r="37" fill="#c98151"/><circle cx="80" cy="55" r="17" fill="#f4c377"/><g clip-path="url(#mars-disc)"><circle class="wave" cx="68" cy="30" r="40" fill="none" stroke="#fff6d8" stroke-width="2"/></g></svg><p>Illustration. Seismic waves let scientists infer where layers begin inside Mars.</p>`;
      break;
    case 'voyager':
      playbackRequest++;
      audio.pause();
      experiment.querySelector('audio')?.pause();
      experiment.innerHTML = `<audio controls preload="metadata" aria-label="Voyager 1 plasma wave playback" src="${base}audio/plasma.mp3"></audio><p>NASA/JPL-Caltech/University of Iowa · Plasma wave data played as audio.</p>`;
      experiment.querySelector('audio').muted = !sound;
      break;
  }
});
