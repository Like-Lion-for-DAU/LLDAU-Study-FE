let members = [];
let isLoading = false;
let lastFetchFn = null;
let filterPart = '전체';
let sortOrder = '최신추가순';
let searchName = '';

const PARTS = ['Frontend', 'Backend', 'Design'];

const SKILLS_BY_PART = {
  Frontend: ['React', 'Vue.js', 'TypeScript', 'CSS Grid', 'Tailwind', 'Next.js', 'Svelte', 'HTML/CSS'],
  Backend:  ['Node.js', 'Spring', 'Django', 'FastAPI', 'PostgreSQL', 'Redis', 'Docker', 'GraphQL'],
  Design:   ['Figma', 'Sketch', 'Adobe XD', 'Zeplin', 'Framer', 'Principle', 'Lottie', 'InVision'],
};

const ABOUT_PRESETS = [
  '4주차 미션에서 fetch로 데이터를 불러와 상태(lions)를 업데이트하는 연습을 하고 있습니다. 비동기(async/await)로 받아온 데이터를 map으로 변환해 UI에 반영하는 흐름을 이해하려고 합니다. 목표는 "데이터가 바뀌면 UI를 다시 그리는 구조"를 자연스럽게 체득하는 것입니다.',
  '외부 API를 활용해 동적으로 데이터를 불러오는 방식을 학습하고 있습니다. 비동기 처리와 상태 관리의 중요성을 배우면서, 더 나은 사용자 경험을 만드는 개발자가 되려고 노력하고 있습니다.',
  'JavaScript의 비동기 처리 방식인 Promise와 async/await를 깊이 이해하고 싶습니다. fetch API를 통해 실시간 데이터를 화면에 반영하는 흐름을 익히는 중입니다.',
  '데이터 중심의 UI 설계에 관심이 생겼습니다. 서버에서 받아온 정보를 가공해 화면에 뿌려주는 과정이 재미있고, 앞으로 더 다양한 API를 다뤄보고 싶습니다.',
];

const QUOTE_PRESETS = [
  '데이터가 바뀌면 UI도 바뀐다!',
  '비동기를 정복하면 웹이 살아 숨쉰다!',
  '코드보다 흐름을 이해하자.',
  '작은 기능 하나가 큰 경험을 만든다.',
];

const INTROS_BY_PART = {
  Frontend: ['구조적인 UI를 고민하는 개발자입니다.', '컴포넌트 단위 설계에 흥미가 있습니다.', '반응형 웹 구현을 연습 중입니다.'],
  Backend:  ['안정적인 서버 구조에 관심이 많습니다.', 'API 설계의 일관성을 중요하게 생각합니다.', '확장 가능한 아키텍처를 지향합니다.'],
  Design:   ['의미 있는 시각 표현을 만들고 싶습니다.', '사용자 관점에서 디자인을 고민합니다.', 'UX 리서치에 관심이 많습니다.'],
};

document.addEventListener('DOMContentLoaded', () => {
  initFromDOM();

  document.getElementById('btn-toggle-form').addEventListener('click', toggleForm);
  document.getElementById('btn-delete-last').addEventListener('click', deleteLast);
  document.getElementById('btn-cancel').addEventListener('click', closeForm);
  document.getElementById('add-form').addEventListener('submit', handleSubmit);

  document.getElementById('btn-fill-random').addEventListener('click', fillFormWithRandom);
  document.getElementById('btn-add1').addEventListener('click', () => fetchAndAdd(1));
  document.getElementById('btn-add5').addEventListener('click', () => fetchAndAdd(5));
  document.getElementById('btn-refresh').addEventListener('click', fetchAndRefresh);
  document.getElementById('btn-retry').addEventListener('click', () => lastFetchFn && lastFetchFn());

  document.getElementById('filter-part').addEventListener('change', e => {
    filterPart = e.target.value;
    renderView();
  });
  document.getElementById('sort-order').addEventListener('change', e => {
    sortOrder = e.target.value;
    renderView();
  });
  document.getElementById('search-name').addEventListener('input', e => {
    searchName = e.target.value;
    renderView();
  });
});

