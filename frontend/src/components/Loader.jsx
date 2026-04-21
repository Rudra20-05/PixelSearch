export default function Loader({ message = "Searching images..." }) {
  return (
    <div className="status-container">
      <div className="spinner"></div>
      <p>{message}</p>
    </div>
  );
}

export function EmptyState({ message = "Type a description above to search your semantic gallery." }) {
  return (
    <div className="status-container">
      <div style={{ opacity: 0.5 }}>
        {/* Simple placeholder graphic or icon can go here */}
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
      </div>
      <p>{message}</p>
    </div>
  );
}
