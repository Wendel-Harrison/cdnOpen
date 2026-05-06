export function InfoField({ label, value, icon: Icon, isMono = false, isTruncate = false, labelExtra = null }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 text-muted-foreground">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
        {labelExtra}
      </div>
      <p 
        className={`text-sm font-medium text-foreground ${isMono ? 'font-mono text-xs bg-muted/50 px-2 py-0.5 rounded' : ''} ${isTruncate ? 'truncate' : ''}`} 
        title={isTruncate ? value : ''}
      >
        {value || 'N/A'}
      </p>
    </div>
  );
}