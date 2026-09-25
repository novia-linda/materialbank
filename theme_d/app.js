(() => {
  'use strict';

  const STORAGE_KEY = 'nf-knowledge-test-lab-v1';
  const SCHEMA_VERSION = 1;

  const els = {
    startScreen: document.getElementById('startScreen'),
    labScreen: document.getElementById('labScreen'),
    reportScreen: document.getElementById('reportScreen'),
    groupNameInput: document.getElementById('groupNameInput'),
    savedSessionNotice: document.getElementById('savedSessionNotice'),
    savedSessionText: document.getElementById('savedSessionText'),
    continueSavedBtn: document.getElementById('continueSavedBtn'),
    headerActions: document.getElementById('headerActions'),
    resetBtn: document.getElementById('resetBtn'),
    verifiedCount: document.getElementById('verifiedCount'),
    progressBar: document.getElementById('progressBar'),
    questionGrid: document.getElementById('questionGrid'),
    questionWorkspace: document.getElementById('questionWorkspace'),
    questionBankVersion: document.getElementById('questionBankVersion'),
    sessionEyebrow: document.getElementById('sessionEyebrow'),
    saveBackupBtn: document.getElementById('saveBackupBtn'),
    restoreBackupInput: document.getElementById('restoreBackupInput'),
    reportBtn: document.getElementById('reportBtn'),
    backToLabBtn: document.getElementById('backToLabBtn'),
    reportSheet: document.getElementById('reportSheet'),
    printReportBtn: document.getElementById('printReportBtn'),
    downloadHtmlReportBtn: document.getElementById('downloadHtmlReportBtn'),
    teacherModeBtn: document.getElementById('teacherModeBtn'),
    teacherDialog: document.getElementById('teacherDialog'),
    teacherKeyInput: document.getElementById('teacherKeyInput'),
    teacherKeyStatus: document.getElementById('teacherKeyStatus'),
    teacherPanel: document.getElementById('teacherPanel'),
    teacherQuestionCount: document.getElementById('teacherQuestionCount'),
    teacherAnswerView: document.getElementById('teacherAnswerView'),
    randomTeacherQuestionBtn: document.getElementById('randomTeacherQuestionBtn'),
    resetDialog: document.getElementById('resetDialog'),
    confirmResetBtn: document.getElementById('confirmResetBtn'),
    brandHome: document.getElementById('brandHome')
  };

  let state = null;
  let bank = null;
  let currentIndex = 0;
  let teacherKey = null;

  function esc(value = '') {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function downloadBlob(filename, content, type = 'application/json;charset=utf-8') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function nowIso() { return new Date().toISOString(); }

  function emptyQuestionState() {
    return {
      result: '',
      firstResult: '',
      sources: [],
      note: '',
      issues: [],
      improvement: '',
      retest: '',
      verified: false,
      verifiedAt: null
    };
  }

  function createState(groupSize, groupName, loadedBank) {
    const questions = {};
    loadedBank.questions.forEach(q => { questions[q.id] = emptyQuestionState(); });
    return {
      schemaVersion: SCHEMA_VERSION,
      questionSet: String(groupSize),
      questionBankVersion: loadedBank.version,
      groupName: groupName.trim(),
      startedAt: nowIso(),
      updatedAt: nowIso(),
      questions
    };
  }

  async function fetchBank(groupSize) {
    const response = await fetch(`data/questions-${groupSize}.json`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Could not load question bank for ${groupSize} people.`);
    const data = await response.json();
    if (!Array.isArray(data.questions) || data.questions.length === 0) throw new Error('Question bank is empty.');
    return data;
  }

  function saveState() {
    if (!state) return;
    state.updatedAt = nowIso();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function getSavedState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed.schemaVersion !== SCHEMA_VERSION || !parsed.questionSet) return null;
      return parsed;
    } catch (_) {
      return null;
    }
  }

  function refreshSavedNotice() {
    const saved = getSavedState();
    if (!saved) {
      els.savedSessionNotice.hidden = true;
      return;
    }
    els.savedSessionNotice.hidden = false;
    const when = saved.updatedAt ? new Date(saved.updatedAt).toLocaleString() : 'earlier';
    const name = saved.groupName ? `“${saved.groupName}” · ` : '';
    els.savedSessionText.textContent = `${name}${saved.questionSet}-person version · last saved ${when}`;
  }

  async function startNewSession(groupSize) {
    try {
      bank = await fetchBank(groupSize);
      state = createState(groupSize, els.groupNameInput.value, bank);
      currentIndex = 0;
      teacherKey = null;
      saveState();
      openLab();
    } catch (error) {
      alert(error.message + '\n\nTip: open the app through GitHub Pages or another web server, not by double-clicking index.html.');
    }
  }

  async function continueSavedSession() {
    const saved = getSavedState();
    if (!saved) return;
    try {
      bank = await fetchBank(saved.questionSet);
      state = reconcileState(saved, bank);
      currentIndex = 0;
      saveState();
      openLab();
    } catch (error) {
      alert(error.message);
    }
  }

  function reconcileState(saved, loadedBank) {
    const next = { ...saved, questionBankVersion: loadedBank.version, questions: { ...saved.questions } };
    loadedBank.questions.forEach(q => {
      if (!next.questions[q.id]) next.questions[q.id] = emptyQuestionState();
    });
    return next;
  }

  function openLab() {
    els.startScreen.hidden = true;
    els.reportScreen.hidden = true;
    els.labScreen.hidden = false;
    els.headerActions.hidden = false;
    els.resetBtn.hidden = false;
    const groupLabel = state.groupName ? `${state.groupName} · ` : '';
    els.sessionEyebrow.textContent = `${groupLabel}${state.questionSet}-person group`;
    els.questionBankVersion.textContent = bank.version ? `v${bank.version}` : '';
    renderNavigation();
    renderCurrentQuestion();
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function goHome() {
    els.labScreen.hidden = true;
    els.reportScreen.hidden = true;
    els.startScreen.hidden = false;
    els.headerActions.hidden = true;
    els.resetBtn.hidden = !getSavedState();
    refreshSavedNotice();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function qState(questionId) {
    if (!state.questions[questionId]) state.questions[questionId] = emptyQuestionState();
    return state.questions[questionId];
  }

  function isReadyToVerify(qs) {
    return Boolean(qs.result && qs.sources && qs.sources.length > 0);
  }

  function hasAttention(qs) {
    return qs.result === 'partial' || qs.result === 'incorrect';
  }

  function renderNavigation() {
    els.questionGrid.innerHTML = bank.questions.map((q, index) => {
      const qs = qState(q.id);
      const cls = qs.verified ? 'is-done' : hasAttention(qs) ? 'is-attention' : '';
      return `<button type="button" class="qnav ${cls}" data-index="${index}" aria-label="Question ${index + 1}" aria-current="${index === currentIndex ? 'true' : 'false'}">${index + 1}</button>`;
    }).join('');
    els.questionGrid.querySelectorAll('.qnav').forEach(btn => {
      btn.addEventListener('click', () => {
        currentIndex = Number(btn.dataset.index);
        renderNavigation();
        renderCurrentQuestion();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  function sourceOptionsHtml(qs) {
    return bank.sourceOptions.map(source => {
      const checked = qs.sources.includes(source.id) ? 'checked' : '';
      return `<label class="option-label"><input type="checkbox" name="source" value="${esc(source.id)}" ${checked}><span>${esc(source.label)}</span></label>`;
    }).join('');
  }

  function issuesHtml(qs) {
    const issueOptions = bank.issueOptions || [
      { id: 'not-retrieved', label: 'Information existed but was not retrieved' },
      { id: 'hard-to-find', label: 'Information was difficult to find in the source' },
      { id: 'combine', label: 'Two or more sources needed to be combined' },
      { id: 'knowledge', label: 'Knowledge document needed improvement' },
      { id: 'instructions', label: 'Gem instructions needed improvement' },
      { id: 'other', label: 'Other' }
    ];
    return issueOptions.map(issue => {
      const checked = qs.issues.includes(issue.id) ? 'checked' : '';
      return `<label class="option-label"><input type="checkbox" name="issue" value="${esc(issue.id)}" ${checked}><span>${esc(issue.label)}</span></label>`;
    }).join('');
  }

  function renderCurrentQuestion() {
    const q = bank.questions[currentIndex];
    const qs = qState(q.id);
    const resultLabels = { correct: 'Yes, correct', partial: 'Partly correct', incorrect: 'No / incorrect' };
    const diagnosticVisible = qs.result === 'partial' || qs.result === 'incorrect';
    const verifiedText = qs.verified ? 'Verified' : 'Not yet verified';

    els.questionWorkspace.innerHTML = `
      <article class="question-card">
        <header class="question-card-header">
          <div class="question-number"><span>Question ${currentIndex + 1} of ${bank.questions.length}</span><span>${esc(q.id)}</span></div>
          <h2>${esc(q.question)}</h2>
          ${q.instruction ? `<div class="question-instruction"><strong>Before you ask:</strong> ${esc(q.instruction)}</div>` : ''}
        </header>
        <div class="question-card-body">
          <section class="work-step">
            <div class="step-label"><strong>1</strong><strong>Ask the Gem</strong></div>
            <p class="step-help">Read the answer. Do not judge it only by how confident or professional it sounds.</p>
            <div class="option-grid">
              ${['correct','partial','incorrect'].map(value => `<label class="option-label status-${value}"><input type="radio" name="result" value="${value}" ${qs.result === value ? 'checked' : ''}><span>${resultLabels[value]}</span></label>`).join('')}
            </div>
          </section>

          <section class="work-step">
            <div class="step-label"><strong>2</strong><strong>Verify against the original material</strong></div>
            <p class="step-help">Choose every source where your group actually found supporting information. At least one source is required.</p>
            <div class="source-chips">${sourceOptionsHtml(qs)}</div>
            <label class="field" style="margin-top:1rem"><span>Verification note <small>(optional but useful)</small></span><textarea id="noteField" placeholder="e.g. Email conversation 6, weekend collection answer">${esc(qs.note)}</textarea></label>
          </section>

          <section class="work-step" id="diagnosticStep" ${diagnosticVisible ? '' : 'hidden'}>
            <div class="step-label"><strong>3</strong><strong>Diagnose and improve</strong></div>
            <div class="diagnostic-box">
              <h3>The answer exists somewhere in the provided material.</h3>
              <p>Find it first. Then decide why the Gem struggled.</p>
              <div class="source-chips">${issuesHtml(qs)}</div>
              <label class="field" style="margin-top:1rem"><span>What did you change?</span><textarea id="improvementField" placeholder="Describe the knowledge or instruction change you made">${esc(qs.improvement)}</textarea></label>
              <label class="field" style="margin-top:1rem"><span>Retest result</span><textarea id="retestField" placeholder="What happened when you asked the same question again?">${esc(qs.retest)}</textarea></label>
            </div>
          </section>
        </div>
        <footer class="question-actions">
          <div>
            <button type="button" class="btn ${qs.verified ? 'btn-outline' : 'btn-dark'}" id="verifyQuestionBtn">${qs.verified ? 'Mark as not verified' : 'Mark question as verified'}</button>
            <div class="verify-message ${qs.verified ? 'ok' : isReadyToVerify(qs) ? '' : 'warn'}" id="verifyMessage">${qs.verified ? '✓ ' + verifiedText : isReadyToVerify(qs) ? 'Ready to verify.' : 'Choose an answer result and at least one source.'}</div>
          </div>
          <div class="pager">
            <button type="button" class="btn btn-outline" id="prevQuestionBtn" ${currentIndex === 0 ? 'disabled' : ''}>← Previous</button>
            <button type="button" class="btn btn-outline" id="nextQuestionBtn" ${currentIndex === bank.questions.length - 1 ? 'disabled' : ''}>Next →</button>
          </div>
        </footer>
      </article>`;

    wireQuestionEvents(q, qs);
  }

  function wireQuestionEvents(q, qs) {
    els.questionWorkspace.querySelectorAll('input[name="result"]').forEach(input => {
      input.addEventListener('change', () => {
        qs.result = input.value;
        if (!qs.firstResult) qs.firstResult = input.value;
        qs.verified = false;
        qs.verifiedAt = null;
        saveState();
        renderNavigation();
        renderCurrentQuestion();
        updateProgress();
      });
    });

    els.questionWorkspace.querySelectorAll('input[name="source"]').forEach(input => {
      input.addEventListener('change', () => {
        const selected = [...els.questionWorkspace.querySelectorAll('input[name="source"]:checked')].map(x => x.value);
        qs.sources = selected;
        qs.verified = false;
        qs.verifiedAt = null;
        saveState();
        renderNavigation();
        renderCurrentQuestion();
        updateProgress();
      });
    });

    els.questionWorkspace.querySelectorAll('input[name="issue"]').forEach(input => {
      input.addEventListener('change', () => {
        qs.issues = [...els.questionWorkspace.querySelectorAll('input[name="issue"]:checked')].map(x => x.value);
        saveState();
      });
    });

    const noteField = document.getElementById('noteField');
    noteField?.addEventListener('input', () => { qs.note = noteField.value; saveState(); });
    const improvementField = document.getElementById('improvementField');
    improvementField?.addEventListener('input', () => { qs.improvement = improvementField.value; saveState(); });
    const retestField = document.getElementById('retestField');
    retestField?.addEventListener('input', () => { qs.retest = retestField.value; saveState(); });

    document.getElementById('verifyQuestionBtn').addEventListener('click', () => {
      if (qs.verified) {
        qs.verified = false;
        qs.verifiedAt = null;
      } else {
        if (!isReadyToVerify(qs)) {
          const msg = document.getElementById('verifyMessage');
          msg.textContent = 'Choose an answer result and at least one source before verifying.';
          msg.className = 'verify-message warn';
          return;
        }
        qs.verified = true;
        qs.verifiedAt = nowIso();
      }
      saveState();
      renderNavigation();
      renderCurrentQuestion();
      updateProgress();
    });

    document.getElementById('prevQuestionBtn')?.addEventListener('click', () => {
      if (currentIndex > 0) { currentIndex--; renderNavigation(); renderCurrentQuestion(); }
    });
    document.getElementById('nextQuestionBtn')?.addEventListener('click', () => {
      if (currentIndex < bank.questions.length - 1) { currentIndex++; renderNavigation(); renderCurrentQuestion(); }
    });
  }

  function updateProgress() {
    const total = bank.questions.length;
    const verified = bank.questions.filter(q => qState(q.id).verified).length;
    els.verifiedCount.textContent = `${verified} / ${total}`;
    els.progressBar.style.width = `${(verified / total) * 100}%`;
  }

  function getSourceLabel(id) {
    return bank.sourceOptions.find(x => x.id === id)?.label || id;
  }

  function getIssueLabel(id) {
    return (bank.issueOptions || []).find(x => x.id === id)?.label || id;
  }

  function statusText(value) {
    return { correct: 'Correct', partial: 'Partly correct', incorrect: 'Incorrect / no answer', '': 'Not tested' }[value] || value;
  }

  function buildReportMarkup() {
    const total = bank.questions.length;
    const verified = bank.questions.filter(q => qState(q.id).verified).length;
    const correctFirst = bank.questions.filter(q => qState(q.id).firstResult === 'correct').length;
    const neededWork = bank.questions.filter(q => ['partial','incorrect'].includes(qState(q.id).firstResult)).length;
    const sourcesUsed = new Set(bank.questions.flatMap(q => qState(q.id).sources));
    const date = new Date().toLocaleString();

    const questionHtml = bank.questions.map((q, idx) => {
      const qs = qState(q.id);
      const statusClass = qs.result || 'open';
      return `<section class="report-question">
        <h3>${idx + 1}. ${esc(q.question)}</h3>
        <dl class="report-meta">
          <dt>Final result</dt><dd><span class="status-pill ${statusClass}">${esc(statusText(qs.result))}</span></dd>
          <dt>Verified</dt><dd>${qs.verified ? 'Yes' : 'No'}</dd>
          <dt>Sources checked</dt><dd>${qs.sources.length ? qs.sources.map(x => esc(getSourceLabel(x))).join(', ') : '—'}</dd>
          <dt>Verification note</dt><dd>${qs.note ? esc(qs.note) : '—'}</dd>
          ${qs.issues.length ? `<dt>Problem diagnosed</dt><dd>${qs.issues.map(x => esc(getIssueLabel(x))).join('; ')}</dd>` : ''}
          ${qs.improvement ? `<dt>Improvement</dt><dd>${esc(qs.improvement)}</dd>` : ''}
          ${qs.retest ? `<dt>Retest</dt><dd>${esc(qs.retest)}</dd>` : ''}
        </dl>
      </section>`;
    }).join('');

    return `<div class="report-header">
      <div><p class="eyebrow">AI for Business · Theme D</p><h1>Knowledge Assistant Test Report</h1><p>${state.groupName ? `<strong>${esc(state.groupName)}</strong> · ` : ''}${esc(state.questionSet)}-person group · Question bank ${esc(bank.version || '')}</p><p>Generated ${esc(date)}</p></div>
      <div class="report-score"><strong>${verified}/${total}</strong><span>verified</span></div>
    </div>
    <div class="report-summary-grid">
      <div class="summary-box"><strong>${correctFirst}</strong><span>correct on first result</span></div>
      <div class="summary-box"><strong>${neededWork}</strong><span>needed attention</span></div>
      <div class="summary-box"><strong>${sourcesUsed.size}</strong><span>source types used</span></div>
      <div class="summary-box"><strong>${verified === total ? 'Ready' : 'In progress'}</strong><span>teacher check</span></div>
    </div>
    <p><strong>Verification rule:</strong> Every question should be checked against at least one original source. This report records the group's own verification work; it is not an automatic correctness certificate.</p>
    ${questionHtml}`;
  }

  function openReport() {
    if (!state || !bank) return;
    els.reportSheet.innerHTML = buildReportMarkup();
    els.startScreen.hidden = true;
    els.labScreen.hidden = true;
    els.reportScreen.hidden = false;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function downloadHtmlReport() {
    const body = buildReportMarkup();
    const css = `body{font-family:Arial,sans-serif;max-width:900px;margin:40px auto;padding:0 20px;color:#111;line-height:1.5}h1,h2,h3{line-height:1.15}.eyebrow{text-transform:uppercase;letter-spacing:.08em;font-size:12px;font-weight:700}.report-header{border-bottom:3px solid #111;padding-bottom:18px}.report-summary-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:20px 0}.summary-box{background:#f3f3f3;padding:12px;border-top:4px solid #111}.summary-box strong{display:block;font-size:24px}.report-question{padding:18px 0;border-top:1px solid #ccc;break-inside:avoid}.report-meta{display:grid;grid-template-columns:150px 1fr;gap:5px 12px}.report-meta dt{font-weight:700}.report-meta dd{margin:0}.status-pill{border:1px solid;padding:2px 6px;font-weight:700;font-size:12px}@media print{@page{margin:14mm}}`;
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Knowledge Assistant Test Report</title><style>${css}</style></head><body>${body}</body></html>`;
    const safe = (state.groupName || `group-${state.questionSet}`).replace(/[^a-z0-9-_]+/gi,'-').replace(/^-|-$/g,'');
    downloadBlob(`Nordic-Freight-Test-Report-${safe}.html`, html, 'text/html;charset=utf-8');
  }

  function saveBackup() {
    saveState();
    const payload = {
      app: 'Nordic Freight Knowledge Assistant Test Lab',
      exportedAt: nowIso(),
      state
    };
    const safe = (state.groupName || `group-${state.questionSet}`).replace(/[^a-z0-9-_]+/gi,'-').replace(/^-|-$/g,'');
    downloadBlob(`Nordic-Freight-Test-Backup-${safe}.json`, JSON.stringify(payload, null, 2));
  }

  async function restoreBackup(file) {
    try {
      const parsed = JSON.parse(await file.text());
      const restored = parsed.state || parsed;
      if (!restored.questionSet || !restored.questions) throw new Error('This does not look like a Test Lab backup.');
      bank = await fetchBank(restored.questionSet);
      state = reconcileState(restored, bank);
      currentIndex = 0;
      saveState();
      openLab();
    } catch (error) {
      alert(`Could not restore backup: ${error.message}`);
    } finally {
      els.restoreBackupInput.value = '';
    }
  }

  async function loadTeacherKey(file) {
    try {
      const parsed = JSON.parse(await file.text());
      if (!Array.isArray(parsed.answers)) throw new Error('The file does not contain an answers array.');
      if (state && parsed.questionSet && String(parsed.questionSet) !== String(state.questionSet)) {
        throw new Error(`This answer key is for a ${parsed.questionSet}-person group, but the current session uses ${state.questionSet}.`);
      }
      teacherKey = parsed;
      els.teacherKeyStatus.textContent = `${file.name} loaded locally`;
      els.teacherPanel.hidden = false;
      els.teacherQuestionCount.textContent = `${parsed.answers.length} answer-key entries`;
      renderTeacherAnswer(bank?.questions[currentIndex]?.id || parsed.answers[0]?.id);
    } catch (error) {
      alert(`Could not load teacher answer key: ${error.message}`);
    } finally {
      els.teacherKeyInput.value = '';
    }
  }

  function renderTeacherAnswer(questionId) {
    if (!teacherKey) return;
    const entry = teacherKey.answers.find(x => x.id === questionId) || teacherKey.answers[0];
    if (!entry) { els.teacherAnswerView.innerHTML = '<p>No answer-key entry found.</p>'; return; }
    const q = bank?.questions.find(x => x.id === entry.id);
    els.teacherAnswerView.innerHTML = `<div class="teacher-answer">
      <p class="eyebrow">${esc(entry.id)}</p>
      <h3>${esc(q?.question || entry.question || 'Question')}</h3>
      <dl>
        <dt>Expected answer</dt><dd>${esc(entry.expectedAnswer || '—')}</dd>
        <dt>Source</dt><dd>${Array.isArray(entry.sources) ? entry.sources.map(esc).join(', ') : esc(entry.sources || '—')}</dd>
        <dt>Evidence</dt><dd>${esc(entry.evidence || '—')}</dd>
        <dt>Expert</dt><dd>${esc(entry.expert || '—')}</dd>
      </dl>
      ${entry.followUp ? `<blockquote><strong>Possible follow-up:</strong><br>${esc(entry.followUp)}</blockquote>` : ''}
      ${entry.note ? `<p><strong>Teacher note:</strong> ${esc(entry.note)}</p>` : ''}
    </div>`;
  }

  function randomTeacherQuestion() {
    if (!teacherKey?.answers?.length) return;
    const entry = teacherKey.answers[Math.floor(Math.random() * teacherKey.answers.length)];
    const idx = bank?.questions.findIndex(x => x.id === entry.id) ?? -1;
    if (idx >= 0) currentIndex = idx;
    renderTeacherAnswer(entry.id);
  }

  function resetSession() {
    localStorage.removeItem(STORAGE_KEY);
    state = null;
    bank = null;
    teacherKey = null;
    currentIndex = 0;
    els.resetDialog.close();
    els.groupNameInput.value = '';
    goHome();
  }

  document.querySelectorAll('[data-group-size]').forEach(btn => btn.addEventListener('click', () => startNewSession(btn.dataset.groupSize)));
  els.continueSavedBtn.addEventListener('click', continueSavedSession);
  els.saveBackupBtn.addEventListener('click', saveBackup);
  els.restoreBackupInput.addEventListener('change', e => e.target.files[0] && restoreBackup(e.target.files[0]));
  els.reportBtn.addEventListener('click', openReport);
  els.backToLabBtn.addEventListener('click', openLab);
  els.printReportBtn.addEventListener('click', () => window.print());
  els.downloadHtmlReportBtn.addEventListener('click', downloadHtmlReport);
  els.teacherModeBtn.addEventListener('click', () => els.teacherDialog.showModal());
  els.teacherKeyInput.addEventListener('change', e => e.target.files[0] && loadTeacherKey(e.target.files[0]));
  els.randomTeacherQuestionBtn.addEventListener('click', randomTeacherQuestion);
  els.resetBtn.addEventListener('click', () => els.resetDialog.showModal());
  els.confirmResetBtn.addEventListener('click', resetSession);
  els.brandHome.addEventListener('click', e => { e.preventDefault(); goHome(); });

  window.addEventListener('storage', e => { if (e.key === STORAGE_KEY && !state) refreshSavedNotice(); });
  window.addEventListener('pageshow', () => refreshSavedNotice());
  refreshSavedNotice();
  els.resetBtn.hidden = !getSavedState();
})();
