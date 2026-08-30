import { useState } from 'react';
import { CheckCircle2, Circle, User } from 'lucide-react';

const ROADMAP = [
  { title: 'Core architecture and multimodal API ingestion', status: 'completed' },
  { title: 'OCR + rule-based validation', status: 'completed' },
  { title: 'Computer vision field detection', status: 'in-progress' },
  { title: 'Real-time mobile scanning', status: 'upcoming' },
  { title: 'Cloud dashboard', status: 'upcoming' },
  { title: 'Verified regulatory integrations', status: 'upcoming' },
];

const TEAM = [
  { name: 'Harsh Kumar Nigam', role: 'Team Leader' },
  { name: 'Sangam', role: 'Team Member' },
  { name: 'Adarsh Yadav', role: 'Team Member' },
  { name: 'Prashant', role: 'Team Member' },
  { name: 'Ankur', role: 'Team Member' },
  { name: 'Vivek', role: 'Team Member' },
];

export default function About() {
  const [activePhase, setActivePhase] = useState<number | null>(null);

  return (
    <main className="page about">
      <div className="about-hero">
        <span className="eyebrow">TEAM TECHVORTEX • SIH 2026</span>
        <h1>Technology that turns a label image into an actionable compliance workflow.</h1>
        <p>
          PackCheck AI is a smart label-analysis platform designed to assist manufacturers, inspectors, retailers
          and businesses in identifying potentially missing, unclear or inconsistent packaged-product declarations.
        </p>
      </div>

      <div className="about-grid">
        <div className="card">
          <h2>Mission</h2>
          <p>Reduce repetitive manual triage and help users focus attention on labels that may need review.</p>
        </div>
        <div className="card">
          <h2>Technology</h2>
          <p>React + TypeScript frontend, Node/Express API, Gemini multimodal analysis, and a configurable rule engine.</p>
        </div>
        <div className="card">
          <h2>Future Scope</h2>
          <p>Verified regulatory databases, mobile scanning, multilingual labels, stronger computer vision and cloud analytics.</p>
        </div>
      </div>

      <h2 className="subhead">Roadmap</h2>
      <div className="roadmap">
        {ROADMAP.map((item, i) => {
          const isCompleted = item.status === 'completed';
          const isInProgress = item.status === 'in-progress';
          return (
            <div
              className={`road ${activePhase === i ? 'active' : ''}`}
              key={i}
              onClick={() => setActivePhase(i)}
              style={{
                cursor: 'pointer',
                border: activePhase === i ? '1px solid var(--primary)' : '1px solid var(--line)',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>0{i + 1}</span>
                {isCompleted ? (
                  <CheckCircle2 size={16} color="var(--green)" />
                ) : isInProgress ? (
                  <span style={{ fontSize: '10px', color: 'var(--yellow)' }}>● ACTIVE</span>
                ) : (
                  <Circle size={14} color="var(--muted)" />
                )}
              </div>
              <b>Phase {i + 1}</b>
              <p>{item.title}</p>
            </div>
          );
        })}
      </div>

      <h2 className="subhead">Team</h2>
      <div className="team-grid">
        {TEAM.map((member, i) => (
          <div className="card team" key={i}>
            <div className="avatar big">
              <User />
            </div>
            <h3>{member.name}</h3>
            <p style={{ margin: '4px 0 2px', fontWeight: 600 }}>{member.role}</p>
            <small style={{ color: 'var(--muted)', fontSize: '11px' }}>TechVortex</small>
          </div>
        ))}
      </div>
    </main>
  );
}