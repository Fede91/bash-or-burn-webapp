import type { ReactNode } from 'react';

interface SystemStateProps {
  title?: string;
  body: string;
  action?: { label: string; onClick: () => void };
  role?: 'alert' | 'status';
  children?: ReactNode;
}

export default function SystemState({ title, body, action, role, children }: SystemStateProps) {
  return (
    <div className="state" role={role}>
      {title && <p className="state-title">{title}</p>}
      <p className="state-body">{body}</p>
      {children}
      {action && (
        <div className="actions">
          <button type="button" className="btn btn-primary" onClick={action.onClick}>
            {action.label}
          </button>
        </div>
      )}
    </div>
  );
}