function initFromDOM() {
  const sumCards = document.querySelectorAll('#card-grid .summary-card');
  const detCards = document.querySelectorAll('#detail-list .detail-card');

  members = Array.from(sumCards).map((sumCard, i) => {
    const detCard = detCards[i];
    const sections = detCard ? Array.from(detCard.querySelectorAll('.detail-section-inner')) : [];

    const aboutSec   = sections.find(s => s.querySelector('h4')?.textContent.includes('자기소개'));
    const skillsSec  = sections.find(s => s.querySelector('.skill-list'));
    const contactSec = sections.find(s => s.querySelector('.contact-list'));
    const quoteSec   = sections.find(s => s.querySelector('blockquote'));

    const emailLink   = contactSec?.querySelector('a[href^="mailto:"]');
    const websiteLink = contactSec?.querySelector('a[href^="http"]');
    const phoneItem   = contactSec
      ? Array.from(contactSec.querySelectorAll('.contact-list li')).find(li => !li.querySelector('a'))
      : null;

    return {
      id:      i + 1,
      name:    sumCard.querySelector('.card-name').textContent.trim(),
      part:    sumCard.querySelector('.card-part').textContent.trim(),
      intro:   sumCard.querySelector('.card-intro').textContent.trim(),
      badge:   sumCard.querySelector('.badge').textContent.trim(),
      image:   sumCard.querySelector('.card-image').src,
      isMine:  sumCard.classList.contains('summary-card--mine'),
      club:    detCard?.querySelector('.detail-club')?.textContent.trim() || 'LION TRACK',
      about:   aboutSec?.querySelector('p')?.textContent.trim() || '',
      skills:  skillsSec ? Array.from(skillsSec.querySelectorAll('li')).map(li => li.textContent.trim()) : [],
      email:   emailLink ? emailLink.getAttribute('href').replace('mailto:', '') : '',
      phone:   phoneItem ? phoneItem.textContent.replace(/^[^:]+:\s*/, '').trim() : '',
      website: websiteLink ? websiteLink.href : '',
      quote:   quoteSec?.querySelector('blockquote')?.textContent.trim() || '',
      addedAt: i,
    };
  });

  renderView();
  updateCount();
}

function updateCount() {
  document.getElementById('total-count').textContent = `총 ${members.length}명`;
}

function renderView() {
  let filtered = [...members];

  if (filterPart !== '전체') {
    filtered = filtered.filter(m => m.part === filterPart);
  }

  if (searchName.trim()) {
    filtered = filtered.filter(m => m.name.includes(searchName.trim()));
  }

  if (sortOrder === '이름순') {
    filtered.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  } else {
    filtered.sort((a, b) => b.addedAt - a.addedAt);
  }

  const cardGrid  = document.getElementById('card-grid');
  const detailList = document.getElementById('detail-list');

  if (filtered.length === 0) {
    const msg = '<li class="empty-state">표시할 아기 사자가 없습니다.<br>(필터/검색 조건을 확인해 주세요)</li>';
    cardGrid.innerHTML  = msg;
    detailList.innerHTML = msg;
    return;
  }

  cardGrid.innerHTML   = filtered.map(createSummaryCardHTML).join('');
  detailList.innerHTML = filtered.map(createDetailCardHTML).join('');
}

function createSummaryCardHTML(member) {
  const partClass = member.part.toLowerCase();
  const mineClass = member.isMine ? ' summary-card--mine' : '';
  return `
    <li class="summary-card${mineClass}">
      <div class="card-image-wrap">
        <img src="${member.image}" alt="${member.name} 프로필 이미지" class="card-image" />
        <span class="badge">${member.badge}</span>
      </div>
      <div class="card-body">
        <h2 class="card-name">${member.name}</h2>
        <p class="card-part card-part--${partClass}">${member.part}</p>
        <p class="card-intro">${member.intro}</p>
      </div>
    </li>`;
}

