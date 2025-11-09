import React from 'react';
import { MapPin, ExternalLink } from 'lucide-react';

interface DevCardProfile {
  login: string;
  name: string | null;
  avatarUrl: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  blog: string | null;
  twitterUsername: string | null;
  createdAt: string;
}

interface DevCardStats {
  repos: number;
  stars: number;
  forks: number;
  pullRequests: number;
  issues: number;
  contributions: number;
}

interface DevCardTopRepo {
  name: string;
  description: string | null;
  stars: number;
  url: string;
}

interface HeatmapDay {
  date: string;
  count: number;
}

interface TimelinePoint {
  label: string;
  total: number;
}

interface DevCardProps {
  profile: DevCardProfile;
  stats: DevCardStats;
  topRepo: DevCardTopRepo | null;
  topLanguages: Array<{ name: string; percentage: number }>;
  heatmap: HeatmapDay[];
  timeline: TimelinePoint[];
  isLoading: boolean;
  error?: string | null;
}

const FALLBACK_LANGS = [
  { name: "javascript", percentage: 26 },
  { name: "typescript", percentage: 22 },
  { name: "react", percentage: 18 },
];

function formatDate(date: string) {
  try {
    return new Date(date).toLocaleDateString(undefined, {
      month: "short",
      year: "numeric",
    });
  } catch {
    return null;
  }
}

