// ============================================================
// AgriSmart — Reusable UI Components
// ============================================================
import { cn } from '@/lib/utils';
import { motion,type Variants } from 'framer-motion';
import { AlertCircle,CheckCircle2,ChevronDown,Clock3,Info,Loader2,XCircle } from 'lucide-react';
import {
forwardRef,
useId,
type ButtonHTMLAttributes,
type HTMLAttributes,
type InputHTMLAttributes,
type KeyboardEvent,
type MouseEvent,
type ReactNode,
type SelectHTMLAttributes,
type TextareaHTMLAttributes,
} from 'react';
import { Link,type LinkProps } from 'react-router-dom';

// ── Button ─────────────────────────────────────────────────
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'saffron' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
}

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  outline: 'btn-outline',
  ghost: 'btn-ghost',
  saffron: 'btn-saffron',
  danger: 'btn bg-brand-error text-white hover:brightness-90 active:scale-[0.98]',
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'min-h-12 px-6 py-3 text-base',
};

function resolveButtonClassName(variant: ButtonVariant, size: ButtonSize, className?: string) {
  return cn(buttonVariants[variant], buttonSizes[size], className);
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, icon, children, disabled, type, onClick, ...props }, ref) => {
    const resolvedType = type ?? 'button';

    return (
      <button
        ref={ref}
        type={resolvedType}
        className={resolveButtonClassName(variant, size, className)}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        onClick={onClick}
        {...props}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : icon}
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';

interface ButtonLinkProps extends Omit<LinkProps, 'to'> {
  to: LinkProps['to'];
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  disabled?: boolean;
}

export function ButtonLink({
  to,
  variant = 'primary',
  size = 'md',
  icon,
  disabled = false,
  className,
  children,
  onClick,
  tabIndex,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      to={to}
      className={resolveButtonClassName(variant, size, className)}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : tabIndex}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        if (disabled) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
      {...props}
    >
      {icon}
      {children}
    </Link>
  );
}

// ── Card ───────────────────────────────────────────────────
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  soft?: boolean;
  hover?: boolean;
}

export function Card({ children, className, soft, hover, onClick, onKeyDown, ...props }: CardProps) {
  const interactive = Boolean(onClick);
  return (
    <div
      className={cn(
        soft ? 'card-soft' : 'card',
        (hover || interactive) && 'interactive-card',
        interactive && 'cursor-pointer',
        className,
      )}
      {...props}
      onClick={(event: MouseEvent<HTMLDivElement>) => {
        const interactiveChild = (event.target as HTMLElement).closest('button, a, input, select, textarea, [role=\"button\"]');
        if (interactiveChild && interactiveChild !== event.currentTarget) return;
        onClick?.(event);
      }}
      onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
        onKeyDown?.(event);
        if (!interactive || event.defaultPrevented || event.target !== event.currentTarget) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          event.currentTarget.click();
        }
      }}
      role={interactive ? 'button' : props.role}
      tabIndex={interactive ? (props.tabIndex ?? 0) : props.tabIndex}
    >
      {children}
    </div>
  );
}

// ── Badge ──────────────────────────────────────────────────
interface BadgeProps {
  children: ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'muted' | 'primary';
  icon?: ReactNode;
  className?: string;
}

export function Badge({ children, variant = 'muted', icon, className }: BadgeProps) {
  const variants = {
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
    info: 'badge-info',
    muted: 'badge-muted',
    primary: 'badge-primary',
  };
  return <span className={cn(variants[variant], className)}>{icon}{children}</span>;
}