function createDetailCardHTML(member) {
  const partClass  = member.part.toLowerCase();
  const skillsHTML = member.skills.map(s => `<li>${s}</li>`).join('');
  const websiteHTML = member.website
    ? `<li>웹사이트: <a href="${member.website}" target="_blank" rel="noopener noreferrer">${member.website}</a></li>`
    : '';

  return `
    <li class="detail-card">
      <header class="detail-header">
        <h3 class="detail-name">${member.name}</h3>
        <p class="detail-part detail-part--${partClass}">${member.part}</p>
        <p class="detail-club">${member.club}</p>
      </header>
      <section class="detail-section-inner">
        <h4>자기소개</h4>
        <p>${member.about}</p>
      </section>
      <section class="detail-section-inner">
        <h4>관심 기술</h4>
        <ul class="skill-list">${skillsHTML}</ul>
      </section>
      <section class="detail-section-inner">
        <h4>연락처</h4>
        <address>
          <ul class="contact-list">
            <li>이메일: <a href="mailto:${member.email}">${member.email}</a></li>
            <li>전화번호: ${member.phone}</li>
            ${websiteHTML}
          </ul>
        </address>
      </section>
      <section class="detail-section-inner">
        <h4>한 마디</h4>
        <blockquote>${member.quote}</blockquote>
      </section>
    </li>`;
}

function toggleForm() {
  const wrapper = document.getElementById('form-wrapper');
  wrapper.hidden = !wrapper.hidden;
}

function closeForm() {
  document.getElementById('form-wrapper').hidden = true;
  document.getElementById('add-form').reset();
}

function deleteLast() {
  if (members.length === 0) return;
  members.pop();
  renderView();
  updateCount();
}

function handleSubmit(e) {
  e.preventDefault();

  const name    = document.getElementById('f-name').value.trim();
  const part    = document.getElementById('f-part').value;
  const skills  = document.getElementById('f-skills').value.trim();
  const intro   = document.getElementById('f-intro').value.trim();
  const about   = document.getElementById('f-about').value.trim();
  const email   = document.getElementById('f-email').value.trim();
  const phone   = document.getElementById('f-phone').value.trim();
  const website = document.getElementById('f-website').value.trim();
  const quote   = document.getElementById('f-quote').value.trim();

  const skillArr = skills.split(',').map(s => s.trim()).filter(Boolean);

  const defaultImages = [
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=280&fit=crop',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=280&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=280&fit=crop',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=280&fit=crop',
  ];

  members.push({
    id:      Date.now(),
    name, part, intro, about, quote,
    skills:  skillArr,
    badge:   skillArr[0] || '',
    email, phone, website,
    image:   defaultImages[members.length % defaultImages.length],
    club:    'LION TRACK',
    isMine:  false,
    addedAt: Date.now(),
  });

  renderView();
  updateCount();
  closeForm();
}

async function fillFormWithRandom() {
  const fillBtn = document.getElementById('btn-fill-random');
  fillBtn.disabled = true;
  fillBtn.textContent = '불러오는 중...';

  try {
    const res = await fetch('https://randomuser.me/api/?results=1&nat=us,gb,ca,au,nz');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const user = data.results[0];

    const part    = PARTS[Math.floor(Math.random() * PARTS.length)];
    const skills  = [...SKILLS_BY_PART[part]].sort(() => Math.random() - 0.5).slice(0, 3);
    const country = user.location.country;
    const city    = user.location.city;

    document.getElementById('f-name').value    = `${user.name.first} ${user.name.last}`;
    document.getElementById('f-part').value    = part;
    document.getElementById('f-skills').value  = skills.join(', ');
    document.getElementById('f-intro').value   = `${part} · ${country} ${city}에서 합류했어요!`;
    document.getElementById('f-about').value   = ABOUT_PRESETS[Math.floor(Math.random() * ABOUT_PRESETS.length)];
    document.getElementById('f-email').value   = user.email;
    document.getElementById('f-phone').value   = user.phone;
    document.getElementById('f-website').value = `https://example.com/${user.login.username}`;
    document.getElementById('f-quote').value   = QUOTE_PRESETS[Math.floor(Math.random() * QUOTE_PRESETS.length)];
  } catch (err) {
    alert(`랜덤 값 채우기 실패: ${err.message}`);
  } finally {
    fillBtn.disabled    = false;
    fillBtn.textContent = '랜덤 값 채우기';
  }
}