export function DevCard({
  profile,
  stats,
  topRepo,
  topLanguages,
  heatmap,
  timeline,
  isLoading,
  error,
}: DevCardProps) {
  const languages = topLanguages.length ? topLanguages : FALLBACK_LANGS;
  const joined = profile.createdAt ? formatDate(profile.createdAt) : null;
  const primaryLanguage = languages[0] ?? { name: "n/a", percentage: 0 };
  const secondaryLanguages = languages.slice(1, 4);

  if (isLoading) {
    return (
      <article className="devcard">
        <div className="card-content">
          <div className="skeleton-header">
            <div className="skeleton-avatar"></div>
            <div className="skeleton-lines">
              <div className="skeleton-line"></div>
              <div className="skeleton-line short"></div>
            </div>
          </div>
          <div className="skeleton-block"></div>
          <div className="skeleton-block"></div>
          <div className="skeleton-block small"></div>
        </div>
        <style>{styles}</style>
      </article>
    );
  }

  if (error) {
    return (
      <article className="devcard">
        <div className="card-content">
          <div className="error-message">{error}</div>
        </div>
        <style>{styles}</style>
      </article>
    );
  }

  return (
    <article className="devcard">
      <div className="card-content">
        {/* Avatar and Name Section */}
        <div className="avatar-section">
          <div className="avatar-ring">
            <img src={profile.avatarUrl} alt={profile.name || profile.login} className="avatar-img" />
          </div>
          <div className="name-section">
            <h2 className="profile-name">{profile.name || profile.login}</h2>
            <p className="profile-username">@{profile.login}</p>
            <p className="profile-bio">{profile.bio || 'Full-Stack Engineer\nOpen Source Enthusiast'}</p>
            <div className="profile-meta">
              {profile.location && (
                <span className="meta-item">
                  <MapPin size={14} />
                  {profile.location}
                </span>
              )}
              {profile.blog && (
                <span className="meta-divider">·</span>
              )}
              {profile.blog && (
                <span className="meta-blog">
                  {profile.blog.replace(/^https?:\/\//, '')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="stats-row">
          <div className="stat-item">
            <div className="stat-value">{stats.repos}</div>
            <div className="stat-label">Repos</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{(stats.stars / 1000).toFixed(1)}k</div>
            <div className="stat-label">Stars</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.forks}</div>
            <div className="stat-label">Forks</div>
          </div>
          <div className="stat-item">
            <div className="stat-value-small">Join {joined?.split(' ')[0]}</div>
            <div className="stat-value-small">{joined?.split(' ')[1]}</div>
          </div>
          <div className="stat-item">
            <div className="stat-value-small">Joian</div>
            <div className="stat-value-small">{joined?.split(' ')[0]} {joined?.split(' ')[1]}</div>
          </div>
        </div>

        {/* Contributions Section */}
        <div className="contributions-section">
          <div className="contributions-header">
            <span className="contributions-title">Contributions</span>
            <span className="contributions-year">this year</span>
          </div>
          <div className="contributions-grid">
            {Array.from({ length: 52 }).map((_, weekIndex) => (
              <div key={weekIndex} className="week-column">
                {Array.from({ length: 7 }).map((_, dayIndex) => {
                  const index = weekIndex * 7 + dayIndex;
                  const intensity = heatmap[index]?.count || Math.floor(Math.random() * 4);
                  return (
                    <div
                      key={dayIndex}
                      className={`contribution-day intensity-${intensity}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <div className="contributions-stats">
            <div className="contribution-stat">
              <div className="contribution-number">{stats.repos}</div>
              <div className="contribution-label">Stars</div>
            </div>
            <div className="contribution-stat">
              <div className="contribution-number">{stats.forks}</div>
              <div className="contribution-label">Pull Req</div>
            </div>
            <div className="contribution-stat">
              <div className="contribution-number">{stats.issues}</div>
              <div className="contribution-label">Issues</div>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="bottom-row">
          {/* Top Repo */}
          <div className="top-repo-section">
            <div className="repo-header">Top repo <span className="repo-name">{topRepo?.name || 'portfolio'}</span></div>
            <div className="repo-meta">
              <span>with {topRepo?.stars || 560}</span>
            </div>
            <div className="language-circle-small">
              <svg viewBox="0 0 36 36" className="circle-chart-small">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="3"/>
                <circle 
                  cx="18" 
                  cy="18" 
                  r="15.5" 
                  fill="none" 
                  stroke="rgb(59, 130, 246)" 
                  strokeWidth="3"
                  strokeDasharray={`${(secondaryLanguages[0]?.percentage || 5) * 0.972}, 100`}
                  strokeDashoffset="25"
                  transform="rotate(-90 18 18)"
                />
              </svg>
              <div className="circle-percentage">{secondaryLanguages[0]?.percentage || 5}%</div>
            </div>
            <div className="most-used-label">Most used<br/>language</div>
          </div>

          {/* Language Tags */}
          <div className="language-tags-section">
            {languages.map((lang, i) => (
              <span key={i} className="language-tag">#{lang.name}</span>
            ))}
          </div>

          {/* Top Repo Large */}
          <div className="top-repo-large">
            <div className="repo-large-title">Top repo <span className="repo-large-name">{topRepo?.name || 'portfolio'}</span></div>
            <div className="repo-large-stars">{topRepo?.stars || 560} <span className="stars-label">stars</span></div>
            <div className="repo-large-lang">Most used language</div>
          </div>

          {/* Language Circle Large */}
          <div className="language-circle-large">
            <svg viewBox="0 0 120 120" className="circle-chart-large">
              <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="8"/>
              <circle 
                cx="60" 
                cy="60" 
                r="54" 
                fill="none" 
                stroke="rgb(59, 130, 246)" 
                strokeWidth="8"
                strokeDasharray={`${primaryLanguage.percentage * 3.39}, 340`}
                strokeDashoffset="85"
                transform="rotate(-90 60 60)"
                strokeLinecap="round"
              />
              <text x="60" y="70" className="circle-text-large">{primaryLanguage.percentage}%</text>
            </svg>
            <div className="most-used-label-large">Most used language</div>
          </div>
        </div>

        {/* Footer */}
        <div className="footer">
          <div className="github-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
            </svg>
            <span className="github-text">GitHub</span>
          </div>
          <div className="generated">Generated with <span className="brand">showra.dev</span></div>
        </div>
      </div>

      <style>{styles}</style>
    </article>
  );
}

const styles = `
  * {
    box-sizing: border-box;
  }

  .devcard {
    width: 440px;
    background: linear-gradient(135deg, #1e3a5f 0%, #0f1f3d 100%);
    border-radius: 32px;
    padding: 32px;
    position: relative;
    overflow: hidden;
    border: 2px solid rgba(100, 200, 255, 0.3);
    box-shadow: 
      0 0 40px rgba(59, 130, 246, 0.4),
      inset 0 0 60px rgba(59, 130, 246, 0.1);
  }

  .devcard::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(135deg, rgba(100, 200, 255, 0.5), rgba(59, 130, 246, 0.3));
    border-radius: 32px;
    z-index: -1;
  }

  .card-content {
    position: relative;
    z-index: 1;
  }

  .avatar-section {
    display: flex;
    gap: 20px;
    margin-bottom: 24px;
  }

  .avatar-ring {
    width: 140px;
    height: 140px;
    border-radius: 50%;
    padding: 4px;
    background: linear-gradient(135deg, rgb(59, 130, 246), rgba(59, 130, 246, 0.4));
    box-shadow: 0 8px 32px rgba(59, 130, 246, 0.6);
    flex-shrink: 0;
  }

  .avatar-img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid #0f1f3d;
  }

  .name-section {
    flex: 1;
    padding-top: 8px;
  }

  .profile-name {
    font-size: 32px;
    font-weight: 700;
    color: white;
    margin: 0 0 4px 0;
    line-height: 1.1;
  }

  .profile-username {
    font-size: 18px;
    color: rgba(255, 255, 255, 0.7);
    margin: 0 0 12px 0;
  }

  .profile-bio {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.4;
    margin: 0 0 12px 0;
    white-space: pre-line;
  }

  .profile-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .meta-divider {
    color: rgba(255, 255, 255, 0.4);
  }

  .meta-blog {
    color: rgba(255, 255, 255, 0.7);
  }

  .stats-row {
    display: flex;
    gap: 16px;
    margin-bottom: 20px;
  }

  .stat-item {
    flex: 1;
    text-align: center;
  }

  .stat-value {
    font-size: 28px;
    font-weight: 700;
    color: white;
    line-height: 1;
    margin-bottom: 4px;
  }

  .stat-label {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
  }

  .stat-value-small {
    font-size: 14px;
    color: white;
    line-height: 1.3;
  }

  .contributions-section {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 20px;
    padding: 20px;
    margin-bottom: 20px;
    border: 1px solid rgba(100, 200, 255, 0.2);
  }

  .contributions-header {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 16px;
  }

  .contributions-title {
    font-size: 20px;
    font-weight: 600;
    color: rgb(59, 180, 246);
  }

  .contributions-year {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
  }

  .contributions-grid {
    display: flex;
    gap: 3px;
    margin-bottom: 16px;
    height: 80px;
  }

  .week-column {
    display: flex;
    flex-direction: column;
    gap: 3px;
    flex: 1;
  }

  .contribution-day {
    flex: 1;
    border-radius: 2px;
    background: rgba(59, 130, 246, 0.15);
  }

  .contribution-day.intensity-1 {
    background: rgba(59, 130, 246, 0.3);
  }

  .contribution-day.intensity-2 {
    background: rgba(59, 130, 246, 0.5);
  }

  .contribution-day.intensity-3 {
    background: rgba(59, 130, 246, 0.8);
  }

  .contributions-stats {
    display: flex;
    gap: 24px;
  }

  .contribution-stat {
    display: flex;
    flex-direction: column;
  }

  .contribution-number {
    font-size: 24px;
    font-weight: 700;
    color: white;
    line-height: 1;
  }

  .contribution-label {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
  }

  .bottom-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 20px;
  }

  .top-repo-section {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 16px;
    padding: 16px;
    border: 1px solid rgba(100, 200, 255, 0.2);
    position: relative;
  }

  .repo-header {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 8px;
  }

  .repo-name {
    color: white;
    font-weight: 600;
  }

  .repo-meta {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 12px;
  }

  .language-circle-small {
    width: 60px;
    height: 60px;
    position: relative;
    margin: 0 auto 8px;
  }

  .circle-chart-small {
    width: 100%;
    height: 100%;
  }

  .circle-percentage {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 16px;
    font-weight: 700;
    color: white;
  }

  .most-used-label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    text-align: center;
    line-height: 1.3;
  }

  .language-tags-section {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-content: flex-start;
  }

  .language-tag {
    font-size: 14px;
    color: rgb(59, 180, 246);
    background: rgba(59, 130, 246, 0.15);
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 12px;
    padding: 6px 12px;
    white-space: nowrap;
  }

  .top-repo-large {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 16px;
    padding: 16px;
    border: 1px solid rgba(100, 200, 255, 0.2);
  }

  .repo-large-title {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 12px;
  }

  .repo-large-name {
    color: white;
    font-weight: 600;
  }

  .repo-large-stars {
    font-size: 32px;
    font-weight: 700;
    color: white;
    margin-bottom: 8px;
    line-height: 1;
  }

  .stars-label {
    font-size: 16px;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.6);
  }

  .repo-large-lang {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
  }

  .language-circle-large {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 16px;
    padding: 24px;
    border: 1px solid rgba(100, 200, 255, 0.2);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .circle-chart-large {
    width: 120px;
    height: 120px;
    margin-bottom: 12px;
  }

  .circle-text-large {
    font-size: 28px;
    font-weight: 700;
    fill: white;
    text-anchor: middle;
  }

  .most-used-label-large {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
    text-align: center;
  }

  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .github-logo {
    display: flex;
    align-items: center;
    gap: 8px;
    color: white;
  }

  .github-text {
    font-size: 20px;
    font-weight: 600;
  }

  .generated {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
  }

  .brand {
    color: white;
    font-weight: 600;
  }

  .skeleton-header {
    display: flex;
    gap: 20px;
    margin-bottom: 24px;
  }

  .skeleton-avatar {
    width: 140px;
    height: 140px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    animation: pulse 1.5s ease-in-out infinite;
  }

  .skeleton-lines {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-top: 8px;
  }

  .skeleton-line {
    height: 20px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    animation: pulse 1.5s ease-in-out infinite;
  }

  .skeleton-line.short {
    width: 60%;
  }

  .skeleton-block {
    height: 100px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    margin-bottom: 16px;
    animation: pulse 1.5s ease-in-out infinite;
  }

  .skeleton-block.small {
    height: 60px;
  }

  .error-message {
    text-align: center;
    color: rgba(255, 100, 100, 0.9);
    font-size: 16px;
    padding: 40px;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

// export default function App() {
//   const demoProfile: DevCardProfile = {
//     login: "sarawilliams",
//     name: "Sara Williams",
//     avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
//     bio: "Full-Stack Engineer\nOpen Source Enthusiast",
//     company: "Tech Corp",
//     location: "San Francisco",
//     blog: "sarev.dev",
//     twitterUsername: null,
//     createdAt: "2017-08-15T00:00:00Z"
//   };

//   const demoStats: DevCardStats = {
//     repos: 92,
//     stars: 1400,
//     forks: 320,
//     pullRequests: 320,
//     issues: 210,
//     contributions: 1250
//   };

//   const demoTopRepo: DevCardTopRepo = {
//     name: "portfolio",
//     description: "My personal portfolio website",
//     stars: 560,
//     url: "https://github.com/sarawilliams/portfolio"
//   };

//   const demoLanguages = [
//     { name: "React", percentage: 50 },
//     { name: "Node.js", percentage: 5 },
//     { name: "TypeScript", percentage: 25 },
//     { name: "Python", percentage: 20 }
//   ];

//   return (
//     <div style={{ 
//       minHeight: '100vh', 
//       background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1f35 100%)',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       padding: '40px'
//     }}>
//       <DevCard 
//         profile={demoProfile}
//         stats={demoStats}
//         topRepo={demoTopRepo}
//         topLanguages={demoLanguages}
//         heatmap={[]}
//         timeline={[]}
//         isLoading={false}
//       />
//     </div>
//   );
// }