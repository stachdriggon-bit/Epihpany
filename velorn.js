/* Account-bound Velorn dashboard. All balances, mission progress and claims come from trusted server APIs. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const panel = $('velorn-panel');
  if (!panel) return;
  const status = $('velorn-status');
  const wallet = $('velorn-wallet');
  const boards = $('velorn-boards');
  const refreshButton = $('velorn-refresh');
  let requestVersion = 0;
  let busy = false;
  const missionTitles = {
    learning_step: 'Learning Step',
    try_something_different: 'Try Something Different',
    solve_a_challenge: 'Solve a Challenge',
    put_knowledge_to_use: 'Put Knowledge to Use',
    consistent_progress: 'Consistent Progress',
    broaden_your_experience: 'Broaden Your Experience',
    meaningful_progress: 'Meaningful Progress'
  };
  function node(tag, className, value) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (value !== undefined && value !== null) element.textContent = String(value);
    return element;
  }
  function amount(value) {
    const raw = String(value ?? '0');
    try { return new Intl.NumberFormat(undefined).format(BigInt(raw)); }
    catch { return raw; }
  }
  function dateLabel(value) {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString(undefined, {month:'short',day:'numeric'});
  }
  function setStatus(message, kind = 'info') {
    if (!status) return;
    status.textContent = message;
    status.dataset.state = kind;
  }
  function setBusy(value) {
    busy = value;
    if (refreshButton) refreshButton.disabled = value;
    panel.querySelectorAll('.velorn-claim').forEach(button => { if (value) button.disabled = true; });
  }
  function resetForGuest() {
    requestVersion += 1;
    setBusy(false);
    panel.hidden = true;
    wallet.hidden = true;
    boards.hidden = true;
    wallet.replaceChildren();
    boards.replaceChildren();
    setStatus('Sign in to view your account wallet and missions.');
  }
  function makeClaimButton(label, action, id) {
    const button = node('button', 'velorn-claim', label);
    button.type = 'button';
    button.dataset.velornClaim = action;
    button.dataset.velornTarget = id;
    return button;
  }
  function renderMission(assignment) {
    const card = node('article', 'velorn-mission');
    const head = node('div', 'velorn-mission-head');
    head.append(
      node('strong', 'velorn-mission-title', missionTitles[assignment.templateId] || 'Learning mission'),
      node('span', 'velorn-mission-reward', '+' + amount(assignment.rewardAmount) + ' Velorn')
    );
    card.append(head);
    if (assignment.summary) card.append(node('p', 'velorn-mission-summary', assignment.summary));
    const progress = node('div', 'velorn-mission-meta');
    progress.append(
      node('span', '', amount(assignment.progress) + ' / ' + amount(assignment.target)),
      node('span', 'velorn-mission-state' + (assignment.status === 'completed' ? ' is-complete' : ''),
        assignment.claimStatus === 'paid' ? 'Claimed' :
          assignment.status === 'completed' ? 'Completed' :
            assignment.status === 'replaced' ? 'Replaced' :
              assignment.status === 'expired' ? 'Expired' : 'In progress')
    );
    card.append(progress);
    if (assignment.canClaim === true && assignment.assignmentId) {
      card.append(makeClaimButton('Claim +' + amount(assignment.rewardAmount) + ' Velorn',
        'claim_assignment', assignment.assignmentId));
    }
    return card;
  }
  function renderBoard(period, board) {
    const section = node('section', 'velorn-board');
    section.append(node('h3', '', period === 'daily' ? 'Daily missions' : 'Weekly missions'));
    if (!board) {
      section.append(node('p', 'velorn-empty', 'This board is not ready yet. No partial mission board will be created.'));
      return section;
    }
    const periodEnd = dateLabel(board.periodEnd);
    if (periodEnd) section.append(node('p', 'velorn-board-note', 'Resets ' + periodEnd));
    const list = node('div', 'velorn-mission-list');
    const assignments = Array.isArray(board.assignments) ? board.assignments : [];
    if (!assignments.length) list.append(node('p', 'velorn-empty', 'No missions are available in this period yet.'));
    else assignments.forEach(assignment => list.append(renderMission(assignment)));
    section.append(list);
    const bonus = node('div', 'velorn-board-bonus');
    bonus.append(node('span', '', (period === 'daily' ? 'Daily' : 'Weekly') +
      ' completion bonus · +' + amount(board.bonusReward) + ' Velorn'));
    if (board.bonusClaimStatus === 'paid') bonus.append(node('span', 'velorn-mission-state is-complete', 'Claimed'));
    else if (board.canClaimBonus === true && board.boardId) bonus.append(makeClaimButton('Claim bonus', 'claim_board_bonus', board.boardId));
    else bonus.append(node('span', 'velorn-mission-state', amount(board.paidCount) + ' claimed'));
    section.append(bonus);
    return section;
  }
  function renderDashboard(data) {
    if (!data || data.enabled !== true) {
      wallet.hidden = true;
      boards.hidden = true;
      wallet.replaceChildren();
      boards.replaceChildren();
      setStatus('Velorn is not active yet. Your learning progress continues as usual; no balances or rewards are being issued.');
      return;
    }
    wallet.hidden = false;
    wallet.replaceChildren(
      node('span', '', 'YOUR BALANCE'),
      node('strong', '', amount(data.balance)),
      node('small', '', 'VELORN')
    );
    boards.hidden = false;
    boards.replaceChildren(renderBoard('daily', data.daily), renderBoard('weekly', data.weekly));
    setStatus('Your wallet and mission progress are synced to your account.', 'success');
  }
  async function loadDashboard() {
    const auth = window.EpiphanyAuth;
    if (!auth?.isSignedIn?.()) { resetForGuest(); return; }
    const version = ++requestVersion;
    panel.hidden = false;
    setBusy(true);
    setStatus('Loading your Velorn account…');
    try {
      const data = await auth.loadVelornDashboard();
      if (version !== requestVersion || !auth.isSignedIn()) return;
      renderDashboard(data);
    } catch {
      if (version !== requestVersion || !auth.isSignedIn()) return;
      wallet.hidden = true;
      boards.hidden = true;
      setStatus('Your Velorn account could not be loaded. Check your connection and try again.', 'error');
    } finally {
      if (version === requestVersion) setBusy(false);
    }
  }
  async function submitClaim(button) {
    if (busy || button.disabled) return;
    const action = button.dataset.velornClaim;
    const targetId = button.dataset.velornTarget;
    if (!['claim_assignment', 'claim_board_bonus'].includes(action) || !targetId) return;
    const auth = window.EpiphanyAuth;
    if (!auth?.isSignedIn?.()) { resetForGuest(); return; }
    setBusy(true);
    setStatus('Confirming your mission reward…');
    try {
      await auth.claimVelornMission(action, targetId);
      setStatus('Reward confirmed. Updating your wallet…', 'success');
      await loadDashboard();
    } catch {
      setStatus('The claim could not be completed. Refresh your missions and try again.', 'error');
    } finally {
      if (busy) setBusy(false);
    }
  }
  refreshButton?.addEventListener('click', loadDashboard);
  panel.addEventListener('click', event => {
    const button = event.target.closest('[data-velorn-claim]');
    if (button) submitClaim(button);
  });
  window.addEventListener('epiphany:auth-state', event => {
    if (event.detail?.isSignedIn) loadDashboard();
    else resetForGuest();
  });
  window.EpiphanyAuth?.whenReady?.().then(() => {
    if (window.EpiphanyAuth?.isSignedIn?.()) loadDashboard();
    else resetForGuest();
  }).catch(() => resetForGuest());
})();
