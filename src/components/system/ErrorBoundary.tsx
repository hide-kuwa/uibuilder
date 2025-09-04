import React from 'react';
import { RecoveryModal } from './RecoveryModal';

interface Props {
  onDisable?: () => void;
  onRollback?: () => void;
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (typeof window !== 'undefined') {
      const logs = (window as any).__DEV_LOGS__ || ((window as any).__DEV_LOGS__ = []);
      logs.push({ message: error.message, stack: error.stack, info, time: Date.now() });
    }
  }

  handleReload = () => {
    if (typeof window !== 'undefined') window.location.reload();
  };

  handleDisable = () => {
    this.setState({ error: null });
    this.props.onDisable?.();
  };

  handleRollback = () => {
    this.setState({ error: null });
    this.props.onRollback?.();
  };

  render() {
    if (this.state.error) {
      return (
        <RecoveryModal
          onReload={this.handleReload}
          onDisable={this.handleDisable}
          onRollback={this.handleRollback}
        />
      );
    }
    return this.props.children;
  }
}
