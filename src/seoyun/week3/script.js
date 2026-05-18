let members = [];

const defaultImages = [
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=280&fit=crop',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=280&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=280&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=280&fit=crop',
];

document.addEventListener('DOMContentLoaded', () => {
  initFromDOM();

  document.getElementById('btn-toggle-form').addEventListener('click', toggleForm);
  document.getElementById('btn-delete-last').addEventListener('click', deleteLast);
  document.getElementById('btn-cancel').addEventListener('click', closeForm);
  document.getElementById('add-form').addEventListener('submit', handleSubmit);
});

function initFromDOM() {
  const summaryCards = document.querySelectorAll('#card-grid .summary-card');
  members = Array.from(summaryCards).map((card, i) => ({
    id: i + 1,
    name: card.querySelector('.card-name').textContent.trim(),
    isMine: card.classList.contains('summary-card--mine'),
  }));
  updateCount();
}

function updateCount() {
  document.getElementById('total-count').textContent = `총 ${members.length}명`;
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

  const cardGrid = document.getElementById('card-grid');
  const detailList = document.getElementById('detail-list');

  cardGrid.removeChild(cardGrid.lastElementChild);
  detailList.removeChild(detailList.lastElementChild);

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

  const member = {
    id: Date.now(),
    name, part, intro, about, quote,
    skills: skillArr,
    badge: skillArr[0] || '',
    email, phone, website,
    image: defaultImages[members.length % defaultImages.length],
    club: 'LION TRACK',
    isMine: false,
  };

  members.push(member);
  appendSummaryCard(member);
  appendDetailCard(member);
  updateCount();
  closeForm();
}

function appendSummaryCard(member) {
  const partClass = member.part.toLowerCase();
  const li = document.createElement('li');
  li.className = 'summary-card';
  li.innerHTML = `
    <div class="card-image-wrap">
      <img src="${member.image}" alt="${member.name} 프로필 이미지" class="card-image" />
      <span class="badge">${member.badge}</span>
    </div>
    <div class="card-body">
      <h2 class="card-name">${member.name}</h2>
      <p class="card-part card-part--${partClass}">${member.part}</p>
      <p class="card-intro">${member.intro}</p>
    </div>
  `;
  document.getElementById('card-grid').appendChild(li);
}

function appendDetailCard(member) {
  const partClass = member.part.toLowerCase();
  const skillsHTML = member.skills.map(s => `<li>${s}</li>`).join('');
  const websiteHTML = member.website
    ? `<li>웹사이트: <a href="${member.website}" target="_blank" rel="noopener noreferrer">${member.website}</a></li>`
    : '';

  const li = document.createElement('li');
  li.className = 'detail-card';
  li.innerHTML = `
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
  `;
  document.getElementById('detail-list').appendChild(li);
}
