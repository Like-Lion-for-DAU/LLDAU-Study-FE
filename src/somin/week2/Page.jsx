import styles from "./Page.module.css";
import { members } from "./members";

function ContactList({ contact }) {
  if (!contact) return null;
  return (
    <ul>
      {contact.email && <li>email : {contact.email}</li>}
      {contact.phone && <li>phone : {contact.phone}</li>}
      {contact.website && (
        <li>
          website : <a href={contact.website.url} target="_blank" rel="noreferrer">{contact.website.label}</a>
        </li>
      )}
      {contact.instagram && (
        <li>
          instagram :{" "}
          {contact.instagram.url
            ? <a href={contact.instagram.url} target="_blank" rel="noreferrer">{contact.instagram.label}</a>
            : contact.instagram.label}
        </li>
      )}
      {contact.github && (
        <li>
          github : <a href={contact.github.url} target="_blank" rel="noreferrer">{contact.github.label}</a>
        </li>
      )}
    </ul>
  );
}

function SummaryCard({ member }) {
  return (
    <div className={`${styles.card} ${member.isMe ? styles.cardMe : ""}`}>
      <div className={styles.profileimg}>
        <img src={member.image} alt={`${member.name} 프로필`} />
        <span className={styles.badge}>{member.badge}</span>
      </div>
      <p className={styles.name}>{member.name}</p>
      <p className={styles.end}>{member.role}</p>
      <p>{member.intro}</p>
    </div>
  );
}

function DetailCard({ member }) {
  return (
    <div className={styles.detail}>
      <div className={styles.main}>
        <p className={styles.name}>{member.name}</p>
        <p className={styles.end}>{member.role}</p>
        <p className={styles.club}>{member.club}</p>
      </div>

      <div className={styles.introduce}>
        <p>자기소개</p>
        <p>{member.bio}</p>
      </div>

      <div className={styles.contact}>
        <p>연락처</p>
        <ContactList contact={member.contact} />
      </div>

      <div className={styles.interest}>
        <p>관심기술</p>
        <ul>
          {member.skills.map((skill) => (
            <li key={skill}>{skill}</li>
          ))}
        </ul>
      </div>

      <div className={styles.gako}>
        <p>각오 한 마디</p>
        <p>{member.motto}</p>
      </div>
    </div>
  );
}

export default function Week2Page() {
  return (
    <div className={styles.weekPage}>
      <section className={styles.cardIntro}>
        {members.map((member) => (
          <SummaryCard key={member.name} member={member} />
        ))}
      </section>

      <section className={styles.cardDetail}>
        {members.map((member) => (
          <DetailCard key={member.name} member={member} />
        ))}
      </section>
    </div>
  );
}