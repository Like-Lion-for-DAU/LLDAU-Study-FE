const initialLions = [
    {
        name: "김나함",
        part: "Frontend",
        intro: "분야를 넘나들며 성장하는 개발자입니다.",
        bio: "동아대학교 응용생물공학과 25학번 김나함입니다. 멋쟁이사자처럼을 통해 처음 프론트엔드에 도전하는 중입니다.",
        skills: "JavaScript, HTML / CSS",
        email: "naham9488@gmail.com",
        phone: "010-3626-9488",
        image: "./nhprofile.png" 
    },
    {
        name: "임도영",
        part: "Frontend",
        intro: "아기사자 14기 프론트엔드 임도영입니다.",
        bio: "동아대 26학번 컴퓨터공학과 임도영입니다. 경험과 기술을 쌓기 위해 노력하겠습니다.",
        skills: "HTML/CSS, JavaScript, JAVA, C/C++",
        email: "dlaehdud342@naver.com",
        phone: "010-3516-6306",
        image: "./dyprofile.png"
    },
    {
        name: "김주완",
        part: "Frontend",
        intro: "성실히 배우고 싶은 학생입니다.",
        bio: "컴퓨터공학과 1학년입니다. 코드 하나하나 다 이해하려고 노력하고 있습니다.",
        skills: "HTML / CSS, JavaScript, React(학습 중)",
        email: "mmnnbbnn070910@gmail.com",
        phone: "010-9041-1287",
        image: "./jwprofile.gif"
    },
    {
        name: "백태우",
        part: "Frontend",
        intro: "I'm Empty Stack Junior",
        bio: "AI학과이지만 Full Stack Developer를 목표로 하고 있습니다.",
        skills: "NLU / NLG, NLP, LLM",
        email: "btu0414@gmail.com",
        phone: "010-4564-4725",
        image: "./twprofile.png"
    },
    {
        name: "정소민",
        part: "Frontend",
        intro: "컴퓨터공학과 25학번 정소민입니다.",
        bio: "프론트엔드를 맡고 있는 정소민입니다.",
        skills: "React, ReactNative, JavaScript",
        email: "sominjung1116@gmail.com",
        phone: "010-5615-8474",
        image: "./smprofile.png"
    },
    {
        name: "이도은",
        part: "Frontend",
        intro: "열심히 배우는 프론트엔드 개발자입니다.",
        bio: "모르는 게 너무 많은 말하는 수국입니다. 스펀지처럼 이해하려고 노력하고 있습니다.",
        skills: "HTML/CSS, JavaScript, React (공부 중)",
        email: "dodo55860@gmail.com",
        phone: "010-2686-5586",
        image: "./deprofile.jpg"
    },
    {
        name: "정서윤",
        part: "Frontend",
        intro: "열심히 배워가고 있는 프론트엔드 개발자입니다.",
        bio: "07년생 26학번 컴퓨터공학과 정서윤입니다. 배우는 과정 자체를 즐깁니다.",
        skills: "TypeScript, SSR/SSG, Utility-First CSS",
        email: "t01021124995@gmail.com",
        phone: "010-3846-5638",
        image: "./syprofile.png"
    }
];

let babyLions = [...initialLions];

const cardGrid = document.getElementById('card-grid');
const totalCount = document.getElementById('total-count');
const modal = document.getElementById('modal-overlay');
const form = document.getElementById('add-lion-form');

function render() {
    cardGrid.innerHTML = '';
    babyLions.forEach((lion, index) => {
        const card = `
            <div class="summary-card">
                <span class="badge">${lion.skills.split(',')[0]}</span>
                <img src="${lion.image}" alt="${lion.name} 프로필" onerror="this.src='https://picsum.photos/id/64/400/300'">
                <div class="card-info">
                    <span class="part-tag ${lion.part}">${lion.part}</span>
                    <h3>${lion.name}</h3>
                    <p class="intro-text">${lion.intro}</p>
                </div>
            </div>
        `;
        cardGrid.insertAdjacentHTML('beforeend', card);
    });
    totalCount.textContent = babyLions.length;
}

document.getElementById('open-add-modal').onclick = () => {
    form.classList.remove('hidden');
    modal.classList.remove('hidden');
};

document.getElementById('close-modal').onclick = () => modal.classList.add('hidden');

document.getElementById('delete-last-btn').onclick = () => {
    if (babyLions.length > 0) {
        babyLions.pop();
        render();
    }
};

form.onsubmit = (e) => {
    e.preventDefault();

    const newLion = {
        name: document.getElementById('name').value,
        part: document.getElementById('part').value,
        skills: document.getElementById('skills').value,
        intro: document.getElementById('intro').value,
        bio: document.getElementById('bio').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        image: "https://picsum.photos/id/1012/400/300"
    };

    babyLions.push(newLion);
    render(); 
    modal.classList.add('hidden');
    form.reset();
};

render();