import { ImageResponse } from 'next/og';

export const alt = 'pinguin boat — a discord bot, and a dashboard for it';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0b0f10',
          color: '#e8f1ef',
          padding: '72px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 30, letterSpacing: 8, color: '#7dd3c7' }}>
          PINGUIN BOAT
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, maxWidth: 900 }}>
            a discord bot, and a dashboard for it.
          </div>
          <div style={{ fontSize: 34, color: '#9fb3b0', maxWidth: 860 }}>
            moderation, music, economy, levels, tickets, giveaways — nineteen modules, one
            integration.
          </div>
        </div>

        <div style={{ display: 'flex', fontSize: 26, color: '#7dd3c7' }}>
          configured from the web
        </div>
      </div>
    ),
    { ...size }
  );
}