/* Non-blocking survey autosave and safe return navigation. */
(() => {
  'use strict';
  const ids = ['gran','whale'];
  const target = document.getElementById('survey-content');
  if (!target || typeof commitVote !== 'function' || typeof renderStatus !== 'function') return;

  const style = document.createElement('style');
  style.textContent = '.save-vote{display:none!important}.survey-return-card{border:1px solid #b8d8d9;background:#f2fbfa}.survey-return-card h2{font-size:20px}.survey-return-card p{line-height:1.5}.survey-return-button{display:block;width:100%;max-width:430px;background:#126d76;color:#fff;border-color:#126d76;padding:15px 18px;font-size:17px}.survey-return-button:disabled{opacity:.78;cursor:progress}.survey-return-status{font-size:14px;color:#36596d}.survey-return-status.error{color:#9a3f28}.survey-help{color:#52697b;font-size:13px}.survey-retry{margin:10px 0;display:none}.survey-retry.visible{display:inline-block}';
  document.head.append(style);

  for (const id of ids) {
    const oldButton = document.getElementById('save-' + id);
    if (oldButton) oldButton.hidden = true;
  }

  const card = document.createElement('section');
  card.className = 'card survey-return-card';
  card.innerHTML = '<h2>Завершили? Поверніться до путівника</h2><p class="survey-help">Варіанти та коментарі зберігаються автоматично. Натискати окреме «Зберегти» не потрібно.</p><p id="survey-return-status" class="survey-return-status" role="status"></p><button id="survey-return-button" class="survey-return-button" type="button">Повернутися до путівника</button><button id="survey-return-retry" class="survey-retry" type="button">Повторити збереження</button>';
  target.append(card);
  const returnButton = document.getElementById('survey-return-button');
  const returnStatus = document.getElementById('survey-return-status');
  const retryButton = document.getElementById('survey-return-retry');
  let returnRequested = false;
  let requestedPerson = '';
  let leaving = false;
  const timers = new Map();
  const url = 'index.html';

  function current() {
    return activePerson ? profiles[activePerson] : null;
  }
  function synced(p) {
    return Boolean(p && p.loaded && !p.loading && !p.saving &&
      !p.dirty && !p.draftDirty && !p.error && !p.offline && !p.blockedConflict);
  }
  function draftMismatch(p, id) {
    const draft = p.draftVotes[id];
    const saved = p.data.votes[id] || {choice:'',comment:''};
    return draft.choice !== saved.choice || draft.comment.trim() !== saved.comment;
  }
  function statusForVote(id,p) {
    if (!p.loaded) return 'Завантажуємо відповіді…';
    const draft = p.draftVotes[id];
    if (!CHOICES[id].has(draft.choice)) {
      return draft.comment.trim() ? 'Коментар збережено лише на цьому пристрої. Оберіть варіант для надсилання.' :
        'Оберіть варіант: відповідь збережеться автоматично.';
    }
    if (p.blockedConflict) return '⚠️ Конфлікт змін на іншому пристрої. Підтвердіть версію перед виходом.';
    if (p.error || p.offline) return '⚠️ Немає підтвердження від сервера. Відповідь залишилася на цьому пристрої.';
    if (draftMismatch(p,id) || p.dirty || p.saving) return '⏳ Відповідь на пристрої. Синхронізація із сервером…';
    if (p.loading) return 'Перевіряємо збереження на сервері…';
    return '✓ Відповідь збережено на сервері.';
  }
  function paintStatus() {
    const p = current();
    if (!p) return;
    for (const id of ids) {
      const el = document.getElementById(id + '-status');
      if (!el) continue;
      el.textContent = statusForVote(id,p);
      el.classList.toggle('error',Boolean(p.error || p.offline || p.blockedConflict));
    }
    if (p.blockedConflict) {
      returnStatus.textContent = '⚠️ Відповіді змінено на іншому пристрої. Спочатку розв’яжіть конфлікт.';
    } else if (p.error || p.offline) {
      returnStatus.textContent = '⚠️ Сервер не підтвердив збереження. Відповіді є на цьому пристрої, але поки не варто виходити.';
    } else if (p.draftDirty && ids.some(id => !CHOICES[id].has(p.draftVotes[id].choice) && p.draftVotes[id].comment.trim())) {
      returnStatus.textContent = 'Коментар є на пристрої, але не має вибраного варіанта. Оберіть відповідь, щоб синхронізувати його.';
    } else if (p.loading || p.saving || p.dirty || p.draftDirty) {
      returnStatus.textContent = '⏳ Збережено на пристрої. Очікуємо підтвердження сервера…';
    } else if (synced(p)) {
      returnStatus.textContent = '✓ Усі вибрані відповіді підтверджені сервером. Можна повертатися.';
    } else {
      returnStatus.textContent = 'Відповіді зберігаються автоматично.';
    }
    returnStatus.classList.toggle('error',Boolean(p.error || p.offline || p.blockedConflict));
    returnButton.textContent = leaving ? 'Повертаємося…' :
      (p.dirty || p.saving || p.draftDirty ? 'Зберегти й повернутися до путівника' : 'Повернутися до путівника');
    returnButton.disabled = leaving || (returnRequested && p.saving);
    retryButton.classList.toggle('visible',Boolean(p.error || p.offline));
    if (returnRequested && requestedPerson === activePerson) {
      if (synced(p)) {
        returnRequested = false;
        leaving = true;
        returnButton.disabled = true;
        window.location.assign(url);
      } else if (p.error || p.offline || p.blockedConflict) {
        returnRequested = false;
        returnButton.disabled = false;
      }
    }
  }

  const oldRenderStatus = renderStatus;
  renderStatus = function() {
    oldRenderStatus();
    paintStatus();
  };
  function pushVote(id) {
    const p = current();
    if (!p || !p.loaded) return;
    if (!CHOICES[id].has(p.draftVotes[id].choice)) {
      renderStatus(); return;
    }
    if (draftMismatch(p,id)) {
      commitVote(id); // persisting to localStorage happens before the network write.
      void syncProfile(activePerson); // avoid an extra 750 ms delay on top of the RPC.
    } else {
      renderStatus();
    }
  }
  function flushDebounces() {
    for (const [id,timer] of timers) {
      clearTimeout(timer);
      pushVote(id);
    }
    timers.clear();
  }
  for (const id of ids) {
    const options = document.getElementById(id + '-votes');
    const comment = document.getElementById(id + '-comment');
    // Event delegation survives renderQuestion() recreating the radio buttons.
    options.addEventListener('change', event => {
      if (!event.target.matches('input[type="radio"]')) return;
      pushVote(id);
    });
    comment.addEventListener('input', () => {
      clearTimeout(timers.get(id));
      timers.set(id,setTimeout(() => {
        timers.delete(id);
        pushVote(id);
      },650));
      paintStatus();
    });
    comment.addEventListener('blur', () => {
      if (timers.has(id)) {
        clearTimeout(timers.get(id));
        timers.delete(id);
        pushVote(id);
      }
    });
  }
  returnButton.addEventListener('click', () => {
    flushDebounces();
    const p = current();
    if (!p) {window.location.assign(url);return;}
    if (p.blockedConflict) {paintStatus();card.scrollIntoView({block:'nearest'});return;}
    // A comment without a selected vote is intentionally only a draft.
    if (p.draftDirty && ids.some(id => !CHOICES[id].has(p.draftVotes[id].choice) && p.draftVotes[id].comment.trim())) {
      paintStatus();return;
    }
    if (synced(p)) {leaving=true;window.location.assign(url);return;}
    returnRequested = true; requestedPerson = activePerson;
    if (!p.saving && p.dirty) {
      void syncProfile(activePerson);
    } else if (!p.saving && (p.error || p.offline)) {
      // No unsynced changes, but cached data could not be verified.
      void loadProfile(activePerson);
    }
    renderStatus();
  });
  retryButton.addEventListener('click', () => {
    const p=current();
    if (!p || p.blockedConflict) return;
    retryCurrent();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) flushDebounces();
  });
  renderStatus();
})();