// ── Input ──────────────────────────────────────────────────
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, prefix, suffix, className, id, name, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || name || generatedId;
    const descriptionId = `${inputId}-description`;
    const hasLeadingContent = Boolean(icon || prefix);
    const hasBothLeadingItems = Boolean(icon && prefix);

    return (
      <div className="w-full">
        {label && <label htmlFor={inputId} className="label">{label}</label>}
        <div className="relative">
          {hasLeadingContent && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-brand-muted pointer-events-none">
              {icon}
              {prefix && <span className="text-sm font-medium">{prefix}</span>}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            name={name}
            className={cn(
              'input',
              hasLeadingContent && (hasBothLeadingItems ? 'pl-[4.75rem]' : 'pl-10'),
              suffix && 'pr-12',
              error && 'border-brand-error focus:border-brand-error focus:ring-brand-error/10',
              className,
            )}
            aria-invalid={Boolean(error)}
            aria-describedby={(error || hint) ? descriptionId : undefined}
            {...props}
          />
          {suffix && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-brand-muted pointer-events-none">
              {suffix}
            </span>
          )}
        </div>
        {error && (
          <p id={descriptionId} className="mt-1.5 text-xs text-brand-error flex items-center gap-1" role="alert">
            <AlertCircle className="w-3 h-3 shrink-0" aria-hidden="true" />{error}
          </p>
        )}
        {hint && !error && <p id={descriptionId} className="mt-1.5 text-xs text-brand-muted">{hint}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';

// ── Select ─────────────────────────────────────────────────
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, placeholder, className, id, name, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id || name || generatedId;
    const descriptionId = `${selectId}-description`;

    return (
      <div className="w-full">
        {label && <label htmlFor={selectId} className="label">{label}</label>}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            name={name}
            className={cn('input appearance-none pr-10', error && 'border-brand-error focus:border-brand-error focus:ring-brand-error/10', className)}
            aria-invalid={Boolean(error)}
            aria-describedby={(error || hint) ? descriptionId : undefined}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted pointer-events-none" aria-hidden="true" />
        </div>
        {error && <p id={descriptionId} className="mt-1.5 text-xs text-brand-error" role="alert">{error}</p>}
        {hint && !error && <p id={descriptionId} className="mt-1.5 text-xs text-brand-muted">{hint}</p>}
      </div>
    );
  },
);
Select.displayName = 'Select';

// ── Textarea ───────────────────────────────────────────────
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, name, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id || name || generatedId;
    const descriptionId = `${textareaId}-description`;

    return (
      <div className="w-full">
        {label && <label htmlFor={textareaId} className="label">{label}</label>}
        <textarea
          ref={ref}
          id={textareaId}
          name={name}
          className={cn('input min-h-[96px] resize-y', error && 'border-brand-error focus:border-brand-error focus:ring-brand-error/10', className)}
          aria-invalid={Boolean(error)}
          aria-describedby={(error || hint) ? descriptionId : undefined}
          {...props}
        />
        {error && <p id={descriptionId} className="mt-1.5 text-xs text-brand-error" role="alert">{error}</p>}
        {hint && !error && <p id={descriptionId} className="mt-1.5 text-xs text-brand-muted">{hint}</p>}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';

// ── Stat Card ──────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  trend?: { value: number; positive: boolean };
  accent?: 'primary' | 'saffron' | 'sky' | 'teal' | 'purple' | 'rose' | 'amber' | 'success' | 'warning' | 'error';
  onClick?: () => void;
}

export function StatCard({ label, value, unit, icon, trend, accent = 'primary', onClick }: StatCardProps) {
  const accents = {
    primary: 'bg-brand-soft text-brand-primary',
    saffron: 'bg-brand-saffron/10 text-brand-saffron',
    sky: 'bg-brand-sky/10 text-brand-sky',
    teal: 'bg-brand-teal/10 text-brand-teal',
    purple: 'bg-brand-purple/10 text-brand-purple',
    rose: 'bg-brand-rose/10 text-brand-rose',
    amber: 'bg-brand-amber/10 text-brand-amber',
    success: 'bg-brand-success/10 text-brand-success',
    warning: 'bg-brand-warning/10 text-brand-warning',
    error: 'bg-brand-error/10 text-brand-error',
  };
  const accentBars = {
    primary: 'from-brand-primary to-brand-teal',
    saffron: 'from-brand-saffron to-brand-amber',
    sky: 'from-brand-sky to-brand-teal',
    teal: 'from-brand-teal to-brand-primary',
    purple: 'from-brand-purple to-brand-sky',
    rose: 'from-brand-rose to-brand-saffron',
    amber: 'from-brand-amber to-brand-warning',
    success: 'from-brand-success to-brand-teal',
    warning: 'from-brand-warning to-brand-saffron',
    error: 'from-brand-error to-brand-rose',
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24 }} className="h-full">
      <Card hover={Boolean(onClick)} onClick={onClick} className="relative h-full overflow-hidden p-4 pt-5 sm:p-5 sm:pt-6">
        <span className={cn('absolute inset-x-0 top-0 h-1 bg-gradient-to-r', accentBars[accent])} aria-hidden="true" />
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-brand-muted uppercase tracking-wide leading-5">{label}</p>
            <p className="mt-1 text-2xl font-bold text-brand-text tabular-nums break-words">
              {value}{unit && <span className="text-sm font-medium text-brand-muted ml-1">{unit}</span>}
            </p>
            {trend && (
              <p className={cn('mt-1 text-xs font-semibold', trend.positive ? 'text-brand-success' : 'text-brand-error')}>
                {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}% vs last week
              </p>
            )}
          </div>
          {icon && <div className={cn('flex items-center justify-center w-10 h-10 rounded-lg shrink-0', accents[accent])}>{icon}</div>}
        </div>
      </Card>
    </motion.div>
  );
}

