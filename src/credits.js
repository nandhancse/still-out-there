const SCROLL_SPEED = 54;

export function createCreditsRoll(section) {
  const roll = section.querySelector('#credits-roll');
  const actions = section.querySelector('.credits-actions');
  const playButton = section.querySelector('#credits-play');
  const title = section.querySelector('#credits-title');
  const progress = section.querySelector('#credits-progress');
  const thanks = section.querySelector('#credits-thanks');
  let frame = null;
  let position = 0;
  let previous = 0;

  function stop() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
  }

  function pause() {
    if (frame === null) return;
    stop();
    playButton.textContent = 'Resume';
  }

  function finish() {
    stop();
    roll.scrollTop = roll.scrollHeight;
    actions.hidden = true;
    thanks.focus({ preventScroll: true });
  }

  function scroll(now) {
    const end = roll.scrollHeight - roll.clientHeight;
    position = Math.min(end, position + Math.min(now - previous, 100) * SCROLL_SPEED / 1000);
    previous = now;
    roll.scrollTop = position;
    if (position >= end) finish();
    else frame = requestAnimationFrame(scroll);
  }

  function play() {
    position = roll.scrollTop;
    previous = performance.now();
    playButton.textContent = 'Pause';
    frame = requestAnimationFrame(scroll);
  }

  playButton.addEventListener('click', () => frame === null ? play() : pause());
  section.querySelector('#credits-skip').addEventListener('click', finish);
  roll.addEventListener('wheel', pause, { passive: true });
  roll.addEventListener('touchstart', pause, { passive: true });
  roll.addEventListener('focusin', event => { if (event.target !== title) pause(); });

  return {
    show(explored, total) {
      progress.textContent = `You explored ${explored} of ${total} exhibits.`;
      section.hidden = false;
      actions.hidden = false;
      roll.scrollTop = 0;
      title.focus({ preventScroll: true });
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) playButton.textContent = 'Play';
      else play();
    },
    hide() {
      stop();
      section.hidden = true;
    }
  };
}