function mapApiUser(user) {
  const part    = PARTS[Math.floor(Math.random() * PARTS.length)];
  const skills  = [...SKILLS_BY_PART[part]].sort(() => Math.random() - 0.5).slice(0, 3);
  const name    = `${user.name.first} ${user.name.last}`;
  const country = user.location.country;
  const city    = user.location.city;
  const intro   = `${part} · ${country} ${city}에서 합류했어요!`;

  return {
    id:      Date.now() + Math.random() * 1000,
    name, part, intro,
    about:   `안녕하세요, ${name}입니다. ${country} ${city} 출신으로 ${part} 분야에서 활동 중입니다.`,
    skills,
    badge:   skills[0],
    email:   user.email,
    phone:   user.phone,
    website: `https://github.com/${user.login.username}`,
    image:   user.picture.large,
    club:    'LION TRACK',
    isMine:  false,
    addedAt: Date.now() + Math.random() * 1000,
  };
}

async function fetchAndAdd(count) {
  if (isLoading) return;
  lastFetchFn = () => fetchAndAdd(count);
  setStatus('loading');

  try {
    const res = await fetch(`https://randomuser.me/api/?results=${count}&nat=us,gb,ca,au,nz`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const now = Date.now();
    data.results.forEach((user, i) => {
      const member = mapApiUser(user);
      member.id      = now + i;
      member.addedAt = now + i;
      members.push(member);
    });

    renderView();
    updateCount();
    setStatus('success');
  } catch (err) {
    setStatus('error', err.message);
  }
}

async function fetchAndRefresh() {
  if (isLoading) return;
  const nonMineCount = members.filter(m => !m.isMine).length;
  if (nonMineCount === 0) return;

  lastFetchFn = fetchAndRefresh;
  setStatus('loading');

  try {
    const res = await fetch(`https://randomuser.me/api/?results=${nonMineCount}&nat=us,gb,ca,au,nz`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const mineMembers = members.filter(m => m.isMine);
    const now = Date.now();
    const newMembers = data.results.map((user, i) => {
      const m    = mapApiUser(user);
      m.id       = now + i;
      m.addedAt  = now + i;
      return m;
    });

    members = [...mineMembers, ...newMembers];
    renderView();
    updateCount();
    setStatus('success');
  } catch (err) {
    setStatus('error', err.message);
  }
}

function setStatus(state, errorMsg = '') {
  const statusEl  = document.getElementById('fetch-status');
  const retryBtn  = document.getElementById('btn-retry');
  const fetchBtns = document.querySelectorAll('.btn-fetch');

  isLoading = state === 'loading';
  fetchBtns.forEach(btn => (btn.disabled = isLoading));

  if (state === 'loading') {
    statusEl.textContent    = '불러오는 중...';
    statusEl.dataset.state  = 'loading';
    retryBtn.hidden         = true;
  } else if (state === 'success') {
    statusEl.textContent    = '완료!';
    statusEl.dataset.state  = 'success';
    retryBtn.hidden         = true;
    setTimeout(() => setStatus('idle'), 2000);
  } else if (state === 'error') {
    statusEl.textContent    = `불러오기 실패: ${errorMsg}`;
    statusEl.dataset.state  = 'error';
    retryBtn.hidden         = false;
  } else {
    statusEl.textContent    = '준비 완료';
    statusEl.dataset.state  = '';
    retryBtn.hidden         = true;
  }
}