// ── Progress Bar ───────────────────────────────────────────
export function ProgressBar({ value, max = 100, accent = 'primary', className }: { value: number; max?: number; accent?: string; className?: string }) {
  const safeMax = max > 0 ? max : 100;
  const pct = Math.max(0, Math.min(100, (value / safeMax) * 100));
  const colors: Record<string, string> = {
    primary: 'bg-brand-primary',
    success: 'bg-brand-success',
    warning: 'bg-brand-warning',
    error: 'bg-brand-error',
    sky: 'bg-brand-sky',
    teal: 'bg-brand-teal',
    purple: 'bg-brand-purple',
    rose: 'bg-brand-rose',
    amber: 'bg-brand-amber',
    saffron: 'bg-brand-saffron',
  };

  return (
    <div
      className={cn('w-full h-2 rounded-full bg-brand-border overflow-hidden', className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={Math.max(0, Math.min(value, safeMax))}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className={cn('h-full rounded-full', colors[accent] || colors.primary)}
      />
    </div>
  );
}

// ── Empty State ────────────────────────────────────────────
export function EmptyState({ icon, title, message, action }: { icon?: ReactNode; title: string; message?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && <div className="mb-3 text-brand-muted opacity-55">{icon}</div>}
      <h3 className="text-base font-semibold text-brand-text">{title}</h3>
      {message && <p className="mt-1.5 text-sm text-brand-muted max-w-sm">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton h-4 w-full', className)} aria-hidden="true" />;
}

export function CardSkeleton() {
  return (
    <Card className="p-5 space-y-3" aria-label="Loading content">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-2 w-full" />
    </Card>
  );
}

// ── Toast / Alert Banner ───────────────────────────────────
export function AlertBanner({ type, title, message, onClose }: { type: 'info' | 'success' | 'warning' | 'error'; title: string; message?: string; onClose?: () => void }) {
  const config = {
    info: { icon: <Info className="w-5 h-5" />, cls: 'bg-brand-sky/10 border-brand-sky/30', accent: 'text-brand-sky' },
    success: { icon: <CheckCircle2 className="w-5 h-5" />, cls: 'bg-brand-success/10 border-brand-success/30', accent: 'text-brand-success' },
    warning: { icon: <AlertCircle className="w-5 h-5" />, cls: 'bg-brand-warning/10 border-brand-warning/30', accent: 'text-brand-warning' },
    error: { icon: <XCircle className="w-5 h-5" />, cls: 'bg-brand-error/10 border-brand-error/30', accent: 'text-brand-error' },
  };
  const current = config[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex items-start gap-3 rounded-xl border p-4', current.cls)}
      role={type === 'error' ? 'alert' : 'status'}
    >
      <span className={cn("shrink-0 mt-0.5", current.accent)} aria-hidden="true">{current.icon}</span>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-semibold", current.accent)}>{title}</p>
        {message && <p className="mt-0.5 text-sm leading-relaxed text-brand-text">{message}</p>}
      </div>
      {onClose && (
        <button type="button" onClick={onClose} className="shrink-0 rounded-md p-1 hover:bg-black/5" aria-label="Dismiss message">
          <XCircle className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
}

// ── Verification Badge ─────────────────────────────────────
export function VerificationBadge({ status, size = 'sm' }: { status: 'verified' | 'pending' | 'unverified' | 'rejected'; size?: 'sm' | 'md' }) {
  const config = {
    verified: { icon: <CheckCircle2 className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />, label: 'Verified', cls: 'badge-success' },
    pending: { icon: <Clock3 className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />, label: 'Pending', cls: 'badge-warning' },
    unverified: { icon: <Info className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />, label: 'Unverified', cls: 'badge-muted' },
    rejected: { icon: <XCircle className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />, label: 'Rejected', cls: 'badge-error' },
  };
  const current = config[status];
  return <span className={cn(current.cls, size === 'md' && 'px-3 py-1 text-sm')} title={`Identity ${status}`}>{current.icon}{current.label}</span>;
}

// ── Page Transition Wrapper ────────────────────────────────
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
};

export function PageTransition({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Section Header ─────────────────────────────────────────
function sectionAccent(title: string): string {
  const normalized = title.toLowerCase();
  if (normalized.includes('drone') || normalized.includes('trust') || normalized.includes('verification')) return 'bg-brand-purple/10 text-brand-purple';
  if (normalized.includes('payment') || normalized.includes('escrow') || normalized.includes('revenue')) return 'bg-brand-amber/[0.12] text-brand-amber';
  if (normalized.includes('alert') || normalized.includes('dispute') || normalized.includes('risk')) return 'bg-brand-rose/10 text-brand-rose';
  if (normalized.includes('sensor') || normalized.includes('iot') || normalized.includes('system')) return 'bg-brand-sky/10 text-brand-sky';
  if (normalized.includes('agreement') || normalized.includes('offer') || normalized.includes('market')) return 'bg-brand-teal/10 text-brand-teal';
  return 'bg-brand-soft text-brand-primary';
}

export function SectionHeader({ title, subtitle, action, icon }: { title: string; subtitle?: string; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
      <div className="flex items-start sm:items-center gap-3 min-w-0">
        {icon && <div className={cn('flex items-center justify-center w-9 h-9 rounded-lg shrink-0 transition-transform duration-200 hover:rotate-3 hover:scale-105', sectionAccent(title))}>{icon}</div>}
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-brand-text leading-tight">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-brand-muted">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0 flex items-center gap-2">{action}</div>}
    </div>
  );
}

// ── Tabs ───────────────────────────────────────────────────
export function Tabs({ tabs, active, onChange, label = 'Content filters' }: { tabs: { id: string; label: string; count?: number }[]; active: string; onChange: (id: string) => void; label?: string }) {
  const tabListId = useId().replace(/:/g, '');
  const getTabId = (tabId: string) => `${tabListId}-tab-${tabId}`;
  const selectRelativeTab = (currentIndex: number, direction: -1 | 1) => {
    if (tabs.length === 0) return;
    const nextIndex = (currentIndex + direction + tabs.length) % tabs.length;
    onChange(tabs[nextIndex].id);
    window.requestAnimationFrame(() => document.getElementById(getTabId(tabs[nextIndex].id))?.focus());
  };

  return (
    <div className="flex gap-1 overflow-x-auto scrollbar-hide border-b border-brand-border" role="tablist" aria-label={label}>
      {tabs.map((tab, index) => (
        <button
          id={getTabId(tab.id)}
          key={tab.id}
          type="button"
          role="tab"
          tabIndex={active === tab.id ? 0 : -1}
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft') { event.preventDefault(); selectRelativeTab(index, -1); }
            if (event.key === 'ArrowRight') { event.preventDefault(); selectRelativeTab(index, 1); }
            if (event.key === 'Home') {
              event.preventDefault();
              onChange(tabs[0].id);
              window.requestAnimationFrame(() => document.getElementById(getTabId(tabs[0].id))?.focus());
            }
            if (event.key === 'End') {
              event.preventDefault();
              const lastTab = tabs[tabs.length - 1];
              onChange(lastTab.id);
              window.requestAnimationFrame(() => document.getElementById(getTabId(lastTab.id))?.focus());
            }
          }}
          className={cn(
            'relative min-h-11 px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors',
            active === tab.id ? 'text-brand-primary' : 'text-brand-muted hover:text-brand-text',
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={cn('ml-1.5 text-xs tabular-nums', active === tab.id ? 'text-brand-primary' : 'text-brand-muted')}>{tab.count}</span>
          )}
          {active === tab.id && <motion.div layoutId={`${tabListId}-indicator`} className="absolute bottom-0 left-1 right-1 h-0.5 bg-brand-primary rounded-full" />}
        </button>
      ))}
    </div>
  );
}